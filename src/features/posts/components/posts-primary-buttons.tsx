import { PlusIcon } from '@radix-ui/react-icons'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { usePosts } from './posts-provider'

export function PostsPrimaryButtons() {
  const { t } = useTranslation()

  const { setOpen } = usePosts()

  return (
    <div className='flex gap-2'>
      <Button className='gap-2' onClick={() => setOpen('create')}>
        <PlusIcon className='h-4 w-4' /> {t('messages.createPost')}
      </Button>
    </div>
  )
}
