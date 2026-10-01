import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { PasswordInput } from '@/components/password-input'
import { ChangePassword } from '@/features/auth/api'

const schema = z
  .object({
    currentPassword: z
      .string()
      .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
      .max(20, 'Mật khẩu không được quá 20 ký tự'),
    password: z
      .string()
      .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
      .max(20, 'Mật khẩu không được quá 20 ký tự'),
    passwordConfirmation: z.string(),
  })
  .refine((values) => values.password === values.passwordConfirmation, {
    path: ['passwordConfirmation'],
    message: 'Mật khẩu xác nhận không khớp',
  })

type FormValues = z.infer<typeof schema>

export function ChangePasswordForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      currentPassword: '',
      password: '',
      passwordConfirmation: '',
    },
  })
  const mutation = useMutation({
    mutationFn: ChangePassword,
    onSuccess: () => {
      form.reset()
      toast.success('Đã đổi mật khẩu')
    },
    onError: () => toast.error('Không thể đổi mật khẩu'),
  })

  return (
    <Form {...form}>
      <form
        className='space-y-6'
        onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      >
        <FormField
          control={form.control}
          name='currentPassword'
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Mật khẩu hiện tại</FormLabel>
              <FormControl>
                <PasswordInput
                  {...field}
                  autoComplete='current-password'
                  placeholder='Nhập mật khẩu hiện tại'
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Mật khẩu mới</FormLabel>
              <FormControl>
                <PasswordInput
                  {...field}
                  autoComplete='new-password'
                  placeholder='Từ 6 đến 20 ký tự'
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='passwordConfirmation'
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Xác nhận mật khẩu mới</FormLabel>
              <FormControl>
                <PasswordInput
                  {...field}
                  autoComplete='new-password'
                  placeholder='Nhập lại mật khẩu mới'
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type='submit' disabled={mutation.isPending}>
          {mutation.isPending ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
        </Button>
      </form>
    </Form>
  )
}
