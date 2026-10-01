import { StatisticsPage } from './components/statistics-page'

export function Dashboard() {
  return <StatisticsPage period='day' />
}

export function MonthlyDashboard() {
  return <StatisticsPage period='month' />
}
