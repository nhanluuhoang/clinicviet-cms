import { createFileRoute } from '@tanstack/react-router'
import { Diagnoses } from '@/features/diagnoses'
import { diagnosesSearchSchema } from '@/features/diagnoses/data'

export const Route = createFileRoute('/_authenticated/system/diagnoses')({
  validateSearch: diagnosesSearchSchema,
  component: Diagnoses,
})
