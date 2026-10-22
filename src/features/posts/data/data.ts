import i18n from '@/i18n'
import { CircleCheck, CircleX } from 'lucide-react'

export const postStatuses = [
  {
    get label() {
      return i18n.t('messages.published')
    },
    value: true,
    icon: CircleCheck,
  },
  {
    get label() {
      return i18n.t('messages.draft')
    },
    value: false,
    icon: CircleX,
  },
]
