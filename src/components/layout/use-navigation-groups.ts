import { hasAnyRole, USER_ROLES } from '@/config/access-control'
import { useAuthStore } from '@/stores/auth-store'
import { sidebarData } from './data/sidebar-data'
import type { NavItem, NavGroup as NavGroupType } from './types'

export function useNavigationGroups() {
  const { user } = useAuthStore((state) => state.auth)

  const checkRole = (roles?: string[]) => hasAnyRole(user?.role, roles)
  const checkPlan = (plans?: readonly string[]) =>
    user?.role === USER_ROLES.SUPER_ADMIN ||
    !plans ||
    (!!user?.tenant?.servicePlan && plans.includes(user.tenant.servicePlan))

  const filteredNavGroups = sidebarData.navGroups
    .map((group) => {
      if (!checkRole(group.roles) || !checkPlan(group.plans)) return null

      const filteredItems = group.items
        .map((item) => {
          if (!checkRole(item.roles) || !checkPlan(item.plans)) return null

          if ('items' in item && item.items) {
            const filteredSubItems = item.items.filter(
              (subItem) => checkRole(subItem.roles) && checkPlan(subItem.plans)
            )
            if (filteredSubItems.length === 0) return null
            return { ...item, items: filteredSubItems } as NavItem
          }

          return item as NavItem
        })
        .filter((item): item is NavItem => item !== null)

      if (filteredItems.length === 0) return null
      return { ...group, items: filteredItems } as NavGroupType
    })
    .filter((group): group is NavGroupType => group !== null)

  return filteredNavGroups
}
