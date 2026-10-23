import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { hasAnyRole, STAFF_ROLES } from '@/config/access-control'
import {
  BadgeCheck,
  Building2,
  ChevronsUpDown,
  Gift,
  LogOut,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import useDialogState from '@/hooks/use-dialog-state'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { ReferralDialog } from '@/components/referral-dialog'
import { SignOutDialog } from '@/components/sign-out-dialog'
import type { ProfileData } from '@/features/auth/api'

type NavUserProps = {
  user: ProfileData | null
}

export function NavUser({ user }: NavUserProps) {
  const { t } = useTranslation()

  const { isMobile } = useSidebar()
  const [open, setOpen] = useDialogState()
  const [referralOpen, setReferralOpen] = useState(false)
  const displayName =
    user?.fullName?.trim() || user?.userName || t('messages.account')
  const email = user?.email?.trim() || null
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size='lg'
                className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
              >
                <Avatar className='h-8 w-8 rounded-lg'>
                  <AvatarFallback className='rounded-lg'>
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className='grid flex-1 text-start text-sm leading-tight'>
                  <span className='truncate font-semibold'>{displayName}</span>
                  {email && <span className='truncate text-xs'>{email}</span>}
                </div>
                <ChevronsUpDown className='ms-auto size-4' />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
              side={isMobile ? 'bottom' : 'right'}
              align='end'
              sideOffset={4}
            >
              <DropdownMenuLabel className='p-0 font-normal'>
                <div className='flex items-center gap-2 px-1 py-1.5 text-start text-sm'>
                  <Avatar className='h-8 w-8 rounded-lg'>
                    <AvatarFallback className='rounded-lg'>
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className='grid flex-1 text-start text-sm leading-tight'>
                    <span className='truncate font-semibold'>
                      {displayName}
                    </span>
                    {email && <span className='truncate text-xs'>{email}</span>}
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link to='/settings'>
                    <BadgeCheck />
                    {t('messages.profile')}
                  </Link>
                </DropdownMenuItem>
                {user?.role === 'TENANT_ADMIN' && (
                  <DropdownMenuItem asChild>
                    <Link to='/settings/tenant'>
                      <Building2 />
                      {t('messages.clinicInformation')}
                    </Link>
                  </DropdownMenuItem>
                )}
                {user?.tenant && hasAnyRole(user.role, STAFF_ROLES) && (
                  <DropdownMenuItem onSelect={() => setReferralOpen(true)}>
                    <Gift aria-hidden='true' />
                    {t('messages.referAFriend')}
                  </DropdownMenuItem>
                )}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant='destructive'
                onClick={() => setOpen(true)}
              >
                <LogOut />
                {t('messages.signOut')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <SignOutDialog open={!!open} onOpenChange={setOpen} />
      <ReferralDialog open={referralOpen} onOpenChange={setReferralOpen} />
    </>
  )
}
