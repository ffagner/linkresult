import { useEffect, useState } from 'react'
import { listarRelatorios, excluirRelatorio } from '@/features/relatorios/api'
import type { Relatorio } from '@/shared/types'
import { Button } from '@/shared/ui/Button'
import { Spinner } from '@/shared/ui/Spinner'
import { EmptyState } from '@/shared/ui/EmptyState'
import { StatusBadge } from '@/shared/ui/StatusBadge'
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog'
import { useToast } from '@/shared/ui/Toast'
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
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-on-surface">Relatórios</h1>
        <div className="flex gap-2">
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
              {itens.map(item => (
                <tr key={item.id} className="hover:bg-surface-container-low">
                  <td className="px-4 py-3">{item.municipioId}</td>
                  <td className="px-4 py-3">{item.avaliacaoId}</td>
                  <td className="px-4 py-3">{item.serieId}</td>
                  <td className="px-4 py-3"><StatusBadge liberado={item.liberado} /></td>
                  <td className="flex gap-2 px-4 py-3">
                    <Link to={`/admin/relatorio/${item.id}`}>
                      <Button variant="secondary">Visualizar</Button>
                    </Link>
                    <Button variant="secondary" onClick={() => { setEditing(item); setShowForm(true) }}>Editar</Button>
                    <Button variant="danger" onClick={() => setDeleting(item.id)}>Excluir</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
