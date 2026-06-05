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
      <h1 className="mb-stack-md text-headline-lg font-bold text-text-primary">Meus Relatórios</h1>
      <p className="mb-stack-lg text-body-sm text-text-secondary">
        {profile?.municipioId ? `Município: ${profile.municipioId}` : ''}
      </p>

      {relatorios.length === 0 ? (
        <EmptyState message="Nenhum relatório disponível ainda." />
      ) : (
        <div className="space-y-stack-lg">
          {agrupados.map(({ avaliacao, itens }) => (
            <div key={avaliacao.id} className="rounded-xl border border-border-technical bg-surface shadow-card">
              <div className="border-b border-border-technical px-gutter py-stack-md">
                <h2 className="text-headline-sm font-semibold text-text-primary">{avaliacao.nome}</h2>
                <p className="text-body-sm text-text-secondary">Ano: {avaliacao.ano}</p>
              </div>
              <div className="divide-y divide-border-technical">
                {itens.map(item => (
                  <div key={item.id} className="flex items-center justify-between px-gutter py-stack-md">
                    <span className="text-body-sm text-text-secondary">{getNomeSerie(item.serieId)}</span>
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
