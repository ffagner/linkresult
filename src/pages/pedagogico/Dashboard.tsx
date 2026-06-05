import { useEffect, useState } from 'react'
import { listarRelatorios } from '@/features/relatorios/api'
import { Spinner } from '@/shared/ui/Spinner'

export function PedagogicoDashboard() {
  const [stats, setStats] = useState({ total: 0, liberados: 0, pendentes: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const relatorios = await listarRelatorios()
      const liberados = relatorios.filter(r => r.liberado)
      setStats({
        total: relatorios.length,
        liberados: liberados.length,
        pendentes: relatorios.length - liberados.length,
      })
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <Spinner />

  return (
    <div>
      <h1 className="mb-stack-lg text-headline-lg font-bold text-text-primary">Dashboard Pedagógico</h1>
      <div className="grid grid-cols-1 gap-gutter sm:grid-cols-3">
        <div className="rounded-xl border border-primary-fixed bg-primary-fixed p-stack-lg text-primary shadow-card">
          <p className="text-body-sm font-medium">Total de Relatórios</p>
          <p className="mt-stack-md text-headline-lg font-bold">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-success/30 bg-success/10 p-stack-lg text-success shadow-card">
          <p className="text-body-sm font-medium">Liberados</p>
          <p className="mt-stack-md text-headline-lg font-bold">{stats.liberados}</p>
        </div>
        <div className="rounded-xl border border-warning/30 bg-warning/10 p-stack-lg text-warning shadow-card">
          <p className="text-body-sm font-medium">Pendentes</p>
          <p className="mt-stack-md text-headline-lg font-bold">{stats.pendentes}</p>
        </div>
      </div>
    </div>
  )
}
