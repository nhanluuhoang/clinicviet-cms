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
import {
  deleteMedicineInstruction,
  getMedicineInstructions,
  type MedicineInstruction,
} from './api'
import { MedicineInstructionDialog } from './components/medicine-instruction-dialog'
import { MedicineInstructionsTable } from './components/medicine-instructions-table'
import type { MedicineInstructionsSearch } from './data'

export function MedicineInstructions() {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.auth.user)
  const common = user?.role === 'SUPER_ADMIN'
  const search = useSearch({ strict: false }) as MedicineInstructionsSearch
  const [editing, setEditing] = useState<
    MedicineInstruction | null | undefined
  >(undefined)
  const [removing, setRemoving] = useState<MedicineInstruction | null>(null)
  const queryClient = useQueryClient()
  const { data, isLoading, isError } = useQuery({
    queryKey: [
      'medicineInstructions',
      'list',
      user?.tenantId,
      user?.role,
      common,
      search,
    ],
    enabled: Boolean(user),
    queryFn: () =>
      getMedicineInstructions({
        page: search.page ?? 1,
        limit: search.pageSize ?? 10,
        search: search.filter || undefined,
        scope: common ? 'COMMON' : search.scope?.[0],
        sort: search.sort,
      }),
  })
  const deletion = useMutation({
    mutationFn: (id: string) => deleteMedicineInstruction(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['medicineInstructions'],
      })
      toast.success(t('medicineInstructions.deleted'))
      setRemoving(null)
    },
    onError: (error) =>
      showRequestError(error, t('medicineInstructions.deleteFailed')),
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
              {t(
                common
                  ? 'medicineInstructions.commonTitle'
                  : 'medicineInstructions.title'
              )}
            </h2>
            <p className='text-muted-foreground'>
              {t(
                common
                  ? 'medicineInstructions.commonHint'
                  : 'medicineInstructions.description'
              )}
            </p>
          </div>
          <Button onClick={() => setEditing(null)}>
            <Plus className='size-4' />
            {t('medicineInstructions.add')}
          </Button>
        </div>
        {isError && (
          <p role='alert' className='text-sm text-destructive'>
            {t('medicineInstructions.loadFailed')}
          </p>
        )}
        <MedicineInstructionsTable
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
        <MedicineInstructionDialog
          key={editing?.id ?? 'new'}
          medicineInstruction={editing}
          common={common}
          onClose={() => setEditing(undefined)}
        />
      )}
      <ConfirmDialog
        open={Boolean(removing)}
        onOpenChange={(open) => {
          if (!open && !deletion.isPending) setRemoving(null)
        }}
        title={t('medicineInstructions.delete')}
        desc={t('medicineInstructions.deleteConfirm', {
          name: removing?.name ?? '',
        })}
        destructive
        isLoading={deletion.isPending}
        handleConfirm={() => {
          if (removing && !deletion.isPending) deletion.mutate(removing.id)
        }}
      />
    </>
  )
}
