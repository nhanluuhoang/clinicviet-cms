import { useState } from 'react'
import { z } from 'zod'
import { isAxiosError } from 'axios'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
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
    subdomain: z
      .string()
      .trim()
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        'Chỉ dùng chữ thường, số và dấu gạch ngang.'
      ),
    address: z.string().trim().min(1, 'Vui lòng nhập địa chỉ.').max(255),
    servicePlan: z.enum(['BASIC', 'PLUS', 'PRO']),
    subscriptionStatus: z.enum(['TRIAL', 'ACTIVE']),
    endsOn: z.string().min(1, 'Vui lòng chọn ngày kết thúc.'),
  })
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
  subscriptionStatus: 'TRIAL',
  endsOn: '',
}

type ApiError = { error?: { title?: string } }

export function CreateTenantDialog() {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  })
  const mutation = useMutation({
    mutationFn: ({ endsOn, subscriptionStatus, ...values }: FormValues) =>
      createTenant({
        ...values,
        isActive: true,
        subscriptionStatus,
        ...(subscriptionStatus === 'TRIAL'
          ? { trialEndsAt: new Date(`${endsOn}T23:59:59`).toISOString() }
          : {
              subscriptionEndsAt: new Date(`${endsOn}T23:59:59`).toISOString(),
            }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['tenants'] })
      toast.success('Đã tạo phòng khám')
      form.reset(defaultValues)
      setOpen(false)
    },
    onError: (error) =>
      toast.error(
        (isAxiosError<ApiError>(error)
          ? error.response?.data?.error?.title
          : undefined) ?? 'Không thể tạo phòng khám.'
      ),
  })

  return (
    <>
      <Button onClick={() => setOpen(true)}>Tạo phòng khám</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='sm:max-w-xl'>
          <DialogHeader className='text-start'>
            <DialogTitle>Tạo phòng khám</DialogTitle>
            <DialogDescription>
              Tài khoản có thể được tạo sau tại mục Người dùng.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              id='create-tenant-form'
              onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
              className='space-y-4'
            >
              <Fields form={form} />
            </form>
          </Form>
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
        </DialogContent>
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
      {fields.map(({ name, label }) => (
        <TextField key={name} form={form} name={name} label={label} />
      ))}
      <FormField
        control={form.control}
        name='servicePlan'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Gói dịch vụ</FormLabel>
            <SelectDropdown
              defaultValue={field.value}
              isControlled
              onValueChange={field.onChange}
              items={[
                { label: 'Cơ bản', value: 'BASIC' },
                { label: 'Nâng cao', value: 'PLUS' },
                { label: 'Chuyên nghiệp', value: 'PRO' },
              ]}
            />
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name='subscriptionStatus'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Hình thức đăng ký</FormLabel>
            <SelectDropdown
              defaultValue={field.value}
              isControlled
              onValueChange={field.onChange}
              items={[
                { label: 'Đăng ký dùng thử', value: 'TRIAL' },
                { label: 'Đăng ký chính thức', value: 'ACTIVE' },
              ]}
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
            <FormLabel>
              {form.watch('subscriptionStatus') === 'TRIAL'
                ? 'Ngày kết thúc dùng thử'
                : 'Ngày hết hạn gói'}
            </FormLabel>
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
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
