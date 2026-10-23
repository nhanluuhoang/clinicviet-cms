import { useTranslation } from 'react-i18next'
import { withAuditColumns } from '@/components/data-table/audit-columns'
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
  const { t } = useTranslation()

  const columns = getPrescriptionTemplatesColumns({
    setCurrent,
    setName,
    setItems,
    setOpen,
  })
  return (
    <UrlDataTable
      columns={withAuditColumns(columns)}
      data={templates}
      isLoading={isLoading}
      searchPlaceholder={t('messages.searchTemplateNameOrMedicine')}
      emptyMessage={t('messages.noPrescriptionTemplatesYet')}
      mobileLabels={{ name: 'mobileTable.context.templateName' }}
      getSearchText={(row) =>
        `${row.name} ${row.items.map((item) => item.medicineName).join(' ')}`
      }
    />
  )
}
