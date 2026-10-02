import { useState, type FormEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
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
  createSupportRequest,
  type CreateSupportInput,
  type RequestType,
} from '../api'

export function CreateRequestDialog({
  onCreated,
}: {
  onCreated: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<RequestType>('BUG')
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: createSupportRequest,
    onSuccess: async (request) => {
      await queryClient.invalidateQueries({ queryKey: ['support-requests'] })
      toast.success('Đã gửi yêu cầu')
      setOpen(false)
      onCreated(request.id)
    },
  })
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const input: CreateSupportInput = {
      type,
      title: String(form.get('title')).trim(),
      content: String(form.get('content')).trim(),
    }
    const pagePath = String(form.get('pagePath')).trim()
    if (!input.title || !input.content)
      return toast.error('Vui lòng nhập tiêu đề và nội dung')
    if (pagePath && !/^\/(?!\/)[^?#\s]*$/.test(pagePath))
      return toast.error(
        'Chỉ nhập đường dẫn trang, không kèm query hoặc tên miền'
      )
    mutation.mutate({ ...input, ...(pagePath ? { pagePath } : {}) })
  }
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!mutation.isPending) {
          setOpen(next)
          if (next) setType('BUG')
        }
      }}
    >
      <DialogTrigger asChild>
        <Button>Gửi yêu cầu</Button>
      </DialogTrigger>
      <DialogContent className='max-h-[90svh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Gửi yêu cầu hỗ trợ</DialogTitle>
          <DialogDescription>
            Báo lỗi hoặc đề xuất cải thiện cho phòng khám của bạn.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className='space-y-4'>
          <fieldset disabled={mutation.isPending} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='request-type' required>
                Loại yêu cầu
              </Label>
              <Select
                value={type}
                onValueChange={(value) => setType(value as RequestType)}
              >
                <SelectTrigger id='request-type'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='BUG'>Báo lỗi</SelectItem>
                  <SelectItem value='FEATURE'>Đề xuất tính năng</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='request-title' required>
                Tiêu đề
              </Label>
              <Input id='request-title' name='title' required maxLength={200} />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='request-content' required>
                Nội dung
              </Label>
              <Textarea
                id='request-content'
                name='content'
                required
                maxLength={10000}
                rows={7}
                placeholder={
                  type === 'BUG'
                    ? 'Thao tác đã thực hiện, kết quả mong muốn và lỗi thực tế…'
                    : 'Bạn muốn thêm tính năng gì? Tính năng đó giúp ích như thế nào?'
                }
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='request-path'>Trang gặp lỗi</Label>
              <Input
                id='request-path'
                name='pagePath'
                maxLength={500}
                placeholder='/medical-histories'
              />
              <p className='text-xs text-muted-foreground'>
                Nhập đường dẫn trang nếu có.
              </p>
            </div>
          </fieldset>
          <div className='flex justify-end gap-2'>
            <Button
              type='button'
              variant='outline'
              disabled={mutation.isPending}
              onClick={() => setOpen(false)}
            >
              Hủy
            </Button>
            <Button type='submit' disabled={mutation.isPending}>
              {mutation.isPending ? 'Đang gửi…' : 'Gửi yêu cầu'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
