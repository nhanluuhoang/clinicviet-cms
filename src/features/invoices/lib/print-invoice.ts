import i18n, { getLocale } from '@/i18n'
import type { Invoice } from '../api'

type InvoicePrintData = {
  invoice: Pick<
    Invoice,
    | 'invoiceCode'
    | 'issuedAt'
    | 'consultationFee'
    | 'medicineRevenue'
    | 'serviceFee'
    | 'serviceFeeLabel'
    | 'otherFee1'
    | 'otherFee1Label'
    | 'otherFee2'
    | 'otherFee2Label'
    | 'otherFee3'
    | 'otherFee3Label'
    | 'totalAmount'
    | 'tenant'
  >
  patient: { fullName: string; phone?: string | null; address?: string | null }
  doctorName: string
  items: Invoice['prescription']['items']
}

export type InvoicePaperSize = 'A4' | 'A5' | '80mm' | '58mm'

const invoicePaperConfig: Record<
  InvoicePaperSize,
  {
    pageSize: string
    width: string
    minHeight: string
    padding: string
    popupWidth: number
    thermal: boolean
  }
> = {
  A4: {
    pageSize: 'A4',
    width: '210mm',
    minHeight: '297mm',
    padding: '18mm',
    popupWidth: 900,
    thermal: false,
  },
  A5: {
    pageSize: 'A5',
    width: '148mm',
    minHeight: '210mm',
    padding: '10mm',
    popupWidth: 700,
    thermal: false,
  },
  '80mm': {
    pageSize: '80mm auto',
    width: '80mm',
    minHeight: 'auto',
    padding: '4mm',
    popupWidth: 420,
    thermal: true,
  },
  '58mm': {
    pageSize: '58mm auto',
    width: '58mm',
    minHeight: 'auto',
    padding: '3mm',
    popupWidth: 340,
    thermal: true,
  },
}

export function printInvoice(
  { invoice, patient, items, doctorName }: InvoicePrintData,
  paperSize: InvoicePaperSize,
  { showMedicines = true }: { showMedicines?: boolean } = {}
) {
  const escapeHtml = (value: unknown) =>
    String(value ?? '').replace(
      /[&<>"']/g,
      (character) =>
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#039;',
        })[character]!
    )
  const money = (value: number | string) =>
    Number(value).toLocaleString(getLocale(), { maximumFractionDigits: 2 })
  const issuedAt = new Date(invoice.issuedAt)
  const invoiceCode = invoice.invoiceCode
  const paper = invoicePaperConfig[paperSize]
  const extraFees = [
    [
      invoice.serviceFeeLabel?.trim() || i18n.t('messages.serviceFee'),
      invoice.serviceFee,
    ],
    [
      invoice.otherFee1Label?.trim() || i18n.t('messages.additionalFee1'),
      invoice.otherFee1,
    ],
    [
      invoice.otherFee2Label?.trim() || i18n.t('messages.additionalFee2'),
      invoice.otherFee2,
    ],
    [
      invoice.otherFee3Label?.trim() || i18n.t('messages.additionalFee3'),
      invoice.otherFee3,
    ],
  ].filter(([, value]) => Number(value) > 0)
  const medicineDetails = showMedicines
    ? items
        .map(
          (line) => `
        <li>
          <span>${escapeHtml(line.medicineName)}</span>
          <span class="medicine-quantity">${line.quantity == null ? '—' : money(line.quantity)} ${escapeHtml(line.medicine?.unit || '')}</span>
        </li>
      `
        )
        .join('')
    : ''
  const lines = [
    {
      label: i18n.t('print.consultationFee'),
      amount: Number(invoice.consultationFee),
      medicines: false,
    },
    {
      label: i18n.t('print.medicineRevenue'),
      amount: Number(invoice.medicineRevenue),
      medicines: true,
    },
    ...extraFees.map(([label, value]) => ({
      label: String(label),
      amount: Number(value),
      medicines: false,
    })),
  ].filter(
    (line) =>
      line.amount !== 0 || (line.medicines && showMedicines && items.length > 0)
  )
  const lineRows = lines
    .map(
      (line, index) => `
      <tr>
        <td class="center row-number">${index + 1}</td>
        <td class="description">
          ${escapeHtml(line.label)}
          ${line.medicines && medicineDetails ? `<ul class="medicine-details">${medicineDetails}</ul>` : ''}
        </td>
        <td class="center optional-column">${line.medicines ? '—' : escapeHtml(i18n.t('print.serviceUnit'))}</td>
        <td class="number optional-column">${line.medicines ? '—' : '1'}</td>
        <td class="number optional-column">${line.medicines ? '—' : money(line.amount)}</td>
        <td class="number">${money(line.amount)}</td>
      </tr>
    `
    )
    .join('')

  const popup = window.open(
    '',
    '_blank',
    `width=${paper.popupWidth},height=900`
  )
  if (!popup) return
  popup.opener = null
  popup.document.write(`
    <!doctype html>
    <html lang="${getLocale().startsWith('en') ? 'en' : 'vi'}">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${escapeHtml(i18n.t('print.paymentReceipt'))} ${escapeHtml(invoiceCode)}</title>
        <style>
          * { box-sizing: border-box; }
          body { margin: 0; background: #e5e7eb; color: #111; font: 14px/1.5 "Times New Roman", serif; }
          .page { width: ${paper.width}; min-height: ${paper.minHeight}; margin: 20px auto; padding: ${paper.padding}; background: #fff; }
          .header { padding-bottom: 14px; border-bottom: 1px solid #111; }
          .clinic { font-size: 18px; font-weight: bold; text-transform: uppercase; overflow-wrap: anywhere; }
          .clinic-address { margin-top: 4px; }
          .document-heading { text-align: center; margin: 20px 0 16px; }
          h1 { margin: 0 0 4px; font-size: 25px; text-transform: uppercase; }
          .invoice-meta { display: flex; justify-content: space-between; gap: 12px; margin-top: 12px; }
          .patient { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 20px; padding: 12px 0; border-top: 1px solid #111; }
          .patient p { margin: 0; overflow-wrap: anywhere; }
          .full { grid-column: 1 / -1; }
          .currency { margin: 8px 0 4px; text-align: right; font-style: italic; }
          table { width: 100%; border-collapse: collapse; }
          thead { display: table-header-group; }
          th, td { padding: 8px 6px; border: 1px solid #555; vertical-align: top; }
          th { text-align: center; font-weight: bold; }
          .center { text-align: center; }
          .number { text-align: right; white-space: nowrap; font-variant-numeric: tabular-nums; }
          .row-number { width: 7%; }
          .description { width: 45%; overflow-wrap: anywhere; }
          .medicine-details { list-style: none; margin: 6px 0 0; padding: 0; font-size: 12px; }
          .medicine-details li { display: flex; justify-content: space-between; gap: 12px; padding: 3px 0; border-top: 1px dotted #aaa; }
          .medicine-quantity { flex-shrink: 0; }
          .total td { font-size: 16px; font-weight: bold; border-top: 2px solid #111; }
          .total-label { text-align: right; }
          .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-top: 28px; text-align: center; break-inside: avoid; }
          .signature-hint { font-size: 12px; font-style: italic; }
          .signature-space { height: 72px; }
          .document-note { border-top: 1px solid #aaa; padding-top: 8px; margin-top: 12px; font-size: 11px; text-align: center; }
          .actions { display: flex; justify-content: center; margin: 24px 0; }
          button { padding: 10px 18px; border: 0; border-radius: 6px; background: #111827; color: #fff; font-weight: 600; cursor: pointer; }
          ${
            paper.thermal
              ? `
          body { font: 11px/1.45 Arial, sans-serif; }
          .header { padding-bottom: 8px; }
          .clinic { font-size: 13px; }
          .document-heading { margin: 12px 0 8px; }
          h1 { font-size: 16px; }
          .invoice-meta { display: block; margin-top: 8px; }
          .invoice-meta > span { display: block; }
          .patient { display: block; padding: 8px 0; }
          .patient p { margin-bottom: 3px; }
          th, td { padding: 5px 3px; font-size: 10px; }
          .optional-column { display: none; }
          .description { width: auto; }
          .medicine-details, .signature-hint, .document-note { font-size: 9px; }
          .medicine-details li { gap: 4px; }
          .medicine-quantity { text-align: right; white-space: nowrap; }
          .total td { font-size: 12px; }
          .signatures { gap: 8px; margin-top: 18px; font-size: 10px; }
          .signature-space { height: 40px; }
          `
              : ''
          }
          @page { size: ${paper.pageSize}; margin: 0; }
          @media print {
            body { background: #fff; }
            .page { margin: 0; }
            .actions { display: none; }
          }
        </style>
      </head>
      <body>
        <main class="page">
          <header class="header">
            <div class="clinic">${escapeHtml(invoice.tenant?.name || i18n.t('print.clinic'))}</div>
            ${invoice.tenant?.address ? `<div class="clinic-address">${escapeHtml(i18n.t('print.address'))} ${escapeHtml(invoice.tenant.address)}</div>` : ''}
          </header>
          <section class="document-heading">
            <h1>${escapeHtml(i18n.t('print.paymentReceipt'))}</h1>
            <div>${escapeHtml(i18n.t('print.receipt'))}</div>
            <div class="invoice-meta">
              <span>${escapeHtml(i18n.t('print.receiptNumber'))} <strong>${escapeHtml(invoiceCode)}</strong></span>
              <span>${escapeHtml(i18n.t('print.issuedAt'))} ${issuedAt.toLocaleString(getLocale(), { timeZone: 'Asia/Ho_Chi_Minh' })}</span>
            </div>
          </section>
          <section class="patient">
            <p class="full">${escapeHtml(i18n.t('print.patient'))} <strong>${escapeHtml(patient.fullName)}</strong></p>
            <p class="full">${escapeHtml(i18n.t('print.address'))} ${escapeHtml(patient.address || '—')}</p>
            <p>${escapeHtml(i18n.t('print.phone'))} ${escapeHtml(patient.phone || '—')}</p>
            <p>${escapeHtml(i18n.t('print.doctor'))} ${escapeHtml(doctorName || '—')}</p>
          </section>
          <div class="currency">${escapeHtml(i18n.t('print.currency'))}</div>
          <table>
            <thead>
              <tr>
                <th class="row-number">${escapeHtml(i18n.t('print.number'))}</th>
                <th>${escapeHtml(i18n.t('print.goodsAndServices'))}</th>
                <th class="optional-column">${escapeHtml(i18n.t('print.unit'))}</th>
                <th class="optional-column">${escapeHtml(i18n.t('print.quantity'))}</th>
                <th class="optional-column">${escapeHtml(i18n.t('print.unitPrice'))}</th>
                <th>${escapeHtml(i18n.t('print.amount'))}</th>
              </tr>
            </thead>
            <tbody>${lineRows}</tbody>
            <tfoot>
              <tr class="total">
                <td class="total-label" colspan="${paper.thermal ? 2 : 5}">${escapeHtml(i18n.t('print.total'))}</td>
                <td class="number">${money(invoice.totalAmount)}</td>
              </tr>
            </tfoot>
          </table>

          <section class="signatures">
            <div>
              <strong>${escapeHtml(i18n.t('print.payer'))}</strong>
              <div class="signature-hint">${escapeHtml(i18n.t('print.signature'))}</div>
              <div class="signature-space"></div>
            </div>
            <div>
              <strong>${escapeHtml(i18n.t('print.collector'))}</strong>
              <div class="signature-hint">${escapeHtml(i18n.t('print.signature'))}</div>
              <div class="signature-space"></div>
            </div>
          </section>
          <p class="document-note">${escapeHtml(i18n.t('print.internalReceiptNote'))}</p>
        </main>
        <div class="actions"><button onclick="window.print()">${escapeHtml(i18n.t('print.print'))}</button></div>
      </body>
    </html>
  `)
  popup.document.close()
  popup.focus()
}
