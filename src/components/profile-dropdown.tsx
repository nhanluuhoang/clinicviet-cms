import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { hasAnyRole, STAFF_ROLES } from '@/config/access-control'
import { BookOpen, Building2, Gift, PackageOpen } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/auth-store'
import useDialogState from '@/hooks/use-dialog-state'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ReferralDialog } from '@/components/referral-dialog'
import { SignOutDialog } from '@/components/sign-out-dialog'

export function ProfileDropdown() {
  const { t } = useTranslation()

  const [open, setOpen] = useDialogState()
  const [referralOpen, setReferralOpen] = useState(false)
  const user = useAuthStore((state) => state.auth.user)
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
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
            <Avatar className='h-8 w-8'>
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-56' align='end' forceMount>
          <DropdownMenuLabel className='font-normal'>
            <div className='flex flex-col gap-1.5'>
              <p className='text-sm leading-none font-medium'>{displayName}</p>
              {email && (
                <p className='text-xs leading-none text-muted-foreground'>
                  {email}
                </p>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link to='/settings'>{t('messages.profile')}</Link>
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
          <DropdownMenuLabel className='text-xs text-muted-foreground'>
            {t('messages.userGuide')}
          </DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem
              onSelect={() =>
                window.dispatchEvent(
                  new CustomEvent('clinicviet:start-tour', {
                    detail: 'patient-workflow',
                  })
                )
              }
            >
              <BookOpen />
              {t('messages.examinationWorkflow')}
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() =>
                window.dispatchEvent(
                  new CustomEvent('clinicviet:start-tour', {
                    detail: 'inventory-workflow',
                  })
                )
              }
            >
              <PackageOpen />
              {t('messages.inventoryWorkflow')}
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant='destructive' onClick={() => setOpen(true)}>
            {t('messages.signOut')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SignOutDialog open={!!open} onOpenChange={setOpen} />
      <ReferralDialog open={referralOpen} onOpenChange={setReferralOpen} />
    </>
  )
}
