'use client'

import AuthShell from '@/components/AuthShell'
import { applyAuthenticatedSession } from '@/lib/auth/client-session'
import { parseOAuthCallbackParams } from '@/lib/auth/normalize-auth'
import { resolveAuthenticatedDestination } from '@/lib/auth/onboarding'
import {
  clearPersistedOAuthLocale,
  getPersistedOAuthLocale,
} from '@/lib/auth/social-oauth'
import {
  clearPersistedTempToken,
  persistTempToken,
} from '@/lib/auth/temp-token'
import { extractEmailFromTempToken } from '@/lib/auth/two-factor-preferences'
import { authApi } from '@/store/features/auth/authApi'
import {
  clearTempToken,
  setEmailInFlow,
  setTempToken,
} from '@/store/features/auth/authSlice'
import { useAppDispatch } from '@/store/hooks'
import { LoaderCircle } from 'lucide-react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { toast } from 'sonner'

const OAuthCallbackPage = () => {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const locale = params.locale as string
  const dispatch = useAppDispatch()

  const [refreshSession] = authApi.useRefreshMutation()
  const [fetchMe] = authApi.useLazyMeQuery()

  useEffect(() => {
    let isMounted = true

    const finishOAuthFlow = async () => {
      const callbackLocale = getPersistedOAuthLocale() ?? locale
      const parsed = parseOAuthCallbackParams(
        new URLSearchParams(searchParams.toString()),
      )

      if (parsed.error) {
        clearPersistedOAuthLocale()
        toast.error(parsed.error)
        router.replace(`/${callbackLocale}/login`)
        return
      }

      if (parsed.requiresTwoFactor) {
        if (!parsed.tempToken) {
          clearPersistedOAuthLocale()
          toast.error(
            'Unable to continue social sign-in. Please sign in again.',
          )
          router.replace(`/${callbackLocale}/login`)
          return
        }

        persistTempToken(parsed.tempToken)
        dispatch(setTempToken(parsed.tempToken))
        dispatch(setEmailInFlow(extractEmailFromTempToken(parsed.tempToken)))
        clearPersistedOAuthLocale()
        router.replace(`/${callbackLocale}/login/2fa`)
        return
      }

      try {
        const refreshResponse = await refreshSession().unwrap()

        if (!isMounted) {
          return
        }

        const accessToken = refreshResponse.data?.accessToken
        if (!accessToken) {
          throw new Error('Unable to complete social sign-in.')
        }

        const destination = await resolveAuthenticatedDestination({
          accessToken,
          locale: callbackLocale,
        })

        if (destination.startsWith(`/${callbackLocale}/onboarding/`)) {
          clearPersistedOAuthLocale()
          router.replace(destination)
          return
        }

        const meResponse = await fetchMe().unwrap()

        if (!isMounted) {
          return
        }

        const user = meResponse.data

        if (!user) {
          throw new Error('Unable to complete social sign-in.')
        }

        applyAuthenticatedSession(dispatch, {
          accessToken,
          user,
        })

        if (!isMounted) {
          return
        }

        clearPersistedOAuthLocale()
        router.replace(destination)
      } catch {
        if (!isMounted) {
          return
        }

        clearPersistedTempToken()
        dispatch(clearTempToken())
        clearPersistedOAuthLocale()
        toast.error('Unable to complete social sign-in. Please sign in again.')
        router.replace(`/${callbackLocale}/login`)
      }
    }

    void finishOAuthFlow()

    return () => {
      isMounted = false
    }
  }, [dispatch, fetchMe, locale, refreshSession, router, searchParams])

  return (
    <main className="min-h-dvh flex flex-col">
      <div className="flex flex-1 min-h-dvh">
        <AuthShell
          backgroundImage="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1200&h=1600&fit=crop"
          title="Signing You In"
          description="Completing your social login and preparing your library."
        />

        <section className="w-full lg:w-1/2 lg:ml-[50%] min-h-dvh flex flex-col bg-white overflow-y-auto">
          <div className="flex flex-1 items-center justify-center">
            <div className="mx-auto w-full max-w-lg rounded-xl px-4 py-16 text-center sm:px-6">
              <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                <LoaderCircle className="size-6 animate-spin" />
              </div>
              <h1 className="text-2xl font-semibold sm:text-3xl">
                Completing sign in...
              </h1>
              <p className="mt-3 text-gray-500">
                Please wait while we finalize your Google or Facebook session.
              </p>
            </div>
          </div>

          <div className="px-6 pb-6 flex sm:flex-row flex-col-reverse items-center justify-between flex-wrap text-sm text-gray-500">
            <p>
              &copy; {new Date().getFullYear()} StackRead. All rights reserved.
            </p>
            <div className="">
              <a
                href={`/${locale}/support`}
                className="font-medium text-teal-700 hover:underline"
              >
                Support
              </a>{' '}
              |{' '}
              <a
                href={`/${locale}/terms`}
                className="font-medium text-teal-700 hover:underline"
              >
                Terms of Service
              </a>{' '}
              |{' '}
              <a
                href={`/${locale}/privacy`}
                className="font-medium text-teal-700 hover:underline"
              >
                Privacy Policy
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default OAuthCallbackPage
