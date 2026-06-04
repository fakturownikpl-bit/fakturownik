'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AppShell } from '@/components/layout/AppShell'
import { useApp, useInvoices } from '@/hooks/useAppState'
import { Card, Button } from '@/components/ui'
import { InvoiceTable } from '@/components/faktury/InvoiceTable'
import { InvoicePreview } from '@/components/faktury/InvoicePreview'
import { resolvedStatus } from '@/lib/utils'
import type { InvoiceStatus } from '@/types'

type FilterTab = 'wszystkie' | InvoiceStatus

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'wszystkie', label: 'Wszystkie' },
  { key: 'nieoplacona', label: 'Nieopłacone' },
  { key: 'oplacona', label: 'Opłacone' },
  { key: 'projekt', label: 'Projekty' },
  { key: 'przeterminowana', label: 'Przeterminowane' },
]

export default function FakturyPage() {
  const { state } = useApp()
  const { invoices, updateStatus } = useInvoices()
  const [tab, setTab] = useState<FilterTab>('wszystkie')
  const [previewId, setPreviewId] = useState<string | null>(null)

  const preview = previewId ? invoices.find((f) => f.id === previewId) ?? null : null
  const previewClient = preview ? state.klienci.find((c) => c.id === preview.klientId) : undefined

  const filtered = tab === 'wszystkie'
    ? [...invoices].reverse()
    : [...invoices].reverse().filter((f) => resolvedStatus(f) === tab)

  return (
    <AppShell
      title="Faktury"
      actions={
        <Link href="/faktury/nowa">
          <Button variant="primary">＋ Nowa faktura</Button>
        </Link>
      }
    >
      {/* Filter tabs */}
      <div className="flex gap-1 border-b border-zinc-200 dark:border-zinc-800 mb-4 overflow-x-auto">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-3 py-2 text-sm whitespace-nowrap border-b-2 -mb-px transition-colors ${
              tab === key
                ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 font-medium'
                : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <Card padding={false}>
        <InvoiceTable
          invoices={filtered}
          clients={state.klienci}
          onView={setPreviewId}
          onMarkPaid={(id) => updateStatus(id, 'oplacona')}
        />
      </Card>

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
