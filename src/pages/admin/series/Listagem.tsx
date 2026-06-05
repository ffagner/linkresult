import { useEffect, useState } from 'react'
import { listarSeries, excluirSerie } from '@/features/series/api'
import type { Serie } from '@/shared/types'
import { Button } from '@/shared/ui/Button'
import { Spinner } from '@/shared/ui/Spinner'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog'
import { useToast } from '@/shared/ui/Toast'
import { Formulario } from './Formulario'

export function SeriesListagem() {
  const [itens, setItens] = useState<Serie[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Serie | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  async function carregar() {
    setLoading(true)
    const data = await listarSeries()
    setItens(data)
    setLoading(false)
  }

  useEffect(() => { carregar() }, [])

  async function handleExcluir() {
    if (!deleting) return
    setSaving(true)
    try {
      await excluirSerie(deleting)
      toast('Série excluída.')
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
        <h1 className="text-2xl font-bold text-on-surface">Séries</h1>
        <Button onClick={() => { setEditing(null); setShowForm(true) }}>+ Nova Série</Button>
      </div>

      {showForm && (
        <Formulario
          item={editing}
          onClose={() => { setShowForm(false); setEditing(null) }}
          onSalvo={() => { setShowForm(false); setEditing(null); carregar() }}
        />
      )}

      {itens.length === 0 ? (
        <EmptyState message="Nenhuma série cadastrada." />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border-technical bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-surface-container-low">
              <tr>
                <th className="px-4 py-3 font-medium text-on-surface-variant">Nome</th>
                <th className="px-4 py-3 font-medium text-on-surface-variant">Ordem</th>
                <th className="px-4 py-3 font-medium text-on-surface-variant">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-technical">
              {itens.map(item => (
                <tr key={item.id} className="hover:bg-surface-container-low">
                  <td className="px-4 py-3">{item.nome}</td>
                  <td className="px-4 py-3">{item.ordem}</td>
                  <td className="flex gap-2 px-4 py-3">
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
        title="Excluir série"
        message="Tem certeza que deseja excluir esta série?"
        loading={saving}
        onConfirm={handleExcluir}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}
