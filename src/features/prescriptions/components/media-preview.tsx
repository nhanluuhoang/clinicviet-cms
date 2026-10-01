import { FileText, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  type UploadedImage,
  type UploadedPdf,
  type UploadedVideo,
} from '@/features/examination-queue/api'

export function MediaPreview({
  media,
  onRemove,
}: {
  media: UploadedImage | UploadedPdf | UploadedVideo
  onRemove: () => void
}) {
  const isPdf = media.mimeType === 'application/pdf'
  const isVideo =
    media.mimeType.startsWith('video/') ||
    media.mimeType === 'application/vnd.apple.mpegurl'

  return (
    <div className='group relative aspect-square overflow-hidden rounded-lg border bg-muted'>
      {isPdf ? (
        <div className='flex size-full flex-col items-center justify-center gap-2 p-3 text-center'>
          <FileText className='size-9 text-red-500' />
          <span className='line-clamp-2 text-xs font-medium'>{media.name}</span>
          <span className='text-xs text-muted-foreground'>
            {(media.size / 1024 / 1024).toFixed(1)} MB
          </span>
        </div>
      ) : isVideo ? (
        <video
          src={media.url}
          className='size-full object-cover'
          controls
          preload='metadata'
        >
          Trình duyệt không hỗ trợ phát video.
        </video>
      ) : (
        <img
          src={media.url}
          alt={media.name}
          className='size-full object-cover'
        />
      )}
      <Button
        type='button'
        variant='destructive'
        size='icon'
        className='absolute top-1 right-1 size-7'
        onClick={onRemove}
      >
        <X className='size-4' />
        <span className='sr-only'>Xóa tệp {media.name}</span>
      </Button>
      <div className='absolute inset-x-0 bottom-0 truncate bg-black/60 px-2 py-1 text-xs text-white'>
        {media.name}
      </div>
    </div>
  )
}
