import { useEffect, useState } from 'react'
import { listarRelatorios, liberarRelatorio } from '@/features/relatorios/api'
import { listarMunicipios } from '@/features/municipios/api'
import { listarAvaliacoes } from '@/features/avaliacoes/api'
import { listarSeries } from '@/features/series/api'
import { useAuth } from '@/app/providers/AuthProvider'
import type { Relatorio, Municipio, Avaliacao, Serie } from '@/shared/types'
import { Button } from '@/shared/ui/Button'
import { Spinner } from '@/shared/ui/Spinner'
import { EmptyState } from '@/shared/ui/EmptyState'
import { StatusBadge } from '@/shared/ui/StatusBadge'
import { Icon } from '@/shared/ui/Icon'
import { useToast } from '@/shared/ui/Toast'
import { Link } from 'react-router-dom'

export function PedagogicoRelatoriosListagem() {
  const { profile } = useAuth()
  const [relatorios, setRelatorios] = useState<Relatorio[]>([])
  const [municipios, setMunicipios] = useState<Municipio[]>([])
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([])
  const [series, setSeries] = useState<Serie[]>([])
  const [loading, setLoading] = useState(true)

  const [filtroMunicipio, setFiltroMunicipio] = useState('')
  const [filtroAvaliacao, setFiltroAvaliacao] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('')

  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const { toast } = useToast()

  async function carregar() {
    setLoading(true)
    const [r, m, a, s] = await Promise.all([
      listarRelatorios(),
      listarMunicipios(),
      listarAvaliacoes(),
      listarSeries(),
    ])
    setRelatorios(r)
    setMunicipios(m)
    setAvaliacoes(a)
    setSeries(s)
    setLoading(false)
  }

  useEffect(() => { carregar() }, [])

  async function handleToggleLiberacao(item: Relatorio) {
    if (!profile) return
    setUpdatingId(item.id)
    try {
      await liberarRelatorio(item.id, profile.uid, !item.liberado)
      toast(item.liberado ? 'Acesso revogado.' : 'Relatório liberado.')
      carregar()
    } catch {
      toast('Erro ao atualizar.', 'error')
    } finally {
      setUpdatingId(null)
    }
  }

  function getNomeMunicipio(id: string) {
    return municipios.find(m => m.id === id)?.nome ?? id
  }

  function getNomeAvaliacao(id: string) {
    return avaliacoes.find(a => a.id === id)?.nome ?? id
  }

  function getNomeSerie(id: string) {
    return series.find(s => s.id === id)?.nome ?? id
  }

  const filtrados = relatorios.filter(r => {
    if (filtroMunicipio && r.municipioId !== filtroMunicipio) return false
    if (filtroAvaliacao && r.avaliacaoId !== filtroAvaliacao) return false
    if (filtroStatus === 'liberado' && !r.liberado) return false
    if (filtroStatus === 'pendente' && r.liberado) return false
    return true
  })

  if (loading) return <Spinner />

  return (
    <div>
      <div className="mb-stack-lg flex items-center justify-between">
        <h1 className="text-headline-lg font-bold text-text-primary">Relatórios</h1>
      </div>

      <div className="mb-stack-md flex flex-wrap gap-stack-md">
        <select value={filtroMunicipio} onChange={e => setFiltroMunicipio(e.target.value)}
          className="rounded border border-border-technical bg-surface px-3 py-2 text-body-sm text-text-primary focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary">
          <option value="">Todos os municípios</option>
          {municipios.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
        </select>
        <select value={filtroAvaliacao} onChange={e => setFiltroAvaliacao(e.target.value)}
          className="rounded border border-border-technical bg-surface px-3 py-2 text-body-sm text-text-primary focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary">
          <option value="">Todas as avaliações</option>
          {avaliacoes.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
        </select>
        <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}
          className="rounded border border-border-technical bg-surface px-3 py-2 text-body-sm text-text-primary focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary">
          <option value="">Todos os status</option>
          <option value="liberado">Liberados</option>
          <option value="pendente">Pendentes</option>
        </select>
      </div>

      {filtrados.length === 0 ? (
        <EmptyState message="Nenhum relatório encontrado." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border-technical bg-surface shadow-card">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low">
              <tr>
                <th className="px-gutter py-4 text-label-sm text-text-secondary">MUNICÍPIO</th>
                <th className="px-gutter py-4 text-label-sm text-text-secondary">AVALIAÇÃO</th>
                <th className="px-gutter py-4 text-label-sm text-text-secondary">SÉRIE</th>
                <th className="px-gutter py-4 text-label-sm text-text-secondary">STATUS</th>
                <th className="px-gutter py-4 text-label-sm text-text-secondary">AÇÕES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-technical">
              {filtrados.map(item => (
                <tr key={item.id} className="group transition-colors hover:bg-surface-container-low">
                  <td className="px-gutter py-4">
                    <span className="text-body-sm text-text-primary">{getNomeMunicipio(item.municipioId)}</span>
                  </td>
                  <td className="px-gutter py-4">
                    <span className="text-body-sm text-text-primary">{getNomeAvaliacao(item.avaliacaoId)}</span>
                  </td>
                  <td className="px-gutter py-4">
                    <span className="text-body-sm text-text-primary">{getNomeSerie(item.serieId)}</span>
                  </td>
                  <td className="px-gutter py-4"><StatusBadge liberado={item.liberado} /></td>
                  <td className="px-gutter py-4">
                    <div className="flex items-center gap-stack-sm">
                      <Link to={`/pedagogico/relatorio/${item.id}`}>
                        <button className="rounded-md p-1 text-text-secondary transition-colors hover:bg-surface-container-highest hover:text-primary">
                          <Icon name="visibility" />
                        </button>
                      </Link>
                      <Button
                        variant={item.liberado ? 'danger' : 'primary'}
                        loading={updatingId === item.id}
                        onClick={() => handleToggleLiberacao(item)}
                      >
                        {item.liberado ? 'Revogar' : 'Liberar'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
