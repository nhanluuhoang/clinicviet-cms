import { useState } from 'react'
import { z } from 'zod'
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
import { PasswordInput } from '@/components/password-input'
import { SelectDropdown } from '@/components/select-dropdown'
import { provisionTenant } from './api'

const schema = z
  .object({
    code: z.string().trim().min(1, 'Vui lòng nhập mã phòng khám.').max(50),
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
    adminFullName: z.string().trim().min(1, 'Vui lòng nhập họ tên.').max(255),
    adminEmail: z.email('Email không hợp lệ.'),
    adminPhone: z.string().trim().max(20),
    adminUserName: z
      .string()
      .trim()
      .min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự.')
      .max(50)
      .regex(
        /^[a-zA-Z0-9._-]+$/,
        'Chỉ dùng chữ, số, dấu chấm, gạch ngang hoặc gạch dưới.'
      ),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự.').max(20),
    passwordConfirmation: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    path: ['passwordConfirmation'],
    message: 'Mật khẩu nhập lại không khớp.',
  })

type FormValues = z.infer<typeof schema>

const defaultValues: FormValues = {
  code: '',
  name: '',
  subdomain: '',
  address: '',
  servicePlan: 'BASIC',
  adminFullName: '',
  adminEmail: '',
  adminPhone: '',
  adminUserName: '',
  password: '',
  passwordConfirmation: '',
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
    mutationFn: (values: FormValues) =>
      provisionTenant({
        ...values,
        isActive: true,
        adminPhone: values.adminPhone || undefined,
      }),
    onSuccess: async ({ admin }) => {
      await queryClient.invalidateQueries({ queryKey: ['tenants'] })
      toast.success(`Đã tạo phòng khám và tài khoản ${admin.userName}`)
      form.reset(defaultValues)
      setOpen(false)
    },
    onError: (error) =>
      toast.error(
        (error as ApiError)?.error?.title ?? 'Không thể tạo phòng khám.'
      ),
  })

  return (
    <>
      <Button onClick={() => setOpen(true)}>Tạo phòng khám</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-2xl'>
          <DialogHeader className='text-start'>
            <DialogTitle>Tạo phòng khám và tài khoản quản trị</DialogTitle>
            <DialogDescription>
              Hai dữ liệu được tạo cùng lúc. Nếu có lỗi, hệ thống sẽ không lưu
              một phần.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              id='create-tenant-form'
              onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
              className='grid gap-4 sm:grid-cols-2'
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
    name: keyof FormValues
    label: string
    type?: 'email' | 'password'
  }> = [
    { name: 'code', label: 'Mã phòng khám' },
    { name: 'name', label: 'Tên phòng khám' },
    { name: 'subdomain', label: 'Subdomain' },
    { name: 'address', label: 'Địa chỉ' },
    { name: 'adminFullName', label: 'Họ tên quản trị viên' },
    { name: 'adminEmail', label: 'Email quản trị viên', type: 'email' },
    { name: 'adminPhone', label: 'Số điện thoại quản trị viên' },
    { name: 'adminUserName', label: 'Tên đăng nhập' },
    { name: 'password', label: 'Mật khẩu', type: 'password' },
    {
      name: 'passwordConfirmation',
      label: 'Nhập lại mật khẩu',
      type: 'password',
    },
  ]

  return (
    <>
      {fields.slice(0, 4).map(({ name, label, type }) => (
        <TextField
          key={name}
          form={form}
          name={name}
          label={label}
          type={type}
        />
      ))}
      <FormField
        control={form.control}
        name='servicePlan'
        render={({ field }) => (
          <FormItem className='sm:col-span-2'>
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
      <div className='border-t pt-4 font-medium sm:col-span-2'>
        Tài khoản quản trị phòng khám
      </div>
      {fields.slice(4).map(({ name, label, type }) => (
        <TextField
          key={name}
          form={form}
          name={name}
          label={label}
          type={type}
        />
      ))}
    </>
  )
}

function TextField({
  form,
  name,
  label,
  type,
}: {
  form: ReturnType<typeof useForm<FormValues>>
  name: keyof FormValues
  label: string
  type?: 'email' | 'password'
}) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            {type === 'password' ? (
              <PasswordInput {...field} />
            ) : (
              <Input type={type} {...field} />
            )}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
