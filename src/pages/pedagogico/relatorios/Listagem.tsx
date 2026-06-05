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
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-on-surface">Relatórios</h1>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <select value={filtroMunicipio} onChange={e => setFiltroMunicipio(e.target.value)}
          className="rounded border border-border-technical bg-surface px-3 py-2 text-sm text-on-surface focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary">
          <option value="">Todos os municípios</option>
          {municipios.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
        </select>
        <select value={filtroAvaliacao} onChange={e => setFiltroAvaliacao(e.target.value)}
          className="rounded border border-border-technical bg-surface px-3 py-2 text-sm text-on-surface focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary">
          <option value="">Todas as avaliações</option>
          {avaliacoes.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
        </select>
        <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}
          className="rounded border border-border-technical bg-surface px-3 py-2 text-sm text-on-surface focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary">
          <option value="">Todos os status</option>
          <option value="liberado">Liberados</option>
          <option value="pendente">Pendentes</option>
        </select>
      </div>

      {filtrados.length === 0 ? (
        <EmptyState message="Nenhum relatório encontrado." />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border-technical bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-surface-container-low">
              <tr>
                <th className="px-4 py-3 font-medium text-on-surface-variant">Município</th>
                <th className="px-4 py-3 font-medium text-on-surface-variant">Avaliação</th>
                <th className="px-4 py-3 font-medium text-on-surface-variant">Série</th>
                <th className="px-4 py-3 font-medium text-on-surface-variant">Status</th>
                <th className="px-4 py-3 font-medium text-on-surface-variant">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-technical">
              {filtrados.map(item => (
                <tr key={item.id} className="hover:bg-surface-container-low">
                  <td className="px-4 py-3">{getNomeMunicipio(item.municipioId)}</td>
                  <td className="px-4 py-3">{getNomeAvaliacao(item.avaliacaoId)}</td>
                  <td className="px-4 py-3">{getNomeSerie(item.serieId)}</td>
                  <td className="px-4 py-3"><StatusBadge liberado={item.liberado} /></td>
                  <td className="flex gap-2 px-4 py-3">
                    <Link to={`/pedagogico/relatorio/${item.id}`}>
                      <Button variant="secondary">Visualizar</Button>
                    </Link>
                    <Button
                      variant={item.liberado ? 'danger' : 'primary'}
                      loading={updatingId === item.id}
                      onClick={() => handleToggleLiberacao(item)}
                    >
                      {item.liberado ? 'Revogar' : 'Liberar'}
                    </Button>
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
