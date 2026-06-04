import { AppShell } from '@/components/layout/AppShell'
import { InvoiceForm } from '@/components/faktury/InvoiceForm'

export default function NowaFakturaPage() {
  return (
    <AppShell title="Nowa faktura">
      <InvoiceForm />
    </AppShell>
  )
}
