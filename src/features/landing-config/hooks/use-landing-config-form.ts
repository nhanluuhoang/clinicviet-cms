import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { GetPosts } from '@/features/posts/api'
import { updateOwnTenant } from '@/features/settings/tenant/api'
import {
  getLandingConfig,
  updateLandingConfig,
  type LandingConfigFields,
} from '../api'
import { emptyConfig } from '../data/constants'

export function useLandingConfigForm() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['landing-config'],
    queryFn: getLandingConfig,
  })

  const { data: publishedPosts } = useQuery({
    queryKey: ['posts', 'landing-featured'],
    queryFn: () => GetPosts({ page: 1, limit: 100, isPublic: true }),
  })

  const [config, setConfig] = useState(emptyConfig)

  const [clinicName, setClinicName] = useState('')

  useEffect(() => {
    if (!data) return
    const { tenant: _tenant, version: _version, ...fields } = data
    // Form state is initialized when the asynchronous configuration arrives.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConfig(fields)
    setClinicName(data.tenant.name)
  }, [data])

  const mutation = useMutation({
    mutationFn: async (landingConfig: LandingConfigFields) => {
      await updateOwnTenant({ name: clinicName.trim() })
      await updateLandingConfig(landingConfig)
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['landing-config'] }),
        queryClient.invalidateQueries({ queryKey: ['tenant', 'me'] }),
        queryClient.invalidateQueries({ queryKey: ['auth', 'profile'] }),
      ])
      toast.success('Đã lưu cấu hình landing page')
    },
    onError: () => toast.error('Không thể lưu cấu hình landing page'),
  })

  const set = <K extends keyof LandingConfigFields>(
    key: K,
    value: LandingConfigFields[K]
  ) => setConfig((current) => ({ ...current, [key]: value }))
  return {
    data,
    isLoading,
    publishedPosts,
    config,
    clinicName,
    setClinicName,
    mutation,
    set,
  }
}
export type LandingConfigFormState = ReturnType<typeof useLandingConfigForm>
