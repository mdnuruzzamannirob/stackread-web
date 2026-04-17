'use client'

import { Fingerprint, KeyRound, RefreshCcw, ShieldEllipsis } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { getApiErrorMessage } from '@/lib/api/error-message'
import {
  useChangeMyPasswordMutation,
  useDisableTwoFactorMutation,
  useEnableTwoFactorMutation,
  useLoginHistoryQuery,
  useMeQuery,
  useRegenerateBackupCodesMutation,
  useSendTwoFactorSetupEmailOtpMutation,
  useVerifyTwoFactorMutation,
} from '@/store/features/auth/authApi'

import {
  BusyIcon,
  Modal,
  SectionTitle,
  StatusIcon,
} from '@/components/settings/SettingsShared'

type SetupMethod = 'app' | 'email'

const formatHistoryDate = (value: string) => {
  const parsed = new Date(value)

  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return parsed.toLocaleString()
}

export default function SecurityPage() {
  const { data: meResponse } = useMeQuery()
  const { data: loginHistoryResponse, isFetching: isLoadingHistory } =
    useLoginHistoryQuery()
  const [changeMyPassword, { isLoading: isUpdatingPassword }] =
    useChangeMyPasswordMutation()
  const [enableTwoFactor, { isLoading: isGeneratingTwoFactor }] =
    useEnableTwoFactorMutation()
  const [verifyTwoFactor, { isLoading: isVerifyingTwoFactor }] =
    useVerifyTwoFactorMutation()
  const [sendSetupEmailOtp, { isLoading: isSendingSetupEmailOtp }] =
    useSendTwoFactorSetupEmailOtpMutation()
  const [disableTwoFactor, { isLoading: isDisablingTwoFactor }] =
    useDisableTwoFactorMutation()
  const [regenerateBackupCodes, { isLoading: isRegeneratingBackupCodes }] =
    useRegenerateBackupCodesMutation()

  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showEnableTwoFactorModal, setShowEnableTwoFactorModal] =
    useState(false)
  const [showDisableTwoFactorModal, setShowDisableTwoFactorModal] =
    useState(false)
  const [showBackupCodesModal, setShowBackupCodesModal] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [setupMethod, setSetupMethod] = useState<SetupMethod>('app')
  const [setupOtp, setSetupOtp] = useState('')
  const [setupEmailOtp, setSetupEmailOtp] = useState('')
  const [generatedTwoFactorData, setGeneratedTwoFactorData] = useState<{
    secret: string
    qrCodeUrl: string
    backupCodes: string[]
  } | null>(null)

  const [disableOtp, setDisableOtp] = useState('')
  const [disablePassword, setDisablePassword] = useState('')

  const [backupCodeOtp, setBackupCodeOtp] = useState('')
  const [backupCodePassword, setBackupCodePassword] = useState('')
  const [latestBackupCodes, setLatestBackupCodes] = useState<string[] | null>(
    null,
  )

  const twoFactorEnabled = Boolean(meResponse?.data.twoFactorEnabled)
  const loginHistory = loginHistoryResponse?.data ?? []

  const qrImageSrc = useMemo(() => {
    if (!generatedTwoFactorData?.qrCodeUrl) {
      return ''
    }

    if (generatedTwoFactorData.qrCodeUrl.startsWith('otpauth://')) {
      return `https://chart.googleapis.com/chart?chs=256x256&cht=qr&chl=${encodeURIComponent(generatedTwoFactorData.qrCodeUrl)}`
    }

    return generatedTwoFactorData.qrCodeUrl
  }, [generatedTwoFactorData?.qrCodeUrl])

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword) {
      toast.error('Current and new password are required.')
      return
    }

    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters.')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('New password and confirmation do not match.')
      return
    }

    try {
      await changeMyPassword({ currentPassword, newPassword }).unwrap()
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setShowPasswordModal(false)
      toast.success('Password changed successfully.')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to change password.'))
    }
  }

  const handleGenerateTwoFactor = async () => {
    try {
      const response = await enableTwoFactor().unwrap()
      setGeneratedTwoFactorData(response.data)
      setSetupMethod('app')
      setSetupOtp('')
      setSetupEmailOtp('')
      setShowEnableTwoFactorModal(true)
      toast.success('2FA setup generated. Verify with app code or email OTP.')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to start 2FA setup.'))
    }
  }

  const handleSendSetupEmailOtp = async () => {
    try {
      await sendSetupEmailOtp().unwrap()
      toast.success('2FA setup OTP sent to your email.')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to send email OTP.'))
    }
  }

  const handleVerifyTwoFactor = async () => {
    const otp = setupOtp.trim()
    const emailOtp = setupEmailOtp.trim()

    if (setupMethod === 'app' && !/^\d{6}$/.test(otp)) {
      toast.error('Please enter a valid 6-digit authenticator OTP.')
      return
    }

    if (setupMethod === 'email' && !/^\d{6}$/.test(emailOtp)) {
      toast.error('Please enter a valid 6-digit email OTP.')
      return
    }

    try {
      await verifyTwoFactor(
        setupMethod === 'app' ? { otp } : { emailOtp },
      ).unwrap()
      setSetupOtp('')
      setSetupEmailOtp('')
      setGeneratedTwoFactorData(null)
      setShowEnableTwoFactorModal(false)
      toast.success('2FA enabled successfully.')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to verify 2FA code.'))
    }
  }

  const handleDisableTwoFactor = async () => {
    if (!disableOtp.trim() && !disablePassword.trim()) {
      toast.error('Provide OTP or current password to disable 2FA.')
      return
    }

    if (disableOtp.trim() && !/^\d{6}$/.test(disableOtp.trim())) {
      toast.error('OTP must be 6 digits.')
      return
    }

    try {
      await disableTwoFactor({
        otp: disableOtp.trim() || undefined,
        currentPassword: disablePassword.trim() || undefined,
      }).unwrap()
      setDisableOtp('')
      setDisablePassword('')
      setShowDisableTwoFactorModal(false)
      toast.success('2FA disabled successfully.')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to disable 2FA.'))
    }
  }

  const handleRegenerateBackupCodes = async () => {
    if (!backupCodeOtp.trim() && !backupCodePassword.trim()) {
      toast.error('Provide OTP or current password to regenerate backup codes.')
      return
    }

    if (backupCodeOtp.trim() && !/^\d{6}$/.test(backupCodeOtp.trim())) {
      toast.error('OTP must be 6 digits.')
      return
    }

    try {
      const response = await regenerateBackupCodes({
        otp: backupCodeOtp.trim() || undefined,
        currentPassword: backupCodePassword.trim() || undefined,
      }).unwrap()

      setLatestBackupCodes(response.data.backupCodes)
      setBackupCodeOtp('')
      setBackupCodePassword('')
      toast.success('Backup codes regenerated successfully.')
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, 'Unable to regenerate backup codes.'),
      )
    }
  }

  return (
    <section>
      <SectionTitle tone="brand" text="Security Protocols" />
      <article className="space-y-4 p-1 sm:p-2">
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-[#c9dcfb] p-2.5 text-[#305ea8]">
                <KeyRound className="size-4" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-700">
                  Password Update
                </p>
                <p className="text-sm font-medium text-slate-500">
                  Keep your account secure by updating passwords regularly.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowPasswordModal(true)}
              className="self-start rounded-md border border-slate-300 bg-slate-50 px-4 py-1.5 text-xs font-semibold text-brand-700 transition hover:bg-white sm:self-auto"
            >
              Update
            </button>
          </div>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-[#bfeff4] p-2.5 text-[#1b7f89]">
                <Fingerprint className="size-4" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-700">
                  Two-factor Authentication
                </p>
                <p
                  className={`inline-flex items-center gap-1 text-sm font-semibold ${
                    twoFactorEnabled ? 'text-emerald-700' : 'text-amber-700'
                  }`}
                >
                  <StatusIcon enabled={twoFactorEnabled} />
                  {twoFactorEnabled ? 'Enabled and Protected' : 'Disabled'}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {twoFactorEnabled ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setLatestBackupCodes(null)
                      setShowBackupCodesModal(true)
                    }}
                    className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-slate-50 px-4 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-white"
                  >
                    <RefreshCcw className="size-3.5" />
                    Backup Codes
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDisableTwoFactorModal(true)}
                    className="self-start rounded-md border border-red-300 bg-red-50 px-4 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 sm:self-auto"
                  >
                    Disable 2FA
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => void handleGenerateTwoFactor()}
                  disabled={isGeneratingTwoFactor}
                  className="inline-flex self-start items-center gap-2 rounded-md border border-slate-300 bg-slate-50 px-4 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
                >
                  {isGeneratingTwoFactor ? <BusyIcon /> : null}
                  Enable 2FA
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <ShieldEllipsis className="size-4 text-slate-500" />
            <h3 className="text-lg font-semibold text-slate-700">
              Login History
            </h3>
          </div>

          {isLoadingHistory ? (
            <div className="space-y-2">
              <div className="h-10 animate-pulse rounded-md bg-slate-100" />
              <div className="h-10 animate-pulse rounded-md bg-slate-100" />
              <div className="h-10 animate-pulse rounded-md bg-slate-100" />
            </div>
          ) : loginHistory.length === 0 ? (
            <p className="text-sm text-slate-500">
              No recent login history found.
            </p>
          ) : (
            <div className="space-y-2">
              {loginHistory.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-md px-3 py-2 text-sm ring-1 ring-slate-200"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium text-slate-700">
                      {entry.ipAddress || 'Unknown IP'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatHistoryDate(entry.createdAt)}
                    </p>
                  </div>
                  <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                    {entry.userAgent || 'Unknown device'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </article>

      <Modal
        open={showPasswordModal}
        title="Change Password"
        subtitle="Update your password to keep your account secure."
        onClose={() => setShowPasswordModal(false)}
      >
        <div className="space-y-3">
          <input
            type="password"
            placeholder="Current password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-brand-500"
          />
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-brand-500"
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-brand-500"
          />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setShowPasswordModal(false)}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handlePasswordChange()}
            disabled={isUpdatingPassword}
            className="inline-flex items-center gap-2 rounded-md bg-brand-700 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isUpdatingPassword ? <BusyIcon /> : null}
            Save Password
          </button>
        </div>
      </Modal>

      <Modal
        open={showEnableTwoFactorModal}
        title="Enable 2FA"
        subtitle="Scan QR and verify by authenticator app or email OTP."
        onClose={() => setShowEnableTwoFactorModal(false)}
      >
        {generatedTwoFactorData ? (
          <div className="space-y-4">
            <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                QR Setup
              </p>
              <div className="mt-2 flex justify-center">
                {qrImageSrc ? (
                  <img
                    src={qrImageSrc}
                    alt="2FA QR code"
                    className="size-44 rounded-lg bg-white p-2 ring-1 ring-slate-200"
                  />
                ) : (
                  <div className="flex size-44 items-center justify-center rounded-lg bg-white text-sm text-slate-500 ring-1 ring-slate-200">
                    QR unavailable
                  </div>
                )}
              </div>
              <p className="mt-3 break-all text-xs font-medium text-slate-500">
                Secret: {generatedTwoFactorData.secret}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
              <p className="text-sm font-semibold text-slate-700">
                Backup Codes
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Store these safely. Each code can be used once.
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {generatedTwoFactorData.backupCodes.map((code) => (
                  <div
                    key={code}
                    className="rounded-md bg-white px-2 py-1 text-center text-xs font-semibold text-slate-700 ring-1 ring-slate-200"
                  >
                    {code}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSetupMethod('app')}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                  setupMethod === 'app'
                    ? 'bg-brand-700 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Authenticator App
              </button>
              <button
                type="button"
                onClick={() => setSetupMethod('email')}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                  setupMethod === 'email'
                    ? 'bg-brand-700 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Email OTP
              </button>
            </div>

            {setupMethod === 'app' ? (
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Authenticator OTP
                </label>
                <input
                  value={setupOtp}
                  onChange={(event) => setSetupOtp(event.target.value)}
                  placeholder="6-digit code"
                  className="mt-1 h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-brand-500"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Email OTP
                </label>
                <input
                  value={setupEmailOtp}
                  onChange={(event) => setSetupEmailOtp(event.target.value)}
                  placeholder="6-digit code"
                  className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-brand-500"
                />
                <button
                  type="button"
                  onClick={() => void handleSendSetupEmailOtp()}
                  disabled={isSendingSetupEmailOtp}
                  className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700"
                >
                  {isSendingSetupEmailOtp ? <BusyIcon /> : null}
                  Send OTP To Email
                </button>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-500">Generate setup first.</p>
        )}

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setShowEnableTwoFactorModal(false)}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleVerifyTwoFactor()}
            disabled={!generatedTwoFactorData || isVerifyingTwoFactor}
            className="inline-flex items-center gap-2 rounded-md bg-brand-700 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isVerifyingTwoFactor ? <BusyIcon /> : null}
            Verify & Enable
          </button>
        </div>
      </Modal>

      <Modal
        open={showDisableTwoFactorModal}
        title="Disable 2FA"
        subtitle="Provide OTP or your current password to disable 2FA."
        onClose={() => setShowDisableTwoFactorModal(false)}
      >
        <div className="space-y-3">
          <input
            value={disableOtp}
            onChange={(event) => setDisableOtp(event.target.value)}
            placeholder="OTP (optional if password provided)"
            className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-brand-500"
          />
          <input
            type="password"
            value={disablePassword}
            onChange={(event) => setDisablePassword(event.target.value)}
            placeholder="Current password (optional if OTP provided)"
            className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-brand-500"
          />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setShowDisableTwoFactorModal(false)}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleDisableTwoFactor()}
            disabled={isDisablingTwoFactor}
            className="inline-flex items-center gap-2 rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDisablingTwoFactor ? <BusyIcon /> : null}
            Disable 2FA
          </button>
        </div>
      </Modal>

      <Modal
        open={showBackupCodesModal}
        title="Backup Codes"
        subtitle="Regenerate backup codes using OTP or current password."
        onClose={() => setShowBackupCodesModal(false)}
      >
        <div className="space-y-3">
          <input
            value={backupCodeOtp}
            onChange={(event) => setBackupCodeOtp(event.target.value)}
            placeholder="OTP (optional if password provided)"
            className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-brand-500"
          />
          <input
            type="password"
            value={backupCodePassword}
            onChange={(event) => setBackupCodePassword(event.target.value)}
            placeholder="Current password (optional if OTP provided)"
            className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-brand-500"
          />

          {latestBackupCodes?.length ? (
            <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
              <p className="mb-2 text-sm font-semibold text-slate-700">
                New Backup Codes
              </p>
              <div className="grid grid-cols-2 gap-2">
                {latestBackupCodes.map((code) => (
                  <div
                    key={code}
                    className="rounded-md bg-white px-2 py-1 text-center text-xs font-semibold text-slate-700 ring-1 ring-slate-200"
                  >
                    {code}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setShowBackupCodesModal(false)}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => void handleRegenerateBackupCodes()}
            disabled={isRegeneratingBackupCodes}
            className="inline-flex items-center gap-2 rounded-md bg-brand-700 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRegeneratingBackupCodes ? <BusyIcon /> : null}
            Regenerate Codes
          </button>
        </div>
      </Modal>
    </section>
  )
}
