import { Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useSearch } from '@/context/search-provider'
import { Button } from '@/components/ui/button'

export function FunctionSearch() {
  const { t } = useTranslation()

  const { setOpen } = useSearch()

  return (
    <Button
      variant='outline'
      className='gap-2 text-muted-foreground sm:w-64 sm:justify-start'
      aria-label={t('messages.findAFeature')}
      onClick={() => setOpen(true)}
    >
      <Search className='size-4' />
      <span className='hidden sm:inline'>{t('messages.findAFeatureAlt2')}</span>
      <kbd className='ms-auto hidden rounded border px-1.5 text-xs sm:inline'>
        Ctrl/⌘ K
      </kbd>
    </Button>
  )
}
