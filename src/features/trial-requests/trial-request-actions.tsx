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
import {
  approveTrialRequest,
  rejectTrialRequest,
  type ApproveTrialInput,
  type TrialRequest,
} from './api'

export function TrialRequestActions({ request }: { request: TrialRequest }) {
  const [mode, setMode] = useState<'approve' | 'reject' | null>(null)
  const [reason, setReason] = useState('')
  const [form, setForm] = useState<ApproveTrialInput>({ code: '' })
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duyệt yêu cầu {request.phone}</DialogTitle>
          </DialogHeader>
          <div className='space-y-2'>
            <Label htmlFor='trial-clinic-code'>Mã phòng khám</Label>
            <Input
              id='trial-clinic-code'
              inputMode='numeric'
              maxLength={9}
              value={form.code}
              onChange={(event) => setForm({ code: event.target.value })}
              placeholder='Nhập mã gồm 9 chữ số'
            />
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setMode(null)}>
              Hủy
            </Button>
            <Button
              disabled={!/^[1-9]\d{8}$/.test(form.code) || approve.isPending}
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
