import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { ServicePrescriptionFormState } from '../hooks/use-service-prescription-form'
import { AutomaticFee } from './automatic-fee'
import { OtherFeeField } from './other-fee-field'

export function ServiceFeesSection({
  formId,
  isExamination,
  isVaccination,
  items,
  serviceFee,
  setServiceFee,
  serviceFeeLabel,
  setServiceFeeLabel,
  otherFee1,
  setOtherFee1,
  otherFee2,
  setOtherFee2,
  otherFee3,
  setOtherFee3,
  otherFee1Label,
  setOtherFee1Label,
  otherFee2Label,
  setOtherFee2Label,
  otherFee3Label,
  setOtherFee3Label,
  consultationFee,
  medicineFee,
  invoiceTotal,
}: Pick<
  ServicePrescriptionFormState,
  | 'formId'
  | 'isExamination'
  | 'isVaccination'
  | 'items'
  | 'serviceFee'
  | 'setServiceFee'
  | 'serviceFeeLabel'
  | 'setServiceFeeLabel'
  | 'otherFee1'
  | 'setOtherFee1'
  | 'otherFee2'
  | 'setOtherFee2'
  | 'otherFee3'
  | 'setOtherFee3'
  | 'otherFee1Label'
  | 'setOtherFee1Label'
  | 'otherFee2Label'
  | 'setOtherFee2Label'
  | 'otherFee3Label'
  | 'setOtherFee3Label'
  | 'consultationFee'
  | 'medicineFee'
  | 'invoiceTotal'
>) {
  return (
    <Card>
      <CardHeader className='border-b'>
        <CardTitle>Chi phí dịch vụ</CardTitle>
        <CardDescription>
          Kiểm tra các khoản thu trước khi lưu phiếu dịch vụ.
        </CardDescription>
      </CardHeader>
      <CardContent className='grid gap-6 pt-6'>
        <div className='grid gap-3'>
          <AutomaticFee
            label='Phí khám'
            value={consultationFee}
            note={
              isExamination
                ? 'Theo cấu hình phòng khám'
                : 'Không áp dụng cho loại phiếu này'
            }
          />
          <AutomaticFee
            label={isVaccination ? 'Vắc xin / thuốc' : 'Phí thuốc'}
            value={medicineFee}
            note={`${items.filter((item) => item.medicineId).length} loại thuốc`}
          />
        </div>

        <div className='grid gap-3'>
          <div>
            <p className='text-sm font-medium'>Khoản thu bổ sung</p>
            <p className='text-xs text-muted-foreground'>
              Nhập nội dung và số tiền nếu có.
            </p>
          </div>
          <OtherFeeField
            index={formId + '-service'}
            title='Dịch vụ thêm'
            label={serviceFeeLabel}
            amount={serviceFee}
            onLabelChange={setServiceFeeLabel}
            onAmountChange={setServiceFee}
          />
          <OtherFeeField
            index={formId + '-1'}
            title='Khoản khác 1'
            label={otherFee1Label}
            amount={otherFee1}
            onLabelChange={setOtherFee1Label}
            onAmountChange={setOtherFee1}
          />
          <OtherFeeField
            index={formId + '-2'}
            title='Khoản khác 2'
            label={otherFee2Label}
            amount={otherFee2}
            onLabelChange={setOtherFee2Label}
            onAmountChange={setOtherFee2}
          />
          <OtherFeeField
            index={formId + '-3'}
            title='Khoản khác 3'
            label={otherFee3Label}
            amount={otherFee3}
            onLabelChange={setOtherFee3Label}
            onAmountChange={setOtherFee3}
          />
        </div>

        <div className='flex flex-col gap-1 rounded-lg bg-primary px-5 py-4 text-primary-foreground sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <p className='font-medium'>Tổng thanh toán</p>
            <p className='text-xs opacity-80'>Đã bao gồm tất cả khoản phí</p>
          </div>
          <p className='text-2xl font-bold tabular-nums'>
            {invoiceTotal.toLocaleString('vi-VN')} ₫
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
