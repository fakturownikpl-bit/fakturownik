// ─── Core domain types ────────────────────────────────────────────────
export type InvoiceStatus = 'oplacona' | 'nieoplacona' | 'projekt' | 'przeterminowana'

export const VAT_RATES = [23, 8, 5, 0] as const
export type VatRate = (typeof VAT_RATES)[number]

export interface InvoiceItem {
  opis: string
  ilosc: number
  cena: number
  vat: VatRate
}

export interface Invoice {
  id: string
  klientId: number
  data: string        // ISO date
  termin: string      // ISO date
  status: InvoiceStatus
  pozycje: InvoiceItem[]
  uwagi: string
}

export interface Client {
  id: number
  nazwa: string
  email: string
  tel: string
  adres: string
  nip: string
}

export interface Company {
  nazwa: string
  nip: string
  adres: string
  email: string
  tel: string
  nr_konta: string
}

// ─── Computed / UI helpers ────────────────────────────────────────────
export interface InvoiceTotals {
  netto: number
  vat: number
  brutto: number
}

export interface DashboardStats {
  total: number
  zaplacone: number
  naleznosci: number
  przeterminowane: number
}

// ─── Form state ───────────────────────────────────────────────────────
export type NewInvoiceForm = Omit<Invoice, 'id' | 'status'>

export const STATUS_LABELS: Record<InvoiceStatus, string> = {
  oplacona: 'Opłacona',
  nieoplacona: 'Nieopłacona',
  projekt: 'Projekt',
  przeterminowana: 'Przeterminowana',
}

export const STATUS_COLORS: Record<InvoiceStatus, string> = {
  oplacona:
    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  nieoplacona:
    'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  projekt: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
  przeterminowana: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}
