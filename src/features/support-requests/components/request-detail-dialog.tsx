import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  getSupportRequest,
  replyToSupportRequest,
  updateSupportStatus,
  type RequestStatus,
} from '../api'
import { statusLabels, typeLabels } from '../data'

export function RequestDetailDialog({
  id,
  system,
  onClose,
}: {
  id: string
  system: boolean
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<RequestStatus | ''>('')
  const [reply, setReply] = useState('')
  const query = useQuery({
    queryKey: ['support-request', id],
    queryFn: () => getSupportRequest(id),
  })
  const mutation = useMutation({
    mutationFn: async ({
      content,
      nextStatus,
    }: {
      content: string
      nextStatus?: RequestStatus
    }) =>
      nextStatus
        ? updateSupportStatus(id, nextStatus, content || undefined)
        : replyToSupportRequest(id, content),
    onSuccess: async () => {
      setReply('')
      setStatus('')
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['support-request', id] }),
        queryClient.invalidateQueries({ queryKey: ['support-requests'] }),
      ])
      toast.success('Đã cập nhật yêu cầu')
    },
  })
  const request = query.data
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const content = reply.trim()
    const nextStatus =
      system && status && status !== request?.status ? status : undefined
    if (!nextStatus && !content)
      return toast.error('Vui lòng nhập nội dung phản hồi')
    if ((nextStatus === 'DECLINED' || nextStatus === 'NEEDS_INFO') && !content)
      return toast.error('Vui lòng nhập lý do hoặc thông tin cần bổ sung')
    mutation.mutate({ content, nextStatus })
  }
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !mutation.isPending) onClose()
      }}
    >
      <DialogContent className='max-h-[90svh] overflow-y-auto sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>{request?.title ?? 'Chi tiết yêu cầu'}</DialogTitle>
          <DialogDescription>
            Theo dõi phản hồi và lịch sử xử lý yêu cầu.
          </DialogDescription>
        </DialogHeader>
        {query.isPending ? (
          <p role='status'>Đang tải…</p>
        ) : query.isError ? (
          <div role='alert'>
            <p>Không thể tải yêu cầu hoặc bạn không có quyền truy cập.</p>
            <Button variant='outline' onClick={() => void query.refetch()}>
              Thử lại
            </Button>
          </div>
        ) : (
          request && (
            <>
              <div className='space-y-3 rounded-md border p-4'>
                <p className='text-sm'>
                  {typeLabels[request.type]} ·{' '}
                  <strong>{statusLabels[request.status]}</strong>
                </p>
                <p className='text-sm text-muted-foreground'>
                  {request.tenant.name} ({request.tenant.code}) ·{' '}
                  {request.creator?.fullName ?? 'Tài khoản đã xóa'} ·{' '}
                  {new Date(request.createdAt).toLocaleString('vi-VN')}
                </p>
                <p className='break-words whitespace-pre-wrap'>
                  {request.content}
                </p>
                {request.pagePath && (
                  <p className='text-sm break-all text-muted-foreground'>
                    Trang: {request.pagePath}
                  </p>
                )}
              </div>
              <section
                className='space-y-3'
                aria-label='Trao đổi và lịch sử trạng thái'
              >
                <h3 className='font-semibold'>Trao đổi & lịch sử xử lý</h3>
                {!request.activities.length && (
                  <p className='text-sm text-muted-foreground'>
                    Chưa có phản hồi.
                  </p>
                )}
                {request.activities.map((activity) => (
                  <article
                    key={activity.id}
                    className='space-y-2 rounded-md border p-3'
                  >
                    <p className='text-sm font-medium'>
                      {activity.actor?.fullName ?? 'Tài khoản đã xóa'}{' '}
                      <span className='font-normal text-muted-foreground'>
                        · {new Date(activity.createdAt).toLocaleString('vi-VN')}
                      </span>
                    </p>
                    {activity.toStatus && (
                      <p className='text-sm text-muted-foreground'>
                        {activity.fromStatus
                          ? statusLabels[activity.fromStatus]
                          : ''}{' '}
                        → {statusLabels[activity.toStatus]}
                      </p>
                    )}
                    {activity.content && (
                      <p className='text-sm break-words whitespace-pre-wrap'>
                        {activity.content}
                      </p>
                    )}
                  </article>
                ))}
              </section>
              <form onSubmit={submit} className='space-y-3 border-t pt-4'>
                {system && (
                  <div className='space-y-2'>
                    <Label htmlFor='support-status'>Trạng thái</Label>
                    <Select
                      disabled={mutation.isPending}
                      value={status || request.status}
                      onValueChange={(value) =>
                        setStatus(value as RequestStatus)
                      }
                    >
                      <SelectTrigger id='support-status'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className='space-y-2'>
                  <Label
                    htmlFor='support-reply'
                    required={
                      !system ||
                      !status ||
                      status === request.status ||
                      status === 'DECLINED' ||
                      status === 'NEEDS_INFO'
                    }
                  >
                    Phản hồi
                  </Label>
                  <Textarea
                    id='support-reply'
                    value={reply}
                    onChange={(event) => setReply(event.target.value)}
                    maxLength={10000}
                    rows={4}
                    disabled={mutation.isPending}
                  />
                </div>
                <div className='flex justify-end'>
                  <Button disabled={mutation.isPending} type='submit'>
                    {mutation.isPending
                      ? 'Đang gửi…'
                      : system
                        ? 'Cập nhật yêu cầu'
                        : 'Gửi phản hồi'}
                  </Button>
                </div>
              </form>
            </>
          )
        )}
      </DialogContent>
    </Dialog>
  )
}
