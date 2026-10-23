import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import i18n from '@/i18n'
import { Loader2, Save } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
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
import { PasswordInput } from '@/components/password-input'
import { ResetPassword } from '@/features/auth/api'

const formSchema = z.object({
  password: z
    .string()
    .min(8, {
      error: () => i18n.t('messages.passwordMustContainAtLeast8CharactersAlt2'),
    })
    .max(20, {
      error: () => i18n.t('messages.passwordMustNotExceed20CharactersAlt2'),
    }),
  passwordConfirmation: z
    .string()
    .min(1, { error: () => i18n.t('messages.pleaseConfirmYourPassword') }),
})

interface ResetPasswordFormProps extends React.HTMLAttributes<HTMLFormElement> {
  token: string
}

export function ResetPasswordForm({
  token,
  className,
  ...props
}: ResetPasswordFormProps) {
  const { t } = useTranslation()

  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      passwordConfirmation: '',
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      await ResetPassword({ ...data, token })
      navigate({ to: '/sign-in' })
      toast.success(t('messages.passwordResetSuccessfully'))
    } catch (error) {
      showRequestError(
        error,
        t('messages.couldNotResetYourPasswordCheckTheLinkAndTryAg')
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
          name='password'
          render={({ field }) => (
            <FormItem className='relative'>
              <FormLabel required>{t('messages.password')}</FormLabel>
              <FormControl>
                <PasswordInput placeholder='********' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='passwordConfirmation'
          render={({ field }) => (
            <FormItem className='relative'>
              <FormLabel required>{t('messages.confirmPassword')}</FormLabel>
              <FormControl>
                <PasswordInput placeholder='********' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className='mt-2' disabled={isLoading}>
          {isLoading ? <Loader2 className='animate-spin' /> : <Save />}
          {t('messages.resetPassword')}
        </Button>
      </form>
    </Form>
  )
}
