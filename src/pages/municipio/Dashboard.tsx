import { useEffect, useState } from 'react'
import { useAuth } from '@/app/providers/AuthProvider'
import { listarRelatoriosPorMunicipio } from '@/features/relatorios/api'
import { listarAvaliacoes } from '@/features/avaliacoes/api'
import { listarSeries } from '@/features/series/api'
import type { Relatorio, Avaliacao, Serie } from '@/shared/types'
import { Spinner } from '@/shared/ui/Spinner'
import { EmptyState } from '@/shared/ui/EmptyState'
import { Button } from '@/shared/ui/Button'
import { Link } from 'react-router-dom'

export function MunicipioDashboard() {
  const { profile } = useAuth()
  const [relatorios, setRelatorios] = useState<Relatorio[]>([])
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([])
  const [series, setSeries] = useState<Serie[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile?.municipioId) return setLoading(false)
    async function load(id: string) {
      const [r, a, s] = await Promise.all([
        listarRelatoriosPorMunicipio(id),
        listarAvaliacoes(),
        listarSeries(),
      ])
      setRelatorios(r)
      setAvaliacoes(a)
      setSeries(s)
      setLoading(false)
    }
    load(profile.municipioId!)
  }, [profile?.municipioId])

  function getNomeSerie(id: string) {
    return series.find(s => s.id === id)?.nome ?? id
  }

  const agrupados = avaliacoes
    .filter(av => relatorios.some(r => r.avaliacaoId === av.id))
    .map(av => ({
      avaliacao: av,
      itens: relatorios.filter(r => r.avaliacaoId === av.id),
    }))

  if (loading) return <Spinner />

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-on-surface">Meus Relatórios</h1>
      <p className="mb-6 text-sm text-text-secondary">
        {profile?.municipioId ? `Município: ${profile.municipioId}` : ''}
      </p>

      {relatorios.length === 0 ? (
        <EmptyState message="Nenhum relatório disponível ainda." />
      ) : (
        <div className="space-y-6">
          {agrupados.map(({ avaliacao, itens }) => (
            <div key={avaliacao.id} className="rounded-lg border border-border-technical bg-surface">
              <div className="border-b border-border-technical px-6 py-4">
                <h2 className="text-lg font-semibold text-on-surface">{avaliacao.nome}</h2>
                <p className="text-sm text-text-secondary">Ano: {avaliacao.ano}</p>
              </div>
              <div className="divide-y">
                {itens.map(item => (
                  <div key={item.id} className="flex items-center justify-between px-6 py-3">
                    <span className="text-sm text-on-surface-variant">{getNomeSerie(item.serieId)}</span>
                    <Link to={`/municipio/relatorio/${item.id}`}>
                      <Button>Ver Relatório</Button>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
