import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { MANAGED_USER_ROLE_OPTIONS } from '@/config/user-role-labels'
import i18n from '@/i18n'
import { Check, ChevronsUpDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { showRequestError } from '@/lib/handle-server-error'
import { cn } from '@/lib/utils'
import { useDebounce } from '@/hooks/use-debounce'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { PasswordInput } from '@/components/password-input'
import { SelectDropdown } from '@/components/select-dropdown'
import { searchTenants, type Tenant } from '@/features/tenants/api'
import { createSystemUser } from '../api'

const schema = z
  .object({
    tenantId: z
      .string()
      .min(1, { error: () => i18n.t('messages.pleaseSelectAClinic') }),
    userName: z
      .string()
      .trim()
      .min(3)
      .max(50)
      .regex(/^[a-zA-Z0-9._-]+$/),
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
    role: z.enum(['TENANT_ADMIN', 'DOCTOR', 'ASSISTANT']),
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

const defaultValues: Values = {
  tenantId: '',
  userName: '',
  fullName: '',
  email: '',
  phone: '',
  role: 'TENANT_ADMIN',
  password: '',
  passwordConfirmation: '',
}

export function CreateSystemUserDialog({
  open,
  onOpenChange,
  tenants,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  tenants: Tenant[]
}) {
  const { t } = useTranslation()

  const [clinicSearch, setClinicSearch] = useState('')
  const [clinicOpen, setClinicOpen] = useState(false)
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null)
  const debouncedSearch = useDebounce(clinicSearch, 300)
  const clinicResults = useQuery({
    queryKey: ['tenants', 'create-user-search', debouncedSearch],
    queryFn: () => searchTenants(debouncedSearch.trim()),
    enabled: open && !!debouncedSearch.trim(),
  })
  const isSearching = !!clinicSearch.trim()
  const availableTenants = isSearching
    ? clinicSearch.trim() === debouncedSearch.trim()
      ? (clinicResults.data?.data ?? [])
      : []
    : tenants
  const queryClient = useQueryClient()
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues,
  })
  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      form.reset(defaultValues)
      setSelectedTenant(null)
      setClinicSearch('')
      setClinicOpen(false)
    }
    onOpenChange(nextOpen)
  }

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
      toast.success(t('messages.accountCreated'))
      handleOpenChange(false)
    },
    onError: (error) =>
      showRequestError(error, t('messages.couldNotCreateAccount')),
  })

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogFormContent className='sm:max-w-xl'>
        <DialogBody>
          <DialogHeader className='text-start'>
            <DialogTitle>{t('messages.createClinicAccount')}</DialogTitle>
            <DialogDescription>
              {t('messages.chooseAClinicAndRoleForTheNewAccount')}
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
                    <FormLabel required>{t('messages.clinics')}</FormLabel>
                    <Popover open={clinicOpen} onOpenChange={setClinicOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          type='button'
                          variant='outline'
                          role='combobox'
                          aria-expanded={clinicOpen}
                          className='w-full justify-between font-normal'
                        >
                          <span className='truncate'>
                            {selectedTenant
                              ? `${selectedTenant.code} - ${selectedTenant.name}`
                              : t('messages.searchClinicCodeOrName')}
                          </span>
                          <ChevronsUpDown className='ms-2 size-4 shrink-0 opacity-50' />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className='w-(--radix-popover-trigger-width) p-0'
                        align='start'
                      >
                        <Command shouldFilter={false}>
                          <CommandInput
                            value={clinicSearch}
                            onValueChange={setClinicSearch}
                            placeholder={t('messages.searchByCodeOrName')}
                          />
                          <CommandList>
                            <CommandEmpty>
                              {(isSearching &&
                                clinicSearch.trim() !==
                                  debouncedSearch.trim()) ||
                              clinicResults.isFetching
                                ? t('messages.searching')
                                : t('messages.noClinicsFound')}
                            </CommandEmpty>
                            <CommandGroup>
                              {availableTenants.map((tenant) => (
                                <CommandItem
                                  key={tenant.id}
                                  value={tenant.id}
                                  onSelect={() => {
                                    field.onChange(tenant.id)
                                    setSelectedTenant(tenant)
                                    setClinicOpen(false)
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      'me-2 size-4',
                                      field.value === tenant.id
                                        ? 'opacity-100'
                                        : 'opacity-0'
                                    )}
                                  />
                                  {tenant.code} - {tenant.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {(
                [
                  ['userName', t('messages.username')],
                  ['fullName', t('messages.fullName')],
                  ['email', 'Email'],
                  ['phone', t('messages.phoneNumber')],
                ] as const
              ).map(([name, label]) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel
                        required={name === 'userName' || name === 'fullName'}
                      >
                        {label}
                      </FormLabel>
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
                    <FormLabel required>{t('messages.role')}</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      isControlled
                      onValueChange={field.onChange}
                      items={MANAGED_USER_ROLE_OPTIONS}
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
                      <FormLabel required>
                        {name === 'password'
                          ? t('messages.password')
                          : t('messages.confirmPassword')}
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
        </DialogBody>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            {t('messages.cancel')}
          </Button>
          <Button
            type='submit'
            form='system-user-form'
            disabled={mutation.isPending}
          >
            {mutation.isPending
              ? t('messages.creating')
              : t('messages.createAccount')}
          </Button>
        </DialogFooter>
      </DialogFormContent>
    </Dialog>
  )
}
