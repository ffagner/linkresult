interface StatusBadgeProps {
  liberado: boolean
}

export function StatusBadge({ liberado }: StatusBadgeProps) {
  if (liberado) {
    return (
      <span className="inline-flex items-center rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
        Liberado
      </span>
    )
  }

  return (
    <span className="inline-flex items-center rounded-full bg-warning/10 px-2.5 py-0.5 text-xs font-medium text-warning">
      Pendente
    </span>
  )
}
