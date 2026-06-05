import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth'
import { useAuth } from '@/app/providers/AuthProvider'
import { auth } from '@/shared/lib/firebase'
import { Button } from '@/shared/ui/Button'
import { useToast } from '@/shared/ui/Toast'

const roleLabels: Record<string, string> = {
  admin: 'Admin',
  pedagogico: 'Pedagógico',
  municipio: 'Município',
}

function getHome(role: string) {
  return role === 'admin' ? '/admin' : role === 'pedagogico' ? '/pedagogico' : '/municipio'
}

export function PerfilPage() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  async function handleLogout() {
    await signOut(auth)
    navigate('/login')
  }

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault()
    if (!user?.email) return
    setSaving(true)
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword)
      await reauthenticateWithCredential(user, credential)
      await updatePassword(user, newPassword)
      toast('Senha alterada com sucesso.')
      setShowForm(false)
      setCurrentPassword('')
      setNewPassword('')
    } catch {
      toast('Erro ao alterar senha. Verifique a senha atual.', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="rounded-xl border border-gray-200 bg-white p-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Meu Perfil</h1>

        <div className="mb-8 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-500">Nome</label>
            <p className="text-gray-900">{profile?.nome}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Email</label>
            <p className="text-gray-900">{profile?.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Perfil</label>
            <p className="text-gray-900">{profile ? roleLabels[profile.role] : ''}</p>
          </div>
          {profile?.municipioId && (
            <div>
              <label className="block text-sm font-medium text-gray-500">Município</label>
              <p className="text-gray-900">{profile.municipioId}</p>
            </div>
          )}
        </div>

        {showForm ? (
          <form onSubmit={handleChangePassword} className="mb-6 space-y-4 border-t pt-6">
            <h2 className="text-lg font-semibold text-gray-900">Alterar Senha</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700">Senha atual</label>
              <input type="password" required value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nova senha</label>
              <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            <div className="flex gap-2">
              <Button type="submit" loading={saving}>Salvar</Button>
              <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>Cancelar</Button>
            </div>
          </form>
        ) : (
          <div className="flex gap-2 border-t pt-6">
            <Button onClick={() => setShowForm(true)}>Alterar Senha</Button>
            <Button variant="secondary" onClick={() => navigate(getHome(profile?.role ?? 'municipio'))}>Voltar</Button>
            <Button variant="danger" onClick={handleLogout}>Sair</Button>
          </div>
        )}
      </div>
    </div>
  )
}
