import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { canAccessPath, getHomePath } from '@/config/access-control'
import i18n from '@/i18n'
import { Loader2, LogIn } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { showRequestError } from '@/lib/handle-server-error'
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
      iss.input === ''
        ? i18n.t('messages.pleaseEnterYourUsernameOrEmail')
        : undefined,
  }),
  password: z
    .string()
    .min(6, {
      error: () => i18n.t('messages.passwordMustContainAtLeast6Characters'),
    })
    .max(255, {
      error: () => i18n.t('messages.passwordMustNotExceed255Characters'),
    }),
})

interface UserAuthFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string
}

export function UserAuthForm({
  className,
  redirectTo,
  ...props
}: UserAuthFormProps) {
  const { t } = useTranslation()

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
          t('messages.thisAccountCannotAccessTheCmsPleaseSignInWith')
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
      toast.success(
        t('messages.welcomeBack', { value0: profile.data.fullName })
      )
    } catch (error) {
      showRequestError(
        error,
        t('messages.signInFailedPleaseCheckYourCredentials')
      )
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
              <FormLabel required>{t('messages.usernameOrEmail')}</FormLabel>
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
              <FormLabel required>{t('messages.password')}</FormLabel>
              <FormControl>
                <PasswordInput placeholder='********' {...field} />
              </FormControl>
              <FormMessage />
              <Link
                to='/forgot-password'
                className='absolute end-0 -top-0.5 text-sm font-medium text-muted-foreground hover:opacity-75'
              >
                {t('messages.forgotPasswordAlt2')}
              </Link>
            </FormItem>
          )}
        />
        <Button className='mt-2' disabled={isLoading}>
          {isLoading ? <Loader2 className='animate-spin' /> : <LogIn />}
          {t('messages.signIn')}
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
