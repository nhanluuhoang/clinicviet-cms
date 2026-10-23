import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSearch } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { showRequestError } from '@/lib/handle-server-error'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { deleteDiagnosis, getDiagnoses, type Diagnosis } from './api'
import { DiagnosesTable } from './components/diagnoses-table'
import { DiagnosisDialog } from './components/diagnosis-dialog'
import type { DiagnosesSearch } from './data'

export function Diagnoses() {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.auth.user)
  const common = user?.role === 'SUPER_ADMIN'
  const search = useSearch({ strict: false }) as DiagnosesSearch
  const [editing, setEditing] = useState<Diagnosis | null | undefined>(
    undefined
  )
  const [removing, setRemoving] = useState<Diagnosis | null>(null)
  const queryClient = useQueryClient()
  const { data, isLoading, isError } = useQuery({
    queryKey: ['diagnoses', 'list', user?.tenantId, user?.role, common, search],
    enabled: Boolean(user),
    queryFn: () =>
      getDiagnoses({
        page: search.page ?? 1,
        limit: search.pageSize ?? 10,
        search: search.filter || undefined,
        scope: common ? 'COMMON' : search.scope?.[0],
        sort: search.sort,
      }),
  })
  const deletion = useMutation({
    mutationFn: (id: string) => deleteDiagnosis(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['diagnoses'] })
      toast.success(t('diagnoses.deleted'))
      setRemoving(null)
    },
    onError: (error) => showRequestError(error, t('diagnoses.deleteFailed')),
  })
  return (
    <>
      <Header fixed>
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      <Main className='flex min-w-0 flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-start justify-between gap-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              {t(common ? 'diagnoses.commonTitle' : 'diagnoses.title')}
            </h2>
            <p className='text-muted-foreground'>
              {t(common ? 'diagnoses.commonHint' : 'diagnoses.description')}
            </p>
          </div>
          <Button onClick={() => setEditing(null)}>
            <Plus className='size-4' />
            {t('diagnoses.add')}
          </Button>
        </div>
        {isError && (
          <p role='alert' className='text-sm text-destructive'>
            {t('diagnoses.loadFailed')}
          </p>
        )}
        <DiagnosesTable
          data={data?.data ?? []}
          total={data?.total ?? 0}
          isLoading={isLoading}
          common={common}
          tenantId={user?.tenantId}
          onEdit={setEditing}
          onDelete={setRemoving}
        />
      </Main>
      {editing !== undefined && (
        <DiagnosisDialog
          key={editing?.id ?? 'new'}
          diagnosis={editing}
          common={common}
          onClose={() => setEditing(undefined)}
        />
      )}
      <ConfirmDialog
        open={Boolean(removing)}
        onOpenChange={(open) => {
          if (!open && !deletion.isPending) setRemoving(null)
        }}
        title={t('diagnoses.delete')}
        desc={t('diagnoses.deleteConfirm', { name: removing?.name ?? '' })}
        destructive
        isLoading={deletion.isPending}
        handleConfirm={() => {
          if (removing && !deletion.isPending) deletion.mutate(removing.id)
        }}
      />
    </>
  )
}
