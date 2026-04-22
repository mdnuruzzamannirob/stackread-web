'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

import {
  fetchOnboardingStatus,
  resolveAuthenticatedDestination,
} from '@/lib/auth/onboarding'
import {
  clearPersistedTempToken,
  getPersistedTempToken,
} from '@/lib/auth/temp-token'
import { getStoredAccessToken } from '@/lib/auth/token-storage'
import {
  clearAuthState,
  clearTempToken,
  setTempToken,
} from '@/store/features/auth/authSlice'
import { useAppDispatch, useAppSelector } from '@/store/hooks'

export function useRedirectAuthenticated(locale: string) {
  const router = useRouter()
  const pathname = usePathname()
  const dispatch = useAppDispatch()
  const token = useAppSelector((state) => state.auth.token)
  const isHydrated = useAppSelector((state) => state.auth.isHydrated)

  useEffect(() => {
    if (!isHydrated) {
      return
    }

    const cookieToken = getStoredAccessToken()

    if (!cookieToken) {
      if (token) {
        dispatch(clearAuthState())
      }

      let isMounted = true

      void (async () => {
        const onboardingStatus = await fetchOnboardingStatus()

        if (!isMounted || !onboardingStatus) {
          return
        }

        const destination = await resolveAuthenticatedDestination({ locale })

        if (!isMounted) {
          return
        }

        router.replace(destination)
      })()

      return () => {
        isMounted = false
      }
    }

    if (!token) {
      return
    }

    let isMounted = true

    void (async () => {
      const destination = await resolveAuthenticatedDestination({
        accessToken: token,
        locale,
      })

      if (!isMounted) {
        return
      }

      if (pathname === destination) {
        return
      }

      router.replace(destination)
    })()

    return () => {
      isMounted = false
    }
  }, [dispatch, isHydrated, locale, pathname, router, token])
}

export function useRequireTempToken(locale: string) {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const isHydrated = useAppSelector((state) => state.auth.isHydrated)
  const token = useAppSelector((state) => state.auth.token)
  const tempToken = useAppSelector((state) => state.auth.tempToken)

  useEffect(() => {
    if (!isHydrated) {
      return
    }

    if (token) {
      router.replace(`/${locale}/dashboard`)
      return
    }

    if (!tempToken) {
      const persisted = getPersistedTempToken()

      if (persisted) {
        dispatch(setTempToken(persisted))
        return
      }

      clearPersistedTempToken()
      dispatch(clearTempToken())
      router.replace(`/${locale}/login`)
    }
  }, [dispatch, isHydrated, locale, router, tempToken, token])
}
