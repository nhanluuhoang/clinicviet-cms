import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Tenants } from '@/features/tenants'

export const Route = createFileRoute('/_authenticated/system/tenants')({
  validateSearch: z.object({
    page: z.number().optional().catch(1),
    pageSize: z.number().optional().catch(10),
    sort: z.string().optional().catch(''),
    filter: z.string().optional().catch(''),
    servicePlan: z.array(z.string()).optional().catch([]),
    subscriptionStatus: z.array(z.string()).optional().catch([]),
  }),
  component: Tenants,
})
