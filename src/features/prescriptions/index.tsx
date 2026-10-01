import { useCallback, useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { API_URL } from '@/config'
import {
  Check,
  ChevronsUpDown,
  FileText,
  ImagePlus,
  Plus,
  Stethoscope,
  Trash2,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'
import { useDebounce } from '@/hooks/use-debounce'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { DatePickerInput } from '@/components/date-picker-input'
import {
  deleteImage,
  deletePdf,
  deleteVideo,
  uploadImage,
  uploadPdf,
  uploadVideo,
  type UploadedImage,
  type UploadedPdf,
  type UploadedVideo,
} from '@/features/examination-queue/api'
import { GetMasterDatas } from '@/features/master-data/api'
import {
  getPrescriptionTemplates,
  type PrescriptionTemplate,
} from '@/features/prescription-templates/api'
import {
  createPrescription,
  getVaccinationStaff,
  getVaccinationFields,
  updatePrescription,
  getMedicines,
  type User,
  type Medicine,
  type PrescriptionItemInput,
  type ServiceType,
  type VaccinationInput,
} from './api'

type MedicineRow = Omit<PrescriptionItemInput, 'medicineId' | 'quantity'> & {
  key: number
  medicineId?: string
  quantity?: number
  selectedMedicine?: Medicine
}

const emptyMedicine = (key: number): MedicineRow => ({
  key,
  medicineName: '',
  instruction: '',
})

const MAX_MEDIA_FILES = 10
const MAX_MEDIA_FILE_SIZE = 5 * 1024 * 1024
const MAX_VIDEO_SIZE = 100 * 1024 * 1024
const ACCEPTED_MEDIA_TYPES = [
  'image/jpeg',
  'image/png',
  'application/pdf',
  'video/mp4',
  'video/webm',
  'video/quicktime',
]
const INSTRUCTION_OPTIONS = [
  'Uống trước ăn',
  'Uống sau ăn',
  'Uống trong bữa ăn',
  'Uống vào buổi sáng',
  'Uống vào buổi tối',
  'Uống khi cần',
  'Ngậm dưới lưỡi',
  'Bôi ngoài da',
]

export interface InitialPrescriptionData extends VaccinationInput {
  doctorName?: string
  serviceType?: ServiceType
  id: string
  symptoms: string
  diagnosis: string
  treatment: string
  advice: string
  note: string
  images: Array<{ id: string; fileName: string }>
  pdfs: Array<{ id: string; fileName: string }>
  videos: Array<{ id: string; fileName: string }>
  prescription: null | {
    id: string
    items: Array<{
      medicineId: string
      medicineName: string
      quantity: number | null
      instruction: string
      medicine: null | {
        id: string
        name: string
        strength: string
        unit: string
        totalQty: number
        isActive: boolean
        salePrice: number | string
      }
    }>
    invoice: null | {
      consultationFee?: number | string
      serviceFee: number | string
      serviceFeeLabel: string
      otherFee1: number | string
      otherFee1Label: string
      otherFee2: number | string
      otherFee2Label: string
      otherFee3: number | string
      otherFee3Label: string
    }
  }
}

function PrescriptionTemplatePicker({
  onSelect,
}: {
  onSelect: (template: PrescriptionTemplate) => void
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['prescription-templates', 'search', debouncedSearch],
    queryFn: () => getPrescriptionTemplates(debouncedSearch),
    enabled: open,
  })

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type='button'
          variant='outline'
          className='w-full justify-between font-normal'
        >
          Chọn mẫu để áp dụng
          <ChevronsUpDown className='size-4 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className='w-[var(--radix-popover-trigger-width)] p-0'
        align='start'
      >
        <Command shouldFilter={false}>
          <CommandInput
            value={search}
            onValueChange={setSearch}
            placeholder='Tìm tên mẫu hoặc tên thuốc...'
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? 'Đang tìm...' : 'Không tìm thấy mẫu đơn.'}
            </CommandEmpty>
            <CommandGroup>
              {templates.map((template) => (
                <CommandItem
                  key={template.id}
                  value={template.id}
                  onSelect={() => {
                    onSelect(template)
                    setOpen(false)
                    setSearch('')
                  }}
                >
                  <div className='min-w-0'>
                    <p className='truncate font-medium'>{template.name}</p>
                    <p className='truncate text-xs text-muted-foreground'>
                      {template.items
                        .map((item) => item.medicineName)
                        .join(', ')}
                    </p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

const SERVICE_TABS = [
  { value: 'EXAMINATION', label: 'Khám bệnh', saveLabel: 'Lưu phiếu khám' },
  { value: 'PHARMACY', label: 'Bán thuốc', saveLabel: 'Lưu phiếu bán thuốc' },
  { value: 'VACCINATION', label: 'Tiêm vắc xin', saveLabel: 'Lưu phiếu tiêm' },
] as const

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
  const preferenceKey = 'iclinic:last-service-tab:' + userId
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

function ServicePrescriptionForm({
  patient,
  examinationQueueId,
  initialData,
  formId = 'prescription-form',
  serviceType,
  onSavingChange,
  onSaved,
  onUploadingChange,
}: {
  patient: User
  serviceType: ServiceType
  onSavingChange?: (saving: boolean) => void
  examinationQueueId?: string
  initialData?: InitialPrescriptionData | null
  formId?: string
  onSaved?: () => void
  onUploadingChange?: (uploading: boolean) => void
}) {
  const currentUser = useAuthStore((state) => state.auth.user)
  const doctorName = initialData?.doctorName ?? currentUser?.fullName ?? ''
  const canEditPrescription = !initialData || Boolean(initialData.prescription)
  const servicePlan = useAuthStore(
    (state) => state.auth.user?.tenant?.servicePlan ?? 'BASIC'
  )
  const canUseDiagnosisMedia = servicePlan !== 'BASIC'
  const queryClient = useQueryClient()
  const vaccinationDefaults = (): VaccinationInput => {
    const today = new Date()
    return {
      administeredById: currentUser?.id,
      administeredBy: currentUser?.fullName ?? '',
      administeredDate:
        today.getFullYear() +
        '-' +
        String(today.getMonth() + 1).padStart(2, '0') +
        '-' +
        String(today.getDate()).padStart(2, '0'),
    }
  }
  const [vaccination, setVaccination] =
    useState<VaccinationInput>(vaccinationDefaults)
  const isExamination = serviceType === 'EXAMINATION'
  const isPharmacy = serviceType === 'PHARMACY'
  const isVaccination = serviceType === 'VACCINATION'
  const showVaccination = isVaccination
  const [symptoms, setSymptoms] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [treatment, setTreatment] = useState('')
  const [note, setNote] = useState('')
  const [advice, setAdvice] = useState('')
  const [media, setMedia] = useState<
    Array<UploadedImage | UploadedPdf | UploadedVideo>
  >([])
  const draftMediaRef = useRef<
    Array<UploadedImage | UploadedPdf | UploadedVideo>
  >([])
  const [isUploadingMedia, setIsUploadingMedia] = useState(false)
  const [nextKey, setNextKey] = useState(2)
  const [items, setItems] = useState<MedicineRow[]>([emptyMedicine(1)])
  const [serviceFee, setServiceFee] = useState(0)
  const [serviceFeeLabel, setServiceFeeLabel] = useState('')
  const [otherFee1, setOtherFee1] = useState(0)
  const [otherFee2, setOtherFee2] = useState(0)
  const [otherFee3, setOtherFee3] = useState(0)
  const [otherFee1Label, setOtherFee1Label] = useState('')
  const [otherFee2Label, setOtherFee2Label] = useState('')
  const [otherFee3Label, setOtherFee3Label] = useState('')

  useEffect(() => {
    return () => {
      const draftFiles = draftMediaRef.current
      draftMediaRef.current = []
      void (async () => {
        for (const file of draftFiles) {
          try {
            await deleteMediaFile(file)
          } catch {
            // Closing the dialog must continue even if draft cleanup fails.
          }
        }
      })()
    }
  }, [])

  useEffect(() => {
    if (
      !initialData ||
      (initialData.serviceType ?? 'EXAMINATION') !== serviceType
    )
      return
    const prescription = initialData.prescription
    const invoice = prescription?.invoice
    setVaccination(getVaccinationFields(initialData))
    setSymptoms(initialData.symptoms ?? '')
    setDiagnosis(initialData.diagnosis ?? '')
    setTreatment(initialData.treatment ?? '')
    setAdvice(initialData.advice ?? '')
    setNote(initialData.note ?? '')
    setMedia([
      ...(initialData.images ?? []).map((file) => ({
        ...file,
        url: `${API_URL}/images/${file.fileName}`,
        name: file.fileName,
        mimeType: 'image/webp',
        size: 0,
      })),
      ...(initialData.pdfs ?? []).map((file) => ({
        ...file,
        url: `${API_URL}/pdfs/${file.fileName}`,
        name: file.fileName,
        mimeType: 'application/pdf',
        size: 0,
      })),
      ...(initialData.videos ?? []).map((file) => ({
        ...file,
        url: `${API_URL}/videos/${file.fileName}/master.m3u8`,
        name: file.fileName,
        mimeType: 'application/vnd.apple.mpegurl',
        size: 0,
      })),
    ])
    const savedItems = (prescription?.items ?? []).map((item, index) => ({
      key: index + 1,
      medicineId: item.medicineId,
      medicineName: item.medicineName,
      quantity: item.quantity ?? undefined,
      instruction: item.instruction ?? '',
      selectedMedicine: item.medicine
        ? {
            ...item.medicine,
            salePrice: Number(item.medicine.salePrice ?? 0),
            totalQty:
              Number(item.medicine.totalQty ?? 0) + Number(item.quantity ?? 0),
          }
        : undefined,
    }))
    setItems(savedItems.length ? savedItems : [emptyMedicine(1)])
    setNextKey(Math.max(savedItems.length + 1, 2))
    setServiceFee(Number(invoice?.serviceFee ?? 0))
    setServiceFeeLabel(invoice?.serviceFeeLabel ?? '')
    setOtherFee1(Number(invoice?.otherFee1 ?? 0))
    setOtherFee1Label(invoice?.otherFee1Label ?? '')
    setOtherFee2(Number(invoice?.otherFee2 ?? 0))
    setOtherFee2Label(invoice?.otherFee2Label ?? '')
    setOtherFee3(Number(invoice?.otherFee3 ?? 0))
    setOtherFee3Label(invoice?.otherFee3Label ?? '')
  }, [initialData, serviceType])

  const masterData = useQuery({
    queryKey: ['master-data', 'consultation-fee'],
    queryFn: () => GetMasterDatas({ page: 1 }),
  })
  const vaccinationStaff = useQuery({
    queryKey: ['vaccination-staff', currentUser?.tenantId],
    queryFn: getVaccinationStaff,
    enabled: isVaccination && Boolean(currentUser?.tenantId),
  })
  const staffOptions = currentUser?.id
    ? [
        {
          id: currentUser.id,
          fullName: currentUser.fullName,
          role: currentUser.role ?? '',
        },
        ...(vaccinationStaff.data ?? []).filter(
          (user) => user.id !== currentUser.id
        ),
      ]
    : (vaccinationStaff.data ?? [])
  const selectedStaffId =
    vaccination.administeredById ??
    staffOptions.find((user) => user.fullName === vaccination.administeredBy)
      ?.id
  const templateMedicines = useQuery({
    queryKey: ['prescription-template-medicines'],
    queryFn: () => getMedicines(),
  })

  const applyTemplate = (template: PrescriptionTemplate) => {
    const catalog = templateMedicines.data ?? []
    const rows = template.items.map((item, index) => ({
      key: nextKey + index,
      medicineId: item.medicineId,
      medicineName: item.medicineName,
      quantity: item.quantity,
      instruction: item.instruction,
      selectedMedicine: catalog.find(
        (medicine) => medicine.id === item.medicineId
      ),
    }))
    setItems(rows.length ? rows : [emptyMedicine(nextKey)])
    setNextKey((value) => value + Math.max(rows.length, 1))
    toast.success(`Đã áp dụng mẫu ${template.name}`)
  }
  const defaultConsultationFee = Number(
    masterData.data?.data.find((item) => item.key === 'CONSULTATION_FEE')
      ?.value ?? 0
  )
  const consultationFee = isExamination
    ? Number(
        (initialData?.serviceType ?? 'EXAMINATION') === 'EXAMINATION'
          ? (initialData?.prescription?.invoice?.consultationFee ??
              defaultConsultationFee)
          : defaultConsultationFee
      )
    : 0
  const instructionOptions = (
    masterData.data?.data.find(
      (item) => item.key === 'MEDICINE_INSTRUCTION_OPTIONS'
    )?.value ?? INSTRUCTION_OPTIONS.join('\n')
  )
    .split(/\r?\n/)
    .map((value) => value.trim())
    .filter(Boolean)
  const medicineFee = items.reduce((sum, item) => {
    return (
      sum + Number(item.selectedMedicine?.salePrice ?? 0) * (item.quantity ?? 0)
    )
  }, 0)
  const invoiceTotal =
    consultationFee +
    medicineFee +
    serviceFee +
    otherFee1 +
    otherFee2 +
    otherFee3

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        medicalHistory: {
          examinationQueueId,
          serviceType,
          ...(showVaccination
            ? {
                temperature: vaccination.temperature?.trim() || null,
                bloodPressure: vaccination.bloodPressure?.trim() || null,
                doseNumber: vaccination.doseNumber ?? null,
                dose: vaccination.dose ?? null,
                route: vaccination.route ?? null,
                site: vaccination.site ?? null,
                administeredBy: vaccination.administeredBy ?? null,
                administeredById: vaccination.administeredById ?? null,
                expiryDate: vaccination.expiryDate ?? null,
                administeredDate: vaccination.administeredDate ?? null,
                nextDoseDate: vaccination.nextDoseDate ?? null,
              }
            : {}),
          userId: patient.id,
          ...(isExamination && {
            symptoms: symptoms.trim(),
            treatment: treatment.trim(),
          }),
          diagnosis: isExamination ? diagnosis.trim() : '',
          advice: advice.trim() || undefined,
          doctorName: doctorName.trim(),
          note: note.trim() || undefined,
          ...(canUseDiagnosisMedia && {
            images: media
              .filter((file) => file.mimeType.startsWith('image/'))
              .map((file) => file.fileName),
            pdfs: media
              .filter((file) => file.mimeType === 'application/pdf')
              .map((file) => file.fileName),
            videos: media
              .filter((file) => file.mimeType.startsWith('video/'))
              .map((file) => file.fileName),
          }),
        },
        consultationFee,
        serviceFee,
        serviceFeeLabel,
        otherFee1,
        otherFee2,
        otherFee3,
        otherFee1Label,
        otherFee2Label,
        otherFee3Label,
        prescriptionItems: items
          .filter(
            (item) => item.medicineId || item.quantity || item.instruction
          )
          .map(({ key: _key, selectedMedicine: _selected, ...item }) => ({
            ...item,
            medicineId: item.medicineId!,
            medicineName: item.medicineName.trim(),
            quantity: item.quantity!,
            instruction: item.instruction?.trim() || undefined,
          })),
      }
      if (initialData?.id) {
        await updatePrescription(
          initialData.id,
          canEditPrescription
            ? payload
            : { medicalHistory: payload.medicalHistory }
        )
      } else {
        await createPrescription(payload)
      }
    },
    onSuccess: () => {
      toast.success('Đã lưu phiếu dịch vụ')
      setSymptoms('')
      setDiagnosis('')
      setTreatment('')
      setNote('')
      setAdvice('')
      setMedia([])
      setItems([emptyMedicine(nextKey)])
      setServiceFee(0)
      setServiceFeeLabel('')
      setOtherFee1(0)
      setOtherFee2(0)
      setOtherFee3(0)
      setOtherFee1Label('')
      setOtherFee2Label('')
      setOtherFee3Label('')
      setNextKey((value) => value + 1)
      draftMediaRef.current = []
      onSaved?.()
      void queryClient.invalidateQueries({
        queryKey: ['examination-queue'],
      })
      void queryClient.invalidateQueries({
        queryKey: ['medical-histories'],
      })
    },
    onError: (error) =>
      toast.error(
        typeof error === 'string'
          ? error
          : 'Không thể lưu hồ sơ khám và đơn thuốc'
      ),
  })

  useEffect(() => {
    onSavingChange?.(save.isPending)
  }, [save.isPending, onSavingChange])

  const updateItem = (key: number, patch: Partial<MedicineRow>) =>
    setItems((current) =>
      current.map((item) => (item.key === key ? { ...item, ...patch } : item))
    )

  const addItem = () => {
    setItems((current) => [...current, emptyMedicine(nextKey)])
    setNextKey((value) => value + 1)
  }

  const addMedia = async (files: FileList | null) => {
    if (!files) return
    const selected = Array.from(files)
    const invalid = selected.find((file) => {
      const maxSize = file.type.startsWith('video/')
        ? MAX_VIDEO_SIZE
        : MAX_MEDIA_FILE_SIZE
      return !ACCEPTED_MEDIA_TYPES.includes(file.type) || file.size > maxSize
    })
    if (invalid) {
      toast.error(
        'Chỉ nhận JPG, JPEG, PNG, PDF (tối đa 5 MB) hoặc MP4, WebM, MOV (tối đa 100 MB)'
      )
      return
    }
    if (media.length + selected.length > MAX_MEDIA_FILES) {
      toast.error(`Chỉ được tải lên tối đa ${MAX_MEDIA_FILES} tệp`)
      return
    }
    setIsUploadingMedia(true)
    onUploadingChange?.(true)
    try {
      const uploaded = await Promise.all(
        selected.map((file) => {
          if (file.type.startsWith('image/')) return uploadImage(file)
          if (file.type === 'application/pdf') return uploadPdf(file)
          return uploadVideo(file)
        })
      )
      draftMediaRef.current.push(...uploaded)
      setMedia((current) => [...current, ...uploaded])
    } catch (error) {
      toast.error(typeof error === 'string' ? error : 'Không thể tải tệp lên')
    } finally {
      setIsUploadingMedia(false)
      onUploadingChange?.(false)
    }
  }

  const removeMedia = async (
    file: UploadedImage | UploadedPdf | UploadedVideo
  ) => {
    setIsUploadingMedia(true)
    onUploadingChange?.(true)
    try {
      await deleteMediaFile(file)
      draftMediaRef.current = draftMediaRef.current.filter(
        (item) => item.id !== file.id || item.fileName !== file.fileName
      )
      setMedia((current) =>
        current.filter(
          (item) => item.id !== file.id || item.fileName !== file.fileName
        )
      )
      void queryClient.invalidateQueries({
        queryKey: ['examination-queue', 'list'],
      })
      toast.success('Đã xóa tệp')
    } catch (error) {
      toast.error(typeof error === 'string' ? error : 'Không thể xóa tệp')
    } finally {
      setIsUploadingMedia(false)
      onUploadingChange?.(false)
    }
  }

  const getQuantityError = (item: MedicineRow) => {
    if (item.quantity === undefined) return null
    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      return 'Số lượng phải là số nguyên từ 1 trở lên.'
    }
    if (!item.medicineId) return null
    const available = item.selectedMedicine?.totalQty ?? 0
    const prescribed = items
      .filter((row) => row.medicineId === item.medicineId)
      .reduce((total, row) => total + (row.quantity ?? 0), 0)
    return prescribed > available ? `Kho chỉ còn ${available}.` : null
  }

  const isValid = Boolean(
    patient.id &&
    !isUploadingMedia &&
    !save.isPending &&
    doctorName.trim() &&
    (!isExamination || diagnosis.trim()) &&
    (!isPharmacy ||
      !canEditPrescription ||
      items.some((item) => item.medicineId)) &&
    items
      .filter((item) => item.medicineId || item.quantity || item.instruction)
      .every(
        (item) =>
          item.medicineId &&
          item.medicineName.trim() &&
          Number.isInteger(item.quantity) &&
          (item.quantity ?? 0) >= 1 &&
          !getQuantityError(item)
      )
  )

  return (
    <div className='grid gap-6'>
      <form
        id={formId}
        className='grid gap-6'
        onSubmit={(event) => {
          event.preventDefault()
          if (isValid) {
            save.mutate()
          } else {
            toast.error('Vui lòng nhập đầy đủ thông tin bắt buộc')
          }
        }}
      >
        <div className='grid gap-6'>
          <Card>
            <CardHeader>
              <CardTitle>
                {isPharmacy
                  ? 'Thông tin bán thuốc'
                  : isVaccination
                    ? 'Thông tin người được tiêm'
                    : 'Thông tin lượt khám'}
              </CardTitle>
            </CardHeader>
            <CardContent className='grid gap-5 md:grid-cols-2'>
              <Field
                label={
                  isPharmacy
                    ? 'Khách hàng *'
                    : isVaccination
                      ? 'Người được tiêm *'
                      : 'Bệnh nhân *'
                }
              >
                <Input
                  value={`${patient.fullName}${
                    patient.dateOfBirth
                      ? ` · ${new Date(patient.dateOfBirth).toLocaleDateString('vi-VN')}`
                      : ''
                  }`}
                  disabled
                />
              </Field>
              <Field
                label={isExamination ? 'Bác sĩ khám *' : 'Người lập phiếu *'}
                htmlFor={formId + '-doctorName'}
              >
                <Input
                  id={formId + '-doctorName'}
                  value={doctorName}
                  placeholder='Họ và tên bác sĩ'
                  maxLength={255}
                  disabled
                  required
                />
              </Field>
              {isExamination && (
                <>
                  <Field
                    className='md:col-span-2'
                    label='Triệu chứng'
                    htmlFor={formId + '-symptoms'}
                  >
                    <Textarea
                      id={formId + '-symptoms'}
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                    />
                  </Field>
                  <Field
                    className='md:col-span-2'
                    label='Chẩn đoán *'
                    htmlFor={formId + '-diagnosis'}
                  >
                    <Textarea
                      id={formId + '-diagnosis'}
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      placeholder='Nhập kết luận chẩn đoán của bác sĩ'
                      required
                    />
                  </Field>
                  <Field label='Hướng điều trị' htmlFor={formId + '-treatment'}>
                    <Textarea
                      id={formId + '-treatment'}
                      value={treatment}
                      onChange={(e) => setTreatment(e.target.value)}
                    />
                  </Field>
                </>
              )}
              <Field
                className='md:col-span-2'
                label='Ghi chú hồ sơ'
                htmlFor={formId + '-note'}
              >
                <Textarea
                  id={formId + '-note'}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </Field>
              <Field
                className='md:col-span-2'
                label={
                  isExamination ? 'Lời dặn của bác sĩ' : 'Hướng dẫn và lịch hẹn'
                }
                htmlFor={formId + '-advice'}
              >
                <Textarea
                  id={formId + '-advice'}
                  value={advice}
                  onChange={(e) => setAdvice(e.target.value)}
                  placeholder='Chế độ ăn uống, sinh hoạt và lịch tái khám...'
                />
              </Field>
              {canUseDiagnosisMedia ? (
                <div className='grid gap-3 md:col-span-2'>
                  <div>
                    <Label htmlFor={formId + '-diagnosis-media'}>
                      {isPharmacy ? 'Đơn thuốc đính kèm' : 'Tệp hồ sơ'}
                    </Label>
                    <p className='mt-1 text-xs text-muted-foreground'>
                      Tối đa {MAX_MEDIA_FILES} tệp. Ảnh/PDF không quá 5 MB;
                      video MP4, WebM hoặc MOV không quá 100 MB.
                    </p>
                  </div>
                  <label
                    htmlFor={formId + '-diagnosis-media'}
                    className='flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-center transition-colors hover:bg-muted/50'
                  >
                    <ImagePlus className='size-7 text-muted-foreground' />
                    <span className='text-sm font-medium'>
                      Chọn ảnh, PDF hoặc video
                    </span>
                    <span className='text-xs text-muted-foreground'>
                      {isUploadingMedia
                        ? 'Đang tải tệp...'
                        : `Đã tải ${media.length}/${MAX_MEDIA_FILES} tệp`}
                    </span>
                  </label>
                  <Input
                    id={formId + '-diagnosis-media'}
                    className='sr-only'
                    type='file'
                    accept='image/jpeg,image/png,application/pdf,video/mp4,video/webm,video/quicktime'
                    multiple
                    disabled={isUploadingMedia}
                    onChange={(event) => {
                      event.currentTarget.blur()
                      void addMedia(event.target.files)
                      event.target.value = ''
                    }}
                  />
                  {media.length > 0 && (
                    <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'>
                      {media.map((file, index) => (
                        <MediaPreview
                          key={`${file.url}-${index}`}
                          media={file}
                          onRemove={() => void removeMedia(file)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className='rounded-lg border border-dashed p-4 text-sm text-muted-foreground md:col-span-2'>
                  Đính kèm hình ảnh, PDF và video thuộc gói Plus hoặc Pro.
                </div>
              )}
            </CardContent>
          </Card>

          {showVaccination && (
            <Card>
              <CardHeader>
                <CardTitle>Thông tin tiêm</CardTitle>
              </CardHeader>
              <CardContent className='grid gap-4 md:grid-cols-2'>
                {(
                  [
                    ['temperature', 'Nhiệt độ (°C)'],
                    ['bloodPressure', 'Huyết áp (mmHg)'],
                    ['doseNumber', 'Mũi số'],
                    ['dose', 'Liều dùng'],
                    ['route', 'Đường tiêm'],
                    ['site', 'Vị trí tiêm'],
                  ] as const
                ).map(([key, label]) => (
                  <Field key={key} label={label} htmlFor={formId + '-' + key}>
                    <Input
                      id={formId + '-' + key}
                      maxLength={255}
                      placeholder={
                        key === 'temperature'
                          ? 'Ví dụ: 36,5'
                          : key === 'bloodPressure'
                            ? 'Ví dụ: 120/80'
                            : undefined
                      }
                      value={vaccination[key] ?? ''}
                      onChange={(event) =>
                        setVaccination((current) => ({
                          ...current,
                          [key]: event.target.value,
                        }))
                      }
                    />
                  </Field>
                ))}
                <Field label='Người tiêm' htmlFor={formId + '-administeredBy'}>
                  <Select
                    value={
                      selectedStaffId ??
                      (vaccination.administeredBy ? '__legacy__' : '')
                    }
                    onValueChange={(id) => {
                      const staff =
                        staffOptions.find((user) => user.id === id) ??
                        (id === currentUser?.id ? currentUser : undefined)
                      setVaccination((current) => ({
                        ...current,
                        administeredById: staff?.id,
                        administeredBy: staff?.fullName,
                      }))
                    }}
                  >
                    <SelectTrigger id={formId + '-administeredBy'}>
                      <SelectValue placeholder='Chọn người tiêm' />
                    </SelectTrigger>
                    <SelectContent>
                      {vaccination.administeredBy && !selectedStaffId && (
                        <SelectItem value='__legacy__' disabled>
                          {vaccination.administeredBy} (đã lưu)
                        </SelectItem>
                      )}
                      {selectedStaffId &&
                        !staffOptions.some(
                          (user) => user.id === selectedStaffId
                        ) && (
                          <SelectItem value={selectedStaffId}>
                            {vaccination.administeredBy ?? doctorName}
                          </SelectItem>
                        )}
                      {staffOptions.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.fullName}
                          {user.id === currentUser?.id ? ' (bạn)' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {vaccinationStaff.isError && (
                    <p className='text-xs text-destructive'>
                      Không tải được danh sách nhân sự.{' '}
                      <button
                        type='button'
                        className='underline'
                        onClick={() => void vaccinationStaff.refetch()}
                      >
                        Thử lại
                      </button>
                    </p>
                  )}
                </Field>
                {(
                  [
                    ['expiryDate', 'Hạn dùng'],
                    ['administeredDate', 'Ngày tiêm'],
                    ['nextDoseDate', 'Hẹn mũi tiếp theo'],
                  ] as const
                ).map(([key, label]) => (
                  <Field key={key} label={label} htmlFor={formId + '-' + key}>
                    <DatePickerInput
                      id={formId + '-' + key}
                      value={vaccination[key] ?? ''}
                      onChange={(value) =>
                        setVaccination((current) => ({
                          ...current,
                          [key]: value || undefined,
                        }))
                      }
                    />
                  </Field>
                ))}
              </CardContent>
            </Card>
          )}
          {canEditPrescription ? (
            <>
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
                    <div
                      key={item.key}
                      className='grid gap-4 rounded-lg border p-4'
                    >
                      <div className='flex items-center justify-between'>
                        <p className='font-medium'>Thuốc {index + 1}</p>
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          onClick={() =>
                            setItems((rows) =>
                              rows.filter((row) => row.key !== item.key)
                            )
                          }
                        >
                          <Trash2 />
                          <span className='sr-only'>Xóa thuốc</span>
                        </Button>
                      </div>
                      {item.selectedMedicine && (
                        <p className='text-sm text-muted-foreground'>
                          Đơn giá:{' '}
                          {Number(
                            item.selectedMedicine.salePrice
                          ).toLocaleString('vi-VN')}{' '}
                          đ{' · '}Thành tiền:{' '}
                          {(
                            Number(item.selectedMedicine.salePrice) *
                            (item.quantity ?? 0)
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
                          {!getQuantityError(item) && (
                            <span aria-hidden='true' />
                          )}
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
                              <SelectItem value='__none__'>
                                Không có hướng dẫn
                              </SelectItem>
                              {item.instruction &&
                                !instructionOptions.includes(
                                  item.instruction
                                ) && (
                                  <SelectItem value={item.instruction}>
                                    {item.instruction}
                                  </SelectItem>
                                )}
                              {instructionOptions.map((instruction) => (
                                <SelectItem
                                  key={instruction}
                                  value={instruction}
                                >
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
                    <Plus />{' '}
                    {isVaccination ? 'Thêm vắc xin / thuốc' : 'Thêm thuốc'}
                  </Button>
                </CardContent>
              </Card>
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
                      <p className='text-xs opacity-80'>
                        Đã bao gồm tất cả khoản phí
                      </p>
                    </div>
                    <p className='text-2xl font-bold tabular-nums'>
                      {invoiceTotal.toLocaleString('vi-VN')} ₫
                    </p>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <p className='rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground'>
              Hồ sơ này chưa có phiếu thuốc hoặc hóa đơn. Bạn có thể cập nhật
              thông tin hồ sơ; phần thuốc và chi phí không áp dụng.
            </p>
          )}
        </div>
      </form>
    </div>
  )
}

function deleteMediaFile(
  file: UploadedImage | UploadedPdf | UploadedVideo
): Promise<void> {
  if (file.mimeType.startsWith('image/')) return deleteImage(file.fileName)
  if (file.mimeType === 'application/pdf') return deletePdf(file.fileName)
  return deleteVideo(file.fileName)
}

function AutomaticFee({
  label,
  value,
  note,
}: {
  label: string
  value: number
  note: string
}) {
  return (
    <div className='rounded-lg border bg-muted/30 p-4'>
      <p className='text-sm text-muted-foreground'>{label}</p>
      <p className='mt-1 text-xl font-semibold tabular-nums'>
        {value.toLocaleString('vi-VN')} ₫
      </p>
      <p className='mt-1 text-xs text-muted-foreground'>{note}</p>
    </div>
  )
}

function OtherFeeField({
  index,
  title,
  label,
  amount,
  onLabelChange,
  onAmountChange,
}: {
  index: number | string
  title: string
  label: string
  amount: number
  onLabelChange: (value: string) => void
  onAmountChange: (value: number) => void
}) {
  return (
    <div className='grid gap-2 rounded-lg border p-3'>
      <Label htmlFor={`other-fee-label-${index}`}>{title}</Label>
      <Input
        id={`other-fee-label-${index}`}
        value={label}
        maxLength={255}
        placeholder='Nội dung khoản thu'
        onChange={(event) => onLabelChange(event.target.value)}
      />
      <div className='relative'>
        <Input
          type='text'
          inputMode='numeric'
          value={amount.toLocaleString('vi-VN')}
          className='pe-10 text-end tabular-nums'
          onChange={(event) => {
            const digits = event.target.value.replace(/\D/g, '')
            onAmountChange(digits ? Number(digits) : 0)
          }}
        />
        <span className='pointer-events-none absolute inset-y-0 end-3 flex items-center text-sm text-muted-foreground'>
          ₫
        </span>
      </div>
    </div>
  )
}

function MedicinePicker({
  selected,
  onChange,
}: {
  selected?: Medicine
  onChange: (medicine: Medicine) => void
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const medicines = useQuery({
    queryKey: ['prescription-medicines', debouncedSearch],
    queryFn: () => getMedicines(debouncedSearch),
    enabled: open,
  })

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type='button'
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className='w-full justify-between font-normal'
        >
          <span className='truncate'>
            {selected
              ? `${selected.name} · ${selected.strength} (${selected.unit}) · Tồn ${selected.totalQty}`
              : medicines.isLoading
                ? 'Đang tải...'
                : 'Chọn thuốc'}
          </span>
          <ChevronsUpDown className='ms-2 size-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className='w-[var(--radix-popover-trigger-width)] p-0'
        align='start'
      >
        <Command shouldFilter={false}>
          <CommandInput
            value={search}
            onValueChange={setSearch}
            placeholder='Tìm tên thuốc...'
          />
          <CommandList>
            <CommandEmpty>Không tìm thấy thuốc.</CommandEmpty>
            <CommandGroup>
              {(medicines.data ?? []).map((medicine) => (
                <CommandItem
                  key={medicine.id}
                  value={`${medicine.name} ${medicine.strength}`}
                  disabled={medicine.totalQty < 1}
                  onSelect={() => {
                    onChange(medicine)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      'size-4',
                      medicine.id === selected?.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <span className='min-w-0 flex-1 truncate'>
                    {medicine.name} · {medicine.strength} ({medicine.unit})
                  </span>
                  <span className='ms-auto text-xs text-muted-foreground'>
                    {medicine.salePrice.toLocaleString('vi-VN')} ₫ · Tồn:{' '}
                    {medicine.totalQty}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

function MediaPreview({
  media,
  onRemove,
}: {
  media: UploadedImage | UploadedPdf | UploadedVideo
  onRemove: () => void
}) {
  const isPdf = media.mimeType === 'application/pdf'
  const isVideo =
    media.mimeType.startsWith('video/') ||
    media.mimeType === 'application/vnd.apple.mpegurl'

  return (
    <div className='group relative aspect-square overflow-hidden rounded-lg border bg-muted'>
      {isPdf ? (
        <div className='flex size-full flex-col items-center justify-center gap-2 p-3 text-center'>
          <FileText className='size-9 text-red-500' />
          <span className='line-clamp-2 text-xs font-medium'>{media.name}</span>
          <span className='text-xs text-muted-foreground'>
            {(media.size / 1024 / 1024).toFixed(1)} MB
          </span>
        </div>
      ) : isVideo ? (
        <video
          src={media.url}
          className='size-full object-cover'
          controls
          preload='metadata'
        >
          Trình duyệt không hỗ trợ phát video.
        </video>
      ) : (
        <img
          src={media.url}
          alt={media.name}
          className='size-full object-cover'
        />
      )}
      <Button
        type='button'
        variant='destructive'
        size='icon'
        className='absolute top-1 right-1 size-7'
        onClick={onRemove}
      >
        <X className='size-4' />
        <span className='sr-only'>Xóa tệp {media.name}</span>
      </Button>
      <div className='absolute inset-x-0 bottom-0 truncate bg-black/60 px-2 py-1 text-xs text-white'>
        {media.name}
      </div>
    </div>
  )
}

function Field({
  label,
  className,
  htmlFor,
  children,
}: {
  label: string
  className?: string
  htmlFor?: string
  children: React.ReactNode
}) {
  const required = label.endsWith(' *')

  return (
    <div className={`grid gap-2 ${className ?? ''}`}>
      <Label htmlFor={htmlFor}>
        {required ? label.slice(0, -2) : label}
        {required && <span className='text-destructive'> *</span>}
      </Label>
      {children}
    </div>
  )
}
