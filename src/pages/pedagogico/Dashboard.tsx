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
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Dashboard Pedagógico</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-6 text-blue-700">
          <p className="text-sm font-medium">Total de Relatórios</p>
          <p className="mt-1 text-3xl font-bold">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-green-700">
          <p className="text-sm font-medium">Liberados</p>
          <p className="mt-1 text-3xl font-bold">{stats.liberados}</p>
        </div>
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-6 text-yellow-700">
          <p className="text-sm font-medium">Pendentes</p>
          <p className="mt-1 text-3xl font-bold">{stats.pendentes}</p>
        </div>
      </div>
    </div>
  )
}
