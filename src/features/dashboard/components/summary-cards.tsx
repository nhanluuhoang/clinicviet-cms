import { Banknote, Package, Pill, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatNumber } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  type DashboardStatistics,
  type QueueDashboard,
} from '@/features/examination-queue/api'

export function SummaryCards({
  dashboard,
}: {
  dashboard?: QueueDashboard | DashboardStatistics
}) {
  const { t } = useTranslation()

  const cards = [
    {
      label: t('messages.totalExaminations'),
      value: dashboard?.billing.invoiceCount ?? 0,
      icon: Users,
      money: false,
    },
    {
      label: t('messages.totalRevenue'),
      value: dashboard?.billing.totalAmount ?? 0,
      icon: Banknote,
      money: true,
    },
    {
      label: t('messages.medicineSales'),
      value: dashboard?.billing.medicineRevenue ?? 0,
      icon: Pill,
      money: true,
    },
    {
      label: t('messages.medicineCost'),
      value: dashboard?.billing.medicineCost ?? 0,
      icon: Package,
      money: true,
    },
  ]

  return (
    <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
      {cards.map((card) => (
        <Card key={card.label}>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>{card.label}</CardTitle>
            <card.icon className='size-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <p className='text-2xl font-bold tabular-nums'>
              {card.money
                ? t('messages.vndAlt2', { value0: formatNumber(card.value) })
                : card.value}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
