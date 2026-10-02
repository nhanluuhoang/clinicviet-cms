import { createFileRoute } from '@tanstack/react-router'
import { SupportRequests } from '@/features/support-requests'
import { supportSearchSchema } from '@/features/support-requests/data'

export const Route = createFileRoute('/_authenticated/support-requests')({
  validateSearch: supportSearchSchema,
  component: SupportRequests,
})
