import { useState } from 'react'
import { z } from 'zod'
import { isAxiosError } from 'axios'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { canAccessPath, getHomePath } from '@/config/access-control'
import { Loader2, LogIn } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
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
import { Login, Profile } from '@/features/auth/api'

const formSchema = z.object({
  userName: z.string({
    error: (iss) =>
      iss.input === '' ? 'Vui lòng nhập tên đăng nhập' : undefined,
  }),
  password: z
    .string()
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    .max(255, 'Mật khẩu không được vượt quá 255 ký tự'),
})

interface UserAuthFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string
}

type ApiError = { error?: { title?: string } }

export function UserAuthForm({
  className,
  redirectTo,
  ...props
}: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { auth } = useAuthStore()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userName: '',
      password: '',
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setSubmitError('')
    try {
      await Login(data)
      const profile = await Profile()
      if (
        !canAccessPath(
          profile.data.role,
          getHomePath(),
          profile.data.tenant?.servicePlan
        )
      ) {
        auth.reset()
        setSubmitError(
          'Tài khoản này không có quyền truy cập CMS. Vui lòng đăng nhập bằng tài khoản nhân viên.'
        )
        return
      }
      await queryClient.cancelQueries()
      queryClient.clear()
      auth.setUser(profile.data)

      const targetPath =
        redirectTo &&
        canAccessPath(
          profile.data.role,
          redirectTo,
          profile.data.tenant?.servicePlan
        )
          ? redirectTo
          : getHomePath()
      navigate({ to: targetPath, replace: true })
      toast.success(`Chào mừng trở lại, ${profile.data.fullName}!`)
    } catch (error) {
      const message =
        (isAxiosError<ApiError>(error)
          ? error.response?.data?.error?.title
          : undefined) ?? 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-3', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='userName'
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Tên đăng nhập</FormLabel>
              <FormControl>
                <Input placeholder='name@example.com' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem className='relative'>
              <FormLabel required>Mật khẩu</FormLabel>
              <FormControl>
                <PasswordInput placeholder='********' {...field} />
              </FormControl>
              <FormMessage />
              <Link
                to='/forgot-password'
                className='absolute end-0 -top-0.5 text-sm font-medium text-muted-foreground hover:opacity-75'
              >
                Quên mật khẩu?
              </Link>
            </FormItem>
          )}
        />
        <Button className='mt-2' disabled={isLoading}>
          {isLoading ? <Loader2 className='animate-spin' /> : <LogIn />}
          Đăng nhập
        </Button>
        {submitError && (
          <p role='alert' className='text-sm text-destructive'>
            {submitError}
          </p>
        )}
      </form>
    </Form>
  )
}
