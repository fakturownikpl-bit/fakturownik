'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export default function RejestracjaPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirm) {
      setError('Hasła nie są identyczne.')
      return
    }
    if (password.length < 6) {
      setError('Hasło musi mieć co najmniej 6 znaków.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
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
              <div className="text-4xl mb-3">📬</div>
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                Sprawdź skrzynkę
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Wysłaliśmy link aktywacyjny na{' '}
                <strong className="text-zinc-700 dark:text-zinc-300">{email}</strong>.
                Kliknij go, aby aktywować konto.
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
                Utwórz konto
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-5">
                Masz już konto?{' '}
                <Link href="/auth/login" className="text-zinc-900 dark:text-zinc-100 underline underline-offset-2">
                  Zaloguj się
                </Link>
              </p>

              <form onSubmit={handleRegister} className="space-y-4">
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

                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Hasło
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 znaków"
                    className="w-full px-3 py-2 text-sm rounded-lg border bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-400 placeholder-zinc-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Powtórz hasło
                  </label>
                  <input
                    type="password"
                    required
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="••••••••"
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
                  {loading ? 'Rejestrowanie…' : 'Utwórz konto'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
