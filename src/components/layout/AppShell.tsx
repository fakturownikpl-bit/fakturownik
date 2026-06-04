'use client'

import { useState, type ReactNode } from 'react'
import { Sidebar } from './Sidebar'

interface AppShellProps {
  children: ReactNode
  title: string
  actions?: ReactNode
}

export function AppShell({ children, title, actions }: AppShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-col w-52 flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile drawer overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setDrawerOpen(false)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="absolute left-0 top-0 bottom-0 w-52 z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar onClose={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 md:px-6 py-3 flex items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Hamburger (mobile) */}
            <button
              className="md:hidden text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              onClick={() => setDrawerOpen(true)}
              aria-label="Otwórz menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
              {title}
            </h2>
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
