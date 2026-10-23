import { MixerHorizontalIcon } from '@radix-ui/react-icons'
import type { Table } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { auditLabels, type AuditColumnId } from './audit-columns'

export function DataTableViewOptions<T>({ table }: { table: Table<T> }) {
  const { t } = useTranslation()

  const columns = table
    .getAllLeafColumns()
    .filter((column) => column.columnDef.meta?.audit && column.getCanHide())
  if (!columns.length) return null
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='outline'
          size='sm'
          className='ms-auto hidden h-8 shrink-0 gap-2 sm:inline-flex'
        >
          <MixerHorizontalIcon className='size-4' /> {t('messages.showColumns')}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-48'>
        <DropdownMenuLabel>{t('messages.toggleColumns')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {columns.map((column) => (
          <DropdownMenuCheckboxItem
            key={column.id}
            checked={column.getIsVisible()}
            onSelect={(event) => event.preventDefault()}
            onCheckedChange={(value) => column.toggleVisibility(value === true)}
          >
            {auditLabels[column.id as AuditColumnId]}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
