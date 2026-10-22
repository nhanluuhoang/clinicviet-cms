import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { hasAnyRole, PRESCRIBER_ROLES } from '@/config/access-control'
import { ClipboardList, Edit, FileClock, Trash } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type Patient } from '../api'
import { usePatients } from './patients-provider'

export function DataTableRowActions({ row }: { row: Row<Patient> }) {
  const { t } = useTranslation()

  const patient = row.original
  const { setOpen, setCurrentRow } = usePatients()
  const role = useAuthStore((state) => state.auth.user?.role)
  const canPrescribe = hasAnyRole(role, PRESCRIBER_ROLES)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
        >
          <DotsHorizontalIcon className='h-4 w-4' />
          <span className='sr-only'>{t('messages.openMenu')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[160px]'>
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(patient)
            setOpen('update')
          }}
        >
          {t('messages.update')}
          <DropdownMenuShortcut>
            <Edit size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        {canPrescribe && (
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(patient)
              setOpen('prescription')
            }}
          >
            {t('messages.prescribe')}
            <DropdownMenuShortcut>
              <ClipboardList size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(patient)
            setOpen('history')
          }}
        >
          {t('messages.medicalHistoryAlt2')}
          <DropdownMenuShortcut>
            <FileClock size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(patient)
            setOpen('delete')
          }}
          className='!text-red-500'
        >
          {t('messages.deleteAlt2')}
          <DropdownMenuShortcut>
            <Trash size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
