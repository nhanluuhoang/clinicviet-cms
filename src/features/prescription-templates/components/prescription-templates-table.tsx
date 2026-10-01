import { UrlDataTable } from '@/components/data-table/url-data-table'
import type { PrescriptionTemplatesState } from '../hooks/use-prescription-templates'
import { getPrescriptionTemplatesColumns } from './prescription-templates-columns'

export function PrescriptionTemplatesTable({
  setOpen,
  setCurrent,
  setName,
  setItems,
  templates,
  isLoading,
}: Pick<
  PrescriptionTemplatesState,
  'setOpen' | 'setCurrent' | 'setName' | 'setItems' | 'templates' | 'isLoading'
>) {
  const columns = getPrescriptionTemplatesColumns({
    setCurrent,
    setName,
    setItems,
    setOpen,
  })
  return (
    <UrlDataTable
      columns={columns}
      data={templates}
      isLoading={isLoading}
      searchPlaceholder='Tìm tên mẫu hoặc thuốc...'
      emptyMessage='Chưa có mẫu đơn thuốc.'
      mobileLabels={{ name: 'mobileTable.context.templateName' }}
      getSearchText={(row) =>
        `${row.name} ${row.items.map((item) => item.medicineName).join(' ')}`
      }
    />
  )
}
