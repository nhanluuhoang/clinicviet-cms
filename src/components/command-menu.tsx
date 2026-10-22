import { useNavigate } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useSearch } from '@/context/search-provider'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { useNavigationGroups } from './layout/use-navigation-groups'

const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()

export function CommandMenu() {
  const { t } = useTranslation()

  const navigate = useNavigate()
  const { open, setOpen } = useSearch()
  const groups = useNavigationGroups()

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title={t('messages.findAFeature')}
      description={t('messages.findAndOpenAPageYouHaveAccessTo')}
      filter={(value, search, keywords) => {
        const text = normalize([value, ...(keywords ?? [])].join(' '))
        return normalize(search)
          .trim()
          .split(/\s+/)
          .every((word) => text.includes(word))
          ? 1
          : 0
      }}
    >
      <CommandInput placeholder={t('messages.findAFeatureAlt2')} />
      <CommandList
        // Keep Safari's native list scrolling out of the modal's document touch lock.
        onTouchMove={(event) => event.stopPropagation()}
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <CommandEmpty>{t('messages.noMatchingFeaturesFound')}</CommandEmpty>
        {groups.map((group, index) => (
          <CommandGroup key={index} heading={group.title}>
            {group.items.flatMap((item) => {
              const links = item.items ?? [item]
              return links.map((link) => {
                const Icon = link.icon ?? item.icon ?? ArrowRight
                const context = item.items ? item.title : group.title
                return (
                  <CommandItem
                    key={link.url}
                    value={link.url}
                    keywords={[
                      link.title,
                      context ?? '',
                      context?.startsWith(t('messages.statistics'))
                        ? 'báo cáo'
                        : '',
                      link.url === '/master-data' ? 'cài đặt cấu hình' : '',
                    ]}
                    onSelect={() => {
                      setOpen(false)
                      void navigate({ to: link.url })
                    }}
                  >
                    <Icon className='size-4 shrink-0' />
                    <div className='flex flex-col'>
                      <span>{link.title}</span>
                      {context && (
                        <span className='text-xs text-muted-foreground'>
                          {context}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                )
              })
            })}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  )
}
