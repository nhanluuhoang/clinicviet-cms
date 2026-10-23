import { routeApi } from '../data/route'

export function useDocumentDates<T>(data: T[], getDate: (item: T) => string) {
  const { dateFrom, dateTo } = routeApi.useSearch()
  return data.filter((item) => {
    const date = getDate(item).slice(0, 10)
    return (!dateFrom || date >= dateFrom) && (!dateTo || date <= dateTo)
  })
}
