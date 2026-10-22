import { useState } from 'react'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { SERVICE_PLAN_OPTIONS } from '@/config/service-plans'
import { SUBSCRIPTION_STATUS_OPTIONS } from '@/config/subscription-statuses'
import i18n from '@/i18n'
import { Pencil, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { showRequestError } from '@/lib/handle-server-error'
import { toDateInput } from '@/lib/utils'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogBody,
  DialogFormContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { DatePickerInput } from '@/components/date-picker-input'
import { SelectDropdown } from '@/components/select-dropdown'
import { deleteTenant, updateTenant, type Tenant } from '../api'

export function TenantActions({ tenant }: { tenant: Tenant }) {
  const { t } = useTranslation()

  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const queryClient = useQueryClient()
  const [subscriptionStatus, setSubscriptionStatus] = useState(
    tenant.subscriptionStatus
  )
  const expiryDate = tenant.subscriptionEndsAt
  const [endsOn, setEndsOn] = useState(
    expiryDate ? toDateInput(expiryDate) : ''
  )
  const [values, setValues] = useState({
    code: tenant.code,
    name: tenant.name,
    subdomain: tenant.subdomain ?? '',
    address: tenant.address,
    note: tenant.note,
    servicePlan: tenant.servicePlan,
    storageLimitGb: tenant.storageLimitGb,
    isActive: tenant.isActive,
  })
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['tenants'] })
  const update = useMutation({
    mutationFn: () =>
      updateTenant(tenant.id, {
        ...values,
        subscriptionStatus,
        subdomain:
          values.servicePlan === 'PRO'
            ? values.subdomain || null
            : values.servicePlan === 'PLUS' && tenant.servicePlan !== 'PLUS'
              ? null
              : undefined,
        subscriptionEndsAt: new Date(`${endsOn}T23:59:59`).toISOString(),
      }),
    onSuccess: async () => {
      await refresh()
      toast.success(t('messages.clinicUpdated'))
      setEditOpen(false)
    },
    onError: (error) =>
      showRequestError(error, t('messages.couldNotUpdateClinic')),
  })
  const remove = useMutation({
    mutationFn: () => deleteTenant(tenant.id),
    onSuccess: async () => {
      await refresh()
      toast.success(t('messages.clinicDeleted'))
      setDeleteOpen(false)
    },
    onError: (error) =>
      showRequestError(
        error,
        t('messages.cannotDeleteAClinicWithBusinessData')
      ),
  })

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='flex h-8 w-8 p-0'>
            <DotsHorizontalIcon className='h-4 w-4' />
            <span className='sr-only'>{t('messages.openMenu')}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-[160px]'>
          <DropdownMenuItem
            onClick={() => {
              setSubscriptionStatus(tenant.subscriptionStatus)
              const storedExpiry = tenant.subscriptionEndsAt
              setEndsOn(storedExpiry ? toDateInput(storedExpiry) : '')
              setValues({
                code: tenant.code,
                name: tenant.name,
                subdomain: tenant.subdomain ?? '',
                address: tenant.address,
                note: tenant.note,
                servicePlan: tenant.servicePlan,
                storageLimitGb: tenant.storageLimitGb,
                isActive: tenant.isActive,
              })
              setEditOpen(true)
            }}
          >
            {t('messages.update')}
            <DropdownMenuShortcut>
              <Pencil size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setDeleteOpen(true)}
            className='text-red-500!'
          >
            {t('messages.delete')}
            <DropdownMenuShortcut>
              <Trash2 size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogFormContent className='sm:max-w-xl'>
          <DialogBody>
            <DialogHeader>
              <DialogTitle>{t('messages.updateClinic')}</DialogTitle>
            </DialogHeader>
            <div className='grid gap-4 sm:grid-cols-2'>
              {(
                [
                  ['code', t('messages.clinicCode')],
                  ['name', t('messages.clinicName')],
                  ['subdomain', i18n.t('messages.subdomain')],
                  ['address', t('messages.address')],
                ] as const
              )
                .filter(
                  ([key]) => key !== 'subdomain' || values.servicePlan === 'PRO'
                )
                .map(([key, label]) => (
                  <div className='space-y-2' key={key}>
                    <Label required>{label}</Label>
                    <Input
                      value={values[key]}
                      onChange={(event) =>
                        setValues({ ...values, [key]: event.target.value })
                      }
                    />
                  </div>
                ))}
              <div className='space-y-2 sm:col-span-2'>
                <Label required htmlFor={`tenant-storage-${tenant.id}`}>
                  {t('messages.storageLimitGb')}
                </Label>
                <Input
                  id={`tenant-storage-${tenant.id}`}
                  type='number'
                  min={1}
                  max={100000}
                  step={1}
                  value={values.storageLimitGb}
                  onChange={(event) =>
                    setValues({
                      ...values,
                      storageLimitGb: Number(event.target.value),
                    })
                  }
                />
              </div>
              <div className='space-y-2 sm:col-span-2'>
                <Label htmlFor={`tenant-note-${tenant.id}`}>
                  {t('messages.internalNotes')}
                </Label>
                <Textarea
                  id={`tenant-note-${tenant.id}`}
                  maxLength={1000}
                  rows={3}
                  value={values.note}
                  onChange={(event) =>
                    setValues({ ...values, note: event.target.value })
                  }
                />
              </div>
              <div className='space-y-2 sm:col-span-2'>
                <Label required>{t('messages.servicePlanAlt2')}</Label>
                <SelectDropdown
                  standalone
                  defaultValue={values.servicePlan}
                  isControlled
                  onValueChange={(servicePlan) =>
                    setValues({
                      ...values,
                      servicePlan: servicePlan as Tenant['servicePlan'],
                    })
                  }
                  items={SERVICE_PLAN_OPTIONS}
                />
              </div>
              <div className='space-y-2 sm:col-span-2'>
                <Label required>{t('messages.usageStatus')}</Label>
                <SelectDropdown
                  standalone
                  isControlled
                  defaultValue={subscriptionStatus}
                  onValueChange={(value) => {
                    const status = value as Tenant['subscriptionStatus']
                    setSubscriptionStatus(status)
                    const date = tenant.subscriptionEndsAt
                    setEndsOn(date ? toDateInput(date) : '')
                  }}
                  items={SUBSCRIPTION_STATUS_OPTIONS}
                />
              </div>
              <div className='space-y-2 sm:col-span-2'>
                <Label required htmlFor={`tenant-expiry-${tenant.id}`}>
                  {t('messages.usageExpiryDate')}
                </Label>
                <DatePickerInput
                  id={`tenant-expiry-${tenant.id}`}
                  value={endsOn}
                  onChange={setEndsOn}
                />
              </div>
              <label className='flex items-center gap-2 sm:col-span-2'>
                <Checkbox
                  checked={values.isActive}
                  onCheckedChange={(checked) =>
                    setValues({ ...values, isActive: checked === true })
                  }
                />
                {t('subscriptionStatuses.ACTIVE')}
              </label>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant='outline' onClick={() => setEditOpen(false)}>
              {t('messages.cancel')}
            </Button>
            <Button
              onClick={() => update.mutate()}
              disabled={
                update.isPending ||
                !endsOn ||
                !Number.isInteger(values.storageLimitGb) ||
                values.storageLimitGb < 1 ||
                values.storageLimitGb > 100000
              }
            >
              {t('messages.saveChanges')}
            </Button>
          </DialogFooter>
        </DialogFormContent>
      </Dialog>
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('messages.deleteClinic')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('messages.onlyClinicsWithoutAppointmentsMedicalRecordsInven')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('messages.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => remove.mutate()}>
              {t('messages.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
