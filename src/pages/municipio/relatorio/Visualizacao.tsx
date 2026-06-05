import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { buscarRelatorio } from '@/features/relatorios/api'
import { listarAvaliacoes } from '@/features/avaliacoes/api'
import { listarSeries } from '@/features/series/api'
import { decryptLink } from '@/shared/lib/crypto'
import { useAuth } from '@/app/providers/AuthProvider'
import type { Relatorio, Avaliacao, Serie } from '@/shared/types'
import { Spinner } from '@/shared/ui/Spinner'
import { Button } from '@/shared/ui/Button'

export function MunicipioRelatorioVisualizacao() {
  const { id } = useParams<{ id: string }>()
  const { profile } = useAuth()
  const [relatorio, setRelatorio] = useState<Relatorio | null>(null)
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([])
  const [series, setSeries] = useState<Serie[]>([])
  const [link, setLink] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      if (!id) { setError('ID não informado.'); setLoading(false); return }
      if (!profile?.municipioId) { setError('Perfil não encontrado.'); setLoading(false); return }

      const [data, a, s] = await Promise.all([
        buscarRelatorio(id),
        listarAvaliacoes(),
        listarSeries(),
      ])
      setAvaliacoes(a)
      setSeries(s)

      if (!data) {
        setError('Relatório não encontrado.')
        setLoading(false)
        return
      }

      if (data.municipioId !== profile.municipioId || !data.liberado) {
        setError('Você não tem permissão para acessar este relatório.')
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
  }, [id, profile?.municipioId])

  function getNome(id: string, lista: { id: string; nome: string }[]) {
    return lista.find(item => item.id === id)?.nome ?? id
  }

  if (loading) return <Spinner />
  if (error) return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="text-center">
        <p className="mb-4 text-error">{error}</p>
        <Link to="/municipio">
          <Button variant="secondary">← Voltar</Button>
        </Link>
      </div>
    </div>
  )
  if (!relatorio) return null

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b bg-surface px-6 py-3">
        <div className="flex items-center gap-4">
          <Link to="/municipio">
            <Button variant="secondary">← Voltar</Button>
          </Link>
          <div>
            <p className="text-sm text-text-secondary">Visualizando Relatório</p>
            <p className="text-sm font-medium text-on-surface">
              {getNome(relatorio.avaliacaoId, avaliacoes)} — {getNome(relatorio.serieId, series)}
            </p>
          </div>
        </div>
      </div>
      <div className="flex-1">
        {link && (
          <iframe src={link} className="h-full w-full" allowFullScreen title="Power BI Report" />
        )}
      </div>
    </div>
  )
}
