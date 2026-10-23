import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Reminders } from '@/features/reminders'

export const Route = createFileRoute('/_authenticated/reminders/')({
  validateSearch: z.object({
    page: z.number().int().min(1).optional().catch(1),
    pageSize: z.number().int().min(1).max(100).optional().catch(10),
    filter: z.string().optional().catch(''),
    sort: z
      .enum(['appointmentDate', '-appointmentDate'])
      .optional()
      .catch(undefined),
    dateFrom: z
      .union([z.iso.date(), z.literal('')])
      .optional()
      .catch(undefined),
    dateTo: z.iso.date().optional().catch(undefined),
    serviceType: z
      .array(z.enum(['EXAMINATION', 'VACCINATION']))
      .max(1)
      .optional()
      .catch([]),
    due: z
      .array(z.enum(['OVERDUE', 'TODAY', 'UPCOMING']))
      .max(1)
      .optional()
      .catch([]),
  }),
  component: Reminders,
})
