import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { buscarRelatorio } from '@/features/relatorios/api'
import { decryptLink } from '@/shared/lib/crypto'
import type { Relatorio } from '@/shared/types'
import { Spinner } from '@/shared/ui/Spinner'
import { Button } from '@/shared/ui/Button'

export function RelatorioVisualizacao() {
  const { id } = useParams<{ id: string }>()
  const [relatorio, setRelatorio] = useState<Relatorio | null>(null)
  const [link, setLink] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      if (!id) { setError('ID não informado.'); setLoading(false); return }
      const data = await buscarRelatorio(id)
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

  if (loading) return <Spinner />
  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (!relatorio) return null

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b bg-white px-6 py-3">
        <div className="flex items-center gap-4">
          <Link to="/admin/relatorios">
            <Button variant="secondary">← Voltar</Button>
          </Link>
          <div>
            <p className="text-sm text-gray-500">Visualizando Relatório</p>
            <p className="text-sm font-medium text-gray-900">
              {relatorio.municipioId} — {relatorio.avaliacaoId} — {relatorio.serieId}
            </p>
          </div>
        </div>
      </div>
      <div className="flex-1">
        {link && (
          <iframe
            src={link}
            className="h-full w-full"
            allowFullScreen
            title="Power BI Report"
          />
        )}
      </div>
    </div>
  )
}
