import { type SVGProps } from 'react'
import { cn } from '@/lib/utils'

export function Logo({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox='0 0 112 112'
      xmlns='http://www.w3.org/2000/svg'
      role='img'
      aria-label='ClinicViet'
      className={cn('size-8 shrink-0 rounded-lg bg-white', className)}
      {...props}
    >
      <title>ClinicViet</title>
      <path
        d='M78 29A36 36 0 1 0 78 83'
        fill='none'
        stroke='#0F766E'
        strokeWidth='11'
        strokeLinecap='round'
      />
      <path
        d='m39 48 15 20 18-26'
        fill='none'
        stroke='#153E3A'
        strokeWidth='9'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <circle cx='82' cy='30' r='7' fill='#C4823A' />
    </svg>
  )
}
