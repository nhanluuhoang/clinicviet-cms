import Axios, {
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'
import { API_URL } from '@/config'

let csrfToken: string | null = null
let csrfTokenRequest: Promise<string> | null = null

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
    const message = error.response?.data || error.message
    return Promise.reject(message)
  }
)
