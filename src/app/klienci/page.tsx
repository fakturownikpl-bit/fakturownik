'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AppShell } from '@/components/layout/AppShell'
import { useClients, useInvoices } from '@/hooks/useAppState'
import { Card, Button, Modal, Input, Avatar, EmptyState } from '@/components/ui'
import { brutto, formatZl } from '@/lib/utils'
import type { Client } from '@/types'

const emptyClient = (): Omit<Client, 'id'> => ({
  nazwa: '', email: '', tel: '', adres: '', nip: '',
})

export default function KlienciPage() {
  const { clients, addClient, updateClient, deleteClient } = useClients()
  const { invoices } = useInvoices()

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Client | null>(null)
  const [form, setForm] = useState<Omit<Client, 'id'>>(emptyClient())
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)

  const openAdd = () => {
    setEditing(null)
    setForm(emptyClient())
    setModalOpen(true)
  }

  const openEdit = (client: Client) => {
    setEditing(client)
    setForm({ nazwa: client.nazwa, email: client.email, tel: client.tel, adres: client.adres, nip: client.nip })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.nazwa.trim()) return
    setSaving(true)
    try {
      if (editing) {
        await updateClient({ ...editing, ...form })
      } else {
        await addClient(form)
      }
      setModalOpen(false)
    } finally {
      setSaving(false)
    }
  }

  const filtered = clients.filter((c) =>
    c.nazwa.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AppShell
      title="Klienci"
      actions={<Button variant="primary" onClick={openAdd}>＋ Dodaj klienta</Button>}
    >
      {/* Search */}
      <div className="mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Szukaj klienta..."
          className="w-full max-w-sm px-3 py-1.5 text-sm rounded-lg border bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-400"
        />
      </div>

      <Card padding={false}>
        {filtered.length === 0 ? (
          <EmptyState icon="👥" message="Brak klientów" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                  {['Nazwa', 'Telefon', 'Faktury', 'Łącznie', ''].map((h) => (
                    <th
                      key={h}
                      className="text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 py-2 px-4"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((k) => {
                  const kFaktury = invoices.filter((f) => f.klientId === k.id)
                  const sum = kFaktury.reduce((s, f) => s + brutto(f), 0)
                  return (
                    <tr
                      key={k.id}
                      className="border-b border-zinc-50 dark:border-zinc-800/60 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={k.nazwa} />
                          <div>
                            <p className="font-medium text-zinc-900 dark:text-zinc-100">{k.nazwa}</p>
                            <p className="text-xs text-zinc-400 dark:text-zinc-500">{k.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-zinc-500 dark:text-zinc-400">{k.tel || '—'}</td>
                      <td className="py-3 px-4 text-zinc-700 dark:text-zinc-300">{kFaktury.length}</td>
                      <td className="py-3 px-4 font-medium">{formatZl(sum)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/faktury/nowa?klientId=${k.id}`}>
                            <Button size="sm">📄 Faktura</Button>
                          </Link>
                          <Button size="sm" onClick={() => openEdit(k)}>✏</Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={async () => {
                              if (confirm(`Usunąć klienta "${k.nazwa}"?`)) await deleteClient(k.id)
                            }}
                          >
                            🗑
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add / edit modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edytuj klienta' : 'Nowy klient'}
      >
        <div className="space-y-3">
          <Input
            label="Imię i nazwisko / Nazwa firmy"
            placeholder="Jan Kowalski"
            value={form.nazwa}
            onChange={(e) => setForm((p) => ({ ...p, nazwa: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="E-mail"
              type="email"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            />
            <Input
              label="Telefon"
              placeholder="600 000 000"
              value={form.tel}
              onChange={(e) => setForm((p) => ({ ...p, tel: e.target.value }))}
            />
          </div>
          <Input
            label="Adres"
            placeholder="ul. Przykładowa 1, 00-000 Miasto"
            value={form.adres}
            onChange={(e) => setForm((p) => ({ ...p, adres: e.target.value }))}
          />
          <Input
            label="NIP (opcjonalnie — dla firm)"
            placeholder="123-456-78-90"
            value={form.nip}
            onChange={(e) => setForm((p) => ({ ...p, nip: e.target.value }))}
          />
          <div className="flex gap-2 justify-end pt-2">
            <Button onClick={() => setModalOpen(false)}>Anuluj</Button>
            <Button variant="primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Zapisywanie…' : '✓ Zapisz'}
            </Button>
          </div>
        </div>
      </Modal>
    </AppShell>
  )
}
