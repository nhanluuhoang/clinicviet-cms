import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { SERVICE_PLAN_OPTIONS } from '@/config/service-plans'
import i18n from '@/i18n'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { showRequestError } from '@/lib/handle-server-error'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogBody,
  DialogFormContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { DatePickerInput } from '@/components/date-picker-input'
import { SelectDropdown } from '@/components/select-dropdown'
import { createTenant } from '../api'

const schema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, { error: () => i18n.t('messages.pleaseEnterAClinicNameAlt2') })
      .max(255),
    subdomain: z.string().trim(),
    address: z
      .string()
      .trim()
      .min(1, { error: () => i18n.t('messages.pleaseEnterAnAddressAlt2') })
      .max(255),
    servicePlan: z.enum(['BASIC', 'PLUS', 'PRO']),
    endsOn: z
      .string()
      .min(1, { error: () => i18n.t('messages.pleaseSelectAnEndDate') }),
  })
  .refine(
    ({ servicePlan, subdomain }) =>
      servicePlan !== 'PRO' ||
      (subdomain.length <= 50 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(subdomain)),
    {
      path: ['subdomain'],
      error: () =>
        i18n.t('messages.enterASubdomainOfUpTo50CharactersUsingLowercas'),
    }
  )
  .refine(
    ({ endsOn }) => new Date(`${endsOn}T23:59:59`).getTime() > Date.now(),
    {
      path: ['endsOn'],
      error: () => i18n.t('messages.theEndDateMustBeInTheFuture'),
    }
  )

type FormValues = z.infer<typeof schema>

const defaultValues: FormValues = {
  name: '',
  subdomain: '',
  address: '',
  servicePlan: 'BASIC',
  endsOn: '',
}

export function CreateTenantDialog() {
  const { t } = useTranslation()

  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  })
  const mutation = useMutation({
    mutationFn: ({ endsOn, subdomain, ...values }: FormValues) =>
      createTenant({
        ...values,
        ...(values.servicePlan === 'PRO' && { subdomain }),
        isActive: true,
        subscriptionStatus: 'ACTIVE',
        subscriptionEndsAt: new Date(`${endsOn}T23:59:59`).toISOString(),
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['tenants'] }),
        queryClient.invalidateQueries({
          queryKey: ['support-requests', 'tenant-options'],
        }),
      ])
      toast.success(t('messages.clinicCreated'))
      form.reset(defaultValues)
      setOpen(false)
    },
    onError: (error) =>
      showRequestError(error, t('messages.couldNotCreateClinic')),
  })

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        {t('messages.createClinic')}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogFormContent className='sm:max-w-xl'>
          <DialogBody>
            <DialogHeader className='text-start'>
              <DialogTitle>{t('messages.createClinic')}</DialogTitle>
              <DialogDescription>
                {t('messages.accountsCanBeCreatedLaterUnderUsers')}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                id='create-tenant-form'
                onSubmit={form.handleSubmit((values) =>
                  mutation.mutate(values)
                )}
                className='space-y-4'
              >
                <Fields form={form} />
              </form>
            </Form>
          </DialogBody>
          <DialogFooter>
            <Button variant='outline' onClick={() => setOpen(false)}>
              {t('messages.cancel')}
            </Button>
            <Button
              type='submit'
              form='create-tenant-form'
              disabled={mutation.isPending}
            >
              {mutation.isPending
                ? t('messages.creating')
                : t('messages.createClinic')}
            </Button>
          </DialogFooter>
        </DialogFormContent>
      </Dialog>
    </>
  )
}

function Fields({ form }: { form: ReturnType<typeof useForm<FormValues>> }) {
  const { t } = useTranslation()

  const fields: Array<{
    name: 'name' | 'subdomain' | 'address'
    label: string
  }> = [
    { name: 'name', label: t('messages.clinicName') },
    {
      name: 'subdomain',
      get label() {
        return i18n.t('messages.subdomain')
      },
    },
    { name: 'address', label: t('messages.address') },
  ]

  return (
    <>
      {fields
        .filter(
          ({ name }) =>
            name !== 'subdomain' || form.watch('servicePlan') === 'PRO'
        )
        .map(({ name, label }) => (
          <TextField key={name} form={form} name={name} label={label} />
        ))}
      <FormField
        control={form.control}
        name='servicePlan'
        render={({ field }) => (
          <FormItem>
            <FormLabel required>{t('messages.servicePlanAlt2')}</FormLabel>
            <SelectDropdown
              defaultValue={field.value}
              isControlled
              onValueChange={field.onChange}
              items={SERVICE_PLAN_OPTIONS}
            />
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name='endsOn'
        render={({ field }) => (
          <FormItem>
            <FormLabel required>{t('messages.usageExpiryDate')}</FormLabel>
            <DatePickerInput value={field.value} onChange={field.onChange} />
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  )
}

function TextField({
  form,
  name,
  label,
}: {
  form: ReturnType<typeof useForm<FormValues>>
  name: 'name' | 'subdomain' | 'address'
  label: string
}) {
  useTranslation()

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel
            required={
              name !== 'subdomain' || form.watch('servicePlan') === 'PRO'
            }
          >
            {label}
          </FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
