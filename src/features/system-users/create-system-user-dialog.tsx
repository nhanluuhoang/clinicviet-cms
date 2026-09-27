import { useEffect } from 'react'
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
import type { Tenant } from '@/features/tenants/api'
import { createSystemUser } from './api'

const schema = z
  .object({
    tenantId: z.string().min(1, 'Vui lòng chọn phòng khám.'),
    userName: z
      .string()
      .trim()
      .min(3)
      .max(50)
      .regex(/^[a-zA-Z0-9._-]+$/),
    fullName: z.string().trim().min(1, 'Vui lòng nhập họ tên.'),
    email: z.union([z.literal(''), z.email('Email không hợp lệ.')]),
    phone: z.string().trim().max(20),
    role: z.enum(['TENANT_ADMIN', 'DOCTOR', 'ASSISTANT']),
    password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự.').max(20),
    passwordConfirmation: z.string(),
  })
  .refine((value) => value.password === value.passwordConfirmation, {
    path: ['passwordConfirmation'],
    message: 'Mật khẩu nhập lại không khớp.',
  })

type Values = z.infer<typeof schema>

export function CreateSystemUserDialog({
  open,
  onOpenChange,
  tenants,
  tenantId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  tenants: Tenant[]
  tenantId?: string
}) {
  const queryClient = useQueryClient()
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      tenantId: tenantId ?? '',
      userName: '',
      fullName: '',
      email: '',
      phone: '',
      role: 'TENANT_ADMIN',
      password: '',
      passwordConfirmation: '',
    },
  })
  useEffect(() => {
    if (open) form.reset({ ...form.getValues(), tenantId: tenantId ?? '' })
  }, [form, open, tenantId])

  const mutation = useMutation({
    mutationFn: (values: Values) =>
      createSystemUser({
        ...values,
        email: values.email || undefined,
        phone: values.phone || undefined,
        isActive: true,
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['system-users'] }),
        queryClient.invalidateQueries({ queryKey: ['tenants'] }),
      ])
      toast.success('Đã tạo tài khoản')
      onOpenChange(false)
    },
    onError: () => toast.error('Không thể tạo tài khoản'),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-xl'>
        <DialogHeader className='text-start'>
          <DialogTitle>Tạo tài khoản cho phòng khám</DialogTitle>
          <DialogDescription>
            Chọn phòng khám và vai trò của tài khoản mới.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id='system-user-form'
            onSubmit={form.handleSubmit((value) => mutation.mutate(value))}
            className='grid gap-4 sm:grid-cols-2'
          >
            <FormField
              control={form.control}
              name='tenantId'
              render={({ field }) => (
                <FormItem className='sm:col-span-2'>
                  <FormLabel>Phòng khám</FormLabel>
                  <SelectDropdown
                    defaultValue={field.value}
                    isControlled
                    onValueChange={field.onChange}
                    items={tenants.map((tenant) => ({
                      label: `${tenant.code} - ${tenant.name}`,
                      value: tenant.id,
                    }))}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            {(
              [
                ['userName', 'Tên đăng nhập'],
                ['fullName', 'Họ tên'],
                ['email', 'Email'],
                ['phone', 'Số điện thoại'],
              ] as const
            ).map(([name, label]) => (
              <FormField
                key={name}
                control={form.control}
                name={name}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                      <Input
                        type={name === 'email' ? 'email' : 'text'}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <FormField
              control={form.control}
              name='role'
              render={({ field }) => (
                <FormItem className='sm:col-span-2'>
                  <FormLabel>Vai trò</FormLabel>
                  <SelectDropdown
                    defaultValue={field.value}
                    isControlled
                    onValueChange={field.onChange}
                    items={[
                      { label: 'Quản trị phòng khám', value: 'TENANT_ADMIN' },
                      { label: 'Bác sĩ', value: 'DOCTOR' },
                      { label: 'Trợ lý', value: 'ASSISTANT' },
                    ]}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            {(['password', 'passwordConfirmation'] as const).map((name) => (
              <FormField
                key={name}
                control={form.control}
                name={name}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {name === 'password' ? 'Mật khẩu' : 'Nhập lại mật khẩu'}
                    </FormLabel>
                    <FormControl>
                      <PasswordInput {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </form>
        </Form>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            type='submit'
            form='system-user-form'
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Đang tạo...' : 'Tạo tài khoản'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
