import { useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { SERVICE_PLAN_LABELS } from '@/config/service-plans'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { axios } from '@/lib/axios'
import { showRequestError } from '@/lib/handle-server-error'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type ReferralInput = {
  phone: string
  contactName: string
}

export function ReferralDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const user = useAuthStore((state) => state.auth.user)
  const [submitted, setSubmitted] = useState(false)
  const plan = user?.tenant?.servicePlan
  const mutation = useMutation({
    mutationFn: (data: ReferralInput) =>
      axios.post('/trial-requests/referrals', data),
    onSuccess: () => {
      setSubmitted(true)
      toast.success('Đã gửi thông tin giới thiệu')
    },
    onError: (error) =>
      showRequestError(error, 'Không thể gửi thông tin giới thiệu'),
  })

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    mutation.mutate({
      phone: String(data.get('phone') ?? '').trim(),
      contactName: String(data.get('contactName') ?? '').trim(),
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (mutation.isPending) return
        if (!next) setSubmitted(false)
        onOpenChange(next)
      }}
    >
      <DialogContent className='max-h-[90dvh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Giới thiệu cho bạn bè</DialogTitle>
          <DialogDescription>
            Giới thiệu ClinicViet đến bạn bè hoặc cơ sở có nhu cầu sử dụng.
          </DialogDescription>
        </DialogHeader>
        <div className='rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm leading-6'>
          Khi người bạn giới thiệu mua gói dịch vụ thành công, bạn được cộng
          thêm <strong>1 tháng sử dụng theo gói đang dùng</strong>
          {plan ? ` (${SERVICE_PLAN_LABELS[plan]})` : ''} tại thời điểm ghi nhận
          thưởng. Đội ngũ ClinicViet sẽ xác nhận và cập nhật thời hạn sử dụng
          cho bạn.
        </div>
        {submitted ? (
          <div className='space-y-4'>
            <p className='text-sm leading-6'>
              Đã nhận thông tin giới thiệu. ClinicViet sẽ liên hệ người được
              giới thiệu để tư vấn.
            </p>
            <Button
              className='w-full'
              onClick={() => {
                setSubmitted(false)
                onOpenChange(false)
              }}
            >
              Đóng
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} className='space-y-4'>
            <fieldset disabled={mutation.isPending} className='space-y-4'>
              <div className='space-y-2'>
                <Label required htmlFor='referral-phone'>
                  SĐT người được giới thiệu
                </Label>
                <Input
                  id='referral-phone'
                  name='phone'
                  type='tel'
                  required
                  maxLength={20}
                  placeholder='Nhập số điện thoại liên hệ'
                />
              </div>
              <div className='space-y-2'>
                <Label required htmlFor='referral-name'>
                  Tên người được giới thiệu
                </Label>
                <Input
                  id='referral-name'
                  name='contactName'
                  required
                  maxLength={100}
                />
              </div>
              <p className='text-xs text-muted-foreground'>
                Thông tin người giới thiệu được lấy từ tài khoản đang đăng nhập.
              </p>
              <Button
                type='submit'
                className='w-full'
                disabled={mutation.isPending}
              >
                {mutation.isPending ? 'Đang gửi…' : 'Gửi thông tin giới thiệu'}
              </Button>
            </fieldset>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
