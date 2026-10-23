import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/auth-store'
import { useLayout } from '@/context/layout-provider'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { AppTitle } from './app-title'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'
import { useNavigationGroups } from './use-navigation-groups'

export function AppSidebar() {
  useTranslation()

  const { collapsible, variant } = useLayout()
  const user = useAuthStore((state) => state.auth.user)
  const filteredNavGroups = useNavigationGroups()

  return (
    <Sidebar collapsible={collapsible} variant={variant} data-tour='sidebar'>
      <SidebarHeader>
        <AppTitle />
      </SidebarHeader>
      <SidebarContent>
        {filteredNavGroups.map((props, index) => (
          <NavGroup key={index} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter data-tour='user-menu'>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
