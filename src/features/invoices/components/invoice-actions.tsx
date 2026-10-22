import { useState } from 'react'
import { Printer } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Invoice } from '../api'
import { printInvoice, type InvoicePaperSize } from '../lib/print-invoice'

export function InvoiceActions({ invoice }: { invoice: Invoice }) {
  const { t } = useTranslation()
  const [showMedicines, setShowMedicines] = useState(true)
  const options: { size: InvoicePaperSize; label: string }[] = [
    { size: 'A4', label: t('messages.a4Paper') },
    { size: 'A5', label: t('messages.a5Paper') },
    { size: '80mm', label: t('messages.80MmThermalPrinter') },
    { size: '58mm', label: t('messages.58MmThermalPrinter') },
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size='sm' variant='outline'>
          <Printer /> {t('messages.printInvoice')}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuCheckboxItem
          checked={showMedicines}
          onCheckedChange={setShowMedicines}
          onSelect={(event) => event.preventDefault()}
        >
          {t('print.showMedicines')}
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        {options.map(({ size, label }) => (
          <DropdownMenuItem
            key={size}
            onClick={() =>
              printInvoice(
                {
                  invoice,
                  patient: invoice.prescription.patient,
                  items: invoice.prescription.items,
                  doctorName: invoice.prescription.medicalHistory.doctorName,
                },
                size,
                { showMedicines }
              )
            }
          >
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
