'use client'

import { useState, useEffect } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { useCompany } from '@/hooks/useAppState'
import { useTheme } from '@/components/ui/ThemeProvider'
import { Card, Button, Input, SectionLabel, Alert } from '@/components/ui'
import type { Company } from '@/types'

export default function UstawieniaPage() {
  const { company, updateCompany } = useCompany()
  const { theme, setTheme } = useTheme()
  const [form, setForm] = useState<Company>(company)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => { setForm(company) }, [company])

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateCompany(form)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  const field = (key: keyof Company) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [key]: e.target.value })),
  })

  return (
    <AppShell title="Ustawienia">
      <div className="max-w-xl space-y-4">
        {saved && <Alert type="ok" message="Dane firmy zaktualizowane." />}

        {/* Company data */}
        <Card>
          <SectionLabel>Dane firmy</SectionLabel>
          <div className="space-y-3">
            <Input label="Nazwa firmy" {...field('nazwa')} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="NIP" placeholder="123-456-78-90" {...field('nip')} />
              <Input label="Telefon" placeholder="600 000 000" {...field('tel')} />
            </div>
            <Input label="Adres" placeholder="ul. Przykładowa 1, 00-000 Miasto" {...field('adres')} />
            <Input label="E-mail" type="email" {...field('email')} />
            <Input label="Numer konta bankowego (IBAN)" {...field('nr_konta')} />
          </div>
          <div className="flex justify-end mt-4">
            <Button variant="primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Zapisywanie…' : '✓ Zapisz zmiany'}
            </Button>
          </div>
        </Card>

        {/* Theme */}
        <Card>
          <SectionLabel>Motyw</SectionLabel>
          <div className="flex gap-2">
            {(['light', 'dark', 'system'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`flex-1 py-2 px-3 text-sm rounded-lg border transition-colors ${
                  theme === t
                    ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium'
                    : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                }`}
              >
                {t === 'light' ? '☀ Jasny' : t === 'dark' ? '☾ Ciemny' : '⊙ Systemowy'}
              </button>
            ))}
          </div>
        </Card>

        {/* Plan info */}
        <Card>
          <SectionLabel>Plan abonamentowy</SectionLabel>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { name: 'Darmowy', price: '0 zł', features: 'Do 3 faktur/mies.\n1 firma\nPDF do druku' },
              { name: 'Podstawowy', price: '39 zł', features: 'Nieograniczone faktury\nEksport PDF + e-mail\nPrzypomnienia', highlight: true },
              { name: 'Pro', price: '79 zł', features: 'Wszystko z Podstawowego\nWiele firm\nRaporty' },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`border rounded-xl p-3 text-center ${
                  plan.highlight
                    ? 'border-blue-400 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-zinc-200 dark:border-zinc-700'
                }`}
              >
                {plan.highlight && (
                  <span className="inline-block bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[10px] font-semibold px-2 py-0.5 rounded-full mb-1">
                    Polecany
                  </span>
                )}
                <p className="text-sm font-semibold mb-1">{plan.name}</p>
                <p className="text-lg font-bold mb-2">
                  {plan.price}
                  <span className="text-xs font-normal text-zinc-400">/mies.</span>
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 whitespace-pre-line leading-relaxed">
                  {plan.features}
                </p>
              </div>
            ))}
          </div>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center">
            Aktualnie używasz planu <strong>Podstawowego</strong>. Kontakt: pomoc@fakturownik.pl
          </p>
        </Card>
      </div>
    </AppShell>
  )
}
