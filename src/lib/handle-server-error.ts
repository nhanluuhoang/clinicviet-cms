import { toast } from 'sonner'
import { getApiErrorMessage } from './axios'

export function showRequestError(error: unknown, fallback: string) {
  if (getApiErrorMessage(error)) return
  toast.error(typeof error === 'string' ? error : fallback)
}
