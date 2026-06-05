import { Button } from './Button'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'primary'
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ open, title, message, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', variant = 'danger', loading, onConfirm, onCancel }: ConfirmDialogProps) {
  if (!open) return null

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-sm rounded-xl bg-surface p-stack-lg shadow-card">
        <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
        <p className="mt-2 text-body-sm text-text-secondary">{message}</p>
        <div className="mt-stack-lg flex justify-end gap-stack-md">
          <Button variant="secondary" onClick={onCancel}>{cancelLabel}</Button>
          <Button variant={variant} loading={loading} onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  )
}
