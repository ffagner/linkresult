import { useEffect, useState, type FormEvent } from 'react'
import { criarRelatoriosEmLote } from '@/features/relatorios/api'
import { listarMunicipios } from '@/features/municipios/api'
import { listarAvaliacoes } from '@/features/avaliacoes/api'
import { listarSeries } from '@/features/series/api'
import { encryptLink } from '@/shared/lib/crypto'
import type { Municipio, Avaliacao, Serie } from '@/shared/types'
import { Icon } from '@/shared/ui/Icon'
import { useToast } from '@/shared/ui/Toast'
import { SeriesRow } from '@/shared/ui/SeriesRow'
import { SelectionPanel } from '@/shared/ui/SelectionPanel'

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

  function limpar() {
    setMunicipioId('')
    setAvaliacaoId('')
    setItens([])
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
    <div className="p-stack-lg mx-auto" style={{ maxWidth: 'var(--spacing-container-max)' }}>
      <div className="mb-10 flex items-end justify-between">
        <div>
          <h2 className="mb-2 text-headline-lg text-primary">Cadastro em Lote</h2>
          <p className="max-w-2xl text-body-md text-text-secondary">
            Vincule múltiplos links de relatórios do Power BI a diferentes séries de um município simultaneamente.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={limpar}
            className="rounded-lg border border-border-technical px-6 py-2.5 text-label-md text-primary transition-all hover:bg-surface-container-low"
          >
            Limpar Formulário
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border-technical px-6 py-2.5 text-label-md text-text-secondary transition-all hover:bg-surface-container-low"
          >
            Voltar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={itens.length === 0 || saving}
            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-label-md text-on-primary shadow-md transition-all hover:opacity-90 disabled:opacity-50"
          >
            <Icon name="save" />
            Salvar Todos ({itens.length})
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-12 gap-gutter">
          <SelectionPanel
            municipios={municipios}
            avaliacoes={avaliacoes}
            municipioId={municipioId}
            avaliacaoId={avaliacaoId}
            onMunicipioChange={setMunicipioId}
            onAvaliacaoChange={setAvaliacaoId}
          />

          <div className="col-span-12 lg:col-span-8">
            <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border-technical bg-surface shadow-card">
              <div className="flex items-center justify-between border-b border-border-technical bg-surface-container-lowest p-6">
                <div className="flex items-center gap-3">
                  <Icon name="list_alt" className="text-primary" />
                  <h3 className="text-headline-sm text-primary">Séries e Vínculos de Relatórios</h3>
                </div>
                <button
                  type="button"
                  onClick={adicionarItem}
                  className="flex items-center gap-2 rounded-lg px-4 py-2 text-label-md text-primary transition-all hover:bg-primary-fixed-dim/20"
                >
                  <Icon name="add" />
                  Adicionar Série
                </button>
              </div>

              {itens.length > 0 ? (
                <div className="max-h-[600px] space-y-stack-md overflow-y-auto bg-background/50 p-6">
                  {itens.map((item, idx) => (
                    <SeriesRow
                      key={idx}
                      idx={idx}
                      serieId={item.serieId}
                      link={item.link}
                      series={series}
                      onUpdate={atualizarItem}
                      onRemove={removerItem}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center p-12 text-center">
                  <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-surface-container">
                    <Icon name="add_task" className="text-5xl text-text-secondary" />
                  </div>
                  <h4 className="mb-2 text-headline-sm text-primary">Nenhuma série adicionada</h4>
                  <p className="mb-6 text-body-sm text-text-secondary">
                    Clique no botão acima para começar a cadastrar os links das séries.
                  </p>
                </div>
              )}

              <div className="border-t border-border-technical bg-surface-container-lowest p-6">
                <div className="flex items-center gap-4 rounded-lg border border-border-technical/50 bg-surface-container-low p-4 text-text-secondary">
                  <Icon name="warning" className="text-warning" />
                  <p className="text-body-sm">
                    Certifique-se de salvar todas as alterações antes de sair. As alterações não salvas serão perdidas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
