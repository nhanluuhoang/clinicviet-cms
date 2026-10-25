import type { Table } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import { DataTableToolbar } from '@/components/data-table'
import { DatePickerInput } from '@/components/date-picker-input'
import { routeApi } from '../data/route'

export function DocumentDateToolbar<T>({
  table,
  placeholder,
}: {
  table: Table<T>
  placeholder: string
}) {
  const { t } = useTranslation()
  const { dateFrom = '', dateTo = '' } = routeApi.useSearch()
  const navigate = routeApi.useNavigate()
  return (
    <DataTableToolbar
      table={table}
      searchPlaceholder={placeholder}
      hasExtraFilters={Boolean(dateFrom || dateTo)}
      onReset={() =>
        navigate({
          search: (previous) => ({
            tab: previous.tab,
            pageSize: previous.pageSize,
          }),
        })
      }
    >
      {(['dateFrom', 'dateTo'] as const).map((key) => (
        <div key={key} className='flex items-center gap-2'>
          <label
            htmlFor={`inventory-${key}`}
            className='text-sm whitespace-nowrap'
          >
            {t(`inventoryExport.${key}`)}
          </label>
          <DatePickerInput
            id={`inventory-${key}`}
            value={key === 'dateFrom' ? dateFrom : dateTo}
            minDate={key === 'dateTo' ? dateFrom : undefined}
            onChange={(value) =>
              navigate({
                search: (previous) => ({
                  ...previous,
                  page: undefined,
                  [key]: value,
                  ...(key === 'dateFrom' && dateTo && value > dateTo
                    ? { dateTo: value }
                    : {}),
                }),
              })
            }
            className='w-[150px]'
            inputClassName='h-8 w-full'
          />
        </div>
      ))}
    </DataTableToolbar>
  )
}
