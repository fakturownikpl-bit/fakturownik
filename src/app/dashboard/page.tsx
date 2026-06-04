'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AppShell } from '@/components/layout/AppShell'
import { useApp, useInvoices } from '@/hooks/useAppState'
import { StatCard, Card, Button } from '@/components/ui'
import { InvoiceTable } from '@/components/faktury/InvoiceTable'
import { InvoicePreview } from '@/components/faktury/InvoicePreview'
import { brutto, formatZl, isOverdue, initials } from '@/lib/utils'

export default function DashboardPage() {
  const { state, dispatch } = useApp()
  const { invoices, updateStatus } = useInvoices()
  const [previewId, setPreviewId] = useState<string | null>(null)

  const preview = previewId ? invoices.find((f) => f.id === previewId) ?? null : null
  const previewClient = preview ? state.klienci.find((c) => c.id === preview.klientId) : undefined

  const total = invoices.reduce((s, f) => s + brutto(f), 0)
  const zaplacone = invoices.filter((f) => f.status === 'oplacona').reduce((s, f) => s + brutto(f), 0)
  const naleznosci = invoices.filter((f) => f.status === 'nieoplacona').reduce((s, f) => s + brutto(f), 0)
  const przeterminowane = invoices.filter(isOverdue).length

  const recent = [...invoices].reverse().slice(0, 5)
  const recentClients = state.klienci.slice(0, 3)

  return (
    <AppShell
      title="Panel główny"
      actions={
        <Link href="/faktury/nowa">
          <Button variant="primary">＋ Nowa faktura</Button>
        </Link>
      }
    >
      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <StatCard label="Łączne przychody" value={formatZl(total)} />
        <StatCard label="Opłacone" value={formatZl(zaplacone)} color="green" />
        <StatCard label="Należności" value={formatZl(naleznosci)} color="amber" />
        <StatCard label="Przeterminowane" value={String(przeterminowane)} color="red" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Recent invoices */}
        <Card padding={false} className="xl:col-span-2">
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
            <span className="text-sm font-semibold">Ostatnie faktury</span>
            <Link href="/faktury">
              <Button size="sm">Wszystkie</Button>
            </Link>
          </div>
          <InvoiceTable
            invoices={recent}
            clients={state.klienci}
            onView={setPreviewId}
            onMarkPaid={(id) => updateStatus(id, 'oplacona')}
            compact
          />
        </Card>

        {/* Recent clients */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold">Klienci</span>
            <Link href="/klienci">
              <Button size="sm">Wszyscy</Button>
            </Link>
          </div>
          <div className="space-y-0">
            {recentClients.map((k) => {
              const kFaktury = invoices.filter((f) => f.klientId === k.id)
              const sum = kFaktury.reduce((s, f) => s + brutto(f), 0)
              return (
                <div
                  key={k.id}
                  className="flex items-center justify-between py-3 border-b border-zinc-50 dark:border-zinc-800/60 last:border-0"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                      {initials(k.nazwa)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{k.nazwa}</p>
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate">{k.email}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className="text-sm font-semibold">{formatZl(sum)}</p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500">{kFaktury.length} fakt.</p>
                  </div>
                </div>
              )
            })}
            {recentClients.length === 0 && (
              <p className="text-sm text-zinc-400 dark:text-zinc-500 py-4 text-center">
                Brak klientów
              </p>
            )}
          </div>
        </Card>
      </div>

      <InvoicePreview
        invoice={preview}
        client={previewClient}
        company={state.firma}
        onClose={() => setPreviewId(null)}
        onMarkPaid={(id) => { updateStatus(id, 'oplacona'); setPreviewId(null) }}
      />
    </AppShell>
  )
}
