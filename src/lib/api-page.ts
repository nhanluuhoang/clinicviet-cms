export type ApiPage<T> = {
  data: T[]
  total: number
  page: number
  limit: number
}

// Fetch all pages only for an explicit export or an operation requiring all rows.
export async function collectPages<T>(
  fetchPage: (page: number) => Promise<ApiPage<T>>
) {
  const first = await fetchPage(1)
  const rows = [...first.data]
  for (let page = 2; page <= Math.ceil(first.total / first.limit); page++) {
    rows.push(...(await fetchPage(page)).data)
  }
  return rows
}
