'use client'

import { useState } from 'react'
import type { Invoice, Client, Company } from '@/types'
import { Modal, Badge, Button } from '@/components/ui'
import { calcTotals, formatZl, formatDate, resolvedStatus } from '@/lib/utils'

interface InvoicePreviewProps {
  invoice: Invoice | null
  client: Client | undefined
  company: Company
  onClose: () => void
  onMarkPaid?: (id: string) => void
}

async function generatePDF(invoice: Invoice, client: Client | undefined, company: Company) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })

  const { netto, vat: vatAmt, brutto } = calcTotals(invoice)

  const L = 15   // left margin
  const R = 195  // right margin
  const W = R - L

  // ── Header ──────────────────────────────────────────────────────────
  doc.setFillColor(24, 24, 27)
  doc.rect(0, 0, 210, 28, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('FAKTURA VAT', L, 14)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(invoice.id, L, 21)
  doc.setFontSize(9)
  doc.text(`Data wystawienia: ${formatDate(invoice.data)}   Termin płatności: ${formatDate(invoice.termin)}`, R, 21, { align: 'right' })

  // ── Seller / Buyer ───────────────────────────────────────────────────
  let y = 38
  doc.setTextColor(30, 30, 30)

  // Sprzedawca
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(120, 120, 120)
  doc.text('SPRZEDAWCA', L, y)
  y += 4
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(20, 20, 20)
  doc.text(company.nazwa || '—', L, y)
  y += 5
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(80, 80, 80)
  if (company.nip) { doc.text(`NIP: ${company.nip}`, L, y); y += 4 }
  if (company.adres) { doc.text(company.adres, L, y); y += 4 }
  if (company.email) { doc.text(company.email, L, y); y += 4 }
  if (company.tel) { doc.text(`Tel: ${company.tel}`, L, y); y += 4 }

  // Nabywca
  let yb = 38
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(120, 120, 120)
  doc.text('NABYWCA', 110, yb)
  yb += 4
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(20, 20, 20)
  doc.text(client?.nazwa || '—', 110, yb)
  yb += 5
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(80, 80, 80)
  if (client?.nip) { doc.text(`NIP: ${client.nip}`, 110, yb); yb += 4 }
  if (client?.adres) { doc.text(client.adres, 110, yb); yb += 4 }
  if (client?.email) { doc.text(client.email, 110, yb); yb += 4 }
  if (client?.tel) { doc.text(`Tel: ${client.tel}`, 110, yb); yb += 4 }

  // ── Divider ──────────────────────────────────────────────────────────
  y = Math.max(y, yb) + 6
  doc.setDrawColor(220, 220, 220)
  doc.line(L, y, R, y)
  y += 6

  // ── Table header ─────────────────────────────────────────────────────
  doc.setFillColor(245, 245, 245)
  doc.rect(L, y - 4, W, 8, 'F')
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(80, 80, 80)

  const cols = { opis: L + 2, ilosc: 100, cena: 122, vat: 142, netto: 158, brutto: R }
  doc.text('Opis', cols.opis, y)
  doc.text('Ilość', cols.ilosc, y, { align: 'right' })
  doc.text('Cena netto', cols.cena, y, { align: 'right' })
  doc.text('VAT', cols.vat, y, { align: 'right' })
  doc.text('Netto', cols.netto, y, { align: 'right' })
  doc.text('Brutto', cols.brutto, y, { align: 'right' })
  y += 6

  // ── Table rows ───────────────────────────────────────────────────────
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(30, 30, 30)

  invoice.pozycje.forEach((p, i) => {
    const lineNetto = p.ilosc * p.cena
    const lineBrutto = lineNetto * (1 + p.vat / 100)

    if (i % 2 === 1) {
      doc.setFillColor(250, 250, 250)
      doc.rect(L, y - 4, W, 7, 'F')
    }

    doc.setFontSize(9)
    // truncate long descriptions
    const opis = p.opis.length > 38 ? p.opis.substring(0, 36) + '…' : p.opis
    doc.text(opis, cols.opis, y)
    doc.text(String(p.ilosc), cols.ilosc, y, { align: 'right' })
    doc.text(formatZl(p.cena), cols.cena, y, { align: 'right' })
    doc.text(`${p.vat}%`, cols.vat, y, { align: 'right' })
    doc.text(formatZl(lineNetto), cols.netto, y, { align: 'right' })
    doc.setFont('helvetica', 'bold')
    doc.text(formatZl(lineBrutto), cols.brutto, y, { align: 'right' })
    doc.setFont('helvetica', 'normal')

    doc.setDrawColor(235, 235, 235)
    doc.line(L, y + 3, R, y + 3)
    y += 8
  })

  // ── Totals ───────────────────────────────────────────────────────────
  y += 4
  const totalsX = 130

  doc.setFontSize(9)
  doc.setTextColor(80, 80, 80)
  doc.text('Wartość netto:', totalsX, y)
  doc.text(formatZl(netto), R, y, { align: 'right' })
  y += 6
  doc.text('VAT:', totalsX, y)
  doc.text(formatZl(vatAmt), R, y, { align: 'right' })
  y += 2
  doc.setDrawColor(200, 200, 200)
  doc.line(totalsX, y, R, y)
  y += 5

  doc.setFillColor(24, 24, 27)
  doc.rect(totalsX - 2, y - 5, R - totalsX + 4, 9, 'F')
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 255, 255)
  doc.text('Do zapłaty:', totalsX, y)
  doc.text(formatZl(brutto), R, y, { align: 'right' })
  y += 10

  // ── Payment info ─────────────────────────────────────────────────────
  doc.setTextColor(60, 60, 60)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Forma płatności: przelew bankowy', L, y)
  y += 5
  if (company.nr_konta) {
    doc.setFont('helvetica', 'bold')
    doc.text(`Nr konta: ${company.nr_konta}`, L, y)
    doc.setFont('helvetica', 'normal')
    y += 5
  }
  if (invoice.uwagi) {
    doc.setTextColor(100, 100, 100)
    doc.text(`Uwagi: ${invoice.uwagi}`, L, y)
    y += 5
  }

  // ── Footer ───────────────────────────────────────────────────────────
  doc.setFillColor(245, 245, 245)
  doc.rect(0, 280, 210, 17, 'F')
  doc.setFontSize(7.5)
  doc.setTextColor(140, 140, 140)
  doc.text('Dokument wygenerowany przez Fakturownik', 105, 288, { align: 'center' })
  doc.text(company.nazwa || '', 105, 293, { align: 'center' })

  return doc
}

export function InvoicePreview({
  invoice,
  client,
  company,
  onClose,
  onMarkPaid,
}: InvoicePreviewProps) {
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  if (!invoice) return null

  const status = resolvedStatus(invoice)
  const { netto, vat: vatAmt, brutto } = calcTotals(invoice)

  const handleDownloadPDF = async () => {
    const doc = await generatePDF(invoice, client, company)
    doc.save(`${invoice.id.replace(/\//g, '_')}.pdf`)
  }

  const handleSendEmail = async () => {
    if (!client?.email) {
      alert('Klient nie ma przypisanego adresu email.')
      return
    }
    setEmailLoading(true)
    try {
      const doc = await generatePDF(invoice, client, company)
      const pdfBase64 = doc.output('datauristring').split(',')[1]

      const res = await fetch('/api/send-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: client.email,
          invoiceId: invoice.id,
          pdfBase64,
          clientName: client.nazwa,
          brutto,
        }),
      })

      if (!res.ok) throw new Error('Błąd wysyłki')
      setEmailSent(true)
      setTimeout(() => setEmailSent(false), 3000)
    } catch {
      alert('Nie udało się wysłać emaila. Sprawdź konfigurację SMTP.')
    } finally {
      setEmailLoading(false)
    }
  }

  return (
    <Modal
      open={!!invoice}
      onClose={onClose}
      title={invoice.id}
      width="max-w-2xl"
    >
      {/* Status row */}
      <div className="flex items-center gap-2 mb-5">
        <Badge status={status} />
        <span className="text-xs text-zinc-400 dark:text-zinc-500">
          Data wystawienia: {formatDate(invoice.data)}
        </span>
        <span className="text-xs text-zinc-400 dark:text-zinc-500">
          Termin: {formatDate(invoice.termin)}
        </span>
      </div>

      {/* Buyer / Seller */}
      <div className="grid grid-cols-2 gap-6 mb-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2">
            Nabywca
          </p>
          {client ? (
            <>
              <p className="text-sm font-semibold">{client.nazwa}</p>
              {client.nip && (
                <p className="text-xs text-zinc-400 dark:text-zinc-500">NIP: {client.nip}</p>
              )}
              <p className="text-xs text-zinc-400 dark:text-zinc-500">{client.adres}</p>
            </>
          ) : (
            <p className="text-sm text-zinc-400">—</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2">
            Sprzedawca
          </p>
          <p className="text-sm font-semibold">{company.nazwa}</p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">NIP: {company.nip}</p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">{company.adres}</p>
        </div>
      </div>

      {/* Line items */}
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 dark:border-zinc-800">
              {['Opis', 'Ilość', 'Cena netto', 'VAT', 'Netto', 'Brutto'].map((h) => (
                <th
                  key={h}
                  className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 py-2 px-2 text-right first:text-left"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {invoice.pozycje.map((p, i) => {
              const lineNetto = p.ilosc * p.cena
              const lineBrutto = lineNetto * (1 + p.vat / 100)
              return (
                <tr key={i} className="border-b border-zinc-50 dark:border-zinc-800/60">
                  <td className="py-2 px-2 text-zinc-700 dark:text-zinc-300">{p.opis}</td>
                  <td className="py-2 px-2 text-right text-zinc-500 dark:text-zinc-400">{p.ilosc}</td>
                  <td className="py-2 px-2 text-right text-zinc-500 dark:text-zinc-400">{formatZl(p.cena)}</td>
                  <td className="py-2 px-2 text-right text-zinc-500 dark:text-zinc-400">{p.vat}%</td>
                  <td className="py-2 px-2 text-right">{formatZl(lineNetto)}</td>
                  <td className="py-2 px-2 text-right font-medium">{formatZl(lineBrutto)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3 mb-4 space-y-1">
        {[
          { label: 'Wartość netto', value: netto },
          { label: 'VAT', value: vatAmt },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between text-sm text-zinc-500 dark:text-zinc-400">
            <span>{label}</span>
            <span>{formatZl(value)}</span>
          </div>
        ))}
        <div className="flex justify-between text-base font-semibold pt-1">
          <span>Do zapłaty (brutto)</span>
          <span>{formatZl(brutto)}</span>
        </div>
      </div>

      {/* Payment info */}
      <div className="text-xs text-zinc-400 dark:text-zinc-500 border-t border-zinc-100 dark:border-zinc-800 pt-3 mb-4">
        <p>Forma płatności: przelew bankowy</p>
        <p>Nr konta: {company.nr_konta}</p>
        {invoice.uwagi && <p>Uwagi: {invoice.uwagi}</p>}
      </div>

      {/* Actions */}
      <div className="flex gap-2 justify-end flex-wrap">
        {invoice.status === 'nieoplacona' && onMarkPaid && (
          <Button
            variant="primary"
            onClick={() => {
              onMarkPaid(invoice.id)
              onClose()
            }}
          >
            ✓ Oznacz jako opłaconą
          </Button>
        )}

        <Button onClick={handleDownloadPDF}>
          ⬇ Pobierz PDF
        </Button>

        <Button
          onClick={handleSendEmail}
          disabled={emailLoading || emailSent}
        >
          {emailSent ? '✓ Wysłano!' : emailLoading ? 'Wysyłanie…' : '✉ Wyślij PDF mailem'}
        </Button>

        <Button onClick={onClose}>Zamknij</Button>
      </div>
    </Modal>
  )
}
