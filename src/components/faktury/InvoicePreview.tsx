'use client'

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

export function InvoicePreview({
  invoice,
  client,
  company,
  onClose,
  onMarkPaid,
}: InvoicePreviewProps) {
  if (!invoice) return null

  const status = resolvedStatus(invoice)
  const { netto, vat: vatAmt, brutto } = calcTotals(invoice)

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
                <tr
                  key={i}
                  className="border-b border-zinc-50 dark:border-zinc-800/60"
                >
                  <td className="py-2 px-2 text-zinc-700 dark:text-zinc-300">{p.opis}</td>
                  <td className="py-2 px-2 text-right text-zinc-500 dark:text-zinc-400">{p.ilosc}</td>
                  <td className="py-2 px-2 text-right text-zinc-500 dark:text-zinc-400">
                    {formatZl(p.cena)}
                  </td>
                  <td className="py-2 px-2 text-right text-zinc-500 dark:text-zinc-400">
                    {p.vat}%
                  </td>
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
      <div className="flex gap-2 justify-end">
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
        <Button onClick={onClose}>Zamknij</Button>
      </div>
    </Modal>
  )
}
