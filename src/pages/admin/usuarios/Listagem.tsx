import { useEffect, useState } from 'react'
import { listarUsuarios, excluirUsuario } from '@/features/usuarios/api'
import type { UserProfile } from '@/shared/types'
import { Button } from '@/shared/ui/Button'
import { Spinner } from '@/shared/ui/Spinner'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog'
import { useToast } from '@/shared/ui/Toast'
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
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
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
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-600">Nome</th>
                <th className="px-4 py-3 font-medium text-gray-600">Email</th>
                <th className="px-4 py-3 font-medium text-gray-600">Perfil</th>
                <th className="px-4 py-3 font-medium text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {itens.map(item => (
                <tr key={item.uid} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{item.nome}</td>
                  <td className="px-4 py-3">{item.email}</td>
                  <td className="px-4 py-3">{roleLabels[item.role]}</td>
                  <td className="flex gap-2 px-4 py-3">
                    <Button variant="secondary" onClick={() => { setEditing(item); setShowForm(true) }}>Editar</Button>
                    <Button variant="danger" onClick={() => setDeleting(item.uid)}>Excluir</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
