import type { Serie } from '@/shared/types'
import { Icon } from '@/shared/ui/Icon'

interface Props {
  idx: number
  serieId: string
  link: string
  series: Serie[]
  onUpdate: (idx: number, campo: 'serieId' | 'link', valor: string) => void
  onRemove: (idx: number) => void
}

export function SeriesRow({ idx, serieId, link, series, onUpdate, onRemove }: Props) {
  return (
    <div className="group grid grid-cols-12 items-end gap-4 rounded-lg border border-border-technical bg-surface p-4 shadow-sm transition-all hover:border-primary/30">
      <div className="col-span-12 md:col-span-3">
        <label className="mb-1 block text-label-sm text-text-secondary">Série/Ano</label>
        <select
          required
          value={serieId}
          onChange={e => onUpdate(idx, 'serieId', e.target.value)}
          className="w-full rounded-lg border border-border-technical bg-surface px-3 py-2 text-body-sm outline-none transition-all focus:border-secondary focus:ring-2 focus:ring-secondary/20"
        >
          <option value="">Selecione</option>
          {series.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
        </select>
      </div>
      <div className="col-span-12 md:col-span-8">
        <label className="mb-1 block text-label-sm text-text-secondary">Link do Power BI</label>
        <div className="relative">
          <Icon name="link" className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-secondary" />
          <input
            type="url"
            required
            value={link}
            onChange={e => onUpdate(idx, 'link', e.target.value)}
            className="w-full rounded-lg border border-border-technical bg-surface py-2 pl-10 pr-4 text-body-sm outline-none transition-all focus:border-secondary focus:ring-2 focus:ring-secondary/20"
            placeholder="https://app.powerbi.com/view?r=..."
          />
        </div>
      </div>
      <div className="col-span-12 flex justify-end md:col-span-1">
        <button
          type="button"
          onClick={() => onRemove(idx)}
          className="rounded-lg p-2 text-text-secondary transition-all hover:bg-error/10 hover:text-error md:opacity-0 md:group-hover:opacity-100"
        >
          <Icon name="delete" />
        </button>
      </div>
    </div>
  )
}
