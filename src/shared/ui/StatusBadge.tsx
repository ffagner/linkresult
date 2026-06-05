interface StatusBadgeProps {
  liberado: boolean
}

export function StatusBadge({ liberado }: StatusBadgeProps) {
  if (liberado) {
    return (
      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
        Liberado
      </span>
    )
  }

  return (
    <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
      Pendente
    </span>
  )
}
