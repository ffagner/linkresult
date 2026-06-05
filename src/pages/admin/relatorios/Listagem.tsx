import { useEffect, useState } from 'react'
import { listarRelatorios, excluirRelatorio } from '@/features/relatorios/api'
import type { Relatorio } from '@/shared/types'
import { Button } from '@/shared/ui/Button'
import { Spinner } from '@/shared/ui/Spinner'
import { EmptyState } from '@/shared/ui/EmptyState'
import { StatusBadge } from '@/shared/ui/StatusBadge'
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog'
import { useToast } from '@/shared/ui/Toast'
import { Icon } from '@/shared/ui/Icon'
import { Formulario } from './Formulario'
import { CadastroLote } from './CadastroLote'
import { Link } from 'react-router-dom'

export function RelatoriosListagem() {
  const [itens, setItens] = useState<Relatorio[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showLote, setShowLote] = useState(false)
  const [editing, setEditing] = useState<Relatorio | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  async function carregar() {
    setLoading(true)
    const data = await listarRelatorios()
    setItens(data)
    setLoading(false)
  }

  useEffect(() => { carregar() }, [])

  async function handleExcluir() {
    if (!deleting) return
    setSaving(true)
    try {
      await excluirRelatorio(deleting)
      toast('Relatório excluído.')
      setDeleting(null)
      carregar()
    } catch {
      toast('Erro ao excluir.', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Spinner />

  return (
    <div>
      <div className="mb-stack-lg flex items-center justify-between">
        <h1 className="text-headline-lg text-text-primary">Relatórios</h1>
        <div className="flex gap-stack-sm">
          <Button variant="secondary" onClick={() => { setShowLote(true); setShowForm(false) }}>
            Cadastro em Lote
          </Button>
          <Button onClick={() => { setEditing(null); setShowForm(true); setShowLote(false) }}>
            + Novo Relatório
          </Button>
        </div>
      </div>

      {showForm && (
        <Formulario
          item={editing}
          onClose={() => { setShowForm(false); setEditing(null) }}
          onSalvo={() => { setShowForm(false); setEditing(null); carregar() }}
        />
      )}

      {showLote && (
        <CadastroLote
          onClose={() => setShowLote(false)}
          onSalvo={() => { setShowLote(false); carregar() }}
        />
      )}

      {itens.length === 0 ? (
        <EmptyState message="Nenhum relatório cadastrado." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border-technical bg-surface shadow-card">
          <div className="border-b border-border-technical px-gutter py-stack-md">
            <h3 className="text-headline-sm text-text-primary">Relatórios</h3>
          </div>
          <div className="overflow-x-auto">
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
                {itens.map(item => (
                  <tr key={item.id} className="group transition-colors hover:bg-surface-container-low">
                    <td className="px-gutter py-4">
                      <span className="text-body-sm text-text-secondary">{item.municipioId}</span>
                    </td>
                    <td className="px-gutter py-4">
                      <span className="text-body-sm text-text-secondary">{item.avaliacaoId}</span>
                    </td>
                    <td className="px-gutter py-4">
                      <span className="text-body-sm text-text-secondary">{item.serieId}</span>
                    </td>
                    <td className="px-gutter py-4"><StatusBadge liberado={item.liberado} /></td>
                    <td className="px-gutter py-4">
                      <div className="flex items-center gap-1">
                        <Link to={`/admin/relatorio/${item.id}`}>
                          <button className="rounded-md p-1 text-text-secondary transition-colors hover:bg-surface-container-highest hover:text-primary">
                            <Icon name="visibility" />
                          </button>
                        </Link>
                        <button
                          className="rounded-md p-1 text-text-secondary transition-colors hover:bg-surface-container-highest hover:text-primary"
                          onClick={() => { setEditing(item); setShowForm(true) }}
                        >
                          <Icon name="edit" />
                        </button>
                        <button
                          className="rounded-md p-1 text-text-secondary transition-colors hover:bg-surface-container-highest hover:text-error"
                          onClick={() => setDeleting(item.id)}
                        >
                          <Icon name="delete" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleting}
        title="Excluir relatório"
        message="Tem certeza que deseja excluir este relatório?"
        loading={saving}
        onConfirm={handleExcluir}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}
