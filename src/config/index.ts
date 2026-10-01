const configuredApiUrl = import.meta.env.VITE_APP_API_URL
const isLocalApi =
  /^https?:\/\/(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?(?:\/|$)/.test(
    configuredApiUrl ?? ''
  )
const API_URL = import.meta.env.DEV && isLocalApi ? '/api' : configuredApiUrl

export { API_URL }
