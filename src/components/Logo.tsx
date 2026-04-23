import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'

const Logo = ({
  className,
  href = '/',
}: {
  className?: string
  href?: string
}) => {
  return (
    <Link
      href={href}
      className={cn('text-2xl flex items-center gap-1 font-medium', className)}
    >
      <Image alt="StackRead Logo" src="/logo.png" width={28} height={28} />{' '}
      StackRead
    </Link>
  )
}

export default Logo
