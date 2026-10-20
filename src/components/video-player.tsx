import { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'

export function VideoPlayer({
  src,
  className,
}: {
  src: string
  className?: string
}) {
  return <HlsVideo key={src} src={src} className={className} />
}

function HlsVideo({ src, className }: { src: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState(false)
  useEffect(() => {
    const video = ref.current
    if (!video) return
    let hls: Hls | undefined
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src
    } else if (Hls.isSupported()) {
      hls = new Hls({
        xhrSetup: (xhr) => {
          xhr.withCredentials = true
        },
      })
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          setError(true)
          hls?.destroy()
        }
      })
      hls.loadSource(src)
      hls.attachMedia(video)
    } else {
      video.src = src
    }
    return () => {
      hls?.destroy()
      video.removeAttribute('src')
      video.load()
    }
  }, [src])
  return (
    <>
      <video
        ref={ref}
        className={className}
        controls
        playsInline
        preload='metadata'
        crossOrigin='use-credentials'
        onError={() => setError(true)}
      />
      {error && (
        <p role='alert' className='p-2 text-xs text-destructive'>
          Không thể phát video. Vui lòng tải lại trang hoặc thử trình duyệt
          khác.
        </p>
      )}
    </>
  )
}
