import { useEffect, useState, type FormEvent } from 'react'
import { criarUsuario, atualizarUsuario } from '@/features/usuarios/api'
import { listarMunicipios } from '@/features/municipios/api'
import type { UserProfile, Municipio, Role } from '@/shared/types'
import { Button } from '@/shared/ui/Button'
import { useToast } from '@/shared/ui/Toast'

interface FormularioProps {
  item: UserProfile | null
  onClose: () => void
  onSalvo: () => void
}

export function Formulario({ item, onClose, onSalvo }: FormularioProps) {
  const [municipios, setMunicipios] = useState<Municipio[]>([])
  const [nome, setNome] = useState(item?.nome ?? '')
  const [email, setEmail] = useState(item?.email ?? '')
  const [senha, setSenha] = useState('')
  const [role, setRole] = useState<Role>(item?.role ?? 'municipio')
  const [municipioId, setMunicipioId] = useState(item?.municipioId ?? '')
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    listarMunicipios().then(setMunicipios)
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      if (item) {
        await atualizarUsuario(item.uid, { nome, email, role, municipioId: role === 'municipio' ? municipioId : null })
        toast('Usuário atualizado.')
      } else {
        await criarUsuario({ nome, email, senha, role, municipioId: role === 'municipio' ? municipioId : null })
        toast('Usuário criado.')
      }
      onSalvo()
    } catch {
      toast('Erro ao salvar.', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mb-6 rounded-lg border border-border-technical bg-surface p-6 card-shadow">
      <h2 className="mb-4 text-lg font-semibold text-on-surface">{item ? 'Editar' : 'Novo'} Usuário</h2>
      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4">
        <div className="w-64">
          <label className="block text-sm font-medium text-on-surface-variant">Nome</label>
          <input type="text" required value={nome} onChange={e => setNome(e.target.value)}
            className="mt-1 block w-full rounded border border-border-technical bg-surface px-3 py-2 text-sm text-on-surface focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary" />
        </div>
        <div className="w-64">
          <label className="block text-sm font-medium text-on-surface-variant">Email</label>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
            className="mt-1 block w-full rounded border border-border-technical bg-surface px-3 py-2 text-sm text-on-surface focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary" />
        </div>
        {!item && (
          <div className="w-48">
            <label className="block text-sm font-medium text-on-surface-variant">Senha</label>
            <input type="password" required value={senha} onChange={e => setSenha(e.target.value)}
              className="mt-1 block w-full rounded border border-border-technical bg-surface px-3 py-2 text-sm text-on-surface focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary" />
          </div>
        )}
        <div className="w-40">
          <label className="block text-sm font-medium text-on-surface-variant">Perfil</label>
          <select required value={role} onChange={e => setRole(e.target.value as Role)}
            className="mt-1 block w-full rounded border border-border-technical bg-surface px-3 py-2 text-sm text-on-surface focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary">
            <option value="admin">Admin</option>
            <option value="pedagogico">Pedagógico</option>
            <option value="municipio">Município</option>
          </select>
        </div>
        {role === 'municipio' && (
          <div className="w-64">
            <label className="block text-sm font-medium text-on-surface-variant">Município</label>
            <select required value={municipioId} onChange={e => setMunicipioId(e.target.value)}
              className="mt-1 block w-full rounded border border-border-technical bg-surface px-3 py-2 text-sm text-on-surface focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary">
              <option value="">Selecione</option>
              {municipios.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
            </select>
          </div>
        )}
        <div className="flex gap-2">
          <Button type="submit" loading={saving}>Salvar</Button>
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
        </div>
      </form>
    </div>
  )
}
