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
      .min(8, {
        error: () =>
          i18n.t('messages.passwordMustContainAtLeast8CharactersAlt4'),
      })
      .max(20, {
        error: () => i18n.t('messages.passwordMustNotExceed20Characters'),
      }),
    passwordConfirmation: z.string(),
  })
  .refine((value) => value.password === value.passwordConfirmation, {
    path: ['passwordConfirmation'],
    error: () => i18n.t('messages.passwordsDoNotMatch'),
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
  const { t } = useTranslation()

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
      toast.success(t('messages.passwordUpdatedAndExistingSessionsSignedOut'))
      handleOpenChange(false)
    },
    onError: (error) =>
      showRequestError(error, t('messages.couldNotUpdatePassword')),
  })

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogFormContent className='sm:max-w-md'>
        <DialogBody>
          <DialogHeader>
            <DialogTitle>{t('messages.resetPassword')}</DialogTitle>
            <DialogDescription>
              {user.userName} · {user.tenant.code} - {user.tenant.name}
              {t('messages.existingSessionsWillBeSignedOut')}
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
                    <FormLabel required>{t('messages.newPassword')}</FormLabel>
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
                    <FormLabel required>
                      {t('messages.confirmPassword')}
                    </FormLabel>
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
            {t('messages.cancel')}
          </Button>
          <Button
            type='submit'
            form={`system-user-password-${user.id}`}
            disabled={save.isPending}
          >
            {save.isPending
              ? t('messages.saving')
              : t('messages.updatePassword')}
          </Button>
        </DialogFooter>
      </DialogFormContent>
    </Dialog>
  )
}
