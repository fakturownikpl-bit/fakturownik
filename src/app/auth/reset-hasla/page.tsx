'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export default function ResetHaslaPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/callback?next=/auth/nowe-haslo`,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8 justify-center">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-900 text-sm font-bold">
            F
          </div>
          <div>
            <h1 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Fakturownik</h1>
            <p className="text-[10px] text-zinc-400 -mt-0.5">Faktury dla rzemieślników</p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          {success ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-3">📨</div>
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                Link wysłany
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Sprawdź skrzynkę e-mail. Link do resetowania hasła ważny jest przez 1 godzinę.
              </p>
              <Link
                href="/auth/login"
                className="inline-block mt-4 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 underline underline-offset-2"
              >
                Wróć do logowania
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                Resetuj hasło
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-5">
                Podaj adres e-mail, a wyślemy Ci link do ustawienia nowego hasła.
              </p>

              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jan@przyklad.pl"
                    className="w-full px-3 py-2 text-sm rounded-lg border bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-400 placeholder-zinc-400"
                  />
                </div>

                {error && (
                  <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 px-4 text-sm font-medium rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-300 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Wysyłanie…' : 'Wyślij link resetujący'}
                </button>

                <Link
                  href="/auth/login"
                  className="block text-center text-sm text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                >
                  ← Wróć do logowania
                </Link>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
