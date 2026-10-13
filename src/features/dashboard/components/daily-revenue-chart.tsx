import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { formatDashboardMoney as formatMoney } from '@/lib/utils'
import {
  type DashboardStatistics,
  type QueueDashboard,
} from '@/features/examination-queue/api'

export function DailyRevenueChart({
  dashboard,
  periodLabel,
}: {
  dashboard?: QueueDashboard | DashboardStatistics
  periodLabel: string
}) {
  const chartData = [
    {
      name: 'Thuốc',
      value: dashboard?.billing.medicineRevenue ?? 0,
      color: '#2f66d8',
    },
    {
      name: 'Khám',
      value: dashboard?.billing.consultationRevenue ?? 0,
      color: '#32b890',
    },
  ]

  if (!chartData.some((item) => item.value > 0)) {
    return (
      <div className='flex h-[320px] flex-col items-center justify-center gap-1'>
        <span className='text-sm text-muted-foreground'>
          Tổng thu {periodLabel}
        </span>
        <strong className='text-xl tabular-nums'>
          {formatMoney(dashboard?.billing.totalAmount ?? 0)} VNĐ
        </strong>
      </div>
    )
  }

  return (
    <>
      <div className='relative'>
        <ResponsiveContainer width='100%' height={300}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey='value'
              nameKey='name'
              cx='50%'
              cy='48%'
              innerRadius={58}
              outerRadius={125}
              paddingAngle={2}
              stroke='hsl(var(--card))'
              strokeWidth={3}
              labelLine={{ stroke: 'hsl(var(--foreground))' }}
              label={({ value }) => formatMoney(Number(value))}
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [
                `${formatMoney(Number(value))} VNĐ`,
                'Doanh thu',
              ]}
              contentStyle={{
                background: 'var(--popover)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                color: 'var(--popover-foreground)',
              }}
              itemStyle={{ color: 'var(--popover-foreground)' }}
              labelStyle={{ color: 'var(--popover-foreground)' }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className='pointer-events-none absolute top-[48%] left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center'>
          <span className='text-xs text-muted-foreground'>
            Tổng thu {periodLabel}
          </span>
          <strong className='text-sm whitespace-nowrap tabular-nums'>
            {formatMoney(dashboard?.billing.totalAmount ?? 0)} VNĐ
          </strong>
        </div>
      </div>
      <div className='flex items-center justify-center gap-4 text-sm'>
        {chartData.map((entry) => (
          <div key={entry.name} className='flex items-center gap-2'>
            <span
              className='size-2.5 rounded-sm'
              style={{ backgroundColor: entry.color }}
            />
            <span>{entry.name}</span>
          </div>
        ))}
      </div>
    </>
  )
}
