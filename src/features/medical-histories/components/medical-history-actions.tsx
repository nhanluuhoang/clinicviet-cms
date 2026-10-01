import { useState } from 'react'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { hasAnyRole, PRESCRIBER_ROLES } from '@/config/access-control'
import { Edit } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { PrescriptionDialog } from '@/features/examination-queue/components/prescription-dialog'
import type { MedicalHistoryListItem } from '../api'

export function MedicalHistoryActions({
  history,
}: {
  history: MedicalHistoryListItem
}) {
  const [open, setOpen] = useState(false)
  const role = useAuthStore((state) => state.auth.user?.role)
  if (!hasAnyRole(role, PRESCRIBER_ROLES)) return null

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
          >
            <DotsHorizontalIcon className='h-4 w-4' />
            <span className='sr-only'>Mở menu thao tác</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-[160px]'>
          <DropdownMenuItem onClick={() => setOpen(true)}>
            Cập nhật
            <DropdownMenuShortcut>
              <Edit size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {open && (
        <PrescriptionDialog
          open={open}
          onOpenChange={setOpen}
          patient={history.user}
          queueId={history.examinationQueueId ?? undefined}
          initialData={history}
        />
      )}
    </>
  )
}
