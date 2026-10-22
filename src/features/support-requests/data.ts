import { z } from 'zod'
import i18n from '@/i18n'

export const typeLabels = {
  get BUG() {
    return i18n.t('messages.bugReport')
  },
  get FEATURE() {
    return i18n.t('messages.featureRequest')
  },
  get GENERAL() {
    return i18n.t('messages.generalSupport')
  },
}
export const statusLabels = {
  get NEW() {
    return i18n.t('messages.new')
  },
  get IN_PROGRESS() {
    return i18n.t('messages.inProgress')
  },
  get NEEDS_INFO() {
    return i18n.t('messages.moreInformationNeeded')
  },
  get COMPLETED() {
    return i18n.t('messages.finish')
  },
  get DECLINED() {
    return i18n.t('messages.declined')
  },
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
    .array(z.enum(['BUG', 'FEATURE', 'GENERAL']))
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
