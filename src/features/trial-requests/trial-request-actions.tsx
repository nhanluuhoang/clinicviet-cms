import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { PasswordInput } from '@/components/password-input'
import { SelectDropdown } from '@/components/select-dropdown'
import {
  approveTrialRequest,
  rejectTrialRequest,
  type ApproveTrialInput,
  type TrialRequest,
} from './api'

export function TrialRequestActions({ request }: { request: TrialRequest }) {
  const [mode, setMode] = useState<'approve' | 'reject' | null>(null)
  const [reason, setReason] = useState('')
  const [form, setForm] = useState<ApproveTrialInput>({
    code: '',
    clinicName: '',
    subdomain: '',
    address: '',
    adminEmail: '',
    adminFullName: '',
    password: '',
    servicePlan: 'PLUS',
  })
  const queryClient = useQueryClient()
  const done = async (message: string) => {
    await queryClient.invalidateQueries({ queryKey: ['trial-requests'] })
    toast.success(message)
    setMode(null)
  }
  const approve = useMutation({
    mutationFn: () => approveTrialRequest(request.id, form),
    onSuccess: () => done('Đã duyệt yêu cầu dùng thử'),
    onError: () => toast.error('Không thể duyệt yêu cầu'),
  })
  const reject = useMutation({
    mutationFn: () => rejectTrialRequest(request.id, reason),
    onSuccess: () => done('Đã từ chối yêu cầu'),
    onError: () => toast.error('Không thể từ chối yêu cầu'),
  })
  if (request.status !== 'PENDING') return null
  const fields = [
    ['code', 'Mã phòng khám'],
    ['clinicName', 'Tên phòng khám'],
    ['subdomain', 'Subdomain'],
    ['address', 'Địa chỉ'],
    ['adminEmail', 'Email quản trị'],
    ['adminFullName', 'Họ tên quản trị'],
  ] as const
  return (
    <>
      <div className='flex justify-end gap-2'>
        <Button size='sm' onClick={() => setMode('approve')}>
          Duyệt
        </Button>
        <Button size='sm' variant='outline' onClick={() => setMode('reject')}>
          Từ chối
        </Button>
      </div>
      <Dialog
        open={mode === 'approve'}
        onOpenChange={(open) => !open && setMode(null)}
      >
        <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Duyệt yêu cầu {request.phone}</DialogTitle>
          </DialogHeader>
          <div className='grid gap-4 sm:grid-cols-2'>
            {fields.map(([key, label]) => (
              <div className='space-y-2' key={key}>
                <Label>{label}</Label>
                <Input
                  type={key === 'adminEmail' ? 'email' : 'text'}
                  value={form[key]}
                  onChange={(event) =>
                    setForm({ ...form, [key]: event.target.value })
                  }
                />
              </div>
            ))}
            <div className='space-y-2'>
              <Label>Mật khẩu ban đầu</Label>
              <PasswordInput
                value={form.password}
                onChange={(event) =>
                  setForm({ ...form, password: event.target.value })
                }
              />
            </div>
            <div className='space-y-2'>
              <Label>Gói dịch vụ</Label>
              <SelectDropdown
                standalone
                defaultValue={form.servicePlan}
                isControlled
                onValueChange={(servicePlan) =>
                  setForm({
                    ...form,
                    servicePlan:
                      servicePlan as ApproveTrialInput['servicePlan'],
                  })
                }
                items={[
                  { label: 'Cơ bản', value: 'BASIC' },
                  { label: 'Nâng cao', value: 'PLUS' },
                  { label: 'Chuyên nghiệp', value: 'PRO' },
                ]}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setMode(null)}>
              Hủy
            </Button>
            <Button
              disabled={approve.isPending}
              onClick={() => approve.mutate()}
            >
              Xác nhận duyệt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={mode === 'reject'}
        onOpenChange={(open) => !open && setMode(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Từ chối yêu cầu {request.phone}</DialogTitle>
          </DialogHeader>
          <div className='space-y-2'>
            <Label>Lý do</Label>
            <Textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              maxLength={500}
            />
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setMode(null)}>
              Hủy
            </Button>
            <Button
              disabled={!reason.trim() || reject.isPending}
              onClick={() => reject.mutate()}
            >
              Xác nhận từ chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
