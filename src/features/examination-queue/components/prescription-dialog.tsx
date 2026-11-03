import { lazy, Suspense, type ComponentProps } from 'react'
import { LoaderCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import type { PrescriptionDialog as PrescriptionDialogContent } from './prescription-dialog-content'

const LazyPrescriptionDialog = lazy(() =>
  import('./prescription-dialog-content').then((module) => ({
    default: module.PrescriptionDialog,
  }))
)

export function PrescriptionDialog(
  props: ComponentProps<typeof PrescriptionDialogContent>
) {
  const { t } = useTranslation()
  if (!props.open) return null

  return (
    <Suspense
      fallback={
        <Dialog open={props.open} onOpenChange={props.onOpenChange}>
          <DialogContent>
            <DialogTitle>{t('messages.serviceRecord')}</DialogTitle>
            <div
              role='status'
              className='flex items-center gap-2 text-muted-foreground'
            >
              <LoaderCircle className='size-4 animate-spin' />
              {t('messages.loading')}
            </div>
          </DialogContent>
        </Dialog>
      }
    >
      <LazyPrescriptionDialog {...props} />
    </Suspense>
  )
}
