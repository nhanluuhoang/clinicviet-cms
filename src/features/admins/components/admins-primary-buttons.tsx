import { UserPlus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { useAdmins } from './admins-provider'

export function AdminsPrimaryButtons() {
  const { t } = useTranslation()

  const { setOpen } = useAdmins()
  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>{t('messages.addStaffMember')}</span> <UserPlus size={18} />
      </Button>
    </div>
  )
}
