import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import i18n from '@/i18n'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { showRequestError } from '@/lib/handle-server-error'
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
      .min(6, {
        error: () => i18n.t('messages.passwordMustContainAtLeast6Characters'),
      })
      .max(20, {
        error: () => i18n.t('messages.passwordMustNotExceed20CharactersAlt3'),
      }),
    password: z
      .string()
      .min(8, {
        error: () =>
          i18n.t('messages.passwordMustContainAtLeast8CharactersAlt2'),
      })
      .max(20, {
        error: () => i18n.t('messages.passwordMustNotExceed20CharactersAlt3'),
      }),
    passwordConfirmation: z.string(),
  })
  .refine((values) => values.password === values.passwordConfirmation, {
    path: ['passwordConfirmation'],
    error: () => i18n.t('messages.passwordConfirmationDoesNotMatch'),
  })

type FormValues = z.infer<typeof schema>

export function ChangePasswordForm() {
  const { t } = useTranslation()

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
      toast.success(t('messages.passwordChanged'))
    },
    onError: (error) =>
      showRequestError(error, t('messages.couldNotChangePassword')),
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
              <FormLabel required>{t('messages.currentPassword')}</FormLabel>
              <FormControl>
                <PasswordInput
                  {...field}
                  autoComplete='current-password'
                  placeholder={t('messages.enterCurrentPassword')}
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
              <FormLabel required>{t('messages.newPassword')}</FormLabel>
              <FormControl>
                <PasswordInput
                  {...field}
                  autoComplete='new-password'
                  placeholder={t('messages.8To20Characters')}
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
              <FormLabel required>{t('messages.confirmNewPassword')}</FormLabel>
              <FormControl>
                <PasswordInput
                  {...field}
                  autoComplete='new-password'
                  placeholder={t('messages.reEnterNewPassword')}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type='submit' disabled={mutation.isPending}>
          {mutation.isPending
            ? t('messages.updating')
            : t('messages.changePassword')}
        </Button>
      </form>
    </Form>
  )
}
