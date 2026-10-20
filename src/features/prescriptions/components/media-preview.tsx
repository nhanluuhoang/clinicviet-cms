import { FileText, X } from 'lucide-react'
import { isVideoMedia } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { VideoPlayer } from '@/components/video-player'
import {
  type UploadedImage,
  type UploadedPdf,
  type UploadedVideo,
} from '@/features/examination-queue/api'

export function MediaPreview({
  media,
  onRemove,
  disabled = false,
}: {
  media: UploadedImage | UploadedPdf | UploadedVideo
  onRemove: () => void
  disabled?: boolean
}) {
  const isPdf = media.mimeType === 'application/pdf'
  const isVideo = isVideoMedia(media)

  return (
    <div className='group relative aspect-square overflow-hidden rounded-lg border bg-muted'>
      {isPdf ? (
        <a
          href={media.url}
          target='_blank'
          rel='noopener noreferrer'
          aria-label={`Mở PDF ${media.name} trong tab mới`}
          className='flex size-full flex-col items-center justify-center gap-2 p-3 pb-8 text-center hover:bg-muted/80 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-[-2px]'
        >
          <FileText className='size-9 text-red-500' />
          <span className='line-clamp-2 text-xs font-medium'>{media.name}</span>
          <span className='text-xs text-muted-foreground'>
            {media.size > 0
              ? media.size < 1024 * 1024
                ? `${Math.max(1, Math.round(media.size / 1024))} KB`
                : `${(media.size / 1024 / 1024).toFixed(1)} MB`
              : 'Mở PDF'}
          </span>
        </a>
      ) : isVideo ? (
        <VideoPlayer
          src={media.url}
          className='size-full bg-black object-contain'
        />
      ) : (
        <a
          href={media.url}
          target='_blank'
          rel='noopener noreferrer'
          aria-label={`Mở ảnh ${media.name} trong tab mới`}
          className='block size-full focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-[-2px]'
        >
          <img
            src={media.url}
            alt={media.name}
            className='size-full object-cover'
          />
        </a>
      )}
      <Button
        type='button'
        variant='destructive'
        size='icon'
        className='absolute top-1 right-1 size-7'
        onClick={onRemove}
        disabled={disabled}
      >
        <X className='size-4' />
        <span className='sr-only'>Xóa tệp {media.name}</span>
      </Button>
      <div className='pointer-events-none absolute inset-x-0 bottom-0 truncate bg-black/60 px-2 py-1 text-xs text-white'>
        {media.name}
      </div>
    </div>
  )
}
