import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Invoices } from '@/features/invoices'

export const Route = createFileRoute('/_authenticated/invoices/')({
  validateSearch: z.object({
    page: z.number().int().min(1).optional().catch(1),
    pageSize: z.number().int().min(1).max(100).optional().catch(10),
    filter: z.string().optional().catch(''),
    date: z.string().optional().catch(''),
    serviceType: z
      .array(z.enum(['EXAMINATION', 'PHARMACY', 'VACCINATION']))
      .max(1)
      .optional()
      .catch([]),
  }),
  component: Invoices,
})
