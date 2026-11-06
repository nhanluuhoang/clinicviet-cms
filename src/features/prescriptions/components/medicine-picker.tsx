import { useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { getLocale } from '@/i18n'
import { Check, ChevronsUpDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { useDebounce } from '@/hooks/use-debounce'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { getMedicinesPage, type Medicine } from '../api'

export function MedicinePicker({
  selected,
  onChange,
  requireStock = true,
}: {
  requireStock?: boolean
  selected?: Pick<Medicine, 'id' | 'name' | 'strength' | 'unit' | 'totalQty'>
  onChange: (medicine: Medicine) => void
}) {
  const { t } = useTranslation()

  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const medicines = useInfiniteQuery({
    queryKey: ['prescription-medicines', debouncedSearch],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => getMedicinesPage(debouncedSearch, pageParam),
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.limit < lastPage.total
        ? lastPage.page + 1
        : undefined,
    enabled: open,
  })

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type='button'
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className='w-full min-w-0 justify-between font-normal'
        >
          <span className='min-w-0 truncate'>
            {selected
              ? requireStock
                ? t('messages.stockAlt2', {
                    value0: selected.name,
                    value1: selected.strength,
                    value2: selected.unit,
                    value3: selected.totalQty,
                  })
                : selected.name
              : medicines.isLoading
                ? t('messages.loading')
                : t('messages.selectMedicine')}
          </span>
          <ChevronsUpDown className='ms-2 size-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className='w-[var(--radix-popover-trigger-width)] p-0'
        align='start'
      >
        <Command shouldFilter={false}>
          <CommandInput
            value={search}
            onValueChange={setSearch}
            placeholder={t('messages.searchMedicineName')}
          />
          <CommandList>
            <CommandEmpty>{t('messages.noMedicinesFound')}</CommandEmpty>
            <CommandGroup>
              {(medicines.data?.pages.flatMap((page) => page.data) ?? []).map(
                (medicine) => (
                  <CommandItem
                    key={medicine.id}
                    value={`${medicine.name} ${medicine.strength}`}
                    disabled={requireStock && medicine.totalQty < 1}
                    onSelect={() => {
                      onChange(medicine)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        'size-4',
                        medicine.id === selected?.id
                          ? 'opacity-100'
                          : 'opacity-0'
                      )}
                    />
                    <span className='min-w-0 flex-1 truncate'>
                      {medicine.name} · {medicine.strength} ({medicine.unit})
                    </span>
                    <span className='ms-auto shrink-0 text-xs text-muted-foreground'>
                      {medicine.salePrice.toLocaleString(getLocale())}{' '}
                      {t('messages.stockAlt3')} {medicine.totalQty}
                    </span>
                  </CommandItem>
                )
              )}
            </CommandGroup>
          </CommandList>
          {medicines.hasNextPage && (
            <Button
              type='button'
              variant='ghost'
              disabled={medicines.isFetchingNextPage}
              onClick={() => void medicines.fetchNextPage()}
            >
              {t('messages.loadMore')}
            </Button>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  )
}
