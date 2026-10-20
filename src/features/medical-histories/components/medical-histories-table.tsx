import { Fragment, useEffect, useState } from 'react'
import {
  type ExpandedState,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type VisibilityState,
} from '@tanstack/react-table'
import { hasAnyRole, PRESCRIBER_ROLES } from '@/config/access-control'
import { useAuthStore } from '@/stores/auth-store'
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
import { DatePickerInput } from '@/components/date-picker-input'
import { type MedicalHistoryListItem } from '../api'
import { medicalHistoryColumns } from './medical-history-columns'
import { MedicalHistoryDetails } from './medical-history-details'

type Props = {
  data: MedicalHistoryListItem[]
  total: number
  date: string
  search: Record<string, unknown>
  navigate: NavigateFn
  isLoading?: boolean
}

export function MedicalHistoriesTable({
  data,
  total,
  date,
  search,
  navigate,
  isLoading,
}: Props) {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    defaultAuditVisibility
  )
  const [expanded, setExpanded] = useState<ExpandedState>({})
  const role = useAuthStore((state) => state.auth.user?.role)
  const columns = hasAnyRole(role, PRESCRIBER_ROLES)
    ? medicalHistoryColumns
    : medicalHistoryColumns.filter((column) => column.id !== 'actions')
  const {
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
    sorting,
    onSortingChange,
    ensurePageInRange,
  } = useTableUrlState({
    search,
    navigate,
    pagination: { defaultPage: 1, defaultPageSize: 10 },
    columnFilters: [
      { columnId: 'patientName', searchKey: 'patientName', type: 'string' },
      { columnId: 'doctorName', searchKey: 'doctorName', type: 'string' },
    ],
    sorting: { defaultSort: '' },
  })

  const table = useReactTable({
    data,
    columns,
    state: { sorting, pagination, columnFilters, expanded, columnVisibility },
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    rowCount: total,
    onPaginationChange,
    onColumnFiltersChange,
    onSortingChange,
    onExpandedChange: setExpanded,
    getRowCanExpand: () => true,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
  })

  const pageCount = table.getPageCount()
  useEffect(() => {
    ensurePageInRange(pageCount)
  }, [pageCount, ensurePageInRange])

  const resetFilters = () => {
    navigate({
      search: (previous) => ({
        ...previous,
        page: undefined,
        patientName: undefined,
        doctorName: undefined,
        date: '',
      }),
    })
  }

  return (
    <div className='flex min-w-0 flex-1 flex-col gap-4'>
      <DataTableToolbar
        table={table}
        searchFields={[
          { columnId: 'patientName', placeholder: 'Tìm tên bệnh nhân...' },
          { columnId: 'doctorName', placeholder: 'Tìm tên bác sĩ...' },
        ]}
        hasExtraFilters={Boolean(date)}
        onReset={resetFilters}
      >
        <label htmlFor='medical-history-date' className='sr-only'>
          Ngày khám
        </label>
        <DatePickerInput
          id='medical-history-date'
          value={date}
          onChange={(value) =>
            navigate({
              search: (previous) => ({
                ...previous,
                page: undefined,
                date: value,
              }),
            })
          }
          className='min-w-[150px] flex-1 sm:w-[150px] sm:flex-none'
          inputClassName='h-8 w-full'
        />
      </DataTableToolbar>

      <MobileDataCards
        table={table}
        isLoading={isLoading}
        emptyMessage={
          date
            ? 'Không có lịch sử khám bệnh trong ngày đã chọn.'
            : 'Không có lịch sử khám bệnh.'
        }
        renderSubRow={(row) => (
          <MedicalHistoryDetails
            history={row.original}
            auditVisibility={columnVisibility}
          />
        )}
      />
      <div className='hidden overflow-x-auto rounded-md border sm:block'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    className={cn(
                      'whitespace-nowrap',
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
                  className='h-24 text-center text-muted-foreground'
                >
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <Fragment key={row.id}>
                  <TableRow data-state={row.getIsExpanded() && 'selected'}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
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
                  {row.getIsExpanded() && (
                    <TableRow className='hover:bg-transparent'>
                      <TableCell
                        colSpan={row.getVisibleCells().length}
                        className='p-0'
                      >
                        <MedicalHistoryDetails
                          history={row.original}
                          auditVisibility={columnVisibility}
                        />
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={table.getVisibleLeafColumns().length}
                  className='h-24 text-center text-muted-foreground'
                >
                  {date
                    ? 'Không có lịch sử khám bệnh trong ngày đã chọn.'
                    : 'Không có lịch sử khám bệnh.'}
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
