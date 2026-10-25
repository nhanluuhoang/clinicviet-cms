import { z } from 'zod'

export const diagnosesSearchSchema = z.object({
  page: z.number().int().min(1).optional().catch(1),
  pageSize: z.number().int().min(1).max(100).optional().catch(10),
  filter: z.string().optional().catch(''),
  sort: z.enum(['name', '-name']).optional().catch(undefined),
  scope: z
    .array(z.enum(['COMMON', 'CLINIC']))
    .max(1)
    .optional()
    .catch([]),
})
export type DiagnosesSearch = z.infer<typeof diagnosesSearchSchema>
