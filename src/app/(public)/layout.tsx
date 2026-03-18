import { PublicLayout } from '@/components/layouts/PublicLayout'

type PublicRouteLayoutProps = {
  children: React.ReactNode
}

export default function PublicRouteLayout({
  children,
}: PublicRouteLayoutProps) {
  return <PublicLayout>{children}</PublicLayout>
}
