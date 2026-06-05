import type { Municipio, Avaliacao } from '@/shared/types'
import { Icon } from '@/shared/ui/Icon'

interface Props {
  municipios: Municipio[]
  avaliacoes: Avaliacao[]
  municipioId: string
  avaliacaoId: string
  onMunicipioChange: (id: string) => void
  onAvaliacaoChange: (id: string) => void
}

export function SelectionPanel({ municipios, avaliacoes, municipioId, avaliacaoId, onMunicipioChange, onAvaliacaoChange }: Props) {
  return (
    <div className="col-span-12 space-y-gutter lg:col-span-4">
      <div className="rounded-xl border border-border-technical bg-surface p-stack-md shadow-card">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-fixed">
            <Icon name="location_on" className="text-primary" />
          </div>
          <h3 className="text-headline-sm text-primary">Município</h3>
        </div>
        <div className="space-y-stack-md">
          <div>
            <label className="mb-1 block text-label-sm text-text-secondary">Selecione a localidade</label>
            <select
              required
              value={municipioId}
              onChange={e => onMunicipioChange(e.target.value)}
              className="w-full rounded-lg border border-border-technical bg-surface p-3 text-body-md outline-none transition-all focus:border-secondary focus:ring-2 focus:ring-secondary/20"
            >
              <option value="">Selecione um município...</option>
              {municipios.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border-technical bg-surface p-stack-md shadow-card">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary-fixed">
            <Icon name="analytics" className="text-secondary" />
          </div>
          <h3 className="text-headline-sm text-primary">Avaliação</h3>
        </div>
        <div className="space-y-stack-md">
          <div>
            <label className="mb-1 block text-label-sm text-text-secondary">Qual avaliação cadastrar?</label>
            <select
              required
              value={avaliacaoId}
              onChange={e => onAvaliacaoChange(e.target.value)}
              className="w-full rounded-lg border border-border-technical bg-surface p-3 text-body-md outline-none transition-all focus:border-secondary focus:ring-2 focus:ring-secondary/20"
            >
              <option value="">Selecione uma avaliação...</option>
              {avaliacoes.map(a => <option key={a.id} value={a.id}>{a.nome} ({a.ano})</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl bg-primary-container p-stack-md text-on-primary-container">
        <div className="relative z-10">
          <Icon name="info" className="mb-4 text-4xl opacity-80" />
          <h4 className="mb-2 text-headline-sm">Dica de Produtividade</h4>
          <p className="text-body-sm leading-relaxed text-on-primary-container/80">
            Você pode copiar e colar links diretamente do Power BI Web. Certifique-se de que as permissões de acesso estejam configuradas corretamente.
          </p>
        </div>
        <div className="absolute -bottom-8 -right-8 opacity-10">
          <Icon name="auto_awesome" className="text-[160px]" />
        </div>
      </div>
    </div>
  )
}
