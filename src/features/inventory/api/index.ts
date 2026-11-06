import i18n from '@/i18n'
import { collectPages } from '@/lib/api-page'
import { axios } from '@/lib/axios'
import type { ApiTableParams } from '@/hooks/use-api-table-params'
import type { AuditFields } from '@/components/data-table/audit-columns'
import { type Medicine } from '@/features/medicines/api'
import {
  type GoodsReceipt,
  type GoodsReceiptInput,
  type GoodsReceiptSummary,
  type GoodsIssue,
  type GoodsIssueInput,
  type GoodsIssueSummary,
  type InventoryStats,
  type StockBatch,
  type StockBatchUpdateInput,
  type StockSummary,
  type StockTake,
  type StockTakeInput,
  type StockTakeSummary,
} from './types'

interface Page<T> {
  data: T[]
  total: number
  page: number
  limit: number
}
interface ApiCreator {
  fullName: string
  userName: string
}

const getOperatorName = (creator: ApiCreator | null) =>
  creator?.fullName.trim() || creator?.userName || null

interface ApiBatch {
  id: string
  medicineId: string
  batchNo: string
  mfgDate: string | null
  expiryDate: string
  qtyReceived: number
  qtyRemaining: number
  unitCost: number | string
  note: string
  medicine: Pick<Medicine, 'code' | 'name' | 'unit'>
  receiptLine: null | {
    receipt: {
      id: string
      code: string
      supplierName: string
      receivedAt: string
    }
  }
}
interface ApiReceipt extends AuditFields {
  id: string
  code: string
  supplierName: string
  invoiceNo: string
  receivedAt: string
  note: string
  creator: ApiCreator | null
  lines: Array<{
    qty: number
    unitCost: number | string
    amount: number | string
    batch: ApiBatch
  }>
}
interface ApiReceiptSummary extends AuditFields {
  id: string
  code: string
  supplierName: string
  invoiceNo: string
  receivedAt: string
  note: string
  creator: ApiCreator | null
  _count: { lines: number }
}
interface ApiStockTake extends AuditFields {
  id: string
  code: string
  countedAt: string
  note: string
  creator: ApiCreator | null
  lines: Array<{
    batchId: string
    systemQty: number
    countedQty: number
    diff: number
    batch: ApiBatch
  }>
}
interface ApiGoodsIssue extends AuditFields {
  id: string
  code: string
  userId?: string
  prescriptionId?: string
  recipientName: string
  issuedAt: string
  note: string
  creator: ApiCreator | null
  lines: Array<{ quantity: number; batch: ApiBatch }>
}

const mapBatch = (batch: ApiBatch): StockBatch => ({
  id: batch.id,
  medicineId: batch.medicineId,
  medicineCode: batch.medicine.code,
  medicineName: batch.medicine.name,
  unit: batch.medicine.unit,
  batchNo: batch.batchNo,
  mfgDate: batch.mfgDate ?? '',
  expiryDate: batch.expiryDate,
  qtyReceived: batch.qtyReceived,
  qtyRemaining: batch.qtyRemaining,
  unitCost: Number(batch.unitCost),
  note: batch.note,
  receiptId: batch.receiptLine?.receipt.id ?? '',
  receiptCode: batch.receiptLine?.receipt.code ?? '',
  supplierName: batch.receiptLine?.receipt.supplierName ?? '',
  receivedAt: batch.receiptLine?.receipt.receivedAt ?? '',
})

export const GetBatchesPage = async (
  params: ApiTableParams & { medicineId?: string; inStock?: string }
) => {
  const response = await axios.get<unknown, Page<ApiBatch>>('/stock-batches', {
    params,
  })
  return { ...response, data: response.data.map(mapBatch) }
}
const GetBatches = (medicineId: string): Promise<StockBatch[]> =>
  collectPages((page) =>
    GetBatchesPage({
      page,
      limit: 100,
      medicineId,
      inStock: 'true',
      sort: 'expiryDate',
    })
  )

const UpdateBatch = (id: string, data: StockBatchUpdateInput): Promise<void> =>
  axios.patch(`/stock-batches/${id}`, {
    ...data,
    mfgDate: data.mfgDate || undefined,
  })

const GetStock = async (
  params: ApiTableParams
): Promise<Page<StockSummary>> => {
  return axios.get<unknown, Page<StockSummary>>('/medicines/stock', { params })
}
const GetStats = (): Promise<InventoryStats> =>
  axios.get('/medicines/stock/statistics')
export const GetInventoryExport = (
  kind: 'stock' | 'batches',
  params: ApiTableParams
) =>
  kind === 'stock'
    ? collectPages((page) => GetStock({ ...params, page, limit: 100 }))
    : collectPages((page) =>
        GetBatchesPage({ ...params, page, limit: 100, inStock: 'true' })
      )

const mapReceipt = (receipt: ApiReceipt): GoodsReceipt => {
  const lines = receipt.lines.map(({ batch, qty, unitCost, amount }) => ({
    medicineId: batch.medicineId,
    medicineCode: batch.medicine.code,
    medicineName: batch.medicine.name,
    unit: batch.medicine.unit,
    batchId: batch.id,
    batchNo: batch.batchNo,
    mfgDate: batch.mfgDate ?? '',
    expiryDate: batch.expiryDate,
    qty,
    unitCost: Number(unitCost),
    amount: Number(amount),
  }))
  return {
    ...receipt,
    id: receipt.id,
    code: receipt.code,
    supplierName: receipt.supplierName,
    invoiceNo: receipt.invoiceNo,
    receivedAt: receipt.receivedAt,
    note: receipt.note,
    operatorName: getOperatorName(receipt.creator),
    lines,
    totalQty: lines.reduce((sum, line) => sum + line.qty, 0),
    totalAmount: lines.reduce((sum, line) => sum + line.amount, 0),
  }
}
interface ApiStockTakeSummary extends AuditFields {
  id: string
  code: string
  countedAt: string
  note: string
  creator: ApiCreator | null
  _count: { lines: number }
}

interface ApiGoodsIssueSummary extends AuditFields {
  id: string
  code: string
  recipientName: string
  issuedAt: string
  note: string
  creator: ApiCreator | null
  _count: { lines: number }
}

const GetReceipts = async (
  params: ApiTableParams
): Promise<Page<GoodsReceiptSummary>> => {
  const response = await axios.get<unknown, Page<ApiReceiptSummary>>(
    '/goods-receipts',
    { params }
  )
  const summaries = response.data
  return {
    ...response,
    data: summaries.map(({ _count, creator, ...receipt }) => ({
      ...receipt,
      creator,
      operatorName: getOperatorName(creator),
      lineCount: _count.lines,
    })),
  }
}

const GetReceipt = async (id: string): Promise<GoodsReceipt> =>
  mapReceipt(await axios.get<unknown, ApiReceipt>(`/goods-receipts/${id}`))

const CreateReceipt = (data: GoodsReceiptInput): Promise<void> =>
  axios.post('/goods-receipts', {
    ...data,
    lines: data.lines.map((line) => ({
      ...line,
      mfgDate: line.mfgDate || undefined,
    })),
  })

const GetGoodsIssues = async (
  params: ApiTableParams
): Promise<Page<GoodsIssueSummary>> => {
  const response = await axios.get<unknown, Page<ApiGoodsIssueSummary>>(
    '/goods-issues',
    { params }
  )
  const summaries = response.data
  return {
    ...response,
    data: summaries.map(({ _count, creator, ...issue }) => ({
      ...issue,
      creator,
      operatorName: getOperatorName(creator),
      lineCount: _count.lines,
    })),
  }
}

const GetGoodsIssue = async (id: string): Promise<GoodsIssue> => {
  const issue = await axios.get<unknown, ApiGoodsIssue>(`/goods-issues/${id}`)
  const lines = issue.lines.map(({ batch, quantity }) => ({
    batchId: batch.id,
    batchNo: batch.batchNo,
    medicineCode: batch.medicine.code,
    medicineName: batch.medicine.name,
    unit: batch.medicine.unit,
    quantity,
  }))
  const { creator, ...issueData } = issue
  return {
    ...issueData,
    creator,
    operatorName: getOperatorName(creator),
    lines,
    totalQty: lines.reduce((sum, line) => sum + line.quantity, 0),
  }
}

const CreateGoodsIssue = (data: GoodsIssueInput): Promise<void> =>
  axios.post('/goods-issues', data)

const GetStockTakes = async (
  params: ApiTableParams
): Promise<Page<StockTakeSummary>> => {
  const response = await axios.get<unknown, Page<ApiStockTakeSummary>>(
    '/stock-takes',
    { params }
  )
  const summaries = response.data
  return {
    ...response,
    data: summaries.map(({ _count, creator, ...take }) => ({
      ...take,
      creator,
      operatorName: getOperatorName(creator),
      lineCount: _count.lines,
    })),
  }
}

const GetStockTake = async (id: string): Promise<StockTake> => {
  const take = await axios.get<unknown, ApiStockTake>(`/stock-takes/${id}`)
  const lines = take.lines.map((line) => ({
    batchId: line.batchId,
    batchNo: line.batch.batchNo,
    medicineName: line.batch.medicine.name,
    expiryDate: line.batch.expiryDate,
    systemQty: line.systemQty,
    countedQty: line.countedQty,
    diff: line.diff,
  }))
  return {
    ...take,
    id: take.id,
    code: take.code,
    countedAt: take.countedAt,
    note: take.note,
    operatorName: getOperatorName(take.creator),
    lines,
    totalDiff: lines.reduce((sum, line) => sum + line.diff, 0),
  }
}

const CreateStockTake = (data: StockTakeInput): Promise<void> =>
  axios.post('/stock-takes', data)

const DisposeBatch = (batchId: string): Promise<void> =>
  axios.post('/stock-takes', {
    kind: 'DISPOSAL',
    countedAt: new Date().toISOString(),
    note: i18n.t('messages.discardAllRemainingStockInThisExpiredBatch'),
    lines: [
      { batchId, countedQty: 0, reason: i18n.t('messages.discardBatch') },
    ],
  })

export {
  GetStock,
  GetBatches,
  UpdateBatch,
  GetStats,
  GetReceipts,
  GetReceipt,
  CreateReceipt,
  GetGoodsIssues,
  GetGoodsIssue,
  CreateGoodsIssue,
  GetStockTakes,
  GetStockTake,
  CreateStockTake,
  DisposeBatch,
}
export * from './types'
