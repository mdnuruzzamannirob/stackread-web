'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { getApiErrorMessage } from '@/lib/api/error-message'
import {
  useMeQuery,
  useUpdateMyNotificationPreferencesMutation,
} from '@/store/features/auth/authApi'

import {
  BusyIcon,
  PreferenceToggle,
  SettingsCard,
  SettingsPageHeader,
  SkeletonRow,
} from '@/components/settings/SettingsShared'

export default function PreferencesPage() {
  const { data: meResponse, isFetching: isLoadingProfile } = useMeQuery()
  const [updatePreferences, { isLoading: isUpdatingPreferences }] =
    useUpdateMyNotificationPreferencesMutation()

  const [betaFeatures, setBetaFeatures] = useState(false)
  const [emailDigest, setEmailDigest] = useState(true)
  const [pushNotification, setPushNotification] = useState(true)

  useEffect(() => {
    if (!meResponse?.data) {
      return
    }

    setEmailDigest(Boolean(meResponse.data.notificationPreferences?.email))
    setPushNotification(Boolean(meResponse.data.notificationPreferences?.push))
  }, [meResponse?.data])

  const updatePreference = async (field: 'email' | 'push', value: boolean) => {
    if (field === 'email') {
      setEmailDigest(value)
    } else {
      setPushNotification(value)
    }

    try {
      await updatePreferences({ [field]: value }).unwrap()
      toast.success(
        `${field === 'email' ? 'Weekly digest' : 'Push notification'} preference updated.`,
      )
    } catch (error) {
      if (field === 'email') {
        setEmailDigest((previous) => !previous)
      } else {
        setPushNotification((previous) => !previous)
      }

      toast.error(
        getApiErrorMessage(error, 'Unable to update notification preference.'),
      )
    }
  }

  return (
    <section className="space-y-6">
      <SettingsPageHeader
        title="Preferences"
        description="Tailor your interaction with the platform. Control how and when we communicate with you."
      />

      <SettingsCard>
        {isLoadingProfile ? (
          <div className="space-y-4">
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
        ) : (
          <div className="space-y-1 divide-y divide-slate-100">
            <div className="flex items-start justify-between gap-5 py-4">
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Weekly Knowledge Digest
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Receive a curated email summarizing top discussions and new
                  collections in your areas of interest.
                </p>
              </div>
              <PreferenceToggle
                checked={emailDigest}
                onToggle={() => void updatePreference('email', !emailDigest)}
              />
            </div>

            <div className="flex items-start justify-between gap-5 py-4">
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Critical Push Notifications
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Get immediate alerts for direct messages, mentions, and
                  security updates on your registered devices.
                </p>
              </div>
              <PreferenceToggle
                checked={pushNotification}
                onToggle={() =>
                  void updatePreference('push', !pushNotification)
                }
              />
            </div>

            <div className="flex items-start justify-between gap-5 py-4">
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Early Access Features{' '}
                  <span className="ml-1 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                    Beta
                  </span>
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Opt in to preview experimental editorial tools and reading
                  layouts before they are released globally.
                </p>
              </div>
              <PreferenceToggle
                checked={betaFeatures}
                onToggle={() => {
                  setBetaFeatures((previous) => !previous)
                  toast.success('Early access preference updated locally.')
                }}
              />
            </div>
          </div>
        )}

        {isUpdatingPreferences ? (
          <p className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-brand-700">
            <BusyIcon /> Saving preference...
          </p>
        ) : null}
      </SettingsCard>
    </section>
  )
}
