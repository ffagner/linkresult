interface StatusBadgeProps {
  liberado: boolean
}

export function StatusBadge({ liberado }: StatusBadgeProps) {
  if (liberado) {
    return (
      <span className="rounded-full bg-success/10 px-2 py-1 text-[10px] font-bold uppercase tracking-tighter text-success">
        Liberado
      </span>
    )
  }

  return (
    <span className="rounded-full bg-text-secondary/10 px-2 py-1 text-[10px] font-bold uppercase tracking-tighter text-text-secondary">
      Pendente
    </span>
  )
}
