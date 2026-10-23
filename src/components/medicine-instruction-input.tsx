import { useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/auth-store'
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
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { getMedicineInstructions } from '@/features/medicine-instructions/api'

export function MedicineInstructionInput({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.auth.user)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const query = useInfiniteQuery({
    queryKey: [
      'medicineInstructions',
      'suggestions',
      user?.tenantId,
      user?.role,
      debouncedSearch,
    ],
    enabled: open && Boolean(user),
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      getMedicineInstructions({
        page: pageParam,
        limit: 20,
        search: debouncedSearch || undefined,
      }),
    getNextPageParam: (last) =>
      last.page * last.limit < last.total ? last.page + 1 : undefined,
  })
  const suggestions = query.data?.pages.flatMap((page) => page.data) ?? []
  return (
    <div className='min-w-0 space-y-2'>
      <div className='flex min-w-0 items-start gap-2'>
        <Input
          aria-label={t('messages.userGuide')}
          maxLength={255}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={t('messages.enterInstructionsForThePatient')}
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type='button'
              variant='outline'
              aria-label={t('messages.chooseSuggestedInstructions')}
            >
              {t('messages.suggestions')}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align='end'
            className='w-80 max-w-[calc(100vw-2rem)] p-0'
          >
            <Command shouldFilter={false}>
              <CommandInput
                value={search}
                onValueChange={setSearch}
                placeholder={t('messages.searchInstructions')}
              />
              <CommandList>
                {query.isPending ? (
                  <p
                    role='status'
                    className='p-4 text-sm text-muted-foreground'
                  >
                    {t('messages.loading')}
                  </p>
                ) : query.isError ? (
                  <div role='alert' className='p-4 text-sm'>
                    <p>{t('medicineInstructions.loadFailed')}</p>
                    <Button
                      type='button'
                      variant='ghost'
                      onClick={() => void query.refetch()}
                    >
                      {t('messages.tryAgain')}
                    </Button>
                  </div>
                ) : (
                  <>
                    <CommandEmpty>
                      {t(
                        search.trim()
                          ? 'messages.noMatchingSuggestions'
                          : 'medicineInstructions.empty'
                      )}
                    </CommandEmpty>
                    {(['COMMON', 'CLINIC'] as const).map((scope) => {
                      const rows = suggestions.filter((option) =>
                        scope === 'COMMON'
                          ? option.tenantId === null
                          : option.tenantId !== null
                      )
                      return rows.length ? (
                        <CommandGroup
                          key={scope}
                          heading={t(`medicineInstructions.${scope}`)}
                        >
                          {rows.map((option) => (
                            <CommandItem
                              key={option.id}
                              value={option.id}
                              keywords={[option.name]}
                              className='break-words whitespace-pre-wrap'
                              onSelect={() => {
                                onChange(option.name)
                                setOpen(false)
                              }}
                            >
                              {option.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      ) : null
                    })}
                  </>
                )}
              </CommandList>
            </Command>
            {query.hasNextPage && (
              <Button
                type='button'
                variant='ghost'
                className='w-full rounded-none border-t'
                disabled={query.isFetchingNextPage}
                onClick={() => void query.fetchNextPage()}
              >
                {t(
                  query.isFetchingNextPage
                    ? 'messages.loading'
                    : 'medicineInstructions.loadMore'
                )}
              </Button>
            )}
          </PopoverContent>
        </Popover>
      </div>
      <p className='text-xs leading-5 break-words text-muted-foreground'>
        {value.trim()
          ? t('messages.shownOnTheDocument', { value0: value.trim() })
          : t('messages.includeTheAmountPerDoseTimingAndDuration')}
      </p>
    </div>
  )
}
