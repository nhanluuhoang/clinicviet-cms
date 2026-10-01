import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { API_URL } from '@/config'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { deleteMediaFile } from '@/lib/utils'
import {
  uploadImage,
  uploadPdf,
  uploadVideo,
  type UploadedImage,
  type UploadedPdf,
  type UploadedVideo,
} from '@/features/examination-queue/api'
import { GetMasterDatas } from '@/features/master-data/api'
import { type PrescriptionTemplate } from '@/features/prescription-templates/api'
import {
  createPrescription,
  getVaccinationStaff,
  getVaccinationFields,
  updatePrescription,
  getMedicines,
  type VaccinationInput,
} from '../api'
import {
  emptyMedicine,
  MAX_MEDIA_FILES,
  MAX_MEDIA_FILE_SIZE,
  MAX_VIDEO_SIZE,
  ACCEPTED_MEDIA_TYPES,
  INSTRUCTION_OPTIONS,
} from '../data/constants'
import type { MedicineRow, ServicePrescriptionFormProps } from '../types'

export function useServicePrescriptionForm({
  patient,
  examinationQueueId,
  initialData,
  formId = 'prescription-form',
  serviceType,
  onSavingChange,
  onSaved,
  onUploadingChange,
}: ServicePrescriptionFormProps) {
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
          ...(!initialData?.id && examinationQueueId
            ? { examinationQueueId }
            : {}),
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
  return {
    patient,
    formId,
    currentUser,
    doctorName,
    canEditPrescription,
    canUseDiagnosisMedia,
    vaccination,
    setVaccination,
    isExamination,
    isPharmacy,
    isVaccination,
    showVaccination,
    symptoms,
    setSymptoms,
    diagnosis,
    setDiagnosis,
    treatment,
    setTreatment,
    note,
    setNote,
    advice,
    setAdvice,
    media,
    isUploadingMedia,
    items,
    setItems,
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
    vaccinationStaff,
    staffOptions,
    selectedStaffId,
    applyTemplate,
    consultationFee,
    instructionOptions,
    medicineFee,
    invoiceTotal,
    save,
    updateItem,
    addItem,
    addMedia,
    removeMedia,
    getQuantityError,
    isValid,
  }
}

export type ServicePrescriptionFormState = ReturnType<
  typeof useServicePrescriptionForm
>
