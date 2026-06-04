'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import { createClient } from '@/lib/supabase'
import type { Client, Company, Invoice, InvoiceStatus } from '@/types'

// ─── State ────────────────────────────────────────────────────────────
interface AppState {
  firma: Company
  klienci: Client[]
  faktury: Invoice[]
  loading: boolean
}

const DEFAULT_COMPANY: Company = {
  nazwa: '',
  nip: '',
  adres: '',
  email: '',
  tel: '',
  nr_konta: '',
}

function defaultState(): AppState {
  return {
    firma: DEFAULT_COMPANY,
    klienci: [],
    faktury: [],
    loading: true,
  }
}

// ─── DB row → domain type mappers ────────────────────────────────────
function rowToClient(row: Record<string, unknown>): Client {
  return {
    id: row.id as number,
    nazwa: row.nazwa as string,
    email: (row.email as string) ?? '',
    tel: (row.tel as string) ?? '',
    adres: (row.adres as string) ?? '',
    nip: (row.nip as string) ?? '',
  }
}

function rowToInvoice(row: Record<string, unknown>): Invoice {
  return {
    id: row.id as string,
    klientId: (row.klient_id as number) ?? 0,
    data: row.data as string,
    termin: row.termin as string,
    status: row.status as InvoiceStatus,
    pozycje: (row.pozycje as Invoice['pozycje']) ?? [],
    uwagi: (row.uwagi as string) ?? '',
  }
}

// ─── Context ──────────────────────────────────────────────────────────
interface AppContextValue {
  state: AppState
  // Invoice ops
  addInvoice: (inv: Omit<Invoice, 'id'> & { id: string }) => Promise<void>
  updateStatus: (id: string, status: InvoiceStatus) => Promise<void>
  deleteInvoice: (id: string) => Promise<void>
  // Client ops
  addClient: (client: Omit<Client, 'id'>) => Promise<Client>
  updateClient: (client: Client) => Promise<void>
  deleteClient: (id: number) => Promise<void>
  // Company ops
  updateCompany: (company: Company) => Promise<void>
  // Compat shim for pages that spread dispatch
  dispatch: (action: LegacyAction) => void
}

// Legacy action type for backward compat with pages not yet migrated
type LegacyAction =
  | { type: 'UPDATE_INVOICE_STATUS'; id: string; status: InvoiceStatus }
  | { type: 'DELETE_INVOICE'; id: string }
  | { type: 'UPDATE_CLIENT'; payload: Client }
  | { type: 'DELETE_CLIENT'; id: number }
  | { type: 'UPDATE_COMPANY'; payload: Company }

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState())
  const supabase = createClient()

  // ─── Load all data for the current user ──────────────────────────
  const loadData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setState({ ...defaultState(), loading: false })
      return
    }

    const [firmaRes, klienciRes, fakturyRes] = await Promise.all([
      supabase.from('firmy').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('klienci').select('*').eq('user_id', user.id).order('created_at'),
      supabase.from('faktury').select('*').eq('user_id', user.id).order('created_at'),
    ])

    setState({
      firma: firmaRes.data
        ? {
            nazwa: firmaRes.data.nazwa,
            nip: firmaRes.data.nip,
            adres: firmaRes.data.adres,
            email: firmaRes.data.email,
            tel: firmaRes.data.tel,
            nr_konta: firmaRes.data.nr_konta,
          }
        : DEFAULT_COMPANY,
      klienci: (klienciRes.data ?? []).map(rowToClient),
      faktury: (fakturyRes.data ?? []).map(rowToInvoice),
      loading: false,
    })
  }, [supabase])

  useEffect(() => {
    loadData()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadData()
    })
    return () => subscription.unsubscribe()
  }, [loadData, supabase.auth])

  // ─── Invoice operations ───────────────────────────────────────────
  const addInvoice = useCallback(async (inv: Omit<Invoice, 'id'> & { id: string }) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('faktury').insert({
      id: inv.id,
      user_id: user.id,
      klient_id: inv.klientId || null,
      data: inv.data,
      termin: inv.termin,
      status: inv.status,
      pozycje: inv.pozycje as unknown as Record<string, unknown>[],
      uwagi: inv.uwagi,
    })
    if (error) throw error

    setState((prev) => ({ ...prev, faktury: [...prev.faktury, inv] }))
  }, [supabase])

  const updateStatus = useCallback(async (id: string, status: InvoiceStatus) => {
    const { error } = await supabase.from('faktury').update({ status }).eq('id', id)
    if (error) throw error

    setState((prev) => ({
      ...prev,
      faktury: prev.faktury.map((f) => (f.id === id ? { ...f, status } : f)),
    }))
  }, [supabase])

  const deleteInvoice = useCallback(async (id: string) => {
    const { error } = await supabase.from('faktury').delete().eq('id', id)
    if (error) throw error

    setState((prev) => ({ ...prev, faktury: prev.faktury.filter((f) => f.id !== id) }))
  }, [supabase])

  // ─── Client operations ────────────────────────────────────────────
  const addClient = useCallback(async (client: Omit<Client, 'id'>): Promise<Client> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('klienci')
      .insert({ user_id: user.id, ...client })
      .select()
      .single()
    if (error) throw error

    const newClient = rowToClient(data as unknown as Record<string, unknown>)
    setState((prev) => ({ ...prev, klienci: [...prev.klienci, newClient] }))
    return newClient
  }, [supabase])

  const updateClient = useCallback(async (client: Client) => {
    const { error } = await supabase
      .from('klienci')
      .update({ nazwa: client.nazwa, email: client.email, tel: client.tel, adres: client.adres, nip: client.nip })
      .eq('id', client.id)
    if (error) throw error

    setState((prev) => ({
      ...prev,
      klienci: prev.klienci.map((k) => (k.id === client.id ? client : k)),
    }))
  }, [supabase])

  const deleteClient = useCallback(async (id: number) => {
    const { error } = await supabase.from('klienci').delete().eq('id', id)
    if (error) throw error

    setState((prev) => ({ ...prev, klienci: prev.klienci.filter((k) => k.id !== id) }))
  }, [supabase])

  // ─── Company operations ───────────────────────────────────────────
  const updateCompany = useCallback(async (company: Company) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('firmy').upsert(
      { user_id: user.id, ...company },
      { onConflict: 'user_id' }
    )
    if (error) throw error

    setState((prev) => ({ ...prev, firma: company }))
  }, [supabase])

  // ─── Legacy dispatch shim ─────────────────────────────────────────
  const dispatch = useCallback((action: LegacyAction) => {
    switch (action.type) {
      case 'UPDATE_INVOICE_STATUS':
        updateStatus(action.id, action.status)
        break
      case 'DELETE_INVOICE':
        deleteInvoice(action.id)
        break
      case 'UPDATE_CLIENT':
        updateClient(action.payload)
        break
      case 'DELETE_CLIENT':
        deleteClient(action.id)
        break
      case 'UPDATE_COMPANY':
        updateCompany(action.payload)
        break
    }
  }, [updateStatus, deleteInvoice, updateClient, deleteClient, updateCompany])

  return (
    <AppContext.Provider
      value={{
        state,
        addInvoice,
        updateStatus,
        deleteInvoice,
        addClient,
        updateClient,
        deleteClient,
        updateCompany,
        dispatch,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}

// ─── Convenience hooks ────────────────────────────────────────────────
export function useInvoices() {
  const { state, addInvoice, updateStatus, deleteInvoice } = useApp()
  return {
    invoices: state.faktury,
    // nextId kept for compat — generate ID externally now
    nextId: state.faktury.length + 1,
    addInvoice,
    updateStatus,
    deleteInvoice,
  }
}

export function useClients() {
  const { state, addClient, updateClient, deleteClient } = useApp()
  return {
    clients: state.klienci,
    addClient,
    updateClient,
    deleteClient,
  }
}

export function useCompany() {
  const { state, updateCompany } = useApp()
  return {
    company: state.firma,
    updateCompany,
  }
}
