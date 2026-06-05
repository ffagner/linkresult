import { useEffect, useState, type FormEvent } from 'react'
import { criarRelatoriosEmLote } from '@/features/relatorios/api'
import { listarMunicipios } from '@/features/municipios/api'
import { listarAvaliacoes } from '@/features/avaliacoes/api'
import { listarSeries } from '@/features/series/api'
import { encryptLink } from '@/shared/lib/crypto'
import type { Municipio, Avaliacao, Serie } from '@/shared/types'
import { Button } from '@/shared/ui/Button'
import { useToast } from '@/shared/ui/Toast'

interface CadastroLoteProps {
  onClose: () => void
  onSalvo: () => void
}

interface ItemLote {
  serieId: string
  link: string
}

export function CadastroLote({ onClose, onSalvo }: CadastroLoteProps) {
  const [municipios, setMunicipios] = useState<Municipio[]>([])
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([])
  const [series, setSeries] = useState<Serie[]>([])
  const [municipioId, setMunicipioId] = useState('')
  const [avaliacaoId, setAvaliacaoId] = useState('')
  const [itens, setItens] = useState<ItemLote[]>([])
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    Promise.all([listarMunicipios(), listarAvaliacoes(), listarSeries()]).then(([m, a, s]) => {
      setMunicipios(m)
      setAvaliacoes(a)
      setSeries(s)
    })
  }, [])

  function adicionarItem() {
    setItens(prev => [...prev, { serieId: '', link: '' }])
  }

  function removerItem(idx: number) {
    setItens(prev => prev.filter((_, i) => i !== idx))
  }

  function atualizarItem(idx: number, campo: keyof ItemLote, valor: string) {
    setItens(prev => prev.map((item, i) => i === idx ? { ...item, [campo]: valor } : item))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (itens.length === 0) return
    setSaving(true)
    try {
      const itensEncriptados = await Promise.all(
        itens.map(async item => ({
          serieId: item.serieId,
          linkEncriptado: await encryptLink(item.link),
        }))
      )
      await criarRelatoriosEmLote({
        municipioId,
        avaliacaoId,
        itens: itensEncriptados,
      })
      toast(`${itensEncriptados.length} relatório(s) criado(s) com sucesso.`)
      onSalvo()
    } catch {
      toast('Erro ao salvar em lote.', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mb-6 rounded-lg border border-border-technical bg-surface p-6">
      <h2 className="mb-4 text-lg font-semibold text-on-surface">Cadastro em Lote</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-wrap gap-4">
          <div className="w-64">
            <label className="block text-sm font-medium text-on-surface-variant">Município</label>
            <select required value={municipioId} onChange={e => setMunicipioId(e.target.value)}
              className="mt-1 block w-full rounded border border-border-technical bg-surface px-3 py-2 text-sm text-on-surface focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary">
              <option value="">Selecione</option>
              {municipios.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
            </select>
          </div>
          <div className="w-64">
            <label className="block text-sm font-medium text-on-surface-variant">Avaliação</label>
            <select required value={avaliacaoId} onChange={e => setAvaliacaoId(e.target.value)}
              className="mt-1 block w-full rounded border border-border-technical bg-surface px-3 py-2 text-sm text-on-surface focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary">
              <option value="">Selecione</option>
              {avaliacoes.map(a => <option key={a.id} value={a.id}>{a.nome} ({a.ano})</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-on-surface-variant">Séries e Links</h3>
            <Button type="button" variant="secondary" onClick={adicionarItem}>+ Adicionar Série</Button>
          </div>
          {itens.map((item, idx) => (
            <div key={idx} className="flex items-end gap-3">
              <div className="w-48">
                <label className="block text-xs font-medium text-on-surface-variant">Série</label>
                <select required value={item.serieId} onChange={e => atualizarItem(idx, 'serieId', e.target.value)}
                  className="mt-1 block w-full rounded border border-border-technical bg-surface px-3 py-2 text-sm text-on-surface focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary">
                  <option value="">Selecione</option>
                  {series.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-on-surface-variant">Link Power BI</label>
                <input type="url" required value={item.link} onChange={e => atualizarItem(idx, 'link', e.target.value)}
                  className="mt-1 block w-full rounded border border-border-technical bg-surface px-3 py-2 text-sm text-on-surface focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
                  placeholder="https://app.powerbi.com/..." />
              </div>
              <Button type="button" variant="danger" onClick={() => removerItem(idx)}>Remover</Button>
            </div>
          ))}
          {itens.length === 0 && (
            <p className="text-sm text-text-secondary">Clique em "Adicionar Série" para começar.</p>
          )}
        </div>

        <div className="flex gap-2">
          <Button type="submit" loading={saving} disabled={itens.length === 0}>
            Salvar Todos ({itens.length})
          </Button>
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
        </div>
      </form>
    </div>
  )
}
