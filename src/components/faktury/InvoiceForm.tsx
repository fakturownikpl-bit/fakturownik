'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useInvoices, useClients } from '@/hooks/useAppState'
import { useCompany } from '@/hooks/useAppState'
import {
  Button,
  Input,
  Select,
  Textarea,
  Card,
  SectionLabel,
  Alert,
  Modal,
} from '@/components/ui'
import { generateInvoiceId, today, daysFromNow, formatZl } from '@/lib/utils'
import { VAT_RATES, type InvoiceItem, type InvoiceStatus, type Invoice } from '@/types'
import type { Client } from '@/types'

const emptyItem = (): InvoiceItem => ({ opis: '', ilosc: 1, cena: 0, vat: 23 })

interface InvoiceFormProps {
  presetClientId?: number
  editInvoice?: Invoice
}

export function InvoiceForm({ presetClientId, editInvoice }: InvoiceFormProps) {
  const router = useRouter()
  const { addInvoice, updateInvoice, nextId } = useInvoices()
  const { clients, addClient } = useClients()
  const { company } = useCompany()

  const isEdit = !!editInvoice

  const [klientId, setKlientId] = useState<number | ''>(editInvoice?.klientId ?? presetClientId ?? '')
  const [data, setData] = useState(editInvoice?.data ?? today())
  const [termin, setTermin] = useState(editInvoice?.termin ?? daysFromNow(14))
  const [uwagi, setUwagi] = useState(editInvoice?.uwagi ?? '')
  const [konto, setKonto] = useState(company.nr_konta)
  const [pozycje, setPozycje] = useState<InvoiceItem[]>(editInvoice?.pozycje ?? [emptyItem()])
  const [nr, setNr] = useState(editInvoice?.id ?? generateInvoiceId(nextId))
  const [alert, setAlert] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null)
  const [saving, setSaving] = useState(false)

  // New client modal
  const [addClientOpen, setAddClientOpen] = useState(false)
  const [newClient, setNewClient] = useState<Omit<Client, 'id'>>({
    nazwa: '', email: '', tel: '', adres: '', nip: '',
  })
  const [addingClient, setAddingClient] = useState(false)

  // Totals
  const netto = pozycje.reduce((s, p) => s + p.ilosc * p.cena, 0)
  const vatSum = pozycje.reduce((s, p) => s + p.ilosc * p.cena * (p.vat / 100), 0)
  const gross = netto + vatSum

  const updateItem = (i: number, field: keyof InvoiceItem, val: string | number) => {
    setPozycje((prev) => prev.map((p, idx) => (idx === i ? { ...p, [field]: val } : p)))
  }

  const removeItem = (i: number) => {
    setPozycje((prev) => prev.filter((_, idx) => idx !== i))
  }

  const save = async (status: InvoiceStatus) => {
    if (!klientId) { setAlert({ type: 'err', msg: 'Wybierz klienta.' }); return }
    const valid = pozycje.filter((p) => p.opis.trim())
    if (!valid.length) { setAlert({ type: 'err', msg: 'Dodaj co najmniej jedną pozycję.' }); return }
    setSaving(true)
    try {
      if (isEdit) {
        await updateInvoice({ ...editInvoice, id: nr, klientId: Number(klientId), data, termin, status, pozycje: valid, uwagi })
      } else {
        await addInvoice({ id: nr, klientId: Number(klientId), data, termin, status, pozycje: valid, uwagi })
      }
      router.push('/faktury')
    } catch (err) {
      setAlert({ type: 'err', msg: `Błąd zapisu: ${(err as Error).message}` })
      setSaving(false)
    }
  }

  const handleAddClient = async () => {
    if (!newClient.nazwa.trim()) return
    setAddingClient(true)
    try {
      const created = await addClient(newClient)
      setKlientId(created.id)
      setAddClientOpen(false)
      setNewClient({ nazwa: '', email: '', tel: '', adres: '', nip: '' })
    } finally {
      setAddingClient(false)
    }
  }

  return (
    <div className="max-w-2xl">
      {alert && <Alert type={alert.type} message={alert.msg} />}

      <Card className="mb-4">
        <SectionLabel>Numer faktury</SectionLabel>
        <Input label="Nr faktury" value={nr} onChange={(e) => setNr(e.target.value)} />

        <SectionLabel>Dane klienta</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Klient"
            value={klientId}
            onChange={(e) => setKlientId(e.target.value ? Number(e.target.value) : '')}
          >
            <option value="">Wybierz klienta...</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.nazwa}</option>
            ))}
          </Select>
          <div className="flex items-end">
            <Button onClick={() => setAddClientOpen(true)}>＋ Nowy klient</Button>
          </div>
        </div>

        <SectionLabel>Daty</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Data wystawienia"
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
          />
          <Input
            label="Termin płatności"
            type="date"
            value={termin}
            onChange={(e) => setTermin(e.target.value)}
          />
        </div>
      </Card>

      <Card className="mb-4">
        <SectionLabel>Pozycje faktury</SectionLabel>

        <div className="hidden sm:grid grid-cols-[1fr_60px_90px_70px_28px] gap-2 mb-2">
          {['Opis', 'Ilość', 'Cena netto', 'VAT %', ''].map((h) => (
            <p key={h} className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              {h}
            </p>
          ))}
        </div>

        {pozycje.map((p, i) => (
          <div key={i} className="grid grid-cols-[1fr_60px_90px_70px_28px] gap-2 mb-2 items-center">
            <input
              value={p.opis}
              placeholder="Opis pracy / materiałów"
              onChange={(e) => updateItem(i, 'opis', e.target.value)}
              className="w-full px-3 py-1.5 text-sm rounded-lg border bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-400"
            />
            <input
              type="number" min="0" step="0.5"
              value={p.ilosc}
              onChange={(e) => updateItem(i, 'ilosc', parseFloat(e.target.value) || 0)}
              className="w-full px-2 py-1.5 text-sm rounded-lg border bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-400 text-center"
            />
            <input
              type="number" min="0" step="0.01"
              value={p.cena}
              onChange={(e) => updateItem(i, 'cena', parseFloat(e.target.value) || 0)}
              className="w-full px-2 py-1.5 text-sm rounded-lg border bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-400 text-right"
            />
            <select
              value={p.vat}
              onChange={(e) => updateItem(i, 'vat', parseInt(e.target.value))}
              className="w-full px-2 py-1.5 text-sm rounded-lg border bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-400"
            >
              {VAT_RATES.map((v) => (
                <option key={v} value={v}>{v}%</option>
              ))}
            </select>
            <button
              onClick={() => removeItem(i)}
              className="text-zinc-400 hover:text-red-500 transition-colors text-lg leading-none"
              aria-label="Usuń pozycję"
            >✕</button>
          </div>
        ))}

        <Button className="mt-2" onClick={() => setPozycje((p) => [...p, emptyItem()])}>
          ＋ Dodaj pozycję
        </Button>

        <div className="border-t border-zinc-100 dark:border-zinc-800 mt-4 pt-3 space-y-1 text-right">
          <div className="flex justify-end gap-10 text-sm text-zinc-500 dark:text-zinc-400">
            <span>Wartość netto</span><span>{formatZl(netto)}</span>
          </div>
          <div className="flex justify-end gap-10 text-sm text-zinc-500 dark:text-zinc-400">
            <span>VAT</span><span>{formatZl(vatSum)}</span>
          </div>
          <div className="flex justify-end gap-10 text-base font-semibold">
            <span>Do zapłaty (brutto)</span><span>{formatZl(gross)}</span>
          </div>
        </div>
      </Card>

      <Card className="mb-6">
        <SectionLabel>Uwagi i sposób płatności</SectionLabel>
        <div className="grid gap-3">
          <Input label="Numer konta bankowego" value={konto} onChange={(e) => setKonto(e.target.value)} />
          <Textarea label="Uwagi" rows={2} placeholder="Opcjonalne uwagi do faktury..." value={uwagi} onChange={(e) => setUwagi(e.target.value)} />
        </div>
      </Card>

      <div className="flex gap-3 justify-end">
        <Button onClick={() => save('projekt')} disabled={saving}>
          💾 Zapisz projekt
        </Button>
        <Button variant="primary" onClick={() => save('nieoplacona')} disabled={saving}>
          {saving ? 'Zapisywanie…' : isEdit ? '💾 Zapisz zmiany' : '📤 Wystaw fakturę'}
        </Button>
      </div>

      <Modal open={addClientOpen} onClose={() => setAddClientOpen(false)} title="Nowy klient">
        <div className="space-y-3">
          <Input label="Imię i nazwisko / Nazwa firmy" placeholder="Jan Kowalski" value={newClient.nazwa} onChange={(e) => setNewClient(p => ({ ...p, nazwa: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="E-mail" type="email" value={newClient.email} onChange={(e) => setNewClient(p => ({ ...p, email: e.target.value }))} />
            <Input label="Telefon" placeholder="600 000 000" value={newClient.tel} onChange={(e) => setNewClient(p => ({ ...p, tel: e.target.value }))} />
          </div>
          <Input label="Adres" placeholder="ul. Przykładowa 1, 00-000 Miasto" value={newClient.adres} onChange={(e) => setNewClient(p => ({ ...p, adres: e.target.value }))} />
          <Input label="NIP (opcjonalnie — dla firm)" placeholder="123-456-78-90" value={newClient.nip} onChange={(e) => setNewClient(p => ({ ...p, nip: e.target.value }))} />
          <div className="flex gap-2 justify-end pt-1">
            <Button onClick={() => setAddClientOpen(false)}>Anuluj</Button>
            <Button variant="primary" onClick={handleAddClient} disabled={addingClient}>
              {addingClient ? 'Zapisywanie…' : '✓ Zapisz'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}