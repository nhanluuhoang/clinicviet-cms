import {
  CircleX,
  Package,
  TrendingDown,
  TriangleAlert,
  Wallet,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn, formatMoney, formatNumber } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { type InventoryStats as Stats } from '../api'

type Tile = {
  label: string
  value: string
  hint: string
  icon: React.ComponentType<{ className?: string }>
  alert?: boolean
  alertClass?: string
}

export function InventoryStats({
  stats,
  isLoading,
}: {
  stats?: Stats
  isLoading?: boolean
}) {
  const { t } = useTranslation()

  const tiles: Tile[] = [
    {
      label: t('messages.products'),
      value: isLoading ? '—' : formatNumber(stats?.medicineCount ?? 0),
      hint: t('messages.medicinesAvailable'),
      icon: Package,
    },
    {
      label: t('messages.stockValue'),
      value: isLoading ? '—' : formatMoney(stats?.totalStockValue ?? 0),
      hint: t('messages.atEachBatchSPurchasePrice'),
      icon: Wallet,
    },
    {
      label: t('messages.expiredBatches'),
      value: isLoading ? '—' : formatNumber(stats?.expiredBatches ?? 0),
      hint: t('messages.toDiscardFromInventory'),
      icon: CircleX,
      alert: (stats?.expiredBatches ?? 0) > 0,
      alertClass: 'text-red-600 dark:text-red-400',
    },
    {
      label: t('messages.expiringBatches'),
      value: isLoading ? '—' : formatNumber(stats?.criticalBatches ?? 0),
      hint: t('messages.lessThan30DaysRemaining'),
      icon: TriangleAlert,
      alert: (stats?.criticalBatches ?? 0) > 0,
      alertClass: 'text-orange-600 dark:text-orange-400',
    },
    {
      label: t('messages.belowMinimumStock'),
      value: isLoading ? '—' : formatNumber(stats?.belowMinStock ?? 0),
      hint: t('messages.medicinesToRestock'),
      icon: TrendingDown,
      alert: (stats?.belowMinStock ?? 0) > 0,
      alertClass: 'text-amber-600 dark:text-amber-400',
    },
  ]

  return (
    <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-5'>
      {tiles.map((tile) => (
        <Card key={tile.label} className='py-4'>
          <CardContent className='px-4'>
            <div className='flex items-center justify-between gap-2'>
              <span className='text-xs font-medium text-muted-foreground'>
                {tile.label}
              </span>
              <tile.icon
                className={cn(
                  'size-4 shrink-0',
                  tile.alert ? tile.alertClass : 'text-muted-foreground'
                )}
              />
            </div>
            <div
              className={cn(
                'mt-1 truncate text-xl font-bold tabular-nums',
                tile.alert && tile.alertClass
              )}
              title={tile.value}
            >
              {tile.value}
            </div>
            <p className='mt-0.5 text-xs text-muted-foreground'>{tile.hint}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
