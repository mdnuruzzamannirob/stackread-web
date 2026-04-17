'use client'

import {
  Fingerprint,
  KeyRound,
  LockKeyhole,
  Mail,
  ShieldEllipsis,
} from 'lucide-react'
import { type ReactNode, useMemo, useState } from 'react'
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
import type { LoginHistoryRow } from '@/store/features/auth/types'

import {
  BusyIcon,
  Modal,
  SettingsCard,
  SettingsPageHeader,
} from '@/components/settings/SettingsShared'

type SetupMethod = 'app' | 'email'

const formatHistoryDate = (value: string) => {
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString()
}

const getBrowserFromUserAgent = (userAgent: string) => {
  const ua = userAgent.toLowerCase()
  if (ua.includes('edg/')) return 'Edge'
  if (ua.includes('opr/') || ua.includes('opera')) return 'Opera'
  if (ua.includes('chrome/')) return 'Chrome'
  if (ua.includes('firefox/')) return 'Firefox'
  if (ua.includes('safari/') && !ua.includes('chrome/')) return 'Safari'
  return 'Browser'
}

const getDeviceFromUserAgent = (userAgent: string) => {
  const ua = userAgent.toLowerCase()
  if (ua.includes('iphone')) return 'iPhone'
  if (ua.includes('ipad')) return 'iPad'
  if (ua.includes('android'))
    return ua.includes('mobile') ? 'Android Phone' : 'Android Tablet'
  if (ua.includes('macintosh') || ua.includes('mac os')) return 'Mac'
  if (ua.includes('windows')) return 'Windows PC'
  if (ua.includes('linux')) return 'Linux'
  return 'Unknown Device'
}

const resolveDeviceBrowserLabel = (entry: LoginHistoryRow) => {
  if (entry.device || entry.browser)
    return [entry.device, entry.browser].filter(Boolean).join(' | ')
  if (!entry.userAgent) return 'Unknown Device | Browser'
  return `${getDeviceFromUserAgent(entry.userAgent)} | ${getBrowserFromUserAgent(entry.userAgent)}`
}

const resolveStatusLabel = (status: LoginHistoryRow['status']) =>
  status === 'current' ? 'Current Session' : 'Successful'

function SecurityFeatureRow({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  disabled,
  danger,
}: {
  icon: ReactNode
  title: string
  description: string
  actionLabel: string
  onAction: () => void
  disabled?: boolean
  danger?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-[#f6f8fa] px-4 py-3">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 rounded-md bg-white p-2 text-slate-600 ring-1 ring-slate-200">
          {icon}
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-800">{title}</p>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onAction}
        disabled={disabled}
        className={`text-sm font-semibold transition ${danger ? 'text-red-700 hover:text-red-800' : 'text-brand-700 hover:text-brand-800'} disabled:cursor-not-allowed disabled:opacity-50`}
      >
        {actionLabel}
      </button>
    </div>
  )
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

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showEnableTwoFactorModal, setShowEnableTwoFactorModal] =
    useState(false)
  const [showDisableTwoFactorModal, setShowDisableTwoFactorModal] =
    useState(false)
  const [showBackupCodesModal, setShowBackupCodesModal] = useState(false)

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
    if (!generatedTwoFactorData?.qrCodeUrl) return ''
    if (generatedTwoFactorData.qrCodeUrl.startsWith('otpauth://')) {
      return `https://chart.googleapis.com/chart?chs=256x256&cht=qr&chl=${encodeURIComponent(generatedTwoFactorData.qrCodeUrl)}`
    }
    return generatedTwoFactorData.qrCodeUrl
  }, [generatedTwoFactorData?.qrCodeUrl])

  const handlePasswordChange = async () => {
    if (!currentPassword.trim() || !newPassword.trim())
      return toast.error('Current and new password are required.')
    if (newPassword.trim().length < 8)
      return toast.error('New password must be at least 8 characters.')
    if (newPassword !== confirmPassword)
      return toast.error('New password and confirmation do not match.')

    try {
      await changeMyPassword({
        currentPassword: currentPassword.trim(),
        newPassword: newPassword.trim(),
      }).unwrap()
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      toast.success('Password updated successfully.')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to update password.'))
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

  const handleVerifyTwoFactor = async () => {
    const otp = setupOtp.trim()
    const emailOtp = setupEmailOtp.trim()

    if (setupMethod === 'app' && !/^\d{6}$/.test(otp))
      return toast.error('Please enter a valid 6-digit authenticator OTP.')
    if (setupMethod === 'email' && !/^\d{6}$/.test(emailOtp))
      return toast.error('Please enter a valid 6-digit email OTP.')

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
    if (!disableOtp.trim() && !disablePassword.trim())
      return toast.error('Provide OTP or current password to disable 2FA.')
    if (disableOtp.trim() && !/^\d{6}$/.test(disableOtp.trim()))
      return toast.error('OTP must be 6 digits.')

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
    if (!backupCodeOtp.trim() && !backupCodePassword.trim())
      return toast.error(
        'Provide OTP or current password to regenerate backup codes.',
      )
    if (backupCodeOtp.trim() && !/^\d{6}$/.test(backupCodeOtp.trim()))
      return toast.error('OTP must be 6 digits.')

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

  const handleSendSetupEmailOtp = async () => {
    try {
      await sendSetupEmailOtp().unwrap()
      toast.success('2FA setup OTP sent to your email.')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to send email OTP.'))
    }
  }

  return (
    <section className="space-y-6">
      <SettingsPageHeader
        title="Security Protocols"
        description="Manage your credentials and advanced access controls to secure your manuscript collections."
      />

      <SettingsCard className="space-y-4">
        <div className="flex items-center gap-2 text-brand-700">
          <KeyRound className="size-4" />
          <h3 className="text-base font-semibold">Update Password</h3>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <input
            type="password"
            placeholder="Current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="h-10 rounded-md border border-slate-200 bg-[#eef2f4] px-3 text-sm outline-none focus:border-brand-500"
          />
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="h-10 rounded-md border border-slate-200 bg-[#eef2f4] px-3 text-sm outline-none focus:border-brand-500"
          />
          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="h-10 rounded-md border border-slate-200 bg-[#eef2f4] px-3 text-sm outline-none focus:border-brand-500"
          />
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => void handlePasswordChange()}
            disabled={isUpdatingPassword}
            className="inline-flex items-center gap-2 rounded-md bg-[#0f8596] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isUpdatingPassword ? <BusyIcon /> : null}Update Password
          </button>
        </div>
      </SettingsCard>

      <SettingsCard className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">
              Two-Factor Authentication
            </h3>
            <p className="text-sm text-slate-500">
              Add an extra layer of security to your account.
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${twoFactorEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}
          >
            {twoFactorEnabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>

        <div className="space-y-2">
          <SecurityFeatureRow
            icon={<Fingerprint className="size-4" />}
            title="Authenticator App (TOTP)"
            description="Use an authenticator app for verification."
            actionLabel={twoFactorEnabled ? 'Manage' : 'Enable'}
            onAction={() => {
              if (twoFactorEnabled) {
                setShowDisableTwoFactorModal(true)
                return
              }
              void handleGenerateTwoFactor()
            }}
            disabled={isGeneratingTwoFactor}
          />
          <SecurityFeatureRow
            icon={<Mail className="size-4" />}
            title="Email Fallback"
            description={`Fallback verification to ${meResponse?.data.email ?? 'your email'}`}
            actionLabel="Manage"
            onAction={() =>
              toast.message(
                'Email fallback is automatically available with account email and OTP delivery.',
              )
            }
          />
          <SecurityFeatureRow
            icon={<LockKeyhole className="size-4" />}
            title="Recovery Codes"
            description="Single-use codes for account recovery."
            actionLabel="Regenerate"
            onAction={() => {
              if (!twoFactorEnabled)
                return toast.error(
                  'Enable 2FA before regenerating backup codes.',
                )
              setLatestBackupCodes(null)
              setShowBackupCodesModal(true)
            }}
            danger
          />
        </div>
      </SettingsCard>

      <SettingsCard className="space-y-4">
        <div className="flex items-center gap-2">
          <ShieldEllipsis className="size-4 text-brand-700" />
          <h3 className="text-lg font-semibold text-slate-800">
            Recent Logins
          </h3>
        </div>
        {isLoadingHistory ? (
          <div className="space-y-2">
            <div className="h-10 animate-pulse rounded-md bg-slate-100" />
            <div className="h-10 animate-pulse rounded-md bg-slate-100" />
          </div>
        ) : loginHistory.length === 0 ? (
          <p className="text-sm text-slate-500">
            No recent login history found.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[1.4px] text-slate-600">
                    Date & Time
                  </th>
                  <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[1.4px] text-slate-600">
                    Device / Browser
                  </th>
                  <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[1.4px] text-slate-600">
                    Location
                  </th>
                  <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[1.4px] text-slate-600">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {loginHistory.map((entry) => (
                  <tr key={entry.id}>
                    <td className="px-4 py-2">
                      {formatHistoryDate(entry.createdAt)}
                    </td>
                    <td className="px-4 py-2">
                      {resolveDeviceBrowserLabel(entry)}
                    </td>
                    <td className="px-4 py-2">
                      {entry.location || entry.ipAddress || 'Unknown'}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${entry.status === 'current' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}
                      >
                        {resolveStatusLabel(entry.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SettingsCard>

      <Modal
        open={showEnableTwoFactorModal}
        title="Enable 2FA"
        subtitle="Scan QR and verify by authenticator app or email OTP."
        onClose={() => setShowEnableTwoFactorModal(false)}
      >
        {generatedTwoFactorData ? (
          <div className="space-y-4">
            <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
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
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSetupMethod('app')}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${setupMethod === 'app' ? 'bg-brand-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                Authenticator App
              </button>
              <button
                type="button"
                onClick={() => setSetupMethod('email')}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${setupMethod === 'email' ? 'bg-brand-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                Email OTP
              </button>
            </div>
            {setupMethod === 'app' ? (
              <input
                value={setupOtp}
                onChange={(e) => setSetupOtp(e.target.value)}
                placeholder="6-digit app OTP"
                className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-brand-500"
              />
            ) : (
              <div className="space-y-2">
                <input
                  value={setupEmailOtp}
                  onChange={(e) => setSetupEmailOtp(e.target.value)}
                  placeholder="6-digit email OTP"
                  className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-brand-500"
                />
                <button
                  type="button"
                  onClick={() => void handleSendSetupEmailOtp()}
                  disabled={isSendingSetupEmailOtp}
                  className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700"
                >
                  {isSendingSetupEmailOtp ? <BusyIcon /> : null}Send OTP To
                  Email
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
            className="inline-flex items-center gap-2 rounded-md bg-brand-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isVerifyingTwoFactor ? <BusyIcon /> : null}Verify & Enable
          </button>
        </div>
      </Modal>

      <Modal
        open={showDisableTwoFactorModal}
        title="Disable 2FA"
        subtitle="Provide OTP or current password to disable 2FA."
        onClose={() => setShowDisableTwoFactorModal(false)}
      >
        <div className="space-y-3">
          <input
            value={disableOtp}
            onChange={(e) => setDisableOtp(e.target.value)}
            placeholder="OTP (optional if password provided)"
            className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-brand-500"
          />
          <input
            type="password"
            value={disablePassword}
            onChange={(e) => setDisablePassword(e.target.value)}
            placeholder="Current password (optional if OTP provided)"
            className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-brand-500"
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
            className="inline-flex items-center gap-2 rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isDisablingTwoFactor ? <BusyIcon /> : null}Disable 2FA
          </button>
        </div>
      </Modal>

      <Modal
        open={showBackupCodesModal}
        title="Recovery Codes"
        subtitle="Regenerate backup codes using OTP or current password."
        onClose={() => setShowBackupCodesModal(false)}
      >
        <div className="space-y-3">
          <input
            value={backupCodeOtp}
            onChange={(e) => setBackupCodeOtp(e.target.value)}
            placeholder="OTP (optional if password provided)"
            className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-brand-500"
          />
          <input
            type="password"
            value={backupCodePassword}
            onChange={(e) => setBackupCodePassword(e.target.value)}
            placeholder="Current password (optional if OTP provided)"
            className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-brand-500"
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
            className="inline-flex items-center gap-2 rounded-md bg-brand-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isRegeneratingBackupCodes ? <BusyIcon /> : null}Regenerate Codes
          </button>
        </div>
      </Modal>
    </section>
  )
}
