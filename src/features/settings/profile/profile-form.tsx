import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import i18n from '@/i18n'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
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
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { DatePickerInput } from '@/components/date-picker-input'
import { UpdateProfile } from '@/features/auth/api'

const profileFormSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(1, { error: () => i18n.t('messages.pleaseEnterAFullNameAlt2') })
      .max(255),
    email: z.string().trim().max(255),
    phone: z.string().trim().max(20),
    gender: z.enum(['0', '1', '2']),
    dateOfBirth: z.string(),
    address: z.string().trim().max(255),
    note: z.string().trim().max(255),
  })
  .superRefine((values, context) => {
    if (values.email && !z.email().safeParse(values.email).success) {
      context.addIssue({
        code: 'custom',
        path: ['email'],
        message: i18n.t('messages.invalidEmailAddressAlt2'),
      })
    }
    if (
      values.dateOfBirth &&
      values.dateOfBirth > new Date().toISOString().slice(0, 10)
    ) {
      context.addIssue({
        code: 'custom',
        path: ['dateOfBirth'],
        message: i18n.t('messages.dateOfBirthCannotBeInTheFuture'),
      })
    }
  })

type ProfileFormValues = z.infer<typeof profileFormSchema>

const emptyValues: ProfileFormValues = {
  fullName: '',
  email: '',
  phone: '',
  gender: '0',
  dateOfBirth: '',
  address: '',
  note: '',
}

export function ProfileForm() {
  const { t } = useTranslation()

  const user = useAuthStore((state) => state.auth.user)
  const setUser = useAuthStore((state) => state.auth.setUser)
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: emptyValues,
  })

  useEffect(() => {
    if (!user) return
    form.reset({
      fullName: user.fullName ?? '',
      email: user.email ?? '',
      phone: user.phone ?? '',
      gender: user.gender === '1' || user.gender === '2' ? user.gender : '0',
      dateOfBirth: user.dateOfBirth?.slice(0, 10) ?? '',
      address: user.address ?? '',
      note: user.note ?? '',
    })
  }, [form, user])

  const updateProfile = useMutation({
    mutationFn: (values: ProfileFormValues) =>
      UpdateProfile({
        fullName: values.fullName.trim(),
        email: values.email.trim() || null,
        phone: values.phone.trim() || null,
        gender: values.gender === '0' ? null : values.gender,
        dateOfBirth: values.dateOfBirth || null,
        address: values.address.trim() || null,
        note: values.note.trim() || null,
      }),
    onSuccess: ({ data }) => {
      setUser(data)
      toast.success(t('messages.profileUpdated'))
    },
    onError: (error) =>
      showRequestError(error, t('messages.couldNotUpdateProfile')),
  })

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => updateProfile.mutate(values))}
        className='space-y-6'
      >
        <FormItem>
          <FormLabel>{t('messages.username')}</FormLabel>
          <FormControl>
            <Input value={user?.userName ?? ''} disabled />
          </FormControl>
        </FormItem>

        <FormField
          control={form.control}
          name='fullName'
          render={({ field }) => (
            <FormItem>
              <FormLabel required>{t('messages.fullName')}</FormLabel>
              <FormControl>
                <Input {...field} placeholder={t('messages.nguyenVanA')} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='grid gap-4 sm:grid-cols-2'>
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} type='email' placeholder='a@example.com' />
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
                  <Input {...field} placeholder='0901234567' />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='grid gap-4 sm:grid-cols-2'>
          <FormField
            control={form.control}
            name='gender'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('messages.gender')}</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('messages.selectGender')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='0'>
                      {t('messages.unknownAlt2')}
                    </SelectItem>
                    <SelectItem value='1'>{i18n.t('messages.male')}</SelectItem>
                    <SelectItem value='2'>{t('messages.female')}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='dateOfBirth'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('messages.dateOfBirth')}</FormLabel>
                <DatePickerInput
                  value={field.value}
                  onChange={field.onChange}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name='address'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('messages.address')}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t('messages.streetWardProvinceCity')}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='note'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('messages.notes')}</FormLabel>
              <FormControl>
                <Textarea {...field} className='resize-none' maxLength={255} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type='submit' disabled={updateProfile.isPending}>
          {updateProfile.isPending
            ? t('messages.saving')
            : t('messages.saveChanges')}
        </Button>
      </form>
    </Form>
  )
}
