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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Textarea } from '@/components/ui/textarea'
import { getDiagnoses } from '@/features/diagnoses/api'

export function DiagnosisInput({
  id,
  value,
  onChange,
}: {
  id: string
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
      'diagnoses',
      'suggestions',
      user?.tenantId,
      user?.role,
      debouncedSearch,
    ],
    enabled: open && Boolean(user),
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      getDiagnoses({
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
        <Textarea
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={t('messages.enterTheDoctorSDiagnosis')}
          required
        />
        <Popover modal open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type='button'
              variant='outline'
              aria-label={t('diagnosisSuggestions.choose')}
            >
              {t('messages.suggestions')}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align='end'
            className='flex max-h-[var(--radix-popover-content-available-height)] w-80 max-w-[calc(100vw-2rem)] flex-col overflow-hidden p-0'
          >
            <Command shouldFilter={false} className='h-auto min-h-0'>
              <CommandInput
                value={search}
                onValueChange={setSearch}
                placeholder={t('diagnosisSuggestions.search')}
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
                    <p>{t('diagnoses.loadFailed')}</p>
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
                          : 'diagnosisSuggestions.empty'
                      )}
                    </CommandEmpty>
                    <CommandGroup>
                      {suggestions.map((option) => (
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
                  </>
                )}
              </CommandList>
            </Command>
            {query.hasNextPage && (
              <Button
                type='button'
                variant='ghost'
                className='w-full shrink-0 rounded-none border-t'
                disabled={query.isFetchingNextPage}
                onClick={() => void query.fetchNextPage()}
              >
                {t(
                  query.isFetchingNextPage
                    ? 'messages.loading'
                    : 'diagnoses.loadMore'
                )}
              </Button>
            )}
          </PopoverContent>
        </Popover>
      </div>
      <p className='text-xs text-muted-foreground'>
        {t('diagnosisSuggestions.hint')}
      </p>
    </div>
  )
}
