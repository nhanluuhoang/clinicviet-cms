import { createFileRoute } from '@tanstack/react-router'
import { TrialRequests } from '@/features/trial-requests'

export const Route = createFileRoute('/_authenticated/system/trial-requests')({
  component: TrialRequests,
})
