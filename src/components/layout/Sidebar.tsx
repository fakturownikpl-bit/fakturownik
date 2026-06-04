'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useCompany } from '@/hooks/useAppState'
import { useTheme } from '@/components/ui/ThemeProvider'
import { createClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Panel główny', icon: '⊞' },
  { href: '/faktury', label: 'Faktury', icon: '🧾' },
  { href: '/klienci', label: 'Klienci', icon: '👥' },
  { href: '/faktury/nowa', label: 'Nowa faktura', icon: '＋' },
  { href: '/ustawienia', label: 'Ustawienia', icon: '⚙' },
]

interface SidebarProps {
  onClose?: () => void
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { company } = useCompany()
  const { theme, setTheme, resolved } = useTheme()
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserEmail(user?.email ?? null)
    })
  }, [])

  const toggleTheme = () => setTheme(resolved === 'dark' ? 'light' : 'dark')

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <aside className="flex flex-col h-full bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-900 text-xs font-bold flex-shrink-0">
            F
          </div>
          <div>
            <h1 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Fakturownik
            </h1>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 -mt-0.5">
              Faktury dla rzemieślników
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon }) => {
          const active =
            href === '/dashboard'
              ? pathname === '/dashboard' || pathname === '/'
              : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium'
                  : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <span className="text-base w-5 text-center flex-shrink-0">{icon}</span>
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
        {/* Company / user info */}
        <div className="px-1">
          <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate">
            {company.nazwa || 'Moja firma'}
          </p>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate">
            {userEmail ?? ''}
          </p>
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-2 w-full px-3 py-1.5 rounded-lg text-xs text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label="Przełącz motyw"
        >
          <span>{resolved === 'dark' ? '☀' : '☾'}</span>
          {resolved === 'dark' ? 'Jasny motyw' : 'Ciemny motyw'}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-1.5 rounded-lg text-xs text-zinc-500 dark:text-zinc-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
        >
          <span>⎋</span>
          Wyloguj się
        </button>
      </div>
    </aside>
  )
}
