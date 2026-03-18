import { AuthLayout } from '@/components/layouts/AuthLayout'

type AuthRouteLayoutProps = {
  children: React.ReactNode
}

export default function AuthRouteLayout({ children }: AuthRouteLayoutProps) {
  return <AuthLayout>{children}</AuthLayout>
}
