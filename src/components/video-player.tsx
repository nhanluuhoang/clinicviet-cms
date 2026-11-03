import { useEffect, useRef, useState } from 'react'
import type Hls from 'hls.js'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

const MAX_AUTO_RETRIES = 3

export function VideoPlayer({
  src,
  className,
}: {
  src: string
  className?: string
}) {
  useTranslation()

  return <HlsVideo key={src} src={src} className={className} />
}

function HlsVideo({ src, className }: { src: string; className?: string }) {
  const { t } = useTranslation()

  const ref = useRef<HTMLVideoElement>(null)
  const playback = useRef({ position: 0, resume: false })
  const retries = useRef(0)
  const [reload, setReload] = useState(0)
  const [status, setStatus] = useState<'ready' | 'retrying' | 'failed'>('ready')
  useEffect(() => {
    const video = ref.current
    if (!video) return
    let hls: Hls | undefined
    let cancelled = false
    let recoveryPending = false
    let restored = false
    let timer: ReturnType<typeof setTimeout> | undefined
    const resumePosition = playback.current.position

    const restart = () => {
      if (cancelled || !recoveryPending || !navigator.onLine) return
      recoveryPending = false
      clearTimeout(timer)
      retries.current += 1
      setReload((value) => value + 1)
    }
    const fail = (recoverable: boolean) => {
      if (cancelled || recoveryPending) return
      if (restored && Number.isFinite(video.currentTime)) {
        playback.current.position = video.currentTime
      }
      recoveryPending = true
      hls?.destroy()
      hls = undefined
      if (!recoverable || retries.current >= MAX_AUTO_RETRIES) {
        window.removeEventListener('online', restart)
        setStatus('failed')
        return
      }
      setStatus('retrying')
      timer = setTimeout(restart, 1000 * 2 ** retries.current)
    }
    const rememberPosition = () => {
      if (restored && Number.isFinite(video.currentTime)) {
        playback.current.position = video.currentTime
      }
    }
    const restorePlayback = () => {
      if (cancelled || recoveryPending || restored) return
      restored = true
      if (resumePosition > 0) {
        video.currentTime = Number.isFinite(video.duration)
          ? Math.min(resumePosition, video.duration)
          : resumePosition
      }
      setStatus('ready')
      if (playback.current.resume) {
        // Autoplay policy can require another click on the native play control.
        void video.play().catch(() => {})
      }
    }
    const onPlay = () => {
      playback.current.resume = true
    }
    const onPause = () => {
      if (restored && !recoveryPending && !video.error) {
        playback.current.resume = false
      }
    }
    const onError = () => {
      fail(
        video.error?.code === 2 || video.error?.code === 3 || !navigator.onLine
      )
    }
    video.addEventListener('loadedmetadata', restorePlayback)
    video.addEventListener('timeupdate', rememberPosition)
    video.addEventListener('play', onPlay)
    video.addEventListener('pause', onPause)
    video.addEventListener('error', onError)
    window.addEventListener('online', restart)
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src
    } else {
      void import('hls.js')
        .then(({ default: Hls }) => {
          if (cancelled || recoveryPending) return
          if (!Hls.isSupported()) {
            video.src = src
            return
          }
          hls = new Hls({
            startPosition: resumePosition,
            xhrSetup: (xhr) => {
              xhr.withCredentials = true
            },
          })
          hls.on(Hls.Events.ERROR, (_event, data) => {
            if (data.fatal) {
              const code = data.response?.code
              const retryableStatus =
                !code ||
                code < 400 ||
                code >= 500 ||
                code === 408 ||
                code === 429
              fail(
                retryableStatus &&
                  (data.type === Hls.ErrorTypes.NETWORK_ERROR ||
                    data.type === Hls.ErrorTypes.MEDIA_ERROR)
              )
            }
          })
          hls.loadSource(src)
          hls.attachMedia(video)
        })
        .catch(() => {
          fail(false)
        })
    }
    return () => {
      cancelled = true
      clearTimeout(timer)
      window.removeEventListener('online', restart)
      video.removeEventListener('loadedmetadata', restorePlayback)
      video.removeEventListener('timeupdate', rememberPosition)
      video.removeEventListener('play', onPlay)
      video.removeEventListener('pause', onPause)
      video.removeEventListener('error', onError)
      hls?.destroy()
      video.removeAttribute('src')
      video.load()
    }
  }, [src, reload])
  return (
    <>
      <video
        ref={ref}
        className={className}
        controls
        playsInline
        preload='metadata'
        crossOrigin='use-credentials'
      />
      {status === 'retrying' && (
        <p role='status' className='p-2 text-xs text-muted-foreground'>
          {t('messages.videoReconnecting')}
        </p>
      )}
      {status === 'failed' && (
        <div className='flex items-center gap-2 p-2'>
          <p role='alert' className='text-xs text-destructive'>
            {t('messages.videoPlaybackFailed')}
          </p>
          <Button
            type='button'
            size='sm'
            variant='outline'
            onClick={() => {
              retries.current = 0
              setStatus('retrying')
              setReload((value) => value + 1)
            }}
          >
            {t('messages.tryAgain')}
          </Button>
        </div>
      )}
    </>
  )
}
