import { Toaster as Sonner, ToasterProps } from 'sonner'
import { useTheme } from '@/context/theme-provider'
import { useIsMobile } from '@/hooks/use-mobile'

export function Toaster({ ...props }: ToasterProps) {
  const { theme = 'system' } = useTheme()
  const isMobile = useIsMobile()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      position={isMobile ? 'top-center' : 'top-right'}
      offset={{ top: 'calc(env(safe-area-inset-top, 0px) + 24px)' }}
      mobileOffset={{ top: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}
      className='toaster group [&_div[data-content]]:w-full'
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
        } as React.CSSProperties
      }
      {...props}
    />
  )
}
