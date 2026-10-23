import { useState } from 'react'
import { hasAnyRole, PRESCRIBER_ROLES } from '@/config/access-control'
import { ClipboardList, Printer, UserRoundCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { printInvoice } from '@/features/invoices/lib/print-invoice'
import { type QueueEntry, type QueueStatus } from '../api'
import { transitions } from '../data/data'
import { PrescriptionDialog } from './prescription-dialog'

export function QueueActions({
  item,
  pending,
  onStatus,
  onCheckIn,
  align = 'end',
}: {
  item: QueueEntry
  pending: boolean
  onStatus: (status: QueueStatus) => void
  onCheckIn: () => void
  align?: 'start' | 'end'
}) {
  const { t } = useTranslation()

  const [prescriptionOpen, setPrescriptionOpen] = useState(false)
  const role = useAuthStore((state) => state.auth.user?.role)
  const canPrescribe = hasAnyRole(role, PRESCRIBER_ROLES)
  const invoice = item.medicalHistory?.prescription?.invoice

  return (
    <>
      <div
        className={`flex flex-wrap gap-1 ${align === 'start' ? 'justify-start' : 'justify-end'}`}
      >
        {item.status === 'COMPLETED' && invoice && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size='sm' variant='outline' data-tour='print-invoice'>
                <Printer /> {t('messages.printInvoice')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem
                onClick={() =>
                  printInvoice(
                    {
                      invoice,
                      patient: item.patient,
                      items: item.medicalHistory!.prescription!.items,
                      doctorName: item.medicalHistory!.doctorName,
                    },
                    'A4'
                  )
                }
              >
                {t('messages.a4Paper')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  printInvoice(
                    {
                      invoice,
                      patient: item.patient,
                      items: item.medicalHistory!.prescription!.items,
                      doctorName: item.medicalHistory!.doctorName,
                    },
                    'A5'
                  )
                }
              >
                {t('messages.a5Paper')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  printInvoice(
                    {
                      invoice,
                      patient: item.patient,
                      items: item.medicalHistory!.prescription!.items,
                      doctorName: item.medicalHistory!.doctorName,
                    },
                    '80mm'
                  )
                }
              >
                {t('messages.80MmThermalPrinter')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  printInvoice(
                    {
                      invoice,
                      patient: item.patient,
                      items: item.medicalHistory!.prescription!.items,
                      doctorName: item.medicalHistory!.doctorName,
                    },
                    '58mm'
                  )
                }
              >
                {t('messages.58MmThermalPrinter')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        {item.status === 'BOOKED' && (
          <Button
            size='sm'
            variant='outline'
            disabled={pending}
            onClick={onCheckIn}
          >
            <UserRoundCheck /> {t('messages.admit')}
          </Button>
        )}
        {item.status === 'IN_EXAMINATION' && canPrescribe && (
          <>
            <Button
              size='sm'
              variant='outline'
              data-tour='create-prescription'
              onClick={() => setPrescriptionOpen(true)}
            >
              <ClipboardList /> {t('messages.createRecord')}
            </Button>
          </>
        )}
        {(transitions[item.status] ?? []).map((action) => (
          <Button
            key={action.status}
            size='sm'
            variant={
              action.status === 'CANCELLED'
                ? 'destructive'
                : action.status === 'NO_SHOW'
                  ? 'ghost'
                  : 'outline'
            }
            disabled={pending}
            onClick={() => onStatus(action.status)}
          >
            {action.label}
          </Button>
        ))}
      </div>
      {canPrescribe && (
        <PrescriptionDialog
          open={prescriptionOpen}
          onOpenChange={setPrescriptionOpen}
          patient={item.patient}
          queueId={item.id}
          initialData={item.medicalHistory}
        />
      )}
    </>
  )
}
