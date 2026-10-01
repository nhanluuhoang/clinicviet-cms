import { useEffect, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { SelectDropdown } from '@/components/select-dropdown'
import { updateSystemUser, type ManagedRole, type SystemUser } from '../api'

const schema = z.object({
  fullName: z.string().trim().min(1, 'Vui lòng nhập họ tên.'),
  email: z.union([z.literal(''), z.email('Email không hợp lệ.')]),
  phone: z.string().trim().max(20, 'Tối đa 20 ký tự.'),
  role: z.enum(['TENANT_ADMIN', 'DOCTOR', 'ASSISTANT', 'PATIENT', 'USER']),
  isActive: z.boolean(),
})

type Values = z.infer<typeof schema>

const roleLabels = {
  PATIENT: 'Bệnh nhân',
  USER: 'Người dùng',
}

export function UpdateSystemUserDialog({ user }: { user: SystemUser }) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: user.fullName,
      email: user.email ?? '',
      phone: user.phone ?? '',
      role: user.role,
      isActive: user.isActive,
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        fullName: user.fullName,
        email: user.email ?? '',
        phone: user.phone ?? '',
        role: user.role,
        isActive: user.isActive,
      })
    }
  }, [
    form,
    open,
    user.fullName,
    user.email,
    user.phone,
    user.role,
    user.isActive,
  ])

  const save = useMutation({
    mutationFn: (values: Values) =>
      updateSystemUser(user.id, {
        fullName: values.fullName,
        email: values.email || null,
        phone: values.phone || null,
        isActive: values.isActive,
        ...(user.role !== 'PATIENT' &&
          user.role !== 'USER' && { role: values.role as ManagedRole }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['system-users'] })
      toast.success('Đã cập nhật người dùng')
      setOpen(false)
    },
    onError: () => toast.error('Không thể cập nhật người dùng'),
  })

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='flex h-8 w-8 p-0'>
            <DotsHorizontalIcon className='h-4 w-4' />
            <span className='sr-only'>Mở menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-[160px]'>
          <DropdownMenuItem onClick={() => setOpen(true)}>
            Cập nhật
            <DropdownMenuShortcut>
              <Pencil size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle>Cập nhật người dùng</DialogTitle>
            <DialogDescription>
              {user.userName} · {user.tenant.code} - {user.tenant.name}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              id={`system-user-update-${user.id}`}
              onSubmit={form.handleSubmit((values) => save.mutate(values))}
              className='space-y-4'
            >
              <FormField
                control={form.control}
                name='fullName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Họ tên</FormLabel>
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
                    <FormLabel>Số điện thoại</FormLabel>
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
                    <FormLabel>Vai trò</FormLabel>
                    {user.role === 'PATIENT' || user.role === 'USER' ? (
                      <Input value={roleLabels[user.role]} readOnly />
                    ) : (
                      <SelectDropdown
                        defaultValue={field.value}
                        isControlled
                        onValueChange={field.onChange}
                        items={[
                          {
                            label: 'Quản trị phòng khám',
                            value: 'TENANT_ADMIN',
                          },
                          { label: 'Bác sĩ', value: 'DOCTOR' },
                          { label: 'Trợ lý', value: 'ASSISTANT' },
                        ]}
                      />
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='isActive'
                render={({ field }) => (
                  <FormItem className='flex items-center justify-between rounded-md border p-3'>
                    <FormLabel>Kích hoạt tài khoản</FormLabel>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) =>
                          field.onChange(checked === true)
                        }
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </form>
          </Form>
          <DialogFooter>
            <Button variant='outline' onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button
              type='submit'
              form={`system-user-update-${user.id}`}
              disabled={save.isPending}
            >
              {save.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
