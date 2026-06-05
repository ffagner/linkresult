import { useEffect, useState } from 'react'
import { listarMunicipios } from '@/features/municipios/api'
import { listarRelatorios } from '@/features/relatorios/api'
import { Spinner } from '@/shared/ui/Spinner'
import { Icon } from '@/shared/ui/Icon'

interface Stats {
  municipios: number
  relatorios: number
  liberados: number
}

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ municipios: 0, relatorios: 0, liberados: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [municipios, relatorios] = await Promise.all([listarMunicipios(), listarRelatorios()])
      setStats({
        municipios: municipios.length,
        relatorios: relatorios.length,
        liberados: relatorios.filter(r => r.liberado).length,
      })
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <Spinner />

  const pctLiberados = stats.relatorios > 0 ? Math.round((stats.liberados / stats.relatorios) * 100) : 0

  return (
    <div>
      <div className="mb-stack-lg flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-headline-lg text-text-primary">Dashboard Administrativo</h1>
          <p className="text-body-md text-text-secondary">Visão geral da rede educacional e relatórios cadastrados.</p>
        </div>
      </div>

      <div className="mb-stack-lg grid grid-cols-1 gap-gutter md:grid-cols-3">
        <SummaryCard
          title="Total de Municípios"
          value={stats.municipios}
          icon="location_city"
          iconColor="text-primary"
          footer={stats.municipios > 0 ? { text: 'Municípios ativos', color: 'text-text-secondary' } : undefined}
        />
        <SummaryCard
          title="Relatórios Cadastrados"
          value={stats.relatorios}
          icon="description"
          iconColor="text-primary"
          footer={{ text: 'Total acumulado', color: 'text-text-secondary' }}
        />
        <SummaryCard
          title="Relatórios Liberados"
          value={stats.liberados}
          icon="verified"
          iconColor="text-success"
          progress={pctLiberados}
        />
      </div>

      <div className="grid grid-cols-1 gap-gutter lg:grid-cols-4">
        <div className="overflow-hidden rounded-xl border border-border-technical bg-surface shadow-card lg:col-span-3">
          <div className="flex items-center justify-between border-b border-border-technical px-gutter py-stack-md">
            <h3 className="text-headline-sm text-text-primary">Últimos Relatórios</h3>
          </div>
          <RecentReports municipios={stats.municipios} />
        </div>

        <div className="rounded-xl bg-primary p-stack-lg text-on-primary shadow-card relative overflow-hidden h-full">
          <div className="absolute right-0 top-0 p-4 opacity-20">
            <Icon name="auto_graph" className="text-[100px]" />
          </div>
          <h4 className="relative z-10 mb-stack-sm text-headline-sm">Análise Premium</h4>
          <p className="relative z-10 mb-stack-lg text-body-sm opacity-90">
            Gere relatórios comparativos avançados entre municípios para identificar gargalos pedagógicos.
          </p>
          <button className="relative z-10 w-full rounded-lg bg-surface py-3 text-center text-label-md text-primary transition-all hover:opacity-90">
            Gerar Relatório IA
          </button>
          <div className="mt-stack-lg border-t border-white/20 pt-stack-md">
            <p className="mb-2 text-label-sm uppercase tracking-widest opacity-80">Suporte Direto</p>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 overflow-hidden rounded-full border-2 border-white/40 bg-white/20" />
              <span className="text-body-sm">Falar com consultor</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SummaryCard({
  title,
  value,
  icon,
  iconColor,
  footer,
  progress,
}: {
  title: string
  value: number
  icon: string
  iconColor: string
  footer?: { text: string; color: string }
  progress?: number
}) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border-technical bg-surface p-stack-lg shadow-card">
      <div className="absolute bottom-[-10px] right-[-10px] text-[80px] opacity-10 transition-transform group-hover:scale-110">
        <Icon name={icon} className={iconColor} />
      </div>
      <p className="mb-2 text-label-sm uppercase tracking-wider text-text-secondary">{title}</p>
      <div className="flex items-end justify-between">
        <h2 className="text-headline-lg text-text-primary">{value}</h2>
        {progress !== undefined && (
          <div className="flex w-16 flex-col items-end gap-1">
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container-highest">
              <div className="h-full rounded-full bg-success" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
        {footer && <span className={`text-label-sm ${footer.color}`}>{footer.text}</span>}
      </div>
    </div>
  )
}

function RecentReports({ municipios }: { municipios: number }) {
  const ufs = ['SP', 'RJ', 'MG', 'BA']
  const nomes = ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Salvador']
  const tipos = ['Análise Semestral', 'Desempenho Escolar', 'Gestão de Recursos', 'Censo Escolar']
  const statuses: { label: string; className: string }[] = [
    { label: 'Liberado', className: 'bg-success/10 text-success' },
    { label: 'Pendente', className: 'bg-text-secondary/10 text-text-secondary' },
    { label: 'Liberado', className: 'bg-success/10 text-success' },
    { label: 'Revogado', className: 'bg-error/10 text-error' },
  ]

  if (municipios === 0) {
    return <div className="p-gutter text-body-sm text-text-secondary">Nenhum relatório cadastrado ainda.</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-surface-container-low">
          <tr>
            <th className="px-gutter py-4 text-label-sm text-text-secondary">MUNICÍPIO</th>
            <th className="px-gutter py-4 text-label-sm text-text-secondary">TIPO</th>
            <th className="px-gutter py-4 text-label-sm text-text-secondary">STATUS</th>
            <th className="px-gutter py-4 text-label-sm text-text-secondary text-right">AÇÕES</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-technical">
          {Array.from({ length: Math.min(municipios, 4) }).map((_, i) => (
            <tr key={i} className="group transition-colors hover:bg-surface-container-low">
              <td className="px-gutter py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-surface-container text-[10px] font-bold text-primary">
                    {ufs[i]}
                  </div>
                  <span className="text-body-md font-medium text-text-primary">{nomes[i]}</span>
                </div>
              </td>
              <td className="text-body-sm text-text-secondary px-gutter py-4">{tipos[i]}</td>
              <td className="px-gutter py-4">
                <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-tighter ${statuses[i].className}`}>
                  {statuses[i].label}
                </span>
              </td>
              <td className="px-gutter py-4 text-right">
                <button className="rounded-md p-1 text-text-secondary transition-colors hover:bg-surface-container-highest group-hover:text-primary">
                  <Icon name="visibility" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
