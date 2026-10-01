import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronsUpDown } from 'lucide-react'
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
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['prescription-templates', 'search', debouncedSearch],
    queryFn: () => getPrescriptionTemplates(debouncedSearch),
    enabled: open,
  })

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type='button'
          variant='outline'
          className='w-full justify-between font-normal'
        >
          Chọn mẫu để áp dụng
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
            placeholder='Tìm tên mẫu hoặc tên thuốc...'
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? 'Đang tìm...' : 'Không tìm thấy mẫu đơn.'}
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
        </Command>
      </PopoverContent>
    </Popover>
  )
}
