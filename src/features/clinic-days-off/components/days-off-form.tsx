import { useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { CalendarOff, Info, Plus, Save, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CreateMasterData, UpdateMasterData } from '@/features/master-data/api'
import { DAYS_OFF_KEY } from '../data/constants'

const currentYear = new Date().getFullYear()

const pad = (value: number) => String(value).padStart(2, '0')

function readDaysOff(value?: string) {
  try {
    const parsed: unknown = JSON.parse(value ?? '[]')
    return Array.isArray(parsed)
      ? parsed.filter(
          (item): item is string =>
            typeof item === 'string' && /^\d{2}-\d{2}$/.test(item)
        )
      : []
  } catch {
    return []
  }
}

export function DaysOffForm({
  item,
}: {
  item?: { id: string; value: string }
}) {
  const queryClient = useQueryClient()
  const initialDays = useMemo(() => readDaysOff(item?.value), [item?.value])
  const [daysOff, setDaysOff] = useState(initialDays)
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [day, setDay] = useState(new Date().getDate())
  const [isSaving, setIsSaving] = useState(false)
  const daysInMonth = new Date(currentYear, month, 0).getDate()

  const addDay = () => {
    const value = `${pad(month)}-${pad(Math.min(day, daysInMonth))}`
    if (daysOff.includes(value)) {
      toast.error('Ngày nghỉ này đã có trong danh sách')
      return
    }
    setDaysOff((current) => [...current, value].sort())
  }

  const save = async () => {
    setIsSaving(true)
    try {
      const data = { key: DAYS_OFF_KEY, value: JSON.stringify(daysOff) }
      await (item ? UpdateMasterData(item.id, data) : CreateMasterData(data))
      await queryClient.invalidateQueries({ queryKey: ['master-data'] })
      toast.success('Đã lưu ngày nghỉ của phòng khám')
    } catch {
      toast.error('Không thể lưu ngày nghỉ')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className='space-y-5'>
      <Alert className='border-amber-500/50 bg-amber-500/10 text-amber-950 dark:text-amber-100'>
        <Info />
        <AlertTitle>Lưu ý: ngày nghỉ được lặp lại hằng năm</AlertTitle>
        <AlertDescription>
          Bạn chỉ cần chọn ngày và tháng. Hệ thống đang hiển thị theo năm{' '}
          <strong>{currentYear}</strong> và sẽ tự áp dụng cùng ngày, tháng cho
          các năm tiếp theo.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-base'>
            <CalendarOff className='size-5 text-primary' /> Thêm ngày nghỉ
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-5'>
          <div className='grid max-w-md grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label>Ngày</Label>
              <Select
                value={String(Math.min(day, daysInMonth))}
                onValueChange={(value) => setDay(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from(
                    { length: daysInMonth },
                    (_, index) => index + 1
                  ).map((value) => (
                    <SelectItem key={value} value={String(value)}>
                      {pad(value)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label>Tháng</Label>
              <Select
                value={String(month)}
                onValueChange={(value) => {
                  const nextMonth = Number(value)
                  setMonth(nextMonth)
                  setDay((current) =>
                    Math.min(
                      current,
                      new Date(currentYear, nextMonth, 0).getDate()
                    )
                  )
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, index) => index + 1).map(
                    (value) => (
                      <SelectItem key={value} value={String(value)}>
                        Tháng {value}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className='flex items-center gap-3'>
            <Button type='button' variant='outline' onClick={addDay}>
              <Plus /> Thêm ngày nghỉ
            </Button>
            <span className='text-sm text-muted-foreground'>
              Ngày đang chọn: {pad(Math.min(day, daysInMonth))}/{pad(month)}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>
            Danh sách ngày nghỉ hằng năm
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          {daysOff.length === 0 ? (
            <p className='text-sm text-muted-foreground'>Chưa có ngày nghỉ.</p>
          ) : (
            <div className='grid gap-2 sm:grid-cols-2'>
              {daysOff.map((value) => {
                const [itemMonth, itemDay] = value.split('-')
                return (
                  <div
                    key={value}
                    className='flex items-center justify-between rounded-lg border px-3 py-2'
                  >
                    <span className='font-medium'>
                      {itemDay}/{itemMonth}
                    </span>
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      aria-label={`Xóa ngày ${itemDay}/${itemMonth}`}
                      onClick={() =>
                        setDaysOff((current) =>
                          current.filter((itemValue) => itemValue !== value)
                        )
                      }
                    >
                      <Trash2 className='size-4' />
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
          <div className='flex justify-end border-t pt-4'>
            <Button type='button' disabled={isSaving} onClick={save}>
              <Save /> {isSaving ? 'Đang lưu...' : 'Lưu ngày nghỉ'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
