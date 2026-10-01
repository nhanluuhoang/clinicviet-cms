import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { emptyItem } from '../data/constants'
import type { PrescriptionTemplatesState } from '../hooks/use-prescription-templates'

export function PrescriptionTemplatesMutateDialog({
  open,
  current,
  name,
  setName,
  items,
  setItems,
  medicines,
  instructionOptions,
  close,
  patchItem,
  save,
}: Pick<
  PrescriptionTemplatesState,
  | 'open'
  | 'current'
  | 'name'
  | 'setName'
  | 'items'
  | 'setItems'
  | 'medicines'
  | 'instructionOptions'
  | 'close'
  | 'patchItem'
  | 'save'
>) {
  return (
    <Dialog
      open={open === 'create' || open === 'update'}
      onOpenChange={(value) => {
        if (!value) close()
      }}
    >
      <DialogContent className='grid max-h-[90dvh] grid-rows-[auto_minmax(0,1fr)_auto] sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>
            {current ? 'Cập nhật mẫu đơn thuốc' : 'Thêm mẫu đơn thuốc'}
          </DialogTitle>
          <DialogDescription>
            Thiết lập thuốc, số lượng và hướng dẫn sử dụng mặc định.
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-4 overflow-y-auto px-1'>
          <div className='space-y-2'>
            <Label>Tên mẫu</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='VD: Cảm cúm người lớn'
            />
          </div>
          {items.map((item, index) => (
            <div key={index} className='grid gap-3 rounded-md border p-3'>
              <div className='flex items-center justify-between'>
                <Label>Thuốc {index + 1}</Label>
                <Button
                  variant='ghost'
                  size='icon'
                  disabled={items.length === 1}
                  onClick={() =>
                    setItems((rows) => rows.filter((_, i) => i !== index))
                  }
                >
                  <Trash2 className='size-4' />
                </Button>
              </div>
              <Select
                value={item.medicineId || undefined}
                onValueChange={(value) => {
                  const medicine = medicines.find((m) => m.id === value)
                  patchItem(index, {
                    medicineId: value,
                    medicineName: medicine?.name ?? '',
                  })
                }}
              >
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Chọn thuốc' />
                </SelectTrigger>
                <SelectContent>
                  {item.medicineId &&
                    !medicines.some((m) => m.id === item.medicineId) && (
                      <SelectItem value={item.medicineId}>
                        {item.medicineName}
                      </SelectItem>
                    )}
                  {medicines.map((medicine) => (
                    <SelectItem key={medicine.id} value={medicine.id}>
                      {medicine.name} · {medicine.strength}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className='grid gap-3 sm:grid-cols-[8rem_1fr]'>
                <div className='space-y-2'>
                  <Label>Số lượng</Label>
                  <Input
                    type='number'
                    min={1}
                    value={item.quantity}
                    onChange={(e) =>
                      patchItem(index, { quantity: Number(e.target.value) })
                    }
                  />
                </div>
                <div className='space-y-2'>
                  <Label>Hướng dẫn sử dụng</Label>
                  <Select
                    value={item.instruction || '__none__'}
                    onValueChange={(value) =>
                      patchItem(index, {
                        instruction: value === '__none__' ? '' : value,
                      })
                    }
                  >
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder='Chọn hướng dẫn sử dụng' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='__none__'>
                        Không có hướng dẫn
                      </SelectItem>
                      {item.instruction &&
                        !instructionOptions.includes(item.instruction) && (
                          <SelectItem value={item.instruction}>
                            {item.instruction}
                          </SelectItem>
                        )}
                      {instructionOptions.map((instruction) => (
                        <SelectItem key={instruction} value={instruction}>
                          {instruction}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}
          <Button
            variant='outline'
            size='sm'
            onClick={() => setItems((rows) => [...rows, emptyItem()])}
          >
            <Plus /> Thêm thuốc
          </Button>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant='outline'>Đóng</Button>
          </DialogClose>
          <Button onClick={() => void save()}>Lưu mẫu</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
