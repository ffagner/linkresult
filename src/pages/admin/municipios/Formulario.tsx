import { useState, type FormEvent } from 'react'
import { criarMunicipio, atualizarMunicipio } from '@/features/municipios/api'
import type { Municipio } from '@/shared/types'
import { Button } from '@/shared/ui/Button'
import { useToast } from '@/shared/ui/Toast'

const ufs = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

interface FormularioProps {
  item: Municipio | null
  onClose: () => void
  onSalvo: () => void
}

export function Formulario({ item, onClose, onSalvo }: FormularioProps) {
  const [nome, setNome] = useState(item?.nome ?? '')
  const [estado, setEstado] = useState(item?.estado ?? '')
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      if (item) {
        await atualizarMunicipio(item.id, { nome, estado })
        toast('Município atualizado.')
      } else {
        await criarMunicipio({ nome, estado })
        toast('Município criado.')
      }
      onSalvo()
    } catch {
      toast('Erro ao salvar.', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mb-stack-lg rounded-xl border border-border-technical bg-surface p-stack-lg shadow-card">
      <h2 className="mb-stack-md text-headline-sm font-semibold text-text-primary">{item ? 'Editar' : 'Novo'} Município</h2>
      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-gutter">
        <div className="flex-1">
          <label className="block text-label-sm font-medium text-text-secondary">Nome</label>
          <input
            type="text"
            required
            value={nome}
            onChange={e => setNome(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-border-technical bg-surface px-3 py-3 text-body-sm text-text-primary focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
          />
        </div>
        <div className="w-32">
          <label className="block text-label-sm font-medium text-text-secondary">Estado</label>
          <select
            required
            value={estado}
            onChange={e => setEstado(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-border-technical bg-surface px-3 py-3 text-body-sm text-text-primary focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
          >
            <option value="">Selecione</option>
            {ufs.map(uf => <option key={uf} value={uf}>{uf}</option>)}
          </select>
        </div>
        <div className="flex gap-stack-sm">
          <Button type="submit" loading={saving}>Salvar</Button>
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
        </div>
      </form>
    </div>
  )
}
