import React, { useState, useEffect, useMemo } from 'react';
import { Activity, Users, AlertTriangle, Clock, MapPin, TrendingUp, Info, Eye } from 'lucide-react';
import { listar as listarMunicipios } from '@/api/municipios';
import type { MunicipioData } from '@/api/municipios';
import { listar as listarRelatorios } from '@/api/relatorios';
import type { RelatorioData } from '@/api/relatorios';
import { listarDesde, COLETA_INICIO } from '@/api/acessos';
import type { AcessoData } from '@/api/acessos';
import { useAuth } from '@/lib/AuthContext';
import AppLayout from '@/components/lr/AppLayout';
import PageHeader from '@/components/lr/PageHeader';
import StatsCard from '@/components/lr/StatsCard';
import FilterBar from '@/components/lr/FilterBar';
import DataTable from '@/components/lr/DataTable';
import LoadingSpinner from '@/components/lr/LoadingSpinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatarData, formatarDataHora } from '@/lib/date';

interface ResumoMunicipio {
  id: string
  nome: string
  acessos: number
  ultimoAcesso: Date | null
  liberados: number
  nuncaAbertos: number
}

interface ResumoRelatorio {
  relatorioId: string
  municipioNome: string
  avaliacaoNome: string
  serieNome: string
  acessos: number
}

const periodos = [
  { value: '30', label: 'Últimos 30 dias' },
  { value: '90', label: 'Últimos 90 dias' },
  { value: '365', label: 'Último ano' },
];

export default function AdminAnalytics() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [municipios, setMunicipios] = useState<MunicipioData[]>([]);
  const [relatorios, setRelatorios] = useState<RelatorioData[]>([]);
  // Sempre desde o início da coleta, não desde o filtro de período — assim
  // "nunca aberto" e "tempo até 1ª abertura" enxergam o histórico completo,
  // e o filtro de período só recorta as métricas de volume no cliente.
  const [acessos, setAcessos] = useState<AcessoData[]>([]);
  const [filterPeriodo, setFilterPeriodo] = useState<string>('90');
  const [filterMunicipio, setFilterMunicipio] = useState<string>('todos');

  useEffect(() => {
    Promise.all([listarMunicipios(), listarRelatorios(), listarDesde(COLETA_INICIO)]).then(([muns, rels, acs]) => {
      setMunicipios(muns);
      setRelatorios(rels);
      setAcessos(acs);
      setLoading(false);
    });
  }, []);

  const desde = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - Number(filterPeriodo));
    return d;
  }, [filterPeriodo]);

  const relatoriosFiltrados = useMemo(
    () => filterMunicipio === 'todos' ? relatorios : relatorios.filter(r => r.municipioId === filterMunicipio),
    [relatorios, filterMunicipio]
  );

  const acessosDoMunicipio = useMemo(
    () => filterMunicipio === 'todos' ? acessos : acessos.filter(a => a.municipioId === filterMunicipio),
    [acessos, filterMunicipio]
  );

  const acessosNoPeriodo = useMemo(
    () => acessosDoMunicipio.filter(a => a.em && a.em >= desde),
    [acessosDoMunicipio, desde]
  );

  // Municípios que têm pelo menos 1 relatório liberado — os únicos que fazem
  // sentido entrar nas métricas de "acessou/não acessou".
  const municipiosComLiberado = useMemo(
    () => municipios.filter(m =>
      (filterMunicipio === 'todos' || m.id === filterMunicipio) &&
      relatorios.some(r => r.municipioId === m.id && r.liberado)
    ),
    [municipios, relatorios, filterMunicipio]
  );

  const municipiosAtivos = useMemo(
    () => municipiosComLiberado.filter(m => acessosNoPeriodo.some(a => a.municipioId === m.id)).length,
    [municipiosComLiberado, acessosNoPeriodo]
  );

  // Tempo médio entre a entrega e a 1ª abertura, para relatórios entregues
  // dentro do período selecionado — usa o histórico completo de acessos
  // (não só a janela) pra não perder a abertura real que ocorreu perto da
  // borda do período.
  const tempoMedioDias = useMemo(() => {
    const entreguesNoPeriodo = relatoriosFiltrados.filter(r => r.liberado && r.entregueEm && r.entregueEm >= desde);
    const deltas: number[] = [];
    for (const r of entreguesNoPeriodo) {
      const doRelatorio = acessosDoMunicipio.filter(a => a.relatorioId === r.id);
      const primeira = doRelatorio.reduce<Date | null>((min, a) => (a.em && (!min || a.em < min) ? a.em : min), null);
      if (primeira && r.entregueEm) {
        const dias = (primeira.getTime() - r.entregueEm.getTime()) / (1000 * 60 * 60 * 24);
        if (dias >= 0) deltas.push(dias);
      }
    }
    if (deltas.length === 0) return null;
    return Math.round(deltas.reduce((s, d) => s + d, 0) / deltas.length);
  }, [relatoriosFiltrados, acessosDoMunicipio, desde]);

  const porMunicipio: ResumoMunicipio[] = useMemo(() => {
    return municipiosComLiberado
      .map(m => {
        const doMunicipioNoPeriodo = acessosNoPeriodo.filter(a => a.municipioId === m.id);
        const ultimoAcesso = doMunicipioNoPeriodo.reduce<Date | null>((max, a) => (a.em && (!max || a.em > max) ? a.em : max), null);
        const liberadosDoMunicipio = relatorios.filter(r => r.municipioId === m.id && r.liberado);
        // "nunca aberto" olha o histórico inteiro (desde a coleta), não só o período.
        const idsComAcessoAlgumaVez = new Set(acessos.filter(a => a.municipioId === m.id).map(a => a.relatorioId));
        const nuncaAbertos = liberadosDoMunicipio.filter(r => !idsComAcessoAlgumaVez.has(r.id)).length;
        return {
          id: m.id, nome: m.nome,
          acessos: doMunicipioNoPeriodo.length,
          ultimoAcesso,
          liberados: liberadosDoMunicipio.length,
          nuncaAbertos,
        };
      })
      // Mais preocupante primeiro: quem não acessou nada, depois quem tem mais pendência.
      .sort((a, b) => a.acessos - b.acessos || b.nuncaAbertos - a.nuncaAbertos);
  }, [municipiosComLiberado, acessosNoPeriodo, relatorios, acessos]);

  const topAcessados: ResumoRelatorio[] = useMemo(() => {
    const mapa = new Map<string, ResumoRelatorio>();
    for (const a of acessosNoPeriodo) {
      const atual = mapa.get(a.relatorioId) || {
        relatorioId: a.relatorioId, municipioNome: a.municipioNome,
        avaliacaoNome: a.avaliacaoNome, serieNome: a.serieNome, acessos: 0,
      };
      atual.acessos += 1;
      mapa.set(a.relatorioId, atual);
    }
    return [...mapa.values()].sort((a, b) => b.acessos - a.acessos).slice(0, 8);
  }, [acessosNoPeriodo]);

  const nuncaAbertosLista: RelatorioData[] = useMemo(() => {
    const idsComAcessoAlgumaVez = new Set(acessosDoMunicipio.map(a => a.relatorioId));
    return relatoriosFiltrados.filter(r => r.liberado && !idsComAcessoAlgumaVez.has(r.id)).slice(0, 8);
  }, [relatoriosFiltrados, acessosDoMunicipio]);

  const hasActiveFilters = filterPeriodo !== '90' || filterMunicipio !== 'todos';
  const clearFilters = (): void => { setFilterPeriodo('90'); setFilterMunicipio('todos'); };

  const municipioColumns = [
    { header: 'Município', render: (m) => <span className="font-medium flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />{m.nome}</span> },
    { header: 'Acessos no período', render: (m) => <span className={m.acessos === 0 ? 'text-destructive font-medium' : ''}>{m.acessos}</span> },
    { header: 'Último acesso', render: (m) => <span className="text-muted-foreground">{m.ultimoAcesso ? formatarDataHora(m.ultimoAcesso) : 'Nunca'}</span> },
    { header: 'Relatórios liberados', render: (m) => <span className="text-muted-foreground">{m.liberados}</span> },
    { header: 'Nunca abertos', render: (m) => <span className={m.nuncaAbertos > 0 ? 'text-amber-600 dark:text-amber-400 font-medium' : 'text-muted-foreground'}>{m.nuncaAbertos}</span> },
  ];

  if (loading) return <AppLayout role="admin" userName={profile?.nome || 'Admin'}><LoadingSpinner text="Carregando analytics..." /></AppLayout>;

  return (
    <AppLayout role="admin" userName={profile?.nome || 'Admin'}>
      <PageHeader title="Analytics" subtitle="Uso dos relatórios pelos municípios — quem abre e com que frequência" />

      <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-500/10 rounded-xl mb-6">
        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Coleta iniciada em {formatarData(COLETA_INICIO)}</p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
            Aberturas antes dessa data não foram registradas. Os números refletem apenas cliques em
            "Ver relatório" no LinkResults — não é possível medir o que acontece dentro do Power BI.
          </p>
        </div>
      </div>

      <FilterBar hasActiveFilters={hasActiveFilters} onClear={clearFilters}>
        <Select value={filterPeriodo} onValueChange={setFilterPeriodo}>
          <SelectTrigger className="w-full sm:w-48 h-10 rounded-xl"><SelectValue /></SelectTrigger>
          <SelectContent>
            {periodos.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterMunicipio} onValueChange={setFilterMunicipio}>
          <SelectTrigger className="w-full sm:w-48 h-10 rounded-xl"><SelectValue placeholder="Município" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os municípios</SelectItem>
            {municipios.map(m => <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>)}
          </SelectContent>
        </Select>
      </FilterBar>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard label="Acessos no período" value={acessosNoPeriodo.length} icon={Activity} color="blue" />
        <StatsCard label="Municípios ativos" value={municipiosAtivos} icon={Users} color="green" />
        <StatsCard label="Municípios sem acesso" value={municipiosComLiberado.length - municipiosAtivos} icon={AlertTriangle} color="amber" />
        <StatsCard label="Dias até 1ª abertura (média)" value={tempoMedioDias ?? 0} icon={Clock} color="purple" />
      </div>

      <div className="mb-8">
        <h2 className="font-display font-semibold text-base mb-4">Acessos por município</h2>
        <DataTable
          columns={municipioColumns}
          data={porMunicipio}
          emptyTitle="Nenhum município com relatório liberado"
          emptyDescription="Libere relatórios no Pedagógico para começar a acompanhar o uso."
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h2 className="font-display font-semibold text-base">Mais acessados no período</h2>
          </div>
          {topAcessados.length === 0 ? (
            <p className="text-sm text-muted-foreground px-5 py-6 text-center">Nenhum acesso no período selecionado.</p>
          ) : (
            <div className="divide-y divide-border">
              {topAcessados.map(r => (
                <div key={r.relatorioId} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{r.municipioNome}</p>
                    <p className="text-xs text-muted-foreground truncate">{r.avaliacaoNome} — {r.serieNome}</p>
                  </div>
                  <span className="text-sm font-semibold text-primary flex-shrink-0">{r.acessos}×</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
            <Eye className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <h2 className="font-display font-semibold text-base">Liberados, nunca abertos</h2>
          </div>
          {nuncaAbertosLista.length === 0 ? (
            <p className="text-sm text-muted-foreground px-5 py-6 text-center">Todos os relatórios liberados já foram abertos ao menos uma vez.</p>
          ) : (
            <div className="divide-y divide-border">
              {nuncaAbertosLista.map(r => (
                <div key={r.id} className="px-5 py-3">
                  <p className="text-sm font-medium truncate">{r.municipioNome}</p>
                  <p className="text-xs text-muted-foreground truncate">{r.avaliacaoNome} — {r.serieNome}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
