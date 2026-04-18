'use client'

import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { clearClientAuthSession } from '@/lib/auth/client-session'
import { useLogoutMutation } from '@/store/features/auth/authApi'
import { useAppDispatch } from '@/store/hooks'

export function LogoutButton() {
  const params = useParams<{ locale: string }>()
  const locale = params.locale ?? 'en'
  const router = useRouter()
  const dispatch = useAppDispatch()
  const [logout, { isLoading }] = useLogoutMutation()

  const onLogout = async () => {
    try {
      await logout()
        .unwrap()
        .catch(() => null)
    } finally {
      clearClientAuthSession(dispatch)
      toast.success('Logged out')
      router.replace(`/${locale}/auth/login`)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={onLogout}
      disabled={isLoading}
    >
      {isLoading ? 'Logging out...' : 'Logout'}
    </Button>
  )
}
