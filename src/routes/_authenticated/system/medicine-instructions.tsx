import { createFileRoute } from '@tanstack/react-router'
import { MedicineInstructions } from '@/features/medicine-instructions'
import { medicineInstructionsSearchSchema } from '@/features/medicine-instructions/data'

export const Route = createFileRoute(
  '/_authenticated/system/medicine-instructions'
)({
  validateSearch: medicineInstructionsSearchSchema,
  component: MedicineInstructions,
})
