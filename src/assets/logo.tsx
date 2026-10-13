import { type SVGProps } from 'react'
import { cn } from '@/lib/utils'

export function Logo({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox='0 0 64 64'
      xmlns='http://www.w3.org/2000/svg'
      role='img'
      aria-label='ClinicViet'
      className={cn('size-8 shrink-0', className)}
      {...props}
    >
      <title>ClinicViet</title>
      <rect width='64' height='64' rx='16' fill='#176b5b' />
      <path d='M26 14h12v12h12v12H38v12H26V38H14V26h12z' fill='#fff' />
      <circle cx='48' cy='48' r='11' fill='#b77b35' />
      <path
        d='m43 48 3.5 3.5 6-7'
        fill='none'
        stroke='#fff'
        strokeWidth='3'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}
