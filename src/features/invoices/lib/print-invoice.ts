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
    i18n.t('messages.vndAlt2', {
      value0: Number(value).toLocaleString(getLocale()),
    })
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
  const medicineRows = items
    .map((line, index) => {
      const quantity = Number(line.quantity ?? 0)
      const unitPrice = Number(line.medicine?.salePrice ?? 0)
      return `
        <tr>
          <td class="center">${index + 1}</td>
          <td>
            <strong>${escapeHtml(line.medicineName)}</strong>
            ${line.instruction ? `<div class="muted">${escapeHtml(line.instruction)}</div>` : ''}
          </td>
          <td class="center optional-column">${escapeHtml(line.medicine?.unit || '-')}</td>
          <td class="number">${quantity.toLocaleString(getLocale())}</td>
          <td class="number optional-column">${money(unitPrice)}</td>
          <td class="number">${money(unitPrice * quantity)}</td>
        </tr>
      `
    })
    .join('')
  const feeRows = extraFees
    .map(
      ([label, value]) => `
        <tr>
          <td>${escapeHtml(label)}</td>
          <td class="number">${money(value)}</td>
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
        <title>${escapeHtml(i18n.t('print.invoice'))} ${escapeHtml(invoiceCode)}</title>
        <style>
          * { box-sizing: border-box; }
          body {
            margin: 0;
            background: #f3f4f6;
            color: #111827;
            font: 14px/1.45 Arial, sans-serif;
          }
          .page {
            width: ${paper.width};
            min-height: ${paper.minHeight};
            margin: 20px auto;
            padding: ${paper.padding};
            background: #fff;
            box-shadow: 0 4px 24px rgba(0, 0, 0, .08);
          }
          .header {
            display: flex;
            justify-content: space-between;
            gap: 24px;
            padding-bottom: 18px;
            border-bottom: 2px solid #111827;
          }
          .clinic { font-size: 18px; font-weight: 700; }
          h1 { margin: 0 0 4px; font-size: 24px; text-align: right; }
          .invoice-meta { text-align: right; }
          .muted { color: #6b7280; font-size: 12px; }
          .patient {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px 24px;
            margin: 20px 0;
            padding: 14px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
          }
          .patient p { margin: 0; }
          .full { grid-column: 1 / -1; }
          table { width: 100%; border-collapse: collapse; }
          th {
            padding: 10px 8px;
            background: #f3f4f6;
            border: 1px solid #d1d5db;
            font-size: 12px;
            text-align: left;
            text-transform: uppercase;
          }
          td { padding: 10px 8px; border: 1px solid #e5e7eb; vertical-align: top; }
          .center { text-align: center; }
          .number { text-align: right; white-space: nowrap; }
          .summary {
            width: 52%;
            margin: 22px 0 0 auto;
          }
          .summary td { border-width: 0 0 1px; }
          .summary .total td {
            padding-top: 14px;
            border-top: 2px solid #111827;
            border-bottom: 0;
            font-size: 17px;
            font-weight: 700;
          }
          .signatures {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 80px;
            margin-top: 48px;
            text-align: center;
          }
          .signature-space { height: 72px; }
          .actions { display: flex; justify-content: center; margin: 24px 0; }
          button {
            padding: 10px 18px;
            border: 0;
            border-radius: 6px;
            background: #111827;
            color: #fff;
            font-weight: 600;
            cursor: pointer;
          }
          ${
            paper.thermal
              ? `
          body { font-size: 11px; }
          .header { display: block; padding-bottom: 8px; }
          .invoice-meta, h1 { margin-top: 8px; text-align: left; }
          .patient { display: block; margin: 10px 0; padding: 8px; }
          .patient p { margin-bottom: 3px; }
          th, td { padding: 5px 3px; font-size: 10px; }
          .optional-column { display: none; }
          .summary { width: 100%; margin-top: 12px; }
          .signatures { gap: 12px; margin-top: 24px; }
          .signature-space { height: 40px; }
          `
              : ''
          }
          @page { size: ${paper.pageSize}; margin: 0; }
          @media print {
            body { background: #fff; }
            .page { margin: 0; box-shadow: none; }
            .actions { display: none; }
          }
        </style>
      </head>
      <body>
        <main class="page">
          <header class="header">
            <div>
              <div class="clinic">${escapeHtml(i18n.t('print.clinic'))}</div>
              <div class="muted">${escapeHtml(i18n.t('print.receipt'))}</div>
            </div>
            <div class="invoice-meta">
              <h1>${escapeHtml(i18n.t('print.invoice'))}</h1>
              <div>${escapeHtml(i18n.t('print.code'))} <strong>${escapeHtml(invoiceCode)}</strong></div>
              <div class="muted">${issuedAt.toLocaleString(getLocale())}</div>
            </div>
          </header>

          <section class="patient">
            <p class="full">${escapeHtml(i18n.t('print.patient'))} <strong>${escapeHtml(patient.fullName)}</strong></p>
            <p>${escapeHtml(i18n.t('print.phone'))} ${escapeHtml(patient.phone || '-')}</p>
            <p>${escapeHtml(i18n.t('print.address'))} ${escapeHtml(patient.address || '-')}</p>
            <p class="full">${escapeHtml(i18n.t('print.doctor'))} ${escapeHtml(doctorName || '-')}</p>
          </section>

          ${
            showMedicines
              ? `<table>
            <thead>
              <tr>
                <th class="center">${escapeHtml(i18n.t('print.number'))}</th>
                <th>${escapeHtml(i18n.t('print.medicine'))}</th>
                <th class="center optional-column">${escapeHtml(i18n.t('print.unit'))}</th>
                <th class="number">${escapeHtml(i18n.t('print.quantity'))}</th>
                <th class="number optional-column">${escapeHtml(i18n.t('print.unitPrice'))}</th>
                <th class="number">${escapeHtml(i18n.t('print.amount'))}</th>
              </tr>
            </thead>
            <tbody>
              ${medicineRows || `<tr><td colspan="${paper.thermal ? 4 : 6}" class="center muted">${escapeHtml(i18n.t('print.noMedicines'))}</td></tr>`}
            </tbody>
          </table>`
              : ''
          }

          <table class="summary">
            <tbody>
              <tr><td>${escapeHtml(i18n.t('print.consultationFee'))}</td><td class="number">${money(invoice.consultationFee)}</td></tr>
              <tr><td>${escapeHtml(i18n.t('print.medicineRevenue'))}</td><td class="number">${money(invoice.medicineRevenue)}</td></tr>
              ${feeRows}
              <tr class="total">
                <td>${escapeHtml(i18n.t('print.total'))}</td>
                <td class="number">${money(invoice.totalAmount)}</td>
              </tr>
            </tbody>
          </table>

          <section class="signatures">
            <div>
              <strong>${escapeHtml(i18n.t('print.payer'))}</strong>
              <div class="muted">${escapeHtml(i18n.t('print.signature'))}</div>
              <div class="signature-space"></div>
            </div>
            <div>
              <strong>${escapeHtml(i18n.t('print.collector'))}</strong>
              <div class="muted">${escapeHtml(i18n.t('print.signature'))}</div>
              <div class="signature-space"></div>
            </div>
          </section>
        </main>
        <div class="actions"><button onclick="window.print()">${escapeHtml(i18n.t('print.print'))}</button></div>
      </body>
    </html>
  `)
  popup.document.close()
  popup.focus()
}
