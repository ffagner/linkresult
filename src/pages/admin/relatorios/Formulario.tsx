import { useEffect, useState, type FormEvent } from 'react'
import { criarRelatorio, atualizarRelatorio } from '@/features/relatorios/api'
import { listarMunicipios } from '@/features/municipios/api'
import { listarAvaliacoes } from '@/features/avaliacoes/api'
import { listarSeries } from '@/features/series/api'
import { encryptLink } from '@/shared/lib/crypto'
import type { Municipio, Avaliacao, Serie, Relatorio } from '@/shared/types'
import { Button } from '@/shared/ui/Button'
import { useToast } from '@/shared/ui/Toast'

interface FormularioProps {
  item: Relatorio | null
  onClose: () => void
  onSalvo: () => void
}

export function Formulario({ item, onClose, onSalvo }: FormularioProps) {
  const [municipios, setMunicipios] = useState<Municipio[]>([])
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([])
  const [series, setSeries] = useState<Serie[]>([])
  const [municipioId, setMunicipioId] = useState(item?.municipioId ?? '')
  const [avaliacaoId, setAvaliacaoId] = useState(item?.avaliacaoId ?? '')
  const [serieId, setSerieId] = useState(item?.serieId ?? '')
  const [link, setLink] = useState('')
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    Promise.all([listarMunicipios(), listarAvaliacoes(), listarSeries()]).then(([m, a, s]) => {
      setMunicipios(m)
      setAvaliacoes(a)
      setSeries(s)
    })
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const linkEncriptado = await encryptLink(link)
      if (item) {
        await atualizarRelatorio(item.id, { municipioId, avaliacaoId, serieId, linkEncriptado })
        toast('Relatório atualizado.')
      } else {
        await criarRelatorio({ municipioId, avaliacaoId, serieId, linkEncriptado })
        toast('Relatório criado.')
      }
      onSalvo()
    } catch {
      toast('Erro ao salvar.', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mb-stack-lg rounded-xl border border-border-technical bg-surface p-stack-lg shadow-card">
      <h2 className="mb-stack-md text-headline-sm font-semibold text-text-primary">{item ? 'Editar' : 'Novo'} Relatório</h2>
      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-gutter">
        <div className="w-64">
          <label className="block text-label-sm font-medium text-text-secondary">Município</label>
          <select required value={municipioId} onChange={e => setMunicipioId(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-border-technical bg-surface px-3 py-3 text-body-sm text-text-primary focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary">
            <option value="">Selecione</option>
            {municipios.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
          </select>
        </div>
        <div className="w-64">
          <label className="block text-label-sm font-medium text-text-secondary">Avaliação</label>
          <select required value={avaliacaoId} onChange={e => setAvaliacaoId(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-border-technical bg-surface px-3 py-3 text-body-sm text-text-primary focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary">
            <option value="">Selecione</option>
            {avaliacoes.map(a => <option key={a.id} value={a.id}>{a.nome} ({a.ano})</option>)}
          </select>
        </div>
        <div className="w-48">
          <label className="block text-label-sm font-medium text-text-secondary">Série</label>
          <select required value={serieId} onChange={e => setSerieId(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-border-technical bg-surface px-3 py-3 text-body-sm text-text-primary focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary">
            <option value="">Selecione</option>
            {series.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
          </select>
        </div>
        <div className="min-w-[300px] flex-1">
          <label className="block text-label-sm font-medium text-text-secondary">Link do Power BI</label>
          <input type="url" required value={link} onChange={e => setLink(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-border-technical bg-surface px-3 py-3 text-body-sm text-text-primary focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
            placeholder="https://app.powerbi.com/..." />
        </div>
        <div className="flex gap-stack-sm">
          <Button type="submit" loading={saving}>Salvar</Button>
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
        </div>
      </form>
    </div>
  )
}
