import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ServicePrescriptionFormState } from '../hooks/use-service-prescription-form'
import { Field } from './field'
import { MedicinePicker } from './medicine-picker'
import { PrescriptionTemplatePicker } from './prescription-template-picker'

export function PrescriptionItemsSection({
  formId,
  isPharmacy,
  isVaccination,
  items,
  setItems,
  applyTemplate,
  instructionOptions,
  updateItem,
  addItem,
  getQuantityError,
}: Pick<
  ServicePrescriptionFormState,
  | 'formId'
  | 'isPharmacy'
  | 'isVaccination'
  | 'items'
  | 'setItems'
  | 'applyTemplate'
  | 'instructionOptions'
  | 'updateItem'
  | 'addItem'
  | 'getQuantityError'
>) {
  return (
    <Card>
      <CardHeader className='gap-3 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <CardTitle>
            {isVaccination
              ? 'Vắc xin / thuốc'
              : isPharmacy
                ? 'Thuốc / sản phẩm'
                : 'Đơn thuốc'}
          </CardTitle>
          <CardDescription>
            Tìm kiếm và chọn thuốc trong danh mục.
          </CardDescription>
        </div>
        <div className='grid min-w-56 gap-1.5'>
          <Label htmlFor={formId + '-prescription-template'}>
            Mẫu đơn thuốc
          </Label>
          <PrescriptionTemplatePicker onSelect={applyTemplate} />
        </div>
      </CardHeader>
      <CardContent className='grid gap-4'>
        {items.map((item, index) => (
          <div key={item.key} className='grid gap-4 rounded-lg border p-4'>
            <div className='flex items-center justify-between'>
              <p className='font-medium'>Thuốc {index + 1}</p>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                onClick={() =>
                  setItems((rows) => rows.filter((row) => row.key !== item.key))
                }
              >
                <Trash2 />
                <span className='sr-only'>Xóa thuốc</span>
              </Button>
            </div>
            {item.selectedMedicine && (
              <p className='text-sm text-muted-foreground'>
                Đơn giá:{' '}
                {Number(item.selectedMedicine.salePrice).toLocaleString(
                  'vi-VN'
                )}{' '}
                đ{' · '}Thành tiền:{' '}
                {(
                  Number(item.selectedMedicine.salePrice) * (item.quantity ?? 0)
                ).toLocaleString('vi-VN')}{' '}
                đ
              </p>
            )}
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_minmax(8rem,0.6fr)_minmax(0,1.4fr)]'>
              <div className='grid grid-rows-[auto_2.25rem_1rem] content-start gap-2 md:col-span-2 lg:col-span-1'>
                <Label>
                  Thuốc <span className='text-destructive'>*</span>
                </Label>
                <MedicinePicker
                  selected={item.selectedMedicine}
                  onChange={(medicine) =>
                    updateItem(item.key, {
                      medicineId: medicine.id,
                      medicineName: medicine.name,
                      selectedMedicine: medicine,
                    })
                  }
                />
                <span aria-hidden='true' />
              </div>
              <Field
                label='Số lượng *'
                className='grid-rows-[auto_2.25rem_1rem] content-start'
              >
                <Input
                  type='number'
                  min={1}
                  step={1}
                  required={Boolean(item.medicineId)}
                  aria-invalid={Boolean(getQuantityError(item))}
                  value={item.quantity ?? ''}
                  onChange={(e) =>
                    updateItem(item.key, {
                      quantity: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                />
                {getQuantityError(item) && (
                  <p className='text-xs leading-4 text-destructive'>
                    {getQuantityError(item)}
                  </p>
                )}
                {!getQuantityError(item) && <span aria-hidden='true' />}
              </Field>
              <Field
                className='grid-rows-[auto_2.25rem_1rem] content-start md:col-span-2 lg:col-span-1'
                label='Hướng dẫn sử dụng'
              >
                <Select
                  value={item.instruction || '__none__'}
                  onValueChange={(value) =>
                    updateItem(item.key, {
                      instruction: value === '__none__' ? '' : value,
                    })
                  }
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Chọn hướng dẫn sử dụng' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='__none__'>Không có hướng dẫn</SelectItem>
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
                <span aria-hidden='true' />
              </Field>
            </div>
          </div>
        ))}
        <Button
          type='button'
          variant='outline'
          className='w-fit justify-self-center'
          onClick={addItem}
        >
          <Plus /> {isVaccination ? 'Thêm vắc xin / thuốc' : 'Thêm thuốc'}
        </Button>
      </CardContent>
    </Card>
  )
}
