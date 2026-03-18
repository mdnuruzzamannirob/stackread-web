import { AdminLayout } from '@/components/layouts/AdminLayout'

type AdminRouteLayoutProps = {
  children: React.ReactNode
}

export default function AdminRouteLayout({ children }: AdminRouteLayoutProps) {
  return <AdminLayout>{children}</AdminLayout>
}
