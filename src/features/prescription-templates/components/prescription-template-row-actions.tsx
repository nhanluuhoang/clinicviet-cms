import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type PrescriptionTemplate } from '../api'
import type { PrescriptionTemplatesState } from '../hooks/use-prescription-templates'

export function PrescriptionTemplateRowActions({
  setOpen,
  setCurrent,
  setName,
  setItems,
  template,
}: Pick<
  PrescriptionTemplatesState,
  'setOpen' | 'setCurrent' | 'setName' | 'setItems'
> & { template: PrescriptionTemplate }) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
        >
          <DotsHorizontalIcon />
          <span className='sr-only'>Mở menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-40'>
        <DropdownMenuItem
          onClick={() => {
            setCurrent(template)
            setName(template.name)
            setItems(template.items.map((item) => ({ ...item })))
            setOpen('update')
          }}
        >
          Cập nhật
          <DropdownMenuShortcut>
            <Edit size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className='!text-red-500'
          onClick={() => {
            setCurrent(template)
            setOpen('delete')
          }}
        >
          Xóa
          <DropdownMenuShortcut>
            <Trash2 size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
