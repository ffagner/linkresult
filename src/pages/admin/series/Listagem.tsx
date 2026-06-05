import { useEffect, useState } from 'react'
import { listarSeries, excluirSerie } from '@/features/series/api'
import type { Serie } from '@/shared/types'
import { Button } from '@/shared/ui/Button'
import { Spinner } from '@/shared/ui/Spinner'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog'
import { useToast } from '@/shared/ui/Toast'
import { Icon } from '@/shared/ui/Icon'
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
        <div className="overflow-hidden rounded-xl border border-border-technical bg-surface shadow-card">
          <div className="border-b border-border-technical px-gutter py-stack-md">
            <h3 className="text-headline-sm text-text-primary">Séries</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low">
                <tr>
                  <th className="px-gutter py-4 text-label-sm text-text-secondary">NOME</th>
                  <th className="px-gutter py-4 text-label-sm text-text-secondary">ORDEM</th>
                  <th className="px-gutter py-4 text-label-sm text-text-secondary">AÇÕES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-technical">
                {itens.map(item => (
                  <tr key={item.id} className="group transition-colors hover:bg-surface-container-low">
                    <td className="px-gutter py-4">
                      <span className="text-body-md text-text-primary">{item.nome}</span>
                    </td>
                    <td className="px-gutter py-4">
                      <span className="text-body-sm text-text-secondary">{item.ordem}</span>
                    </td>
                    <td className="px-gutter py-4">
                      <div className="flex items-center gap-1">
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
        title="Excluir série"
        message="Tem certeza que deseja excluir esta série?"
        loading={saving}
        onConfirm={handleExcluir}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}
