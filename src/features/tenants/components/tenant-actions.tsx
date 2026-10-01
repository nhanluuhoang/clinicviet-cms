import { useState } from 'react'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SelectDropdown } from '@/components/select-dropdown'
import { deleteTenant, updateTenant, type Tenant } from '../api'

export function TenantActions({ tenant }: { tenant: Tenant }) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const queryClient = useQueryClient()
  const [values, setValues] = useState({
    code: tenant.code,
    name: tenant.name,
    subdomain: tenant.subdomain ?? '',
    address: tenant.address,
    servicePlan: tenant.servicePlan,
    isActive: tenant.isActive,
  })
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['tenants'] })
  const update = useMutation({
    mutationFn: () =>
      updateTenant(tenant.id, {
        ...values,
        subdomain: values.subdomain || undefined,
      }),
    onSuccess: async () => {
      await refresh()
      toast.success('Đã cập nhật phòng khám')
      setEditOpen(false)
    },
    onError: () => toast.error('Không thể cập nhật phòng khám'),
  })
  const remove = useMutation({
    mutationFn: () => deleteTenant(tenant.id),
    onSuccess: async () => {
      await refresh()
      toast.success('Đã xóa phòng khám')
    },
    onError: () =>
      toast.error('Không thể xóa phòng khám đang có dữ liệu nghiệp vụ'),
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
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            Cập nhật
            <DropdownMenuShortcut>
              <Pencil size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setDeleteOpen(true)}
            className='text-red-500!'
          >
            Xóa
            <DropdownMenuShortcut>
              <Trash2 size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className='sm:max-w-xl'>
          <DialogHeader>
            <DialogTitle>Cập nhật phòng khám</DialogTitle>
          </DialogHeader>
          <div className='grid gap-4 sm:grid-cols-2'>
            {(
              [
                ['code', 'Mã phòng khám'],
                ['name', 'Tên phòng khám'],
                ['subdomain', 'Subdomain'],
                ['address', 'Địa chỉ'],
              ] as const
            ).map(([key, label]) => (
              <div className='space-y-2' key={key}>
                <Label
                  required={
                    key !== 'subdomain' || values.servicePlan !== 'BASIC'
                  }
                >
                  {label}
                </Label>
                <Input
                  value={values[key]}
                  onChange={(event) =>
                    setValues({ ...values, [key]: event.target.value })
                  }
                />
              </div>
            ))}
            <div className='space-y-2 sm:col-span-2'>
              <Label required>Gói dịch vụ</Label>
              <SelectDropdown
                standalone
                defaultValue={values.servicePlan}
                isControlled
                onValueChange={(servicePlan) =>
                  setValues({
                    ...values,
                    servicePlan: servicePlan as Tenant['servicePlan'],
                  })
                }
                items={[
                  { label: 'Cơ bản', value: 'BASIC' },
                  { label: 'Nâng cao', value: 'PLUS' },
                  { label: 'Chuyên nghiệp', value: 'PRO' },
                ]}
              />
            </div>
            <label className='flex items-center gap-2 sm:col-span-2'>
              <Checkbox
                checked={values.isActive}
                onCheckedChange={(checked) =>
                  setValues({ ...values, isActive: checked === true })
                }
              />
              Đang hoạt động
            </label>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setEditOpen(false)}>
              Hủy
            </Button>
            <Button onClick={() => update.mutate()} disabled={update.isPending}>
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa phòng khám?</AlertDialogTitle>
            <AlertDialogDescription>
              Tài khoản thuộc tenant sẽ bị xóa cùng phòng khám. Tenant đã có dữ
              liệu nghiệp vụ cần được khóa thay vì xóa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={() => remove.mutate()}>
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
