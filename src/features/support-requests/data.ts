import { z } from 'zod'

export const typeLabels = { BUG: 'Báo lỗi', FEATURE: 'Đề xuất tính năng' }
export const statusLabels = {
  NEW: 'Mới gửi',
  IN_PROGRESS: 'Đang xử lý',
  NEEDS_INFO: 'Cần bổ sung',
  COMPLETED: 'Hoàn tất',
  DECLINED: 'Không thực hiện',
}
export const supportSearchSchema = z.object({
  page: z.number().int().min(1).optional().catch(1),
  pageSize: z.number().int().min(1).max(100).optional().catch(10),
  filter: z.string().optional().catch(''),
  sort: z
    .string()
    .regex(/^-?(title|type|status|createdAt|updatedAt)$/)
    .optional()
    .catch(''),
  type: z
    .array(z.enum(['BUG', 'FEATURE']))
    .max(1)
    .optional()
    .catch([]),
  status: z
    .array(
      z.enum(['NEW', 'IN_PROGRESS', 'NEEDS_INFO', 'COMPLETED', 'DECLINED'])
    )
    .max(1)
    .optional()
    .catch([]),
  tenantId: z.array(z.string().uuid()).max(1).optional().catch([]),
})
