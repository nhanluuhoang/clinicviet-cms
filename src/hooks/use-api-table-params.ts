import { useSearch } from '@tanstack/react-router'
import { useApiSearch } from './use-api-search'

export type ApiTableParams = {
  page: number
  limit: number
  search?: string
  sort?: string
  dateFrom?: string
  dateTo?: string
  group?: string
  unit?: string
  expiryStatus?: string
  servicePlan?: string
  subscriptionStatus?: string
  status?: string
  source?: string
}

export function useApiTableParams(defaultPageSize = 10): ApiTableParams {
  const state = useSearch({ strict: false }) as Record<string, unknown>
  const search = useApiSearch()
  const params: ApiTableParams = {
    page:
      typeof state.page === 'number' &&
      Number.isInteger(state.page) &&
      state.page > 0
        ? state.page
        : 1,
    limit:
      typeof state.pageSize === 'number' &&
      Number.isInteger(state.pageSize) &&
      state.pageSize > 0 &&
      state.pageSize <= 100
        ? state.pageSize
        : defaultPageSize,
    search: search || undefined,
    sort:
      typeof state.sort === 'string' &&
      /^-?[a-zA-Z][a-zA-Z0-9]*$/.test(state.sort)
        ? state.sort
        : '-createdAt',
    dateFrom: typeof state.dateFrom === 'string' ? state.dateFrom : undefined,
    dateTo: typeof state.dateTo === 'string' ? state.dateTo : undefined,
  }
  for (const key of [
    'group',
    'unit',
    'expiryStatus',
    'servicePlan',
    'subscriptionStatus',
    'status',
    'source',
  ] as const) {
    if (Array.isArray(state[key]) && state[key].length)
      params[key] = state[key].join(',')
  }
  return params
}
