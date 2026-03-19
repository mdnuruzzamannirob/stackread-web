'use client'

import { Button } from '@/components/ui/button'
import {
  applyStaffSession,
  applyUserSession,
  clearAuthSession,
} from '@/lib/auth/session'
import { setAccessToken } from '@/lib/auth/tokenStorage'
import { formatApiErrorMessage } from '@/lib/utils/apiHelpers'
import { useLazyGetMeQuery } from '@/store/features/auth/authApi'
import { useLazyGetOnboardingStatusQuery } from '@/store/features/onboarding/onboardingApi'
import { useLazyGetStaffMeQuery } from '@/store/features/staffAuth/staffAuthApi'
import { useAppDispatch } from '@/store/hooks'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

export function AuthCallbackHandler() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [getMe] = useLazyGetMeQuery()
  const [getStaffMe] = useLazyGetStaffMeQuery()
  const [getOnboardingStatus] = useLazyGetOnboardingStatusQuery()
  const [status, setStatus] = useState('Processing callback...')
  const [error, setError] = useState<string | null>(null)

  const callbackToken = useMemo(
    () => searchParams.get('accessToken') ?? searchParams.get('token'),
    [searchParams],
  )
  const actorType = useMemo(
    () => (searchParams.get('actorType') === 'staff' ? 'staff' : 'user'),
    [searchParams],
  )
  const redirectPath = useMemo(
    () =>
      searchParams.get('redirect') ||
      (actorType === 'staff' ? '/admin' : '/dashboard'),
    [actorType, searchParams],
  )
  const callbackError = useMemo(() => searchParams.get('error'), [searchParams])

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      if (callbackError) {
        setError(callbackError)
        return
      }

      if (!callbackToken) {
        setStatus('Missing callback token.')
        return
      }

      try {
        if (actorType === 'staff') {
          setAccessToken('staff', callbackToken)
          const staffResponse = await getStaffMe(undefined, true).unwrap()

          if (cancelled) {
            return
          }

          applyStaffSession(dispatch, {
            token: callbackToken,
            staff: staffResponse.data,
          })
          router.replace(redirectPath)
          return
        }

        setAccessToken('user', callbackToken)
        const meResponse = await getMe(undefined, true).unwrap()

        let onboardingStatus: 'required' | 'completed' = 'completed'
        try {
          const onboardingResponse = await getOnboardingStatus(
            undefined,
            true,
          ).unwrap()
          onboardingStatus = onboardingResponse.data.isOnboardingCompleted
            ? 'completed'
            : 'required'
        } catch {
          if (meResponse.data.isOnboardingCompleted === false) {
            onboardingStatus = 'required'
          }
        }

        if (cancelled) {
          return
        }

        applyUserSession(dispatch, {
          token: callbackToken,
          user: meResponse.data,
          onboardingStatus,
        })

        router.replace(
          onboardingStatus === 'required'
            ? '/dashboard/onboarding/plans'
            : redirectPath,
        )
      } catch (callbackFailure) {
        if (!cancelled) {
          clearAuthSession(dispatch)
          setError(formatApiErrorMessage(callbackFailure))
        }
      }
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [
    actorType,
    callbackError,
    callbackToken,
    dispatch,
    getMe,
    getOnboardingStatus,
    getStaffMe,
    redirectPath,
    router,
  ])

  return (
    <div className="space-y-3 rounded-lg border border-border p-6">
      <h1 className="text-2xl font-semibold">OAuth callback</h1>
      <p className="text-sm text-muted-foreground">Route: /auth/callback</p>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {!error ? (
        <p className="text-sm text-muted-foreground">{status}</p>
      ) : null}

      {error ? (
        <a href="/auth/login">
          <Button type="button" variant="outline">
            Back to login
          </Button>
        </a>
      ) : null}
    </div>
  )
}
