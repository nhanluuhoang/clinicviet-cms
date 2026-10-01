import { InventoryContent } from './components/inventory-content'
import { InventoryProvider } from './components/inventory-provider'

export function Inventory() {
  return (
    <InventoryProvider>
      <InventoryContent />
    </InventoryProvider>
  )
}
