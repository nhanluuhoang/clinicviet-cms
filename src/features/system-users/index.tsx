import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { type ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { UrlDataTable } from '@/components/data-table/url-data-table'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { SelectDropdown } from '@/components/select-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { getTenants } from '@/features/tenants/api'
import { getSystemUsers, type ManagedRole, type SystemUser } from './api'
import { CreateSystemUserDialog } from './create-system-user-dialog'

const roleLabels = {
  TENANT_ADMIN: 'Quản trị phòng khám',
  DOCTOR: 'Bác sĩ',
  ASSISTANT: 'Trợ lý',
}
const columns: ColumnDef<SystemUser>[] = [
  { accessorKey: 'userName', header: 'Tên đăng nhập' },
  { accessorKey: 'fullName', header: 'Họ tên' },
  { accessorKey: 'email', header: 'Email' },
  {
    id: 'tenant',
    header: 'Phòng khám',
    cell: ({ row }) =>
      `${row.original.tenant.code} - ${row.original.tenant.name}`,
  },
  {
    accessorKey: 'role',
    header: 'Vai trò',
    cell: ({ row }) => (
      <Badge variant='outline'>{roleLabels[row.original.role]}</Badge>
    ),
  },
  {
    accessorKey: 'isActive',
    header: 'Trạng thái',
    cell: ({ row }) => (row.original.isActive ? 'Đang hoạt động' : 'Đã khóa'),
  },
]

export function SystemUsers() {
  const [tenantId, setTenantId] = useState('ALL')
  const [role, setRole] = useState<'ALL' | ManagedRole>('ALL')
  const [createOpen, setCreateOpen] = useState(false)
  const tenants = useQuery({ queryKey: ['tenants'], queryFn: getTenants })
  const users = useQuery({
    queryKey: ['system-users', tenantId, role],
    queryFn: () =>
      getSystemUsers({
        tenantId: tenantId === 'ALL' ? undefined : tenantId,
        role: role === 'ALL' ? undefined : role,
      }),
  })
  return (
    <>
      <Header fixed>
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Người dùng</h2>
            <p className='text-muted-foreground'>
              Danh sách tài khoản theo phòng khám và vai trò.
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)}>Tạo tài khoản</Button>
        </div>
        <div className='grid gap-3 sm:grid-cols-2 lg:max-w-2xl'>
          <SelectDropdown
            defaultValue={tenantId}
            isControlled
            onValueChange={setTenantId}
            items={[
              { label: 'Tất cả phòng khám', value: 'ALL' },
              ...(tenants.data?.data ?? []).map((tenant) => ({
                label: `${tenant.code} - ${tenant.name}`,
                value: tenant.id,
              })),
            ]}
          />
          <SelectDropdown
            defaultValue={role}
            isControlled
            onValueChange={(value) => setRole(value as typeof role)}
            items={[
              { label: 'Tất cả vai trò', value: 'ALL' },
              { label: 'Quản trị phòng khám', value: 'TENANT_ADMIN' },
              { label: 'Bác sĩ', value: 'DOCTOR' },
              { label: 'Trợ lý', value: 'ASSISTANT' },
            ]}
          />
        </div>
        <UrlDataTable
          columns={columns}
          data={users.data?.data ?? []}
          isLoading={users.isLoading}
          searchPlaceholder='Tìm tên đăng nhập, họ tên hoặc email...'
          emptyMessage='Không có người dùng phù hợp.'
          mobileLabels={{
            userName: 'Tên đăng nhập',
            fullName: 'Họ tên',
            email: 'Email',
            tenant: 'Phòng khám',
            role: 'Vai trò',
            isActive: 'Trạng thái',
          }}
          getSearchText={(user) =>
            `${user.userName} ${user.fullName} ${user.email ?? ''} ${user.tenant.name}`
          }
        />
      </Main>
      <CreateSystemUserDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        tenants={tenants.data?.data ?? []}
      />
    </>
  )
}
