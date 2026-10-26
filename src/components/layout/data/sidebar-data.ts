import {
  CLINICAL_ADMIN_ROLES,
  STAFF_ROLES,
  TENANT_APPEARANCE_PLANS,
  TENANT_ADMIN_ROLES,
  TENANT_STAFF_PLANS,
  SUPER_ADMIN_ROLES,
} from '@/config/access-control'
import i18n from '@/i18n'
import {
  LayoutDashboard,
  Users,
  Database,
  Pill,
  SquarePen,
  Warehouse,
  HeartPulse,
  ShieldCheck,
  Settings,
  ListOrdered,
  ClipboardList,
  CalendarRange,
  CalendarOff,
  ChartColumn,
  History,
  PanelsTopLeft,
  Building2,
  MessageSquare,
  ReceiptText,
  BellRing,
  ClipboardPlus,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  navGroups: [
    {
      get title() {
        return i18n.t('messages.system')
      },
      roles: SUPER_ADMIN_ROLES,
      items: [
        {
          get title() {
            return i18n.t('messages.clinics')
          },
          url: '/system/tenants',
          icon: Building2,
          roles: SUPER_ADMIN_ROLES,
        },
        {
          get title() {
            return i18n.t('messages.users')
          },
          url: '/system/users',
          icon: Users,
          roles: SUPER_ADMIN_ROLES,
        },
        {
          get title() {
            return i18n.t('messages.trialRequests')
          },
          url: '/system/trial-requests',
          icon: ClipboardList,
          roles: SUPER_ADMIN_ROLES,
        },
        {
          get title() {
            return i18n.t('diagnoses.commonTitle')
          },
          url: '/system/diagnoses',
          icon: ClipboardPlus,
          roles: SUPER_ADMIN_ROLES,
        },
        {
          get title() {
            return i18n.t('medicineInstructions.commonTitle')
          },
          url: '/system/medicine-instructions',
          icon: ClipboardPlus,
          roles: SUPER_ADMIN_ROLES,
        },
        {
          get title() {
            return i18n.t('messages.supportRequests')
          },
          url: '/system/support-requests',
          icon: MessageSquare,
          roles: SUPER_ADMIN_ROLES,
        },
      ],
    },
    {
      get title() {
        return i18n.t('messages.overview')
      },
      items: [
        {
          get title() {
            return i18n.t('messages.examinationQueue')
          },
          url: '/',
          icon: ListOrdered,
          roles: STAFF_ROLES,
        },
        {
          get title() {
            return i18n.t('messages.patient')
          },
          url: '/patients',
          icon: HeartPulse,
          roles: STAFF_ROLES,
        },
        {
          get title() {
            return i18n.t('messages.medicalHistory')
          },
          url: '/medical-histories',
          icon: History,
          roles: STAFF_ROLES,
        },
        {
          get title() {
            return i18n.t('messages.invoices')
          },
          url: '/invoices',
          icon: ReceiptText,
          roles: STAFF_ROLES,
        },
        {
          get title() {
            return i18n.t('reminders.title')
          },
          url: '/reminders',
          icon: BellRing,
          roles: STAFF_ROLES,
        },
      ],
    },
    {
      items: [
        {
          get title() {
            return i18n.t('messages.staff')
          },
          url: '/admins',
          icon: Users,
          roles: TENANT_ADMIN_ROLES,
          plans: TENANT_STAFF_PLANS,
        },
      ],
    },
    {
      get title() {
        return i18n.t('messages.medicineManagement')
      },
      items: [
        {
          get title() {
            return i18n.t('messages.medicineCatalog')
          },
          url: '/medicines',
          icon: Pill,
          roles: STAFF_ROLES,
        },
        {
          get title() {
            return i18n.t('messages.medicineInventory')
          },
          url: '/inventory',
          icon: Warehouse,
          roles: STAFF_ROLES,
        },
        {
          get title() {
            return i18n.t('messages.prescriptionTemplates')
          },
          url: '/prescription-templates',
          icon: ClipboardList,
          roles: CLINICAL_ADMIN_ROLES,
        },
      ],
    },
    {
      get title() {
        return i18n.t('messages.statistics')
      },
      items: [
        {
          get title() {
            return i18n.t('messages.dailyStatistics')
          },
          url: '/dashboards',
          icon: LayoutDashboard,
          roles: CLINICAL_ADMIN_ROLES,
        },
        {
          get title() {
            return i18n.t('messages.monthlyStatistics')
          },
          url: '/monthly-statistics',
          icon: CalendarRange,
          roles: CLINICAL_ADMIN_ROLES,
        },
        {
          get title() {
            return i18n.t('messages.yearlyStatistics')
          },
          url: '/yearly-statistics',
          icon: ChartColumn,
          roles: CLINICAL_ADMIN_ROLES,
        },
      ],
    },
    {
      get title() {
        return i18n.t('messages.settings')
      },
      items: [
        {
          get title() {
            return i18n.t('messages.appearance')
          },
          icon: ShieldCheck,
          plans: TENANT_APPEARANCE_PLANS,
          items: [
            {
              get title() {
                return i18n.t('messages.clinicWebsite')
              },
              url: '/landing-config',
              icon: PanelsTopLeft,
              roles: TENANT_ADMIN_ROLES,
            },
            {
              get title() {
                return i18n.t('messages.posts')
              },
              url: '/posts',
              icon: SquarePen,
              roles: TENANT_ADMIN_ROLES,
            },
          ],
        },
        {
          get title() {
            return i18n.t('messages.settings')
          },
          icon: Settings,
          items: [
            {
              get title() {
                return i18n.t('diagnoses.title')
              },
              url: '/diagnoses',
              icon: ClipboardPlus,
              roles: CLINICAL_ADMIN_ROLES,
            },
            {
              get title() {
                return i18n.t('medicineInstructions.title')
              },
              url: '/medicine-instructions',
              icon: ClipboardPlus,
              roles: CLINICAL_ADMIN_ROLES,
            },
            {
              get title() {
                return i18n.t('messages.generalSettings')
              },
              url: '/master-data',
              icon: Database,
              roles: CLINICAL_ADMIN_ROLES,
            },
            {
              get title() {
                return i18n.t('messages.clinicHolidays')
              },
              url: '/clinic-days-off',
              icon: CalendarOff,
              roles: CLINICAL_ADMIN_ROLES,
              plans: TENANT_STAFF_PLANS,
            },
          ],
        },
      ],
    },
    {
      items: [
        {
          get title() {
            return i18n.t('messages.supportFeedback')
          },
          url: '/support-requests',
          icon: MessageSquare,
          roles: STAFF_ROLES,
        },
      ],
    },
  ],
}
