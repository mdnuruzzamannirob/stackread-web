'use client'

import {
  Copy,
  Download,
  Fingerprint,
  KeyRound,
  LockKeyhole,
  Mail,
  ShieldEllipsis,
  ShieldOff,
} from 'lucide-react'
import Image from 'next/image'
import { type ReactNode, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { getApiErrorMessage } from '@/lib/api/error-message'
import {
  clearTwoFactorMethodPreference,
  setTwoFactorMethodPreference,
} from '@/lib/auth/two-factor-preferences'
import {
  useChangeMyPasswordMutation,
  useDisableTwoFactorMutation,
  useEnableTwoFactorMutation,
  useLazyGetTwoFactorBackupCodesCountQuery,
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

type TwoFactorSetupData = {
  secret: string
  qrCodeUrl: string
  backupCodes: string[]
}

type SetupMethod = 'totp' | 'email'

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
  if (ua.includes('android')) {
    return ua.includes('mobile') ? 'Android Phone' : 'Android Tablet'
  }
  if (ua.includes('macintosh') || ua.includes('mac os')) return 'Mac'
  if (ua.includes('windows')) return 'Windows PC'
  if (ua.includes('linux')) return 'Linux'

  return 'Unknown Device'
}

const resolveDeviceBrowserLabel = (entry: LoginHistoryRow) => {
  if (entry.device || entry.browser) {
    return [entry.device, entry.browser].filter(Boolean).join(' | ')
  }

  if (!entry.userAgent) {
    return 'Unknown Device | Browser'
  }

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
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 rounded-lg bg-white p-2 text-slate-600 ring-1 ring-slate-200">
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

const digitsOnly = (value: string, limit: number) =>
  value.replace(/\D/g, '').slice(0, limit)

export default function SecurityPage() {
  const { data: meResponse } = useMeQuery()
  const userEmail = meResponse?.data.email ?? ''

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
  const [regenerateBackupCodes, { isLoading: isRegeneratingBackupCodes }] =
    useRegenerateBackupCodesMutation()
  const [fetchBackupCount, { isFetching: isFetchingBackupCount }] =
    useLazyGetTwoFactorBackupCodesCountQuery()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showSetupModal, setShowSetupModal] = useState(false)
  const [setupMethod, setSetupMethod] = useState<SetupMethod>('totp')
  const [setupPassword, setSetupPassword] = useState('')
  const [setupOtp, setSetupOtp] = useState('')
  const [setupData, setSetupData] = useState<TwoFactorSetupData | null>(null)
  const [setupEmailCooldown, setSetupEmailCooldown] = useState(0)

  const [showDisableModal, setShowDisableModal] = useState(false)
  const [disablePassword, setDisablePassword] = useState('')
  const [disableOtp, setDisableOtp] = useState('')

  const [showBackupManagerModal, setShowBackupManagerModal] = useState(false)
  const [backupCountOtp, setBackupCountOtp] = useState('')
  const [remainingBackupCodes, setRemainingBackupCodes] = useState<
    number | null
  >(null)
  const [regeneratePassword, setRegeneratePassword] = useState('')
  const [regenerateOtp, setRegenerateOtp] = useState('')

  const [showBackupCodesModal, setShowBackupCodesModal] = useState(false)
  const [revealedBackupCodes, setRevealedBackupCodes] = useState<string[]>([])
  const [backupCodesSource, setBackupCodesSource] = useState<
    'setup' | 'regenerated'
  >('setup')

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

  const qrImageSrc =
    setupData?.qrCodeUrl && setupData.qrCodeUrl.startsWith('data:image/')
      ? setupData.qrCodeUrl
      : ''

  useEffect(() => {
    if (setupEmailCooldown <= 0) {
      return
    }

    const interval = window.setInterval(() => {
      setSetupEmailCooldown((value) => Math.max(0, value - 1))
    }, 1000)

    return () => {
      window.clearInterval(interval)
    }
  }, [setupEmailCooldown])

  const resetSetupState = () => {
    setSetupPassword('')
    setSetupOtp('')
    setSetupData(null)
    setSetupEmailCooldown(0)
  }

  const resetDisableState = () => {
    setDisablePassword('')
    setDisableOtp('')
  }

  const resetBackupManagerState = () => {
    setBackupCountOtp('')
    setRegeneratePassword('')
    setRegenerateOtp('')
  }

  const handlePasswordChange = async () => {
    if (!currentPassword.trim() || !newPassword.trim()) {
      toast.error('Current and new password are required.')
      return
    }

    if (newPassword.trim().length < 8) {
      toast.error('New password must be at least 8 characters.')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('New password and confirmation do not match.')
      return
    }

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

  const openSetupModal = (method: SetupMethod) => {
    setSetupMethod(method)
    resetSetupState()
    setShowSetupModal(true)

    if (twoFactorEnabled) {
      toast.message(
        'Completing this setup will replace your current 2FA verification method preference.',
      )
    }
  }

  const startTwoFactorSetup = async () => {
    const password = setupPassword.trim()

    if (password.length < 8) {
      toast.error('Current password is required to start setup.')
      return
    }

    try {
      const response = await enableTwoFactor({
        currentPassword: password,
      }).unwrap()
      setSetupData(response.data)
      setSetupOtp('')

      if (setupMethod === 'email') {
        await sendSetupEmailOtp().unwrap()
        setSetupEmailCooldown(60)
        toast.success('Setup OTP sent to your email. Enter it to finish setup.')
      } else {
        toast.success('Scan the QR code and enter your authenticator OTP.')
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to start 2FA setup.'))
    }
  }

  const resendSetupOtp = async () => {
    if (!setupData || setupMethod !== 'email') {
      toast.error('Start email setup first.')
      return
    }

    if (setupEmailCooldown > 0) {
      return
    }

    try {
      await sendSetupEmailOtp().unwrap()
      setSetupEmailCooldown(60)
      toast.success('Setup OTP sent successfully.')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to send setup OTP.'))
    }
  }

  const completeTwoFactorSetup = async () => {
    const password = setupPassword.trim()

    if (password.length < 8) {
      toast.error('Current password is required.')
      return
    }

    if (!setupData) {
      toast.error('Start setup first.')
      return
    }

    if (!/^\d{6}$/.test(setupOtp)) {
      toast.error('Please enter a valid 6-digit OTP.')
      return
    }

    try {
      if (setupMethod === 'totp') {
        await verifyTwoFactor({
          currentPassword: password,
          otp: setupOtp,
        }).unwrap()
      } else {
        await verifyTwoFactor({
          currentPassword: password,
          emailOtp: setupOtp,
        }).unwrap()
      }

      if (userEmail) {
        setTwoFactorMethodPreference(userEmail, setupMethod)
      }

      setRevealedBackupCodes(setupData.backupCodes)
      setBackupCodesSource('setup')
      setRemainingBackupCodes(setupData.backupCodes.length)
      setShowBackupCodesModal(true)

      setShowSetupModal(false)
      resetSetupState()
      toast.success('2FA enabled successfully.')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to complete 2FA setup.'))
    }
  }

  const handleDisableTwoFactor = async () => {
    const password = disablePassword.trim()

    if (password.length < 8) {
      toast.error('Current password is required to disable 2FA.')
      return
    }

    if (disableOtp && !/^\d{6}$/.test(disableOtp)) {
      toast.error('Optional authenticator OTP must be 6 digits.')
      return
    }

    try {
      await disableTwoFactor({
        currentPassword: password,
        ...(disableOtp ? { otp: disableOtp } : {}),
      }).unwrap()

      if (userEmail) {
        clearTwoFactorMethodPreference(userEmail)
      }

      setRemainingBackupCodes(null)
      setShowDisableModal(false)
      resetDisableState()
      toast.success('2FA disabled successfully.')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to disable 2FA.'))
    }
  }

  const handleCheckRemainingBackupCodes = async () => {
    if (!/^\d{6}$/.test(backupCountOtp)) {
      toast.error('Enter a valid 6-digit authenticator OTP.')
      return
    }

    try {
      const response = await fetchBackupCount({ otp: backupCountOtp }).unwrap()
      const remaining = response.data.remainingBackupCodes
      setRemainingBackupCodes(remaining)
      toast.success(`You have ${remaining} backup code(s) remaining.`)
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, 'Unable to fetch backup code count.'),
      )
    }
  }

  const handleRegenerateBackupCodes = async () => {
    const password = regeneratePassword.trim()

    if (password.length < 8) {
      toast.error('Current password is required to regenerate backup codes.')
      return
    }

    if (regenerateOtp && !/^\d{6}$/.test(regenerateOtp)) {
      toast.error('Optional authenticator OTP must be 6 digits.')
      return
    }

    try {
      const response = await regenerateBackupCodes({
        currentPassword: password,
        ...(regenerateOtp ? { otp: regenerateOtp } : {}),
      }).unwrap()

      const backupCodes = response.data.backupCodes

      if (!backupCodes.length) {
        toast.error('No backup codes were returned. Try again.')
        return
      }

      setRevealedBackupCodes(backupCodes)
      setBackupCodesSource('regenerated')
      setRemainingBackupCodes(backupCodes.length)
      setShowBackupCodesModal(true)
      toast.success('Backup codes regenerated successfully.')
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, 'Unable to regenerate backup codes.'),
      )
    }
  }

  const copyBackupCodes = async () => {
    if (!revealedBackupCodes.length) {
      return
    }

    try {
      await navigator.clipboard.writeText(revealedBackupCodes.join('\n'))
      toast.success('Backup codes copied to clipboard.')
    } catch {
      toast.error('Unable to copy backup codes.')
    }
  }

  const downloadBackupCodes = () => {
    if (!revealedBackupCodes.length) {
      return
    }

    const timestamp = new Date().toISOString().slice(0, 10)
    const label = backupCodesSource === 'setup' ? 'setup' : 'regenerated'
    const safeEmail = userEmail ? userEmail.replace(/[^a-z0-9]/gi, '-') : 'user'
    const content = [
      'Stackread Backup Codes',
      `Generated: ${new Date().toLocaleString()}`,
      `Source: ${label}`,
      '',
      ...revealedBackupCodes.map((code, index) => `${index + 1}. ${code}`),
      '',
      'Each code can be used only once.',
    ].join('\n')

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `stackread-backup-codes-${safeEmail}-${timestamp}.txt`
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    URL.revokeObjectURL(url)
  }

  return (
    <section className="space-y-6">
      <SettingsPageHeader
        title="Security Protocols"
        description="Manage password, 2FA verification, and backup recovery codes for your Stackread account."
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
            onChange={(event) => setCurrentPassword(event.target.value)}
            className="h-10 rounded-md border border-slate-200 bg-[#eef2f4] px-3 text-sm outline-none focus:border-brand-500"
          />
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            className="h-10 rounded-md border border-slate-200 bg-[#eef2f4] px-3 text-sm outline-none focus:border-brand-500"
          />
          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
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
            {isUpdatingPassword ? <BusyIcon /> : null}
            Update Password
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
              Configure TOTP or Email OTP and keep backup codes ready for
              account recovery.
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${twoFactorEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}
          >
            {twoFactorEnabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>

        {typeof remainingBackupCodes === 'number' ? (
          <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
            Remaining backup codes: <strong>{remainingBackupCodes}</strong>
          </p>
        ) : null}

        <div className="space-y-2">
          <SecurityFeatureRow
            icon={<Fingerprint className="size-4" />}
            title="Authenticator App (TOTP)"
            description="Use an authenticator app like Google Authenticator, Authy, or 1Password."
            actionLabel={twoFactorEnabled ? 'Reconfigure' : 'Setup'}
            onAction={() => openSetupModal('totp')}
            disabled={isGeneratingTwoFactor || isVerifyingTwoFactor}
          />
          <SecurityFeatureRow
            icon={<Mail className="size-4" />}
            title="Email OTP"
            description={`Use one-time codes sent to ${userEmail || 'your account email'}.`}
            actionLabel={twoFactorEnabled ? 'Reconfigure' : 'Setup'}
            onAction={() => openSetupModal('email')}
            disabled={isGeneratingTwoFactor || isVerifyingTwoFactor}
          />
          <SecurityFeatureRow
            icon={<LockKeyhole className="size-4" />}
            title="Backup Codes"
            description="Check remaining codes and regenerate a fresh backup code set."
            actionLabel={twoFactorEnabled ? 'Manage' : 'Unavailable'}
            onAction={() => {
              resetBackupManagerState()
              setShowBackupManagerModal(true)
            }}
            disabled={!twoFactorEnabled}
          />
          {twoFactorEnabled ? (
            <SecurityFeatureRow
              icon={<ShieldOff className="size-4" />}
              title="Disable Two-Factor Authentication"
              description="Disable 2FA with password verification. Optional authenticator OTP is accepted."
              actionLabel="Disable"
              onAction={() => {
                resetDisableState()
                setShowDisableModal(true)
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
        open={showSetupModal}
        title={
          setupMethod === 'totp'
            ? 'Setup Authenticator (TOTP)'
            : 'Setup Email OTP'
        }
        subtitle={
          setupMethod === 'totp'
            ? 'Verify current password, then confirm with a 6-digit authenticator OTP.'
            : 'Verify current password, request an email OTP, and confirm to enable 2FA.'
        }
        onClose={() => {
          setShowSetupModal(false)
          resetSetupState()
        }}
      >
        <div className="space-y-4">
          <input
            type="password"
            value={setupPassword}
            onChange={(event) => setSetupPassword(event.target.value)}
            placeholder="Current password"
            className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-brand-500"
          />

          {setupData ? (
            <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
              {setupMethod === 'totp' ? (
                <>
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
                    Secret: {setupData.secret}
                  </p>
                </>
              ) : (
                <p className="text-xs text-slate-600">
                  Setup session is ready. Use the email OTP sent to{' '}
                  {userEmail || 'your account email'}.
                </p>
              )}
              <p className="mt-3 text-xs text-slate-500">
                Backup codes are prepared and will be shown after setup
                completes.
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-500">
              Enter your current password and start setup.
            </p>
          )}

          {setupData ? (
            <div className="space-y-2">
              <input
                value={setupOtp}
                onChange={(event) =>
                  setSetupOtp(digitsOnly(event.target.value, 6))
                }
                inputMode="numeric"
                placeholder={
                  setupMethod === 'totp'
                    ? '6-digit authenticator OTP'
                    : '6-digit email OTP'
                }
                className="h-11 w-full rounded-md border border-slate-300 px-3 text-center text-sm tracking-[0.3em] outline-none focus:border-brand-500"
              />

              {setupMethod === 'email' ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void resendSetupOtp()}
                  disabled={isSendingSetupEmailOtp || setupEmailCooldown > 0}
                  className="w-full"
                >
                  {isSendingSetupEmailOtp ? (
                    <>
                      <BusyIcon /> Sending OTP...
                    </>
                  ) : setupEmailCooldown > 0 ? (
                    `Resend in ${setupEmailCooldown}s`
                  ) : (
                    'Send OTP'
                  )}
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              setShowSetupModal(false)
              resetSetupState()
            }}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() =>
              void (setupData
                ? completeTwoFactorSetup()
                : startTwoFactorSetup())
            }
            disabled={
              setupData
                ? isVerifyingTwoFactor
                : isGeneratingTwoFactor ||
                  (setupMethod === 'email' && isSendingSetupEmailOtp)
            }
            className="inline-flex items-center gap-2 rounded-md bg-brand-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {setupData ? (
              isVerifyingTwoFactor ? (
                <BusyIcon />
              ) : null
            ) : isGeneratingTwoFactor ||
              (setupMethod === 'email' && isSendingSetupEmailOtp) ? (
              <BusyIcon />
            ) : null}
            {setupData ? 'Verify & Enable 2FA' : 'Start Setup'}
          </button>
        </div>
      </Modal>

      <Modal
        open={showBackupManagerModal}
        title="Backup Codes"
        subtitle="Check remaining backup codes or regenerate a new code set."
        onClose={() => {
          setShowBackupManagerModal(false)
          resetBackupManagerState()
        }}
      >
        <div className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Remaining Codes
            </p>
            <p className="mt-1 text-sm text-slate-700">
              {typeof remainingBackupCodes === 'number'
                ? `${remainingBackupCodes} code(s) available.`
                : 'Not checked yet.'}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-600">
              Authenticator OTP (required)
            </label>
            <input
              value={backupCountOtp}
              onChange={(event) =>
                setBackupCountOtp(digitsOnly(event.target.value, 6))
              }
              inputMode="numeric"
              placeholder="6-digit OTP"
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-center text-sm tracking-[0.3em] outline-none focus:border-brand-500"
            />
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => void handleCheckRemainingBackupCodes()}
              disabled={isFetchingBackupCount}
            >
              {isFetchingBackupCount ? (
                <>
                  <BusyIcon /> Checking...
                </>
              ) : (
                'Check Remaining Codes'
              )}
            </Button>
          </div>

          <div className="h-px bg-slate-200" />

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-600">
              Current Password (required)
            </label>
            <input
              type="password"
              value={regeneratePassword}
              onChange={(event) => setRegeneratePassword(event.target.value)}
              placeholder="Current password"
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-brand-500"
            />
            <label className="text-xs font-medium text-slate-600">
              Authenticator OTP (optional)
            </label>
            <input
              value={regenerateOtp}
              onChange={(event) =>
                setRegenerateOtp(digitsOnly(event.target.value, 6))
              }
              inputMode="numeric"
              placeholder="6-digit OTP (optional)"
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-center text-sm tracking-[0.3em] outline-none focus:border-brand-500"
            />
            <Button
              type="button"
              className="w-full"
              onClick={() => void handleRegenerateBackupCodes()}
              disabled={isRegeneratingBackupCodes}
            >
              {isRegeneratingBackupCodes ? (
                <>
                  <BusyIcon /> Regenerating...
                </>
              ) : (
                'Regenerate Backup Codes'
              )}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={showDisableModal}
        title="Disable 2FA"
        subtitle="Password is required. Authenticator OTP is optional but recommended."
        onClose={() => {
          setShowDisableModal(false)
          resetDisableState()
        }}
      >
        <div className="space-y-3">
          <input
            type="password"
            value={disablePassword}
            onChange={(event) => setDisablePassword(event.target.value)}
            placeholder="Current password"
            className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-brand-500"
          />
          <input
            value={disableOtp}
            onChange={(event) =>
              setDisableOtp(digitsOnly(event.target.value, 6))
            }
            inputMode="numeric"
            placeholder="6-digit authenticator OTP (optional)"
            className="h-11 w-full rounded-md border border-slate-300 px-3 text-center text-sm tracking-[0.3em] outline-none focus:border-brand-500"
          />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              setShowDisableModal(false)
              resetDisableState()
            }}
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
            {isDisablingTwoFactor ? <BusyIcon /> : null}
            Disable 2FA
          </button>
        </div>
      </Modal>

      <Modal
        open={showBackupCodesModal}
        title={
          backupCodesSource === 'setup'
            ? 'Your Backup Codes'
            : 'Your New Backup Codes'
        }
        subtitle="Store these codes securely. Each code can be used only once during login."
        onClose={() => setShowBackupCodesModal(false)}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {revealedBackupCodes.map((code, index) => (
              <div
                key={`${code}-${index}`}
                className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-center font-mono text-sm tracking-[0.14em] text-slate-700"
              >
                {code}
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => void copyBackupCodes()}
            >
              <Copy className="size-4" />
              Copy Codes
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={downloadBackupCodes}
            >
              <Download className="size-4" />
              Download TXT
            </Button>
          </div>

          <Button
            type="button"
            className="w-full"
            onClick={() => setShowBackupCodesModal(false)}
          >
            Done
          </Button>
        </div>
      </Modal>
    </section>
  )
}
