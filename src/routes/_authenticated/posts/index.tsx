import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import Posts from '@/features/posts'

const postSearchSchema = z.object({
  page: z.number().int().min(1).optional().catch(1),
  pageSize: z.number().int().min(1).max(100).optional().catch(10),
  sort: z.string().optional().catch(''),
  isPublic: z.boolean().optional(),
  title: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/posts/')({
  validateSearch: postSearchSchema,
  component: Posts,
})
