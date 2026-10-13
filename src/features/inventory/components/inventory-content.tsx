import { useQuery } from '@tanstack/react-query'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { GetStats } from '../api'
import { routeApi } from '../data/route'
import { BatchesTab } from './batches-tab'
import { InventoryDialogs } from './inventory-dialogs'
import { PrimaryButtons } from './inventory-primary-buttons'
import { InventoryStats } from './inventory-stats'
import { TabBar } from './inventory-tab-bar'
import { IssuesTab } from './issues-tab'
import { ReceiptsTab } from './receipts-tab'
import { StockTab } from './stock-tab'
import { StockTakesTab } from './stocktakes-tab'

export function InventoryContent() {
  const { tab = 'stock' } = routeApi.useSearch()

  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['inventory', 'stats'],
    queryFn: GetStats,
    enabled: tab === 'stock',
  })

  return (
    <>
      <Header fixed>
        <div className='ms-auto flex items-center space-x-4'>
          {/* <LanguageSwitcher /> */}
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Kho thuốc</h2>
            <p className='text-muted-foreground'>
              Quản lý tồn kho theo từng đợt nhập hàng và theo dõi hạn sử dụng
              của từng lô.
            </p>
          </div>
          <PrimaryButtons tab={tab} />
        </div>

        {tab === 'stock' && (
          <InventoryStats stats={stats} isLoading={loadingStats} />
        )}

        <TabBar active={tab} />

        {tab === 'stock' && <StockTab />}
        {tab === 'batches' && <BatchesTab />}
        {tab === 'receipts' && <ReceiptsTab />}
        {tab === 'issues' && <IssuesTab />}
        {tab === 'stocktakes' && <StockTakesTab />}
      </Main>

      <InventoryDialogs />
    </>
  )
}
