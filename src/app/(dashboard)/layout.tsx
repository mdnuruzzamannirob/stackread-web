import { DashboardLayout } from '@/components/layouts/DashboardLayout'

type DashboardRouteLayoutProps = {
  children: React.ReactNode
}

export default function DashboardRouteLayout({
  children,
}: DashboardRouteLayoutProps) {
  return <DashboardLayout>{children}</DashboardLayout>
}
