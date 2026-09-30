import Axios, {
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'
import { API_URL } from '@/config'
import { toast } from 'sonner'

let csrfToken: string | null = null
let csrfTokenRequest: Promise<string> | null = null

type ApiErrorPayload = {
  error?: { title?: string }
  message?: string | string[]
}

const showApiError = (error: unknown) => {
  if (!Axios.isAxiosError<ApiErrorPayload>(error) || !error.response) return

  const { status, data: payload } = error.response
  const requestUrl = error.config?.url ?? ''
  // Profile checks use 401 to determine whether a session exists and redirect
  // to sign-in, so only that expected control flow is silent.
  if (status === 401 && requestUrl.endsWith('/auth/profile')) return

  const message =
    payload?.error?.title ??
    (Array.isArray(payload?.message)
      ? payload.message.join(', ')
      : payload?.message)

  if (message) toast.error(message, { id: 'api-error' })
}

const getCsrfToken = async (): Promise<string> => {
  if (csrfToken) return csrfToken
  if (!csrfTokenRequest) {
    csrfTokenRequest = Axios.get<{ csrfToken: string }>(
      `${API_URL}/auth/csrf`,
      {
        withCredentials: true,
        headers: { Accept: 'application/json' },
      }
    )
      .then(({ data }) => {
        csrfToken = data.csrfToken
        return data.csrfToken
      })
      .catch((error: unknown) => {
        showApiError(error)
        throw error
      })
      .finally(() => {
        csrfTokenRequest = null
      })
  }
  return csrfTokenRequest
}

const authRequestInterceptor = async (
  config: InternalAxiosRequestConfig
): Promise<InternalAxiosRequestConfig> => {
  config.headers.Accept = 'application/json'

  if (!config.headers['Content-Type'])
    config.headers['Content-Type'] = 'application/json'

  const method = config.method?.toUpperCase()
  if (method && !['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    config.headers['x-csrf-token'] = await getCsrfToken()
  }

  return config
}

export const axios = Axios.create({
  baseURL: API_URL,
  withCredentials: true,
})

axios.interceptors.request.use(authRequestInterceptor)

axios.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data
  },
  (error) => {
    showApiError(error)
    return Promise.reject(error)
  }
)
