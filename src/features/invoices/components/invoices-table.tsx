import { getRouteApi } from '@tanstack/react-router'
import i18n from '@/i18n'
import { useTranslation } from 'react-i18next'
import { DataTableToolbar } from '@/components/data-table'
import { UrlDataTable } from '@/components/data-table/url-data-table'
import { DatePickerInput } from '@/components/date-picker-input'
import type { Invoice } from '../api'
import {
  invoiceColumns,
  invoiceMobileLabels,
  invoiceServiceTypes,
} from './invoice-columns'

const route = getRouteApi('/_authenticated/invoices/')
const filters = [
  {
    columnId: 'serviceType',
    get title() {
      return i18n.t('messages.serviceType')
    },
    options: invoiceServiceTypes,
    variant: 'radio' as const,
  },
]

export function InvoicesTable({
  data,
  total,
  isLoading,
  date,
}: {
  data: Invoice[]
  total: number
  isLoading: boolean
  date: string
}) {
  const { t } = useTranslation()

  const navigate = route.useNavigate()
  return (
    <UrlDataTable
      columns={invoiceColumns}
      mobileLabels={invoiceMobileLabels}
      data={data}
      total={total}
      isLoading={isLoading}
      filters={filters}
      emptyMessage={t('messages.noMatchingInvoices')}
      renderToolbar={(table) => (
        <DataTableToolbar
          table={table}
          searchPlaceholder={t('messages.invoiceCodePatientNameOrPhone')}
          filters={filters}
          hasExtraFilters={Boolean(date)}
          onReset={() =>
            navigate({
              search: {
                date: '',
                pageSize: table.getState().pagination.pageSize,
              },
            })
          }
        >
          <label htmlFor='invoice-date' className='sr-only'>
            {t('messages.invoiceDate')}
          </label>
          <DatePickerInput
            id='invoice-date'
            placeholder={t('messages.selectInvoiceDate')}
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
      )}
    />
  )
}
