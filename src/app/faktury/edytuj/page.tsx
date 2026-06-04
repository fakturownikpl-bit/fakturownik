'use client'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { InvoiceForm } from '@/components/faktury/InvoiceForm'
import { useInvoices } from '@/hooks/useAppState'
import type { Invoice } from '@/types'

function EditContent() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const { invoices } = useInvoices()
  const invoice = id ? invoices.find((f) => f.id === id) : undefined

  if (!invoice) {
    return (
      <AppShell title="Edytuj fakturę">
        <p className="text-zinc-500">Faktura nie znaleziona.</p>
      </AppShell>
    )
  }

  return (
    <AppShell title={`Edytuj ${invoice.id}`}>
      <InvoiceForm editInvoice={invoice as Invoice} />
    </AppShell>
  )
}

export default function EditPage() {
  return (
    <Suspense>
      <EditContent />
    </Suspense>
  )
}