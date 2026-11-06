import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { SystemUsers } from '@/features/system-users'

export const Route = createFileRoute('/_authenticated/system/users')({
  validateSearch: z.object({
    page: z.number().int().min(1).optional().catch(1),
    pageSize: z.number().int().min(1).max(100).optional().catch(10),
    sort: z.string().optional().catch(''),
    filter: z.string().optional().catch(''),
    tenantId: z.array(z.string()).optional().catch([]),
    role: z.array(z.string()).optional().catch([]),
  }),
  component: SystemUsers,
})
