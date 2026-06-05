import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { buscarRelatorio, liberarRelatorio } from '@/features/relatorios/api'
import { listarMunicipios } from '@/features/municipios/api'
import { listarAvaliacoes } from '@/features/avaliacoes/api'
import { listarSeries } from '@/features/series/api'
import { decryptLink } from '@/shared/lib/crypto'
import { useAuth } from '@/app/providers/AuthProvider'
import type { Relatorio, Municipio, Avaliacao, Serie } from '@/shared/types'
import { Spinner } from '@/shared/ui/Spinner'
import { Button } from '@/shared/ui/Button'
import { useToast } from '@/shared/ui/Toast'

export function PedagogicoRelatorioVisualizacao() {
  const { id } = useParams<{ id: string }>()
  const { profile } = useAuth()
  const [relatorio, setRelatorio] = useState<Relatorio | null>(null)
  const [municipios, setMunicipios] = useState<Municipio[]>([])
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([])
  const [series, setSeries] = useState<Serie[]>([])
  const [link, setLink] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    async function load() {
      if (!id) { setError('ID não informado.'); setLoading(false); return }
      const [data, m, a, s] = await Promise.all([
        buscarRelatorio(id),
        listarMunicipios(),
        listarAvaliacoes(),
        listarSeries(),
      ])
      setMunicipios(m)
      setAvaliacoes(a)
      setSeries(s)
      if (!data) {
        setError('Relatório não encontrado.')
        setLoading(false)
        return
      }
      setRelatorio(data)
      try {
        const decrypted = await decryptLink(data.linkEncriptado)
        setLink(decrypted)
      } catch {
        setError('Erro ao descriptografar o link.')
      }
      setLoading(false)
    }
    load()
  }, [id])

  async function handleToggleLiberacao() {
    if (!relatorio || !profile) return
    setUpdating(true)
    try {
      await liberarRelatorio(relatorio.id, profile.uid, !relatorio.liberado)
      setRelatorio(prev => prev ? { ...prev, liberado: !prev.liberado } : prev)
      toast(relatorio.liberado ? 'Acesso revogado.' : 'Relatório liberado.')
    } catch {
      toast('Erro ao atualizar.', 'error')
    } finally {
      setUpdating(false)
    }
  }

  function getNome(id: string, lista: { id: string; nome: string }[]) {
    return lista.find(item => item.id === id)?.nome ?? id
  }

  if (loading) return <Spinner />
  if (error) return <div className="p-6 text-error">{error}</div>
  if (!relatorio) return null

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b bg-surface px-6 py-3">
        <div className="flex items-center gap-4">
          <Link to="/pedagogico/relatorios">
            <Button variant="secondary">← Voltar</Button>
          </Link>
          <div>
            <p className="text-sm text-text-secondary">Visualizando Relatório</p>
            <p className="text-sm font-medium text-on-surface">
              {getNome(relatorio.municipioId, municipios)} — {getNome(relatorio.avaliacaoId, avaliacoes)} — {getNome(relatorio.serieId, series)}
            </p>
          </div>
        </div>
        <Button
          variant={relatorio.liberado ? 'danger' : 'primary'}
          loading={updating}
          onClick={handleToggleLiberacao}
        >
          {relatorio.liberado ? 'Revogar Acesso' : 'Liberar Relatório'}
        </Button>
      </div>
      <div className="flex-1">
        {link && (
          <iframe src={link} className="h-full w-full" allowFullScreen title="Power BI Report" />
        )}
      </div>
    </div>
  )
}
