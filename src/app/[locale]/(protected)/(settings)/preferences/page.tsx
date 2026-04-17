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
  SectionTitle,
  SkeletonRow,
} from '@/components/settings/SettingsShared'

export default function PreferencesPage() {
  const { data: meResponse, isFetching: isLoadingProfile } = useMeQuery()
  const [updatePreferences, { isLoading: isUpdatingPreferences }] =
    useUpdateMyNotificationPreferencesMutation()

  const [betaFeatures, setBetaFeatures] = useState(true)
  const [emailDigest, setEmailDigest] = useState(true)
  const [pushNotification, setPushNotification] = useState(true)

  useEffect(() => {
    if (!meResponse?.data) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setEmailDigest(Boolean(meResponse.data.notificationPreferences?.email))
      setPushNotification(
        Boolean(meResponse.data.notificationPreferences?.push),
      )
    }, 0)

    return () => window.clearTimeout(timeoutId)
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
        `${field === 'email' ? 'Email digest' : 'Push notification'} updated.`,
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
    <section>
      <SectionTitle tone="brand" text="Preferences" />
      <article className="p-1 sm:p-2">
        {isLoadingProfile ? (
          <div className="space-y-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 sm:p-6">
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
        ) : (
          <div className="space-y-5 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 sm:p-6">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-2xl font-semibold text-slate-700">
                  Email digests
                </p>
                <p className="mt-0.5 max-w-xl text-sm font-medium leading-6 text-slate-500">
                  Receive weekly curated reports of your reading progress and
                  top recommendations.
                </p>
              </div>
              <PreferenceToggle
                checked={emailDigest}
                onToggle={() => void updatePreference('email', !emailDigest)}
              />
            </div>

            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-2xl font-semibold text-slate-700">
                  Push notifications
                </p>
                <p className="mt-0.5 max-w-xl text-sm font-medium leading-6 text-slate-500">
                  Instant alerts for community highlights and direct curator
                  messages.
                </p>
              </div>
              <PreferenceToggle
                checked={pushNotification}
                onToggle={() =>
                  void updatePreference('push', !pushNotification)
                }
              />
            </div>

            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-2xl font-semibold text-slate-700">
                  Beta features{' '}
                  <span className="ml-1 rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-slate-500">
                    EXPERIMENTAL
                  </span>
                </p>
                <p className="mt-0.5 max-w-xl text-sm font-medium leading-6 text-slate-500">
                  Early access to AI-driven summary insights and advanced
                  taxonomy tools.
                </p>
              </div>
              <PreferenceToggle
                checked={betaFeatures}
                onToggle={() => {
                  setBetaFeatures((previous) => !previous)
                  toast.success('Beta features preference updated locally.')
                }}
              />
            </div>

            {isUpdatingPreferences ? (
              <p className="inline-flex items-center gap-2 text-xs font-semibold text-brand-700">
                <BusyIcon /> Saving preference...
              </p>
            ) : null}
          </div>
        )}
      </article>
    </section>
  )
}
