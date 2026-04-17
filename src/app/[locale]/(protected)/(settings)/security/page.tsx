'use client'

import {
  Fingerprint,
  KeyRound,
  LockKeyhole,
  Mail,
  ShieldEllipsis,
  ShieldOff,
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
import Image from 'next/image'

type TwoFactorSetupData = {
  secret: string
  qrCodeUrl: string
  backupCodes: string[]
}

const RECENT_LOGINS_PAGE_SIZE = 10

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
  const [loginHistoryPage, setLoginHistoryPage] = useState(1)
  const { data: loginHistoryResponse, isFetching: isLoadingHistory } =
    useLoginHistoryQuery({
      page: loginHistoryPage,
      limit: RECENT_LOGINS_PAGE_SIZE,
    })

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

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showTotpSetupModal, setShowTotpSetupModal] = useState(false)
  const [showEmailSetupModal, setShowEmailSetupModal] = useState(false)
  const [showDisableTwoFactorModal, setShowDisableTwoFactorModal] =
    useState(false)

  const [totpPassword, setTotpPassword] = useState('')
  const [totpOtp, setTotpOtp] = useState('')
  const [totpSetupData, setTotpSetupData] = useState<TwoFactorSetupData | null>(
    null,
  )

  const [emailSetupPassword, setEmailSetupPassword] = useState('')
  const [emailSetupOtp, setEmailSetupOtp] = useState('')
  const [isEmailSetupStarted, setIsEmailSetupStarted] = useState(false)

  const [disablePassword, setDisablePassword] = useState('')

  const twoFactorEnabled = Boolean(meResponse?.data.twoFactorEnabled)
  const loginHistoryData = loginHistoryResponse?.data
  const loginHistory = loginHistoryData?.items ?? []
  const loginHistoryPagination = loginHistoryData?.pagination

  const visibleStart =
    loginHistory.length > 0
      ? ((loginHistoryPagination?.page ?? 1) - 1) *
          (loginHistoryPagination?.limit ?? RECENT_LOGINS_PAGE_SIZE) +
        1
      : 0
  const visibleEnd =
    loginHistory.length > 0 ? visibleStart + loginHistory.length - 1 : 0

  const qrImageSrc = useMemo(() => {
    if (!totpSetupData?.qrCodeUrl) return ''
    if (totpSetupData.qrCodeUrl.startsWith('data:image/')) {
      return totpSetupData.qrCodeUrl
    }

    return ''
  }, [totpSetupData?.qrCodeUrl])

  const resetTotpSetupState = () => {
    setTotpPassword('')
    setTotpOtp('')
    setTotpSetupData(null)
  }

  const resetEmailSetupState = () => {
    setEmailSetupPassword('')
    setEmailSetupOtp('')
    setIsEmailSetupStarted(false)
  }

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

  const initializeTwoFactorSetup = async (password: string) => {
    const response = await enableTwoFactor({
      currentPassword: password,
    }).unwrap()
    return response.data
  }

  const handleOpenTotpSetup = () => {
    if (twoFactorEnabled) {
      setShowDisableTwoFactorModal(true)
      toast.message('Disable current 2FA first, then set up TOTP.')
      return
    }

    resetTotpSetupState()
    setShowTotpSetupModal(true)
  }

  const handleOpenEmailSetup = () => {
    if (twoFactorEnabled) {
      setShowDisableTwoFactorModal(true)
      toast.message('Disable current 2FA first, then set up Email OTP.')
      return
    }

    resetEmailSetupState()
    setShowEmailSetupModal(true)
  }

  const handleStartTotpSetup = async () => {
    const password = totpPassword.trim()

    if (password.length < 8) {
      return toast.error('Current password is required to start TOTP setup.')
    }

    try {
      const data = await initializeTwoFactorSetup(password)
      setTotpSetupData(data)
      setTotpOtp('')
      toast.success('TOTP setup initialized. Verify with app OTP to complete.')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to start TOTP setup.'))
    }
  }

  const handleCompleteTotpSetup = async () => {
    const password = totpPassword.trim()
    const otp = totpOtp.trim()

    if (password.length < 8) return toast.error('Current password is required.')
    if (!totpSetupData)
      return toast.error('Start TOTP setup first to generate your QR code.')
    if (!/^\d{6}$/.test(otp))
      return toast.error('Please enter a valid 6-digit authenticator OTP.')

    try {
      await verifyTwoFactor({ currentPassword: password, otp }).unwrap()
      setShowTotpSetupModal(false)
      resetTotpSetupState()
      toast.success('TOTP 2FA enabled successfully.')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to complete TOTP setup.'))
    }
  }

  const handleStartEmailSetup = async () => {
    const password = emailSetupPassword.trim()

    if (password.length < 8) {
      return toast.error('Current password is required to start Email setup.')
    }

    try {
      await initializeTwoFactorSetup(password)
      setIsEmailSetupStarted(true)
      setEmailSetupOtp('')
      await sendSetupEmailOtp().unwrap()
      toast.success('Email setup OTP sent to your account email.')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to start Email setup.'))
    }
  }

  const handleResendEmailSetupOtp = async () => {
    if (!isEmailSetupStarted) return toast.error('Start Email setup first.')

    try {
      await sendSetupEmailOtp().unwrap()
      toast.success('Email setup OTP sent successfully.')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to send email OTP.'))
    }
  }

  const handleCompleteEmailSetup = async () => {
    const password = emailSetupPassword.trim()
    const emailOtp = emailSetupOtp.trim()

    if (password.length < 8) return toast.error('Current password is required.')
    if (!isEmailSetupStarted) return toast.error('Start Email setup first.')
    if (!/^\d{6}$/.test(emailOtp))
      return toast.error('Please enter a valid 6-digit email OTP.')

    try {
      await verifyTwoFactor({ currentPassword: password, emailOtp }).unwrap()
      setShowEmailSetupModal(false)
      resetEmailSetupState()
      toast.success('Email 2FA enabled successfully.')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to complete Email setup.'))
    }
  }

  const handleDisableTwoFactor = async () => {
    const password = disablePassword.trim()

    if (password.length < 8)
      return toast.error('Current password is required to disable 2FA.')

    try {
      await disableTwoFactor({
        currentPassword: password,
      }).unwrap()
      setDisablePassword('')
      setShowDisableTwoFactorModal(false)
      toast.success('2FA disabled successfully.')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to disable 2FA.'))
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
              Setup flows are separated for TOTP, Email OTP, and backup codes.
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
            description="Setup TOTP only. No email option is shown in this flow."
            actionLabel={twoFactorEnabled ? 'Switch Method' : 'Setup'}
            onAction={handleOpenTotpSetup}
            disabled={isGeneratingTwoFactor || isVerifyingTwoFactor}
          />
          <SecurityFeatureRow
            icon={<Mail className="size-4" />}
            title="Email OTP"
            description={`Setup Email OTP only for ${meResponse?.data.email ?? 'your account email'}.`}
            actionLabel={twoFactorEnabled ? 'Switch Method' : 'Setup'}
            onAction={handleOpenEmailSetup}
            disabled={isGeneratingTwoFactor || isVerifyingTwoFactor}
          />
          <SecurityFeatureRow
            icon={<LockKeyhole className="size-4" />}
            title="Backup Codes"
            description="Backup code management is temporarily disabled from this screen."
            actionLabel="Disabled"
            onAction={() => undefined}
            disabled
          />
          {twoFactorEnabled ? (
            <SecurityFeatureRow
              icon={<ShieldOff className="size-4" />}
              title="Disable Two-Factor Authentication"
              description="Disable all 2FA methods with password verification."
              actionLabel="Disable"
              onAction={() => {
                setDisablePassword('')
                setShowDisableTwoFactorModal(true)
              }}
              danger
            />
          ) : null}
        </div>
      </SettingsCard>

      <SettingsCard className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldEllipsis className="size-4 text-brand-700" />
            <h3 className="text-lg font-semibold text-slate-800">
              Recent Logins
            </h3>
          </div>
          <p className="text-xs font-medium text-slate-500">
            {loginHistory.length > 0
              ? `Showing ${visibleStart}-${visibleEnd} of ${loginHistoryPagination?.total ?? loginHistory.length}`
              : 'No entries to display'}
          </p>
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

        {loginHistoryPagination ? (
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              Page {loginHistoryPagination.page} of{' '}
              {loginHistoryPagination.totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLoginHistoryPage((previous) => previous - 1)}
                disabled={
                  !loginHistoryPagination.hasPreviousPage || isLoadingHistory
                }
                className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setLoginHistoryPage((previous) => previous + 1)}
                disabled={
                  !loginHistoryPagination.hasNextPage || isLoadingHistory
                }
                className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </SettingsCard>

      <Modal
        open={showTotpSetupModal}
        title="Setup TOTP 2FA"
        subtitle="Password-first TOTP flow. Once password is verified, setup is generated automatically."
        onClose={() => {
          setShowTotpSetupModal(false)
          resetTotpSetupState()
        }}
      >
        <div className="space-y-4">
          <input
            type="password"
            value={totpPassword}
            onChange={(event) => setTotpPassword(event.target.value)}
            placeholder="Current password"
            className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-brand-500"
          />

          {totpSetupData ? (
            <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
              <div className="mt-2 flex justify-center">
                {qrImageSrc ? (
                  <Image
                    src={qrImageSrc}
                    alt="2FA QR code"
                    width={176}
                    height={176}
                    className="size-44 rounded-lg bg-white p-2 ring-1 ring-slate-200"
                  />
                ) : (
                  <div className="flex size-44 items-center justify-center rounded-lg bg-white text-sm text-slate-500 ring-1 ring-slate-200">
                    QR unavailable
                  </div>
                )}
              </div>
              <p className="mt-3 break-all text-xs font-medium text-slate-500">
                Secret: {totpSetupData.secret}
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-500">
              Enter your current password and continue to generate your QR code
              and secret key.
            </p>
          )}

          <input
            value={totpOtp}
            onChange={(event) => setTotpOtp(event.target.value)}
            placeholder="6-digit authenticator OTP"
            className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-brand-500"
          />
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              setShowTotpSetupModal(false)
              resetTotpSetupState()
            }}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() =>
              void (totpSetupData
                ? handleCompleteTotpSetup()
                : handleStartTotpSetup())
            }
            disabled={
              totpSetupData ? isVerifyingTwoFactor : isGeneratingTwoFactor
            }
            className="inline-flex items-center gap-2 rounded-md bg-brand-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {totpSetupData ? (
              isVerifyingTwoFactor ? (
                <BusyIcon />
              ) : null
            ) : isGeneratingTwoFactor ? (
              <BusyIcon />
            ) : null}
            {totpSetupData ? 'Verify & Enable' : 'Verify Password & Continue'}
          </button>
        </div>
      </Modal>

      <Modal
        open={showEmailSetupModal}
        title="Setup Email OTP 2FA"
        subtitle="Password-first email OTP flow. Setup starts automatically after password verification."
        onClose={() => {
          setShowEmailSetupModal(false)
          resetEmailSetupState()
        }}
      >
        <div className="space-y-4">
          <input
            type="password"
            value={emailSetupPassword}
            onChange={(event) => setEmailSetupPassword(event.target.value)}
            placeholder="Current password"
            className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-brand-500"
          />

          {isEmailSetupStarted ? (
            <div className="space-y-2">
              <input
                value={emailSetupOtp}
                onChange={(event) => setEmailSetupOtp(event.target.value)}
                placeholder="6-digit email OTP"
                className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-brand-500"
              />
              <button
                type="button"
                onClick={() => void handleResendEmailSetupOtp()}
                disabled={isSendingSetupEmailOtp}
                className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:opacity-60"
              >
                {isSendingSetupEmailOtp ? <BusyIcon /> : null}Resend Email OTP
              </button>
            </div>
          ) : (
            <p className="text-xs text-slate-500">
              Enter your current password and continue to receive a setup OTP in
              your email.
            </p>
          )}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              setShowEmailSetupModal(false)
              resetEmailSetupState()
            }}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() =>
              void (isEmailSetupStarted
                ? handleCompleteEmailSetup()
                : handleStartEmailSetup())
            }
            disabled={
              isEmailSetupStarted
                ? isVerifyingTwoFactor
                : isGeneratingTwoFactor || isSendingSetupEmailOtp
            }
            className="inline-flex items-center gap-2 rounded-md bg-brand-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isEmailSetupStarted ? (
              isVerifyingTwoFactor ? (
                <BusyIcon />
              ) : null
            ) : isGeneratingTwoFactor || isSendingSetupEmailOtp ? (
              <BusyIcon />
            ) : null}
            {isEmailSetupStarted
              ? 'Verify & Enable'
              : 'Verify Password & Continue'}
          </button>
        </div>
      </Modal>

      <Modal
        open={showDisableTwoFactorModal}
        title="Disable 2FA"
        subtitle="Password verification is required before disabling 2FA."
        onClose={() => setShowDisableTwoFactorModal(false)}
      >
        <div className="space-y-3">
          <input
            type="password"
            value={disablePassword}
            onChange={(event) => setDisablePassword(event.target.value)}
            placeholder="Current password"
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
    </section>
  )
}
