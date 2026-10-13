import { useCallback, useEffect, useState } from 'react'
import { Stethoscope } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { type ServiceType } from './api'
import { ServicePrescriptionForm } from './components/service-prescription-form'
import { SERVICE_TABS } from './data/constants'

type PrescriptionProps = Omit<
  React.ComponentProps<typeof ServicePrescriptionForm>,
  'serviceType'
> & {
  onActiveFormChange?: (formId: string, saveLabel: string) => void
}

export function Prescriptions({
  formId = 'prescription-form',
  onActiveFormChange,
  onSavingChange,
  onUploadingChange,
  ...props
}: PrescriptionProps) {
  const userId = useAuthStore((state) => state.auth.user?.id ?? 'anonymous')
  const preferenceKey = 'clinicviet:last-service-tab:' + userId
  const [serviceType, setServiceType] = useState<ServiceType>(() => {
    if (props.initialData) return props.initialData.serviceType ?? 'EXAMINATION'
    try {
      const saved = localStorage.getItem(preferenceKey)
      return (
        SERVICE_TABS.find((tab) => tab.value === saved)?.value ?? 'EXAMINATION'
      )
    } catch {
      return 'EXAMINATION'
    }
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const busy = isSaving || isUploading
  const handleSavingChange = useCallback(
    (saving: boolean) => {
      setIsSaving(saving)
      onSavingChange?.(saving)
    },
    [onSavingChange]
  )
  const handleUploadingChange = useCallback(
    (uploading: boolean) => {
      setIsUploading(uploading)
      onUploadingChange?.(uploading)
    },
    [onUploadingChange]
  )
  const activeTab = SERVICE_TABS.find((tab) => tab.value === serviceType)!
  useEffect(() => {
    onActiveFormChange?.(formId + '-' + serviceType, activeTab.saveLabel)
  }, [formId, serviceType, activeTab.saveLabel, onActiveFormChange])

  return (
    <div className='grid gap-4'>
      <h2 className='flex items-center gap-2 text-2xl font-bold tracking-tight'>
        <Stethoscope className='size-6' /> Lập phiếu dịch vụ
      </h2>
      <Tabs
        value={serviceType}
        onValueChange={(value) => {
          if (
            busy ||
            props.initialData ||
            !SERVICE_TABS.some((tab) => tab.value === value)
          )
            return
          setServiceType(value as ServiceType)
          try {
            localStorage.setItem(preferenceKey, value)
          } catch {
            /* The form remains usable when storage is unavailable. */
          }
        }}
      >
        <TabsList className='grid h-auto w-full grid-cols-3'>
          {SERVICE_TABS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              disabled={
                busy ||
                (Boolean(props.initialData) && tab.value !== serviceType)
              }
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <div
          className='rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm'
          role='status'
        >
          {props.initialData
            ? 'Bạn đang cập nhật phiếu '
            : 'Bạn đang lập phiếu '}
          <strong>{activeTab.label.toLowerCase()}</strong>. Khi chọn{' '}
          <strong>{activeTab.saveLabel}</strong>, chỉ nội dung và chi phí của
          tab này được lưu.{' '}
          {props.initialData
            ? 'Loại phiếu được giữ nguyên khi cập nhật; hai tab còn lại đã được khóa.'
            : 'Nội dung đã nhập ở tab khác được giữ khi chuyển tab, nhưng chưa được lưu và sẽ mất khi đóng cửa sổ.'}
        </div>
        {SERVICE_TABS.map((tab) => (
          <TabsContent
            key={tab.value}
            value={tab.value}
            forceMount
            className='data-[state=inactive]:hidden'
          >
            <ServicePrescriptionForm
              {...props}
              serviceType={tab.value}
              formId={formId + '-' + tab.value}
              onSavingChange={
                tab.value === serviceType ? handleSavingChange : undefined
              }
              onUploadingChange={
                tab.value === serviceType ? handleUploadingChange : undefined
              }
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

export type { InitialPrescriptionData } from './types'
