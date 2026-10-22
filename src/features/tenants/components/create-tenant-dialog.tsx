import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { SERVICE_PLAN_OPTIONS } from '@/config/service-plans'
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
    name: z.string().trim().min(1, 'Vui lòng nhập tên phòng khám.').max(255),
    subdomain: z.string().trim(),
    address: z.string().trim().min(1, 'Vui lòng nhập địa chỉ.').max(255),
    servicePlan: z.enum(['BASIC', 'PLUS', 'PRO']),
    endsOn: z.string().min(1, 'Vui lòng chọn ngày kết thúc.'),
  })
  .refine(
    ({ servicePlan, subdomain }) =>
      servicePlan !== 'PRO' ||
      (subdomain.length <= 50 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(subdomain)),
    {
      path: ['subdomain'],
      message:
        'Nhập subdomain tối đa 50 ký tự, chỉ dùng chữ thường, số và dấu gạch ngang.',
    }
  )
  .refine(
    ({ endsOn }) => new Date(`${endsOn}T23:59:59`).getTime() > Date.now(),
    { path: ['endsOn'], message: 'Ngày kết thúc phải ở tương lai.' }
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
      await queryClient.invalidateQueries({ queryKey: ['tenants'] })
      toast.success('Đã tạo phòng khám')
      form.reset(defaultValues)
      setOpen(false)
    },
    onError: (error) => showRequestError(error, 'Không thể tạo phòng khám.'),
  })

  return (
    <>
      <Button onClick={() => setOpen(true)}>Tạo phòng khám</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogFormContent className='sm:max-w-xl'>
          <DialogBody>
            <DialogHeader className='text-start'>
              <DialogTitle>Tạo phòng khám</DialogTitle>
              <DialogDescription>
                Tài khoản có thể được tạo sau tại mục Người dùng.
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
              Hủy
            </Button>
            <Button
              type='submit'
              form='create-tenant-form'
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Đang tạo...' : 'Tạo phòng khám'}
            </Button>
          </DialogFooter>
        </DialogFormContent>
      </Dialog>
    </>
  )
}

function Fields({ form }: { form: ReturnType<typeof useForm<FormValues>> }) {
  const fields: Array<{
    name: 'name' | 'subdomain' | 'address'
    label: string
  }> = [
    { name: 'name', label: 'Tên phòng khám' },
    { name: 'subdomain', label: 'Subdomain' },
    { name: 'address', label: 'Địa chỉ' },
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
            <FormLabel required>Gói dịch vụ</FormLabel>
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
            <FormLabel required>Ngày hết hạn sử dụng</FormLabel>
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
