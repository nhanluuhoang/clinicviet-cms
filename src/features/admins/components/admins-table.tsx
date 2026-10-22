import { useState } from 'react'
import {
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { MANAGED_USER_ROLE_OPTIONS } from '@/config/user-role-labels'
import i18n from '@/i18n'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { type NavigateFn, useTableUrlState } from '@/hooks/use-table-url-state'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DataTablePagination,
  DataTableToolbar,
  MobileDataCards,
} from '@/components/data-table'
import { defaultAuditVisibility } from '@/components/data-table/audit-columns'
import { type Admin } from '../api'
import { adminsColumns as columns } from './admins-columns'

type DataTableProps = {
  data: Admin[]
  total: number
  search: Record<string, unknown>
  navigate: NavigateFn
  isLoading?: boolean
}

export function AdminsTable({
  data,
  total,
  search,
  navigate,
  isLoading,
}: DataTableProps) {
  const { t } = useTranslation()

  // Local UI-only states
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    defaultAuditVisibility
  )

  // Synced with URL states
  const {
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
    sorting,
    onSortingChange,
  } = useTableUrlState({
    search,
    navigate,
    pagination: { defaultPage: 1, defaultPageSize: 10 },
    columnFilters: [
      { columnId: 'fullName', searchKey: 'fullName', type: 'string' },
      { columnId: 'role', searchKey: 'role', type: 'array' },
      { columnId: 'isActive', searchKey: 'isActive', type: 'array' },
    ],
    sorting: { defaultSort: '' },
  })

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      pagination,
      rowSelection,
      columnFilters,
      columnVisibility,
    },
    enableRowSelection: true,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    rowCount: total,
    onPaginationChange,
    onColumnFiltersChange,
    onRowSelectionChange: setRowSelection,
    onSortingChange,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div
      className={cn(
        'max-sm:has-[div[role="toolbar"]]:mb-16',
        'flex flex-1 flex-col gap-4'
      )}
    >
      <DataTableToolbar
        table={table}
        searchPlaceholder={t('messages.searchByName')}
        searchKey='fullName'
        filters={[
          {
            columnId: 'role',
            title: t('messages.role'),
            variant: 'radio',
            options: MANAGED_USER_ROLE_OPTIONS,
          },
          {
            columnId: 'isActive',
            title: t('messages.status'),
            variant: 'radio',
            options: [
              { label: t('subscriptionStatuses.ACTIVE'), value: 'true' },
              { label: t('messages.locked'), value: 'false' },
            ],
          },
        ]}
      />
      <MobileDataCards
        table={table}
        isLoading={isLoading}
        emptyMessage={t('messages.noResults')}
      />
      <div className='hidden overflow-x-auto rounded-md border text-nowrap sm:block'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className='group/row'>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    className={cn(
                      'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                      header.column.columnDef.meta?.className,
                      header.column.columnDef.meta?.thClassName
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={table.getVisibleLeafColumns().length}
                  className='h-24 text-center'
                >
                  {t('messages.loading')}
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={
                    row.getIsSelected() && i18n.t('messages.selectedCount')
                  }
                  className='group/row'
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                        cell.column.columnDef.meta?.className,
                        cell.column.columnDef.meta?.tdClassName
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={table.getVisibleLeafColumns().length}
                  className='h-24 text-center'
                >
                  {t('messages.noResults')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} className='mt-auto' />
    </div>
  )
}
