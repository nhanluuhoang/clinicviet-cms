import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { type ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { UrlDataTable } from '@/components/data-table/url-data-table'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { getTenants } from '@/features/tenants/api'
import { getSystemUsers, type SystemUser, type SystemUserRole } from './api'
import { CreateSystemUserDialog } from './create-system-user-dialog'
import { UpdateSystemUserDialog } from './update-system-user-dialog'

const route = getRouteApi('/_authenticated/system/users')

const roleLabels = {
  TENANT_ADMIN: 'Quản trị phòng khám',
  DOCTOR: 'Bác sĩ',
  ASSISTANT: 'Trợ lý',
  PATIENT: 'Bệnh nhân',
  USER: 'Người dùng',
}
const columns: ColumnDef<SystemUser>[] = [
  { accessorKey: 'userName', header: 'Tên đăng nhập' },
  { accessorKey: 'fullName', header: 'Họ tên' },
  { accessorKey: 'email', header: 'Email' },
  {
    id: 'tenantId',
    accessorFn: (user) => user.tenant.id,
    header: 'Phòng khám',
    cell: ({ row }) =>
      `${row.original.tenant.code} - ${row.original.tenant.name}`,
    filterFn: (row, id, value: string[]) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: 'role',
    header: 'Vai trò',
    cell: ({ row }) => (
      <Badge variant='outline'>{roleLabels[row.original.role]}</Badge>
    ),
    filterFn: (row, id, value: string[]) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: 'isActive',
    header: 'Trạng thái',
    cell: ({ row }) => (row.original.isActive ? 'Đang hoạt động' : 'Đã khóa'),
  },
  {
    accessorKey: 'lastActiveAt',
    header: 'Hoạt động gần nhất',
    cell: ({ row }) =>
      row.original.lastActiveAt
        ? new Intl.DateTimeFormat('vi-VN', {
            dateStyle: 'short',
            timeStyle: 'short',
          }).format(new Date(row.original.lastActiveAt))
        : 'Chưa có phiên hoạt động',
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => <UpdateSystemUserDialog user={row.original} />,
  },
]

export function SystemUsers() {
  const { tenantId, role } = route.useSearch()
  const [createOpen, setCreateOpen] = useState(false)
  const tenants = useQuery({ queryKey: ['tenants'], queryFn: getTenants })
  const users = useQuery({
    queryKey: ['system-users', tenantId?.[0], role?.[0]],
    queryFn: () =>
      getSystemUsers({
        tenantId: tenantId?.[0],
        role: role?.[0] as SystemUserRole | undefined,
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
            tenantId: 'Phòng khám',
            role: 'Vai trò',
            isActive: 'Trạng thái',
            lastActiveAt: 'Hoạt động gần nhất',
            actions: 'Thao tác',
          }}
          getSearchText={(user) =>
            `${user.userName} ${user.fullName} ${user.email ?? ''} ${user.tenant.code} ${user.tenant.name}`
          }
          filters={[
            {
              columnId: 'tenantId',
              title: 'Phòng khám',
              variant: 'radio',
              options: (tenants.data?.data ?? []).map((tenant) => ({
                label: `${tenant.code} - ${tenant.name}`,
                value: tenant.id,
              })),
            },
            {
              columnId: 'role',
              title: 'Vai trò',
              variant: 'radio',
              options: [
                { label: 'Quản trị phòng khám', value: 'TENANT_ADMIN' },
                { label: 'Bác sĩ', value: 'DOCTOR' },
                { label: 'Trợ lý', value: 'ASSISTANT' },
                { label: 'Bệnh nhân', value: 'PATIENT' },
                { label: 'Người dùng', value: 'USER' },
              ],
            },
          ]}
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
