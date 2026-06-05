import { useState, type FormEvent } from 'react'
import { criarSerie, atualizarSerie } from '@/features/series/api'
import type { Serie } from '@/shared/types'
import { Button } from '@/shared/ui/Button'
import { useToast } from '@/shared/ui/Toast'

interface FormularioProps {
  item: Serie | null
  onClose: () => void
  onSalvo: () => void
}

export function Formulario({ item, onClose, onSalvo }: FormularioProps) {
  const [nome, setNome] = useState(item?.nome ?? '')
  const [ordem, setOrdem] = useState(item?.ordem ?? 1)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      if (item) {
        await atualizarSerie(item.id, { nome, ordem })
        toast('Série atualizada.')
      } else {
        await criarSerie({ nome, ordem })
        toast('Série criada.')
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
      <h2 className="mb-4 text-lg font-semibold text-on-surface">{item ? 'Editar' : 'Nova'} Série</h2>
      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-on-surface-variant">Nome</label>
          <input
            type="text"
            required
            value={nome}
            onChange={e => setNome(e.target.value)}
            className="mt-1 block w-full rounded border border-border-technical bg-surface px-3 py-2 text-sm text-on-surface focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
          />
        </div>
        <div className="w-32">
          <label className="block text-sm font-medium text-on-surface-variant">Ordem</label>
          <input
            type="number"
            required
            value={ordem}
            onChange={e => setOrdem(Number(e.target.value))}
            className="mt-1 block w-full rounded border border-border-technical bg-surface px-3 py-2 text-sm text-on-surface focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" loading={saving}>Salvar</Button>
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
        </div>
      </form>
    </div>
  )
}
