import { cn as mergeClassNames } from '@/lib/utils/cn'
import { type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return mergeClassNames(...inputs)
}
