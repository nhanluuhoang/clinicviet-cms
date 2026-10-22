import { AdminsActionDialog } from './admins-action-dialog'
import { useAdmins } from './admins-provider'

export function AdminsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useAdmins()
  return (
    <>
      <AdminsActionDialog
        key='admin-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      {currentRow && (
        <>
          <AdminsActionDialog
            key={`admin-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  )
}
