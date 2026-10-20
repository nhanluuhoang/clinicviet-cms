import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
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
import { PasswordInput } from '@/components/password-input'
import { updateSystemUserPassword, type SystemUser } from '../api'

const schema = z
  .object({
    password: z
      .string()
      .min(8, 'Mật khẩu tối thiểu 8 ký tự.')
      .max(20, 'Mật khẩu tối đa 20 ký tự.'),
    passwordConfirmation: z.string(),
  })
  .refine((value) => value.password === value.passwordConfirmation, {
    path: ['passwordConfirmation'],
    message: 'Mật khẩu nhập lại không khớp.',
  })

type Values = z.infer<typeof schema>
const emptyValues: Values = { password: '', passwordConfirmation: '' }

export function UpdateSystemUserPasswordDialog({
  user,
  open,
  onOpenChange,
}: {
  user: SystemUser
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: emptyValues,
  })
  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) form.reset(emptyValues)
    onOpenChange(nextOpen)
  }
  const save = useMutation({
    mutationFn: (values: Values) => updateSystemUserPassword(user.id, values),
    onSuccess: () => {
      toast.success('Đã cập nhật mật khẩu và đăng xuất các phiên hiện tại')
      handleOpenChange(false)
    },
    onError: (error) => showRequestError(error, 'Không thể cập nhật mật khẩu'),
  })

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogFormContent className='sm:max-w-md'>
        <DialogBody>
          <DialogHeader>
            <DialogTitle>Đặt lại mật khẩu</DialogTitle>
            <DialogDescription>
              {user.userName} · {user.tenant.code} - {user.tenant.name}. Các
              phiên đăng nhập hiện tại sẽ bị đăng xuất.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              id={`system-user-password-${user.id}`}
              onSubmit={form.handleSubmit((values) => save.mutate(values))}
              className='space-y-4'
            >
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Mật khẩu mới</FormLabel>
                    <FormControl>
                      <PasswordInput autoComplete='new-password' {...field} />
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
                    <FormLabel required>Nhập lại mật khẩu</FormLabel>
                    <FormControl>
                      <PasswordInput autoComplete='new-password' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </DialogBody>
        <DialogFooter>
          <Button variant='outline' onClick={() => handleOpenChange(false)}>
            Hủy
          </Button>
          <Button
            type='submit'
            form={`system-user-password-${user.id}`}
            disabled={save.isPending}
          >
            {save.isPending ? 'Đang lưu...' : 'Cập nhật mật khẩu'}
          </Button>
        </DialogFooter>
      </DialogFormContent>
    </Dialog>
  )
}
