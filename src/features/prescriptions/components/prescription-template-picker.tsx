import { useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { ChevronsUpDown } from 'lucide-react'
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
import {
  getPrescriptionTemplates,
  type PrescriptionTemplate,
} from '@/features/prescription-templates/api'

export function PrescriptionTemplatePicker({
  onSelect,
}: {
  onSelect: (template: PrescriptionTemplate) => void
}) {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.auth.user)

  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: [
        'prescription-templates',
        'search',
        user?.tenantId,
        user?.role,
        debouncedSearch,
      ],
      initialPageParam: 1,
      queryFn: ({ pageParam }) =>
        getPrescriptionTemplates({
          page: pageParam,
          limit: 20,
          search: debouncedSearch || undefined,
        }),
      getNextPageParam: (lastPage) =>
        lastPage.page * lastPage.limit < lastPage.total
          ? lastPage.page + 1
          : undefined,
      enabled: open,
    })
  const templates = data?.pages.flatMap((page) => page.data) ?? []

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type='button'
          variant='outline'
          className='w-full justify-between font-normal'
        >
          {t('messages.chooseATemplateToApply')}
          <ChevronsUpDown className='size-4 opacity-50' />
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
            placeholder={t('messages.searchTemplateOrMedicineName')}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading
                ? t('messages.searching')
                : t('messages.noPrescriptionTemplatesFound')}
            </CommandEmpty>
            <CommandGroup>
              {templates.map((template) => (
                <CommandItem
                  key={template.id}
                  value={template.id}
                  onSelect={() => {
                    onSelect(template)
                    setOpen(false)
                    setSearch('')
                  }}
                >
                  <div className='min-w-0'>
                    <p className='truncate font-medium'>{template.name}</p>
                    <p className='truncate text-xs text-muted-foreground'>
                      {template.items
                        .map((item) => item.medicineName)
                        .join(', ')}
                    </p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
          {hasNextPage && (
            <Button
              type='button'
              variant='ghost'
              disabled={isFetchingNextPage}
              onClick={() => void fetchNextPage()}
            >
              {t('messages.loadMore')}
            </Button>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  )
}
