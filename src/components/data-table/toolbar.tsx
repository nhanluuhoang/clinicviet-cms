import { useEffect, useState, type ReactNode } from 'react'
import { Cross2Icon } from '@radix-ui/react-icons'
import { type Table } from '@tanstack/react-table'
import i18n from '@/i18n'
import { useTranslation } from 'react-i18next'
import { useDebounce } from '@/hooks/use-debounce'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTableFacetedFilter } from './faceted-filter'
import { DataTableViewOptions } from './view-options'

type DataTableToolbarProps<TData> = {
  table: Table<TData>
  searchPlaceholder?: string
  searchKey?: string
  searchFields?: { columnId: string; placeholder: string }[]
  filters?: {
    columnId: string
    title: string
    options: {
      label: string
      value: string
      icon?: React.ComponentType<{ className?: string }>
    }[]
    variant?: 'checkbox' | 'radio'
  }[]
  showSearch?: boolean
  showReset?: boolean
  showViewOptions?: boolean
  children?: ReactNode
  hasExtraFilters?: boolean
  onReset?: () => void
}

export function DataTableToolbar<TData>({
  table,
  searchPlaceholder = i18n.t('messages.filterData'),
  searchKey,
  searchFields,
  filters = [],
  showSearch = true,
  showReset = true,
  showViewOptions = true,
  children,
  hasExtraFilters = false,
  onReset,
}: DataTableToolbarProps<TData>) {
  const { t } = useTranslation()

  const isFiltered =
    hasExtraFilters ||
    table
      .getState()
      .columnFilters.some(({ value }) =>
        Array.isArray(value)
          ? value.length > 0
          : String(value ?? '').trim() !== ''
      ) ||
    String(table.getState().globalFilter ?? '').trim() !== ''

  return (
    <div className='flex min-w-0 flex-wrap items-center gap-2'>
      {showSearch &&
        (searchFields ? (
          searchFields.map((field) => (
            <DataTableSearchInput
              key={field.columnId}
              table={table}
              searchKey={field.columnId}
              placeholder={field.placeholder}
            />
          ))
        ) : (
          <DataTableSearchInput
            table={table}
            searchKey={searchKey}
            placeholder={searchPlaceholder}
          />
        ))}
      {(filters.length > 0 || children) && (
        <div className='flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto'>
          {filters.map((filter) => {
            const column = table.getColumn(filter.columnId)
            return column ? (
              <DataTableFacetedFilter
                key={filter.columnId}
                column={column}
                title={filter.title}
                options={filter.options}
                variant={filter.variant}
              />
            ) : null
          })}
          {children}
        </div>
      )}
      {showReset && isFiltered && (
        <Button
          type='button'
          variant='ghost'
          onClick={() => {
            table.resetColumnFilters(true)
            table.setGlobalFilter('')
            onReset?.()
          }}
          className='h-8 shrink-0 gap-2 px-2'
        >
          {t('messages.clearFilters')} <Cross2Icon className='size-4' />
        </Button>
      )}
      {showViewOptions && <DataTableViewOptions table={table} />}
    </div>
  )
}

function DataTableSearchInput<TData>({
  table,
  searchKey,
  placeholder,
}: {
  table: Table<TData>
  searchKey?: string
  placeholder: string
}) {
  useTranslation()

  const externalValue =
    (searchKey
      ? (table.getColumn(searchKey)?.getFilterValue() as string)
      : table.getState().globalFilter) ?? ''

  const [draft, setDraft] = useState({ externalValue, value: externalValue })
  if (draft.externalValue !== externalValue) {
    setDraft({ externalValue, value: externalValue })
  }
  const debouncedSearchValue = useDebounce(draft.value, 500)

  useEffect(() => {
    if (
      draft.externalValue !== externalValue ||
      debouncedSearchValue !== draft.value
    )
      return

    if (searchKey) {
      const column = table.getColumn(searchKey)
      if ((column?.getFilterValue() ?? '') === debouncedSearchValue) return
      column?.setFilterValue(debouncedSearchValue)
    } else {
      if ((table.getState().globalFilter ?? '') === debouncedSearchValue) return
      table.setGlobalFilter(debouncedSearchValue)
    }
  }, [debouncedSearchValue, draft, externalValue, searchKey, table])

  return (
    <Input
      placeholder={placeholder}
      value={draft.value}
      onChange={(event) => {
        setDraft({ externalValue, value: event.target.value })
      }}
      className='h-8 w-full sm:w-[250px]'
    />
  )
}
