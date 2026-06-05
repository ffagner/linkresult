import { useEffect, useState } from 'react'
import { listarMunicipios } from '@/features/municipios/api'
import { listarAvaliacoes } from '@/features/avaliacoes/api'
import { listarRelatorios } from '@/features/relatorios/api'
import { Spinner } from '@/shared/ui/Spinner'

export function AdminDashboard() {
  const [stats, setStats] = useState({ municipios: 0, avaliacoes: 0, relatorios: 0, liberados: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [municipios, avaliacoes, relatorios] = await Promise.all([
        listarMunicipios(),
        listarAvaliacoes(),
        listarRelatorios(),
      ])
      setStats({
        municipios: municipios.length,
        avaliacoes: avaliacoes.length,
        relatorios: relatorios.length,
        liberados: relatorios.filter(r => r.liberado).length,
      })
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <Spinner />

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-on-surface">Dashboard</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card title="Municípios" value={stats.municipios} color="blue" />
        <Card title="Avaliações" value={stats.avaliacoes} color="green" />
        <Card title="Relatórios" value={stats.relatorios} color="purple" />
        <Card title="Liberados" value={stats.liberados} color="amber" />
      </div>
    </div>
  )
}

function Card({ title, value, color }: { title: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-primary-fixed text-primary border-primary-fixed',
    green: 'bg-success/10 text-success border-success/30',
    purple: 'bg-primary-fixed text-primary border-primary-fixed',
    amber: 'bg-warning/10 text-warning border-warning/30',
  }

  return (
    <div className={`rounded-lg border p-6 card-shadow ${colors[color]}`}>
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
    </div>
  )
}
