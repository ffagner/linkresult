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
      <h1 className="mb-6 text-2xl font-bold text-on-surface">Dashboard Pedagógico</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="rounded-lg border border-primary-fixed bg-primary-fixed p-6 text-primary">
          <p className="text-sm font-medium">Total de Relatórios</p>
          <p className="mt-1 text-3xl font-bold">{stats.total}</p>
        </div>
        <div className="rounded-lg border border-success/30 bg-success/10 p-6 text-success">
          <p className="text-sm font-medium">Liberados</p>
          <p className="mt-1 text-3xl font-bold">{stats.liberados}</p>
        </div>
        <div className="rounded-lg border border-warning/30 bg-warning/10 p-6 text-warning">
          <p className="text-sm font-medium">Pendentes</p>
          <p className="mt-1 text-3xl font-bold">{stats.pendentes}</p>
        </div>
      </div>
    </div>
  )
}
