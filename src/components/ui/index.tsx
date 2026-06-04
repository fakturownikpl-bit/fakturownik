'use client'

import { type ReactNode, type ButtonHTMLAttributes, forwardRef } from 'react'
import type { InvoiceStatus } from '@/types'
import { STATUS_LABELS, STATUS_COLORS } from '@/types'

// ─── Button ───────────────────────────────────────────────────────────
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'default', size = 'md', className = '', children, ...props }, ref) => {
    const base =
      'inline-flex items-center gap-1.5 font-medium rounded-lg border cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-1 dark:focus:ring-zinc-500'

    const variants = {
      default:
        'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700',
      primary:
        'bg-zinc-900 dark:bg-zinc-100 border-zinc-900 dark:border-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-300',
      danger:
        'bg-white dark:bg-zinc-800 border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20',
      ghost:
        'bg-transparent border-transparent text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800',
    }

    const sizes = {
      sm: 'px-2.5 py-1 text-xs',
      md: 'px-3.5 py-1.5 text-sm',
      lg: 'px-5 py-2.5 text-sm',
    }

    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'

// ─── Badge ────────────────────────────────────────────────────────────
export function Badge({ status }: { status: InvoiceStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────
export function Card({
  children,
  className = '',
  padding = true,
}: {
  children: ReactNode
  className?: string
  padding?: boolean
}) {
  return (
    <div
      className={`bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl ${padding ? 'p-4 md:p-5' : ''} ${className}`}
    >
      {children}
    </div>
  )
}

// ─── Input ────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`w-full px-3 py-1.5 text-sm rounded-lg border bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100
          border-zinc-200 dark:border-zinc-700 placeholder-zinc-400 dark:placeholder-zinc-600
          focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-500
          ${error ? 'border-red-400 dark:border-red-600' : ''}
          ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  )
)
Input.displayName = 'Input'

// ─── Select ───────────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  children: ReactNode
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, className = '', children, ...props }, ref) => (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={`w-full px-3 py-1.5 text-sm rounded-lg border bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100
          border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-500 ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  )
)
Select.displayName = 'Select'

// ─── Textarea ─────────────────────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, className = '', ...props }, ref) => (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        className={`w-full px-3 py-1.5 text-sm rounded-lg border bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100
          border-zinc-200 dark:border-zinc-700 placeholder-zinc-400 dark:placeholder-zinc-600
          focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-500 resize-none ${className}`}
        {...props}
      />
    </div>
  )
)
Textarea.displayName = 'Textarea'

// ─── Modal ────────────────────────────────────────────────────────────
interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  width?: string
}

export function Modal({ open, onClose, title, children, width = 'max-w-lg' }: ModalProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm pt-16 px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`w-full ${width} bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl max-h-[80vh] overflow-y-auto`}
      >
        <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-zinc-800">
          <h3 className="text-base font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-red-500 transition-colors text-lg leading-none p-1"
          >
            ✕
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

// ─── Alert ────────────────────────────────────────────────────────────
export function Alert({
  type,
  message,
}: {
  type: 'ok' | 'err'
  message: string
}) {
  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm mb-4 ${
        type === 'ok'
          ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-800'
          : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-800'
      }`}
    >
      {type === 'ok' ? '✓' : '⚠'} {message}
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────
export function EmptyState({
  icon,
  message,
}: {
  icon: string
  message: string
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-zinc-400 dark:text-zinc-600 text-sm gap-2">
      <span className="text-3xl">{icon}</span>
      <p>{message}</p>
    </div>
  )
}

// ─── Avatar ───────────────────────────────────────────────────────────
export function Avatar({ name, size = 'sm' }: { name: string; size?: 'sm' | 'md' }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()

  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm' }

  return (
    <div
      className={`${sizes[size]} rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center font-semibold flex-shrink-0`}
    >
      {initials}
    </div>
  )
}

// ─── Stat card ────────────────────────────────────────────────────────
export function StatCard({
  label,
  value,
  color = 'default',
}: {
  label: string
  value: string
  color?: 'default' | 'green' | 'amber' | 'red'
}) {
  const colors = {
    default: 'text-zinc-900 dark:text-zinc-100',
    green: 'text-green-700 dark:text-green-400',
    amber: 'text-amber-700 dark:text-amber-400',
    red: 'text-red-700 dark:text-red-400',
  }
  return (
    <div className="bg-zinc-50 dark:bg-zinc-800/60 rounded-xl p-4 border border-zinc-100 dark:border-zinc-800">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1.5">
        {label}
      </p>
      <p className={`text-xl font-semibold ${colors[color]}`}>{value}</p>
    </div>
  )
}

// ─── Section label ────────────────────────────────────────────────────
export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2.5 mt-5 first:mt-0">
      {children}
    </p>
  )
}
