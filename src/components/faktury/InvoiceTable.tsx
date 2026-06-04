'use client'

import type { Invoice, Client } from '@/types'
import { Badge, Button, EmptyState } from '@/components/ui'
import { brutto, formatZl, formatDate, resolvedStatus } from '@/lib/utils'

interface InvoiceTableProps {
  invoices: Invoice[]
  clients: Client[]
  onView: (id: string) => void
  onMarkPaid?: (id: string) => void
  compact?: boolean
}

export function InvoiceTable({
  invoices,
  clients,
  onView,
  onMarkPaid,
  compact = false,
}: InvoiceTableProps) {
  const getClient = (id: number) => clients.find((c) => c.id === id)

  if (!invoices.length) {
    return <EmptyState icon="🧾" message="Brak faktur" />
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-100 dark:border-zinc-800">
            <th className="text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 py-2 px-3">
              Nr faktury
            </th>
            <th className="text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 py-2 px-3">
              Klient
            </th>
            {!compact && (
              <th className="text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 py-2 px-3 hidden sm:table-cell">
                Data
              </th>
            )}
            <th className="text-right text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 py-2 px-3">
              Kwota
            </th>
            <th className="text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 py-2 px-3 hidden sm:table-cell">
              Status
            </th>
            <th className="py-2 px-3" />
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => {
            const client = getClient(inv.klientId)
            const status = resolvedStatus(inv)
            return (
              <tr
                key={inv.id}
                className="border-b border-zinc-50 dark:border-zinc-800/60 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
              >
                <td className="py-2.5 px-3 font-mono text-xs font-medium text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                  {inv.id}
                </td>
                <td className="py-2.5 px-3 text-zinc-700 dark:text-zinc-300 max-w-[150px] truncate">
                  {client ? client.nazwa : '—'}
                </td>
                {!compact && (
                  <td className="py-2.5 px-3 text-zinc-400 dark:text-zinc-500 whitespace-nowrap hidden sm:table-cell">
                    {formatDate(inv.data)}
                  </td>
                )}
                <td className="py-2.5 px-3 text-right font-medium whitespace-nowrap">
                  {formatZl(brutto(inv))}
                </td>
                <td className="py-2.5 px-3 hidden sm:table-cell">
                  <Badge status={status} />
                </td>
                <td className="py-2.5 px-3 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1">
                    <Button size="sm" onClick={() => onView(inv.id)}>
                      👁
                    </Button>
                    {inv.status === 'nieoplacona' && onMarkPaid && (
                      <Button size="sm" onClick={() => onMarkPaid(inv.id)}>
                        ✓
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
