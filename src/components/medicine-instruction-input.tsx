import { useState } from 'react'
import { DEFAULT_MEDICINE_INSTRUCTIONS } from '@/lib/medicine-instructions'
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

export function MedicineInstructionInput({
  value,
  options,
  onChange,
}: {
  value: string
  options: string[]
  onChange: (value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const configuredOptions = [...new Set(options.filter(Boolean))]
  const extraOptions = DEFAULT_MEDICINE_INSTRUCTIONS.filter(
    (option) => !configuredOptions.includes(option)
  )

  return (
    <div className='min-w-0 space-y-2'>
      <div className='flex min-w-0 gap-2'>
        <Input
          aria-label='Hướng dẫn sử dụng'
          value={value}
          maxLength={255}
          onChange={(event) => onChange(event.target.value)}
          placeholder='Nhập cách dùng cho người bệnh'
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type='button'
              variant='outline'
              aria-label='Chọn hướng dẫn gợi ý'
            >
              Gợi ý
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align='end'
            className='w-80 max-w-[calc(100vw-2rem)] p-0'
          >
            <Command>
              <CommandInput placeholder='Tìm hướng dẫn...' />
              <CommandList>
                <CommandEmpty>Không có gợi ý phù hợp.</CommandEmpty>
                {configuredOptions.length > 0 && (
                  <CommandGroup heading='Lựa chọn của phòng khám'>
                    {configuredOptions.map((option) => (
                      <CommandItem
                        key={option}
                        value={option}
                        onSelect={() => {
                          onChange(option)
                          setOpen(false)
                        }}
                      >
                        {option}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                {extraOptions.length > 0 && (
                  <CommandGroup heading='Gợi ý phổ biến'>
                    {extraOptions.map((option) => (
                      <CommandItem
                        key={option}
                        value={option}
                        onSelect={() => {
                          onChange(option)
                          setOpen(false)
                        }}
                      >
                        {option}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      <p className='text-xs leading-5 break-words text-muted-foreground'>
        {value.trim()
          ? `Hiển thị trên phiếu: ${value.trim()}`
          : 'Có thể ghi lượng mỗi lần, thời điểm và thời gian dùng.'}
      </p>
    </div>
  )
}
