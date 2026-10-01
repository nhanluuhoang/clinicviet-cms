import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Check, ChevronsUpDown } from 'lucide-react'
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
import { getMedicines, type Medicine } from '../api'

export function MedicinePicker({
  selected,
  onChange,
}: {
  selected?: Medicine
  onChange: (medicine: Medicine) => void
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const medicines = useQuery({
    queryKey: ['prescription-medicines', debouncedSearch],
    queryFn: () => getMedicines(debouncedSearch),
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
          className='w-full justify-between font-normal'
        >
          <span className='truncate'>
            {selected
              ? `${selected.name} · ${selected.strength} (${selected.unit}) · Tồn ${selected.totalQty}`
              : medicines.isLoading
                ? 'Đang tải...'
                : 'Chọn thuốc'}
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
            placeholder='Tìm tên thuốc...'
          />
          <CommandList>
            <CommandEmpty>Không tìm thấy thuốc.</CommandEmpty>
            <CommandGroup>
              {(medicines.data ?? []).map((medicine) => (
                <CommandItem
                  key={medicine.id}
                  value={`${medicine.name} ${medicine.strength}`}
                  disabled={medicine.totalQty < 1}
                  onSelect={() => {
                    onChange(medicine)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      'size-4',
                      medicine.id === selected?.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <span className='min-w-0 flex-1 truncate'>
                    {medicine.name} · {medicine.strength} ({medicine.unit})
                  </span>
                  <span className='ms-auto text-xs text-muted-foreground'>
                    {medicine.salePrice.toLocaleString('vi-VN')} ₫ · Tồn:{' '}
                    {medicine.totalQty}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
