import type { Invoice, InvoiceTotals, InvoiceStatus } from '@/types'

// ─── Financial calculations ────────────────────────────────────────────
export function calcTotals(invoice: Invoice): InvoiceTotals {
  const netto = invoice.pozycje.reduce((s, p) => s + p.ilosc * p.cena, 0)
  const vat = invoice.pozycje.reduce(
    (s, p) => s + p.ilosc * p.cena * (p.vat / 100),
    0
  )
  return { netto, vat, brutto: netto + vat }
}

export function brutto(invoice: Invoice): number {
  return calcTotals(invoice).brutto
}

// ─── Formatters ───────────────────────────────────────────────────────
export function formatZl(n: number): string {
  return (
    n.toLocaleString('pl-PL', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + ' zł'
  )
}

export function formatDate(iso: string): string {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}.${m}.${y}`
}

// ─── Status helpers ────────────────────────────────────────────────────
export function isOverdue(invoice: Invoice): boolean {
  return (
    invoice.status === 'nieoplacona' && new Date(invoice.termin) < new Date()
  )
}

export function resolvedStatus(invoice: Invoice): InvoiceStatus {
  return isOverdue(invoice) ? 'przeterminowana' : invoice.status
}

// ─── String helpers ────────────────────────────────────────────────────
export function initials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()
}

// ─── Invoice number generator ─────────────────────────────────────────
export function generateInvoiceId(nextId: number): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const n = String(nextId).padStart(3, '0')
  return `FV/${y}/${m}/${n}`
}

// ─── Date helpers ─────────────────────────────────────────────────────
export function today(): string {
  return new Date().toISOString().split('T')[0]
}

export function daysFromNow(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}
