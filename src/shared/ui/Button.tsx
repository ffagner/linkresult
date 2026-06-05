import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
  loading?: boolean
}

export function Button({ variant = 'primary', loading, children, disabled, className = '', ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center rounded-xl px-gutter py-3 font-label-md transition-all disabled:opacity-50 active:scale-95'

  const variants = {
    primary: 'bg-primary text-on-primary hover:opacity-90 shadow-md',
    secondary: 'bg-surface text-text-secondary hover:bg-surface-container border border-border-technical',
    danger: 'bg-error text-on-error hover:opacity-90',
  }

  return (
    <button className={`${base} ${variants[variant]} ${className}`} disabled={disabled || loading} {...props}>
      {loading && (
        <svg className="-ml-1 mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
}
