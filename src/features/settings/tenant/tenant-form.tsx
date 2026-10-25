import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { SERVICE_PLAN_LABELS } from '@/config/service-plans'
import { SUBSCRIPTION_STATUS_SUMMARY_LABELS } from '@/config/subscription-statuses'
import i18n, { getLocale } from '@/i18n'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { showRequestError } from '@/lib/handle-server-error'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { ContentSection } from '../components/content-section'
import { getOwnTenant, updateOwnTenant } from './api'
import { StorageUsage } from './storage-usage'

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: () => i18n.t('messages.pleaseEnterAClinicName') })
    .max(255),
  address: z
    .string()
    .trim()
    .min(1, { error: () => i18n.t('messages.pleaseEnterAnAddress') })
    .max(255),
})

type FormValues = z.infer<typeof schema>

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString(getLocale()) : '—'

export function TenantForm() {
  const { t } = useTranslation()

  const queryClient = useQueryClient()
  const tenant = useQuery({ queryKey: ['tenant', 'me'], queryFn: getOwnTenant })
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', address: '' },
  })

  useEffect(() => {
    if (!tenant.data) return
    form.reset({
      name: tenant.data.name,
      address: tenant.data.address,
    })
  }, [form, tenant.data])

  const update = useMutation({
    mutationFn: updateOwnTenant,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['tenant', 'me'] }),
        queryClient.invalidateQueries({ queryKey: ['landing-config'] }),
        queryClient.invalidateQueries({ queryKey: ['tenants'] }),
        queryClient.invalidateQueries({
          queryKey: ['support-requests', 'tenant-options'],
        }),
        queryClient.invalidateQueries({ queryKey: ['auth', 'profile'] }),
      ])
      toast.success(t('messages.clinicInformationUpdated'))
    },
    onError: (error) =>
      showRequestError(error, t('messages.couldNotUpdateClinicInformation')),
  })

  if (tenant.isLoading) {
    return (
      <p className='text-sm text-muted-foreground'>
        {t('messages.loadingInformation')}
      </p>
    )
  }

  return (
    <ContentSection
      title={t('messages.clinicInformation')}
      desc={t('messages.manageIdentificationDetailsForTheCurrentClinic')}
    >
      <Form {...form}>
        <form
          className='space-y-6'
          onSubmit={form.handleSubmit((values) => update.mutate(values))}
        >
          <div className='grid gap-4 sm:grid-cols-2'>
            <FormItem>
              <FormLabel>{t('messages.clinicCode')}</FormLabel>
              <FormControl>
                <Input value={tenant.data?.code ?? ''} disabled />
              </FormControl>
            </FormItem>
            <FormItem>
              <FormLabel>{t('messages.servicePlan')}</FormLabel>
              <FormControl>
                <Input
                  value={
                    tenant.data
                      ? SERVICE_PLAN_LABELS[tenant.data.servicePlan]
                      : ''
                  }
                  disabled
                />
              </FormControl>
            </FormItem>
          </div>

          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel required>{t('messages.clinicName')}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='address'
            render={({ field }) => (
              <FormItem>
                <FormLabel required>{t('messages.address')}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormItem>
            <FormLabel>{t('messages.subdomain')}</FormLabel>
            <FormControl>
              <Input value={tenant.data?.subdomain ?? ''} disabled />
            </FormControl>
            <FormDescription>
              {t('messages.contactSupportToChangeTheClinicWebsiteAddress')}
            </FormDescription>
          </FormItem>

          <div className='grid gap-4 rounded-lg border bg-muted/30 p-4 sm:grid-cols-2'>
            <div>
              <p className='text-sm text-muted-foreground'>
                {t('messages.subscriptionStatus')}
              </p>
              <p className='font-medium'>
                {tenant.data
                  ? SUBSCRIPTION_STATUS_SUMMARY_LABELS[
                      tenant.data.subscriptionStatus
                    ]
                  : '—'}
              </p>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>
                {t('messages.expiryDateAlt3')}
              </p>
              <p className='font-medium'>
                {formatDate(tenant.data?.subscriptionEndsAt)}
              </p>
            </div>
          </div>

          {tenant.data && <StorageUsage tenant={tenant.data} />}

          <Button type='submit' disabled={update.isPending}>
            {update.isPending
              ? t('messages.saving')
              : t('messages.saveChanges')}
          </Button>
        </form>
      </Form>
    </ContentSection>
  )
}
