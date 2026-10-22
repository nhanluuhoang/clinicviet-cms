import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import i18n from '@/i18n'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { showRequestError } from '@/lib/handle-server-error'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'
import { SelectDropdown } from '@/components/select-dropdown'
import {
  CreateStaff,
  UpdateStaff,
  type Admin,
  type StaffInput,
} from '@/features/admins/api'
import { roles } from '../data/data'

const formSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(1, { error: () => i18n.t('messages.pleaseEnterAFullName') }),
    email: z.union([
      z.literal(''),
      z.email({ error: () => i18n.t('messages.invalidEmailAddress') }),
    ]),
    phone: z
      .string()
      .trim()
      .max(20, { error: () => i18n.t('messages.maximum20Characters') }),
    role: z.enum(['DOCTOR', 'ASSISTANT']),
    isActive: z.boolean(),
    password: z.string(),
    passwordConfirmation: z.string(),
  })
  .superRefine((values, context) => {
    if (values.password && values.password.length < 8) {
      context.addIssue({
        code: 'custom',
        path: ['password'],
        message: i18n.t('messages.passwordMustContainAtLeast8Characters'),
      })
    }
    if (values.password.length > 20) {
      context.addIssue({
        code: 'custom',
        path: ['password'],
        message: i18n.t('messages.passwordMustNotExceed20Characters'),
      })
    }
    if (values.password !== values.passwordConfirmation) {
      context.addIssue({
        code: 'custom',
        path: ['passwordConfirmation'],
        message: i18n.t('messages.passwordsDoNotMatch'),
      })
    }
  })

type StaffForm = z.infer<typeof formSchema>

const emptyValues: StaffForm = {
  fullName: '',
  email: '',
  phone: '',
  role: 'DOCTOR',
  isActive: true,
  password: '',
  passwordConfirmation: '',
}

export function AdminsActionDialog({
  currentRow,
  open,
  onOpenChange,
}: {
  currentRow?: Admin
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useTranslation()

  const isEdit = !!currentRow
  const queryClient = useQueryClient()
  const form = useForm<StaffForm>({
    resolver: zodResolver(formSchema),
    defaultValues: emptyValues,
  })

  useEffect(() => {
    if (!open) return
    form.reset(
      currentRow
        ? {
            fullName: currentRow.fullName,
            email: currentRow.email ?? '',
            phone: currentRow.phone ?? '',
            role: currentRow.role === 'ASSISTANT' ? 'ASSISTANT' : 'DOCTOR',
            isActive: currentRow.isActive,
            password: '',
            passwordConfirmation: '',
          }
        : emptyValues
    )
  }, [currentRow, form, open])

  const save = useMutation({
    mutationFn: (values: StaffForm) => {
      if (!isEdit && !values.password) {
        form.setError('password', {
          message: t('messages.pleaseEnterAPassword'),
        })
        throw new Error('missing-password')
      }
      const payload: StaffInput = {
        fullName: values.fullName.trim(),
        email: values.email.trim() || undefined,
        phone: values.phone.trim() || undefined,
        role: values.role,
        isActive: values.isActive,
        ...(values.password && { password: values.password }),
        ...(!isEdit && {
          passwordConfirmation: values.passwordConfirmation,
        }),
      }
      return currentRow
        ? UpdateStaff(currentRow.id, payload)
        : CreateStaff(payload)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success(
        isEdit
          ? t('messages.staffMemberUpdated')
          : t('messages.staffMemberCreated')
      )
      onOpenChange(false)
    },
    onError: (error) => {
      if (error instanceof Error && error.message === 'missing-password') return
      showRequestError(error, t('messages.couldNotSaveStaffInformation'))
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogFormContent className='sm:max-w-lg'>
        <DialogBody>
          <DialogHeader className='text-start'>
            <DialogTitle>
              {isEdit
                ? t('messages.updateStaffMember')
                : t('messages.addStaffMember')}
            </DialogTitle>
            <DialogDescription>
              {t('messages.staffAccountsBelongOnlyToTheCurrentClinic')}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              id='staff-form'
              onSubmit={form.handleSubmit((values) => save.mutate(values))}
              className='space-y-4'
            >
              <FormField
                control={form.control}
                name='fullName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>{t('messages.fullName')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type='email' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='phone'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('messages.phoneNumber')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='role'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>{t('messages.role')}</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      isControlled
                      onValueChange={field.onChange}
                      items={roles.map(({ label, value }) => ({
                        label,
                        value,
                      }))}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='isActive'
                render={({ field }) => (
                  <FormItem className='flex items-center justify-between rounded-md border p-3'>
                    <div className='space-y-1'>
                      <FormLabel>{t('messages.activateAccount')}</FormLabel>
                      <p className='text-sm text-muted-foreground'>
                        {t('messages.onlyActiveAccountsCanSignIn')}
                      </p>
                    </div>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) =>
                          field.onChange(checked === true)
                        }
                        onBlur={field.onBlur}
                        ref={field.ref}
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
                    <FormLabel required={!isEdit}>
                      {isEdit
                        ? t('messages.newPasswordOptional')
                        : t('messages.password')}
                    </FormLabel>
                    <FormControl>
                      <PasswordInput {...field} />
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
                    <FormLabel
                      required={!isEdit || Boolean(form.watch('password'))}
                    >
                      {t('messages.confirmPassword')}
                    </FormLabel>
                    <FormControl>
                      <PasswordInput {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </DialogBody>
        <DialogFooter>
          <Button type='submit' form='staff-form' disabled={save.isPending}>
            {save.isPending ? t('messages.saving') : t('messages.saveChanges')}
          </Button>
        </DialogFooter>
      </DialogFormContent>
    </Dialog>
  )
}
