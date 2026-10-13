import { cn } from '@/lib/utils'
import { inventoryTabs, type InventoryTab } from '../data/data'
import { routeApi } from '../data/route'

export function TabBar({ active }: { active: InventoryTab }) {
  const navigate = routeApi.useNavigate()

  return (
    <div
      role='tablist'
      className='inline-flex w-fit max-w-full items-center gap-0.5 overflow-x-auto rounded-lg bg-muted p-[3px] text-muted-foreground'
    >
      {inventoryTabs.map((tab) => {
        const isActive = tab.value === active
        return (
          <button
            key={tab.value}
            role='tab'
            type='button'
            aria-selected={isActive}
            onClick={() =>
              navigate({ search: { tab: tab.value }, replace: true })
            }
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md border border-transparent px-3 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow]',
              'focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
              isActive
                ? 'bg-background text-foreground shadow-sm dark:border-input dark:bg-input/30'
                : 'hover:text-foreground'
            )}
          >
            <tab.icon className='size-4' />
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
