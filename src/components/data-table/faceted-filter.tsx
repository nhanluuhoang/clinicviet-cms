import * as React from 'react'
import { CheckIcon } from '@radix-ui/react-icons'
import { type Column } from '@tanstack/react-table'
import { CircleDot, ListChecks } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'

type DataTableFacetedFilterProps<TData, TValue> = {
  column?: Column<TData, TValue>
  title?: string
  options: {
    label: string
    value: string
    icon?: React.ComponentType<{ className?: string }>
  }[]
  variant?: 'checkbox' | 'radio'
}

export function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
  options,
  variant = 'checkbox',
}: DataTableFacetedFilterProps<TData, TValue>) {
  const { t } = useTranslation()

  const [open, setOpen] = React.useState(false)
  const facets = column?.getFacetedUniqueValues()
  const filterValue = column?.getFilterValue()
  const selectedValues = new Set(
    Array.isArray(filterValue) ? (filterValue as string[]) : []
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          size='sm'
          className='h-8 border-dashed'
          aria-label={t('messages.filterSelectionTitle', {
            value0: title,
            value1:
              variant === 'radio'
                ? t('messages.selectOne')
                : t('messages.selectMultiple'),
          })}
        >
          {variant === 'radio' ? (
            <CircleDot className='size-4' />
          ) : (
            <ListChecks className='size-4' />
          )}
          {title}
          {selectedValues?.size > 0 && (
            <>
              <Separator orientation='vertical' className='mx-2 h-4' />
              <Badge
                variant='secondary'
                className='rounded-sm px-1 font-normal lg:hidden'
              >
                {selectedValues.size}
              </Badge>
              <div className='hidden space-x-1 lg:flex'>
                {selectedValues.size > 2 ? (
                  <Badge
                    variant='secondary'
                    className='rounded-sm px-1 font-normal'
                  >
                    {t('messages.selected')} {selectedValues.size}
                  </Badge>
                ) : (
                  options
                    .filter((option) => selectedValues.has(option.value))
                    .map((option) => (
                      <Badge
                        variant='secondary'
                        key={option.value}
                        className='rounded-sm px-1 font-normal'
                      >
                        {option.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[200px] p-0' align='start'>
        <Command>
          <CommandInput placeholder={title} />
          <CommandList>
            <CommandEmpty>{t('messages.noResultsFound')}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedValues.has(option.value)
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      if (variant === 'radio') {
                        if (isSelected) {
                          column?.setFilterValue(undefined)
                        } else {
                          column?.setFilterValue([option.value])
                        }
                        setOpen(false)
                      } else {
                        if (isSelected) {
                          selectedValues.delete(option.value)
                        } else {
                          selectedValues.add(option.value)
                        }
                        const filterValues = Array.from(selectedValues)
                        column?.setFilterValue(
                          filterValues.length ? filterValues : undefined
                        )
                      }
                    }}
                  >
                    <div
                      className={cn(
                        'flex size-4 items-center justify-center border border-primary',
                        variant === 'radio' ? 'rounded-full' : 'rounded-sm',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'opacity-50 [&_svg]:invisible'
                      )}
                    >
                      <CheckIcon className={cn('h-4 w-4 text-background')} />
                    </div>
                    {option.icon && (
                      <option.icon className='size-4 text-muted-foreground' />
                    )}
                    <span>{option.label}</span>
                    {facets?.get(option.value) && (
                      <span className='ms-auto flex h-4 w-4 items-center justify-center font-mono text-xs'>
                        {facets.get(option.value)}
                      </span>
                    )}
                  </CommandItem>
                )
              })}
            </CommandGroup>
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      column?.setFilterValue(undefined)
                      setOpen(false)
                    }}
                    className='justify-center text-center'
                  >
                    {t('messages.clearFilters')}
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
