import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { ClinicStatistics } from '@/features/clinic-statistics'

export const Route = createFileRoute(
  '/_authenticated/system/clinic-statistics'
)({
  validateSearch: z.object({
    month: z
      .string()
      .regex(/^\d{4}-(0[1-9]|1[0-2])$/)
      .optional()
      .catch(undefined),
    clinicId: z.string().optional().catch(undefined),
    page: z.number().int().min(1).optional().catch(1),
    pageSize: z.number().int().min(1).max(100).optional().catch(10),
    sort: z
      .string()
      .regex(
        /^-?(code|name|examinationCount|totalAmount|medicineRevenue|medicineCost|createdAt)$/
      )
      .optional()
      .catch(''),
    filter: z.string().optional().catch(''),
  }),
  component: ClinicStatistics,
})
