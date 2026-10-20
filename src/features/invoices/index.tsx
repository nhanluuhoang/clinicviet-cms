import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { getToday } from '@/lib/utils'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { getInvoices } from './api'
import { InvoicesTable } from './components/invoices-table'

const route = getRouteApi('/_authenticated/invoices/')

export function Invoices() {
  const search = route.useSearch()
  const date = search.date ?? getToday()
  const { data, isLoading, isError } = useQuery({
    queryKey: ['invoices', search, date],
    queryFn: () =>
      getInvoices({
        date: date || undefined,
        search: search.filter || undefined,
        serviceType: search.serviceType?.[0],
        page: search.page ?? 1,
        limit: search.pageSize ?? 10,
      }),
  })

  return (
    <>
      <Header fixed>
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      <Main className='flex min-w-0 flex-1 flex-col gap-4 sm:gap-6'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Quản lý hóa đơn</h2>
          <p className='text-muted-foreground'>
            Theo dõi hóa đơn khám bệnh, nhà thuốc và tiêm chủng.
          </p>
        </div>
        {isError && (
          <p className='rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive'>
            Không thể tải danh sách hóa đơn. Vui lòng thử lại.
          </p>
        )}
        <InvoicesTable
          data={data?.data ?? []}
          total={data?.total ?? 0}
          isLoading={isLoading}
          date={date}
        />
      </Main>
    </>
  )
}
