import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, ChevronsUpDown } from 'lucide-react'
import { toast } from 'sonner'
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
  DialogContent,
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
    tenantId: z.string().min(1, 'Vui lòng chọn phòng khám.'),
    userName: z
      .string()
      .trim()
      .min(3)
      .max(50)
      .regex(/^[a-zA-Z0-9._-]+$/),
    fullName: z.string().trim().min(1, 'Vui lòng nhập họ tên.'),
    email: z.union([z.literal(''), z.email('Email không hợp lệ.')]),
    phone: z.string().trim().max(20),
    role: z.enum(['TENANT_ADMIN', 'DOCTOR', 'ASSISTANT']),
    password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự.').max(20),
    passwordConfirmation: z.string(),
  })
  .refine((value) => value.password === value.passwordConfirmation, {
    path: ['passwordConfirmation'],
    message: 'Mật khẩu nhập lại không khớp.',
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
      toast.success('Đã tạo tài khoản')
      handleOpenChange(false)
    },
    onError: () => toast.error('Không thể tạo tài khoản'),
  })

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-xl'>
        <DialogHeader className='text-start'>
          <DialogTitle>Tạo tài khoản cho phòng khám</DialogTitle>
          <DialogDescription>
            Chọn phòng khám và vai trò của tài khoản mới.
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
                  <FormLabel required>Phòng khám</FormLabel>
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
                            : 'Tìm mã hoặc tên phòng khám...'}
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
                          placeholder='Tìm theo mã hoặc tên...'
                        />
                        <CommandList>
                          <CommandEmpty>
                            {(isSearching &&
                              clinicSearch.trim() !== debouncedSearch.trim()) ||
                            clinicResults.isFetching
                              ? 'Đang tìm...'
                              : 'Không tìm thấy phòng khám.'}
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
                ['userName', 'Tên đăng nhập'],
                ['fullName', 'Họ tên'],
                ['email', 'Email'],
                ['phone', 'Số điện thoại'],
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
                  <FormLabel required>Vai trò</FormLabel>
                  <SelectDropdown
                    defaultValue={field.value}
                    isControlled
                    onValueChange={field.onChange}
                    items={[
                      { label: 'Quản trị phòng khám', value: 'TENANT_ADMIN' },
                      { label: 'Bác sĩ', value: 'DOCTOR' },
                      { label: 'Trợ lý', value: 'ASSISTANT' },
                    ]}
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
                      {name === 'password' ? 'Mật khẩu' : 'Nhập lại mật khẩu'}
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
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            type='submit'
            form='system-user-form'
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Đang tạo...' : 'Tạo tài khoản'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
