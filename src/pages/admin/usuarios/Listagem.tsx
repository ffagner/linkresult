import { useEffect, useState } from 'react'
import { listarUsuarios, excluirUsuario } from '@/features/usuarios/api'
import type { UserProfile } from '@/shared/types'
import { Button } from '@/shared/ui/Button'
import { Spinner } from '@/shared/ui/Spinner'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog'
import { useToast } from '@/shared/ui/Toast'
import { Icon } from '@/shared/ui/Icon'
import { Formulario } from './Formulario'

const roleLabels: Record<string, string> = {
  admin: 'Admin',
  pedagogico: 'Pedagógico',
  municipio: 'Município',
}

export function UsuariosListagem() {
  const [itens, setItens] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<UserProfile | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  async function carregar() {
    setLoading(true)
    const data = await listarUsuarios()
    setItens(data)
    setLoading(false)
  }

  useEffect(() => { carregar() }, [])

  async function handleExcluir() {
    if (!deleting) return
    setSaving(true)
    try {
      await excluirUsuario(deleting)
      toast('Usuário excluído.')
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
        <h1 className="text-headline-lg text-text-primary">Usuários</h1>
        <Button onClick={() => { setEditing(null); setShowForm(true) }}>+ Novo Usuário</Button>
      </div>

      {showForm && (
        <Formulario
          item={editing}
          onClose={() => { setShowForm(false); setEditing(null) }}
          onSalvo={() => { setShowForm(false); setEditing(null); carregar() }}
        />
      )}

      {itens.length === 0 ? (
        <EmptyState message="Nenhum usuário cadastrado." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border-technical bg-surface shadow-card">
          <div className="border-b border-border-technical px-gutter py-stack-md">
            <h3 className="text-headline-sm text-text-primary">Usuários</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low">
                <tr>
                  <th className="px-gutter py-4 text-label-sm text-text-secondary">NOME</th>
                  <th className="px-gutter py-4 text-label-sm text-text-secondary">EMAIL</th>
                  <th className="px-gutter py-4 text-label-sm text-text-secondary">PERFIL</th>
                  <th className="px-gutter py-4 text-label-sm text-text-secondary">AÇÕES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-technical">
                {itens.map(item => (
                  <tr key={item.uid} className="group transition-colors hover:bg-surface-container-low">
                    <td className="px-gutter py-4">
                      <span className="text-body-md text-text-primary">{item.nome}</span>
                    </td>
                    <td className="px-gutter py-4">
                      <span className="text-body-sm text-text-secondary">{item.email}</span>
                    </td>
                    <td className="px-gutter py-4">
                      <span className="text-body-sm text-text-secondary">{roleLabels[item.role]}</span>
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
                          onClick={() => setDeleting(item.uid)}
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
        title="Excluir usuário"
        message="Tem certeza que deseja excluir este usuário?"
        loading={saving}
        onConfirm={handleExcluir}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}
