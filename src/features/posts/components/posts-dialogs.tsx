import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { showRequestError } from '@/lib/handle-server-error'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { DeletePost } from '@/features/posts/api'
import { PostsMutateDialog } from '@/features/posts/components/posts-mutate-dialog'
import { usePosts } from '@/features/posts/components/posts-provider'

export function PostsDialogs() {
  const { t } = useTranslation()

  const { open, setOpen, currentRow, setCurrentRow } = usePosts()
  const queryClient = useQueryClient()

  const handleDelete = async () => {
    if (!currentRow) return
    try {
      await DeletePost(currentRow.id)
      toast.success(t('messages.postDeleted'))
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      setOpen(null)
      setTimeout(() => setCurrentRow(undefined), 500)
    } catch (error) {
      showRequestError(error, t('messages.couldNotDeletePost'))
    }
  }

  return (
    <>
      <PostsMutateDialog
        key='post-create'
        open={open === 'create'}
        onOpenChange={(v) => {
          if (!v) setOpen(null)
        }}
      />

      {currentRow && (
        <>
          <PostsMutateDialog
            key={`post-update-${currentRow.id}`}
            open={open === 'update'}
            onOpenChange={(v) => {
              if (!v) {
                setOpen(null)
                setTimeout(() => setCurrentRow(undefined), 500)
              }
            }}
            currentRow={currentRow}
          />

          <ConfirmDialog
            key='post-delete'
            destructive
            open={open === 'delete'}
            onOpenChange={(v: boolean) => {
              if (!v) {
                setOpen(null)
                setTimeout(() => setCurrentRow(undefined), 500)
              }
            }}
            className='max-w-md'
            title={t('messages.deletePost', { value0: currentRow.title })}
            desc={
              <>
                {t('messages.youAreAboutToDeleteThePost')}{' '}
                <strong>{currentRow.title}</strong>.
                <br />
                {t('messages.ifThisPostIsFeaturedDeselectItInTheWebsiteCon')}
                <br />
                {t('messages.thisCannotBeUndone')}
              </>
            }
            confirmText={t('messages.delete')}
            handleConfirm={handleDelete}
          />
        </>
      )}
    </>
  )
}
