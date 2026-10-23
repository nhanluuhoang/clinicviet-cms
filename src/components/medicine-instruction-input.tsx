import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getDefaultMedicineInstructions } from '@/lib/medicine-instructions'
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
  const { t } = useTranslation()

  const [open, setOpen] = useState(false)
  const configuredOptions = [...new Set(options.filter(Boolean))]
  const extraOptions = getDefaultMedicineInstructions().filter(
    (option) => !configuredOptions.includes(option)
  )

  return (
    <div className='min-w-0 space-y-2'>
      <div className='flex min-w-0 gap-2'>
        <Input
          aria-label={t('messages.userGuide')}
          value={value}
          maxLength={255}
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
            <Command>
              <CommandInput placeholder={t('messages.searchInstructions')} />
              <CommandList>
                <CommandEmpty>
                  {t('messages.noMatchingSuggestions')}
                </CommandEmpty>
                {configuredOptions.length > 0 && (
                  <CommandGroup heading={t('messages.clinicOptions')}>
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
                  <CommandGroup heading={t('messages.commonSuggestions')}>
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
          ? t('messages.shownOnTheDocument', { value0: value.trim() })
          : t('messages.includeTheAmountPerDoseTimingAndDuration')}
      </p>
    </div>
  )
}
