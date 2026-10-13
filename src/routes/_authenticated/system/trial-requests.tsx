import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { TrialRequests } from '@/features/trial-requests'

export const Route = createFileRoute('/_authenticated/system/trial-requests')({
  validateSearch: z.object({
    page: z.number().optional().catch(1),
    pageSize: z.number().optional().catch(10),
    sort: z.string().optional().catch(''),
    filter: z.string().optional().catch(''),
    status: z.array(z.string()).optional().catch([]),
  }),
  component: TrialRequests,
})
