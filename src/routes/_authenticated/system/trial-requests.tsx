import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { TrialRequests } from '@/features/trial-requests'

export const Route = createFileRoute('/_authenticated/system/trial-requests')({
  validateSearch: z.object({
    page: z.number().int().min(1).optional().catch(1),
    pageSize: z.number().int().min(1).max(100).optional().catch(10),
    sort: z.string().optional().catch(''),
    filter: z.string().optional().catch(''),
    status: z.array(z.string()).optional().catch([]),
    source: z.array(z.string()).optional().catch([]),
  }),
  component: TrialRequests,
})
