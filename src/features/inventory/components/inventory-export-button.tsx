import { useState } from 'react'
import type { Table } from '@tanstack/react-table'
import { Download } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { medicineGroupLabel } from '@/features/medicines/data/data'
import type { StockBatch, StockSummary } from '../api'
import { expiryMeta } from '../data/data'

type ExportColumn<T> = { label: string; value: (row: T) => string | number }

export function InventoryExportButton<T extends StockSummary | StockBatch>({
  table,
  kind,
  disabled,
}: {
  table: Table<T>
  kind: 'stock' | 'batches'
  disabled: boolean
}) {
  const { t } = useTranslation()
  const [busy, setBusy] = useState(false)
  const rows = table.getSortedRowModel().rows

  async function exportFile() {
    setBusy(true)
    try {
      const { Workbook } = await import('exceljs')
      const workbook = new Workbook()
      const sheet = workbook.addWorksheet(t(`inventoryExport.${kind}`))
      const column = <R,>(
        key: string,
        value: (row: R) => string | number
      ): ExportColumn<R> => ({ label: t(`messages.${key}`), value })
      const stockColumns: ExportColumn<StockSummary>[] = [
        column('code', (r) => r.code),
        column('medicine', (r) => r.name),
        column('strength', (r) => r.strength),
        column('unit', (r) => r.unit),
        column('group', (r) => medicineGroupLabel(r.group)),
        column('manufacturer', (r) => r.manufacturer),
        column('inventory', (r) => r.totalQty),
        column('minimumStock', (r) => r.minStock),
        column('batchNumber', (r) => r.batchCount),
        column('nearestExpiry', (r) =>
          r.nearestExpiry ? formatDate(r.nearestExpiry) : ''
        ),
        column('warning', (r) => expiryMeta(r.expiryStatus).label),
        column('stockValue', (r) => r.stockValue),
      ]
      const batchColumns: ExportColumn<StockBatch>[] = [
        column('batchNumber', (r) => r.batchNo),
        column('code', (r) => r.medicineCode),
        column('medicine', (r) => r.medicineName),
        column('unit', (r) => r.unit),
        column('expiryDate', (r) => formatDate(r.expiryDate)),
        column('inStock', (r) => r.qtyRemaining),
        column('received', (r) => r.qtyReceived),
        column('purchasePrice', (r) => r.unitCost),
        column('stockValue', (r) => r.qtyRemaining * r.unitCost),
        column('goodsReceipt', (r) => r.receiptCode),
        column('receivedOn', (r) => formatDate(r.receivedAt)),
        column('supplier', (r) => r.supplierName),
        column('notes', (r) => r.note),
      ]
      const columns = (
        kind === 'stock' ? stockColumns : batchColumns
      ) as ExportColumn<T>[]
      sheet.addRow(columns.map((c) => c.label))
      for (const row of rows)
        sheet.addRow(columns.map((c) => c.value(row.original)))
      sheet.getRow(1).font = { bold: true }
      sheet.views = [{ state: 'frozen', ySplit: 1 }]
      sheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: rows.length + 1, column: columns.length },
      }
      sheet.columns.forEach((c) => {
        c.width = 22
      })
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${kind === 'stock' ? 'ton-kho' : 'lo-thuoc'}-${new Date().toISOString().slice(0, 10)}.xlsx`
      link.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch {
      toast.error(t('inventoryExport.failed'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Button
      type='button'
      variant='outline'
      className='h-8'
      disabled={disabled || busy || rows.length === 0}
      onClick={exportFile}
    >
      <Download className='size-4' />
      {t(busy ? 'inventoryExport.exporting' : 'inventoryExport.exportExcel')}
    </Button>
  )
}
