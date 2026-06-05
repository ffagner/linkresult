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
    <div className="mx-auto max-w-2xl px-gutter py-10">
      <div className="rounded-xl border border-border-technical bg-surface p-8 shadow-card">
        <h1 className="mb-stack-lg text-headline-lg font-bold text-text-primary">Meu Perfil</h1>

        <div className="mb-8 space-y-stack-md">
          <div>
            <label className="block text-body-sm font-medium text-text-secondary">Nome</label>
            <p className="text-text-primary">{profile?.nome}</p>
          </div>
          <div>
            <label className="block text-body-sm font-medium text-text-secondary">Email</label>
            <p className="text-text-primary">{profile?.email}</p>
          </div>
          <div>
            <label className="block text-body-sm font-medium text-text-secondary">Perfil</label>
            <p className="text-text-primary">{profile ? roleLabels[profile.role] : ''}</p>
          </div>
          {profile?.municipioId && (
            <div>
              <label className="block text-body-sm font-medium text-text-secondary">Município</label>
              <p className="text-text-primary">{profile.municipioId}</p>
            </div>
          )}
        </div>

        {showForm ? (
          <form onSubmit={handleChangePassword} className="mb-stack-lg space-y-stack-md border-t pt-6">
            <h2 className="text-headline-sm font-semibold text-text-primary">Alterar Senha</h2>
            <div>
              <label className="block text-label-sm font-medium text-text-secondary">Senha atual</label>
              <input type="password" required value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-border-technical bg-surface px-3 py-3 text-body-sm text-text-primary focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary" />
            </div>
            <div>
              <label className="block text-label-sm font-medium text-text-secondary">Nova senha</label>
              <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-border-technical bg-surface px-3 py-3 text-body-sm text-text-primary focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary" />
            </div>
            <div className="flex gap-stack-sm">
              <Button type="submit" loading={saving}>Salvar</Button>
              <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>Cancelar</Button>
            </div>
          </form>
        ) : (
          <div className="flex gap-stack-sm border-t pt-6">
            <Button onClick={() => setShowForm(true)}>Alterar Senha</Button>
            <Button variant="secondary" onClick={() => navigate(getHome(profile?.role ?? 'municipio'))}>Voltar</Button>
            <Button variant="danger" onClick={handleLogout}>Sair</Button>
          </div>
        )}
      </div>
    </div>
  )
}
