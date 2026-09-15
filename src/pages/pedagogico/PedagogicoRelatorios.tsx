import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Eye, CheckCircle2, XCircle, CalendarClock } from 'lucide-react';
import AppLayout from '@/components/lr/AppLayout';
import PageHeader from '@/components/lr/PageHeader';
import DataTable from '@/components/lr/DataTable';
import StatusBadge from '@/components/lr/StatusBadge';
import FilterBar from '@/components/lr/FilterBar';
import FormModal from '@/components/lr/FormModal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { listar, buscar, liberar, ajustarDataEntrega } from '@/api/relatorios';
import type { RelatorioData } from '@/api/relatorios';
import { listar as listarMunicipios } from '@/api/municipios';
import type { MunicipioData } from '@/api/municipios';
import { listar as listarAvaliacoes } from '@/api/avaliacoes';
import type { AvaliacaoData } from '@/api/avaliacoes';
import { listar as listarSeries } from '@/api/series';
import type { SerieData } from '@/api/series';
import { formatarData, parseDataInput, paraDataInput } from '@/lib/date';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function PedagogicoRelatorios() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<RelatorioData[]>([]);
  const [municipios, setMunicipios] = useState<MunicipioData[]>([]);
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoData[]>([]);
  const [series, setSeries] = useState<SerieData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [filterMunicipio, setFilterMunicipio] = useState<string>('todos');
  const [filterAvaliacao, setFilterAvaliacao] = useState<string>('todos');
  const [filterSerie, setFilterSerie] = useState<string>('todos');
  const [filterAno, setFilterAno] = useState<string>('todos');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [ajusteItem, setAjusteItem] = useState<RelatorioData | null>(null);
  const [novaDataInput, setNovaDataInput] = useState<string>('');
  const [ajustando, setAjustando] = useState<boolean>(false);

  // Listas para os selects de filtro — carregadas uma vez.
  useEffect(() => {
    Promise.all([listarMunicipios(), listarAvaliacoes(), listarSeries()])
      .then(([municipiosData, avaliacoesData, seriesData]) => {
        setMunicipios(municipiosData);
        setAvaliacoes(avaliacoesData);
        setSeries(seriesData);
      })
      .catch((err: Error) => toast({ title: 'Erro ao carregar', description: err.message, variant: 'destructive' }));
  }, []);

  // Relatórios: refeito no Firestore sempre que o filtro de município muda
  // (where server-side) em vez de sempre trazer a coleção inteira — ver
  // docs/PLANO-MELHORIAS.md item 5. Avaliação/série/status/busca continuam
  // aplicados no cliente sobre esse conjunto.
  useEffect(() => {
    setLoading(true);
    listar(filterMunicipio !== 'todos' ? filterMunicipio : undefined)
      .then(relatoriosData => setData(relatoriosData))
      .catch((err: Error) => toast({ title: 'Erro ao carregar', description: err.message, variant: 'destructive' }))
      .finally(() => setLoading(false));
  }, [filterMunicipio]);

  const anos = [...new Set(data.map(r => r.ano))].sort((a, b) => b - a);

  const filtered = data.filter(r => {
    const matchSearch = (r.municipioNome || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.avaliacaoNome || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.serieNome || '').toLowerCase().includes(search.toLowerCase());
    const matchA = filterAvaliacao === 'todos' || r.avaliacaoId === filterAvaliacao;
    const matchSerie = filterSerie === 'todos' || r.serieId === filterSerie;
    const matchAno = filterAno === 'todos' || String(r.ano) === filterAno;
    const matchS = filterStatus === 'todos' || (filterStatus === 'liberado' ? r.liberado : !r.liberado);
    return matchSearch && matchA && matchSerie && matchAno && matchS;
  });

  const hasActiveFilters = search !== '' || filterMunicipio !== 'todos' ||
    filterAvaliacao !== 'todos' || filterSerie !== 'todos' || filterAno !== 'todos' || filterStatus !== 'todos';

  const clearFilters = (): void => {
    setSearch('');
    setFilterMunicipio('todos');
    setFilterAvaliacao('todos');
    setFilterSerie('todos');
    setFilterAno('todos');
    setFilterStatus('todos');
  };

  const handleToggle = async (r: RelatorioData): Promise<void> => {
    setUpdatingId(r.id);
    try {
      const novoValor = !r.liberado;
      await liberar(r.id, profile.uid, profile.nome, novoValor);
      // Busca o documento atualizado em vez de reconstruir entregueEm/historico
      // no cliente — a regra de "só grava na 1ª entrega" fica só no backend.
      const atualizado = await buscar(r.id);
      if (atualizado) setData(prev => prev.map(item => item.id === r.id ? atualizado : item));
      toast({ title: novoValor ? 'Relatório liberado' : 'Acesso revogado', description: `${r.municipioNome} — ${r.avaliacaoNome}` });
    } catch (err) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    } finally {
      setUpdatingId(null);
    }
  };

  const openAjustarData = (r: RelatorioData): void => {
    setAjusteItem(r);
    setNovaDataInput(paraDataInput(r.entregueEm));
  };

  const handleAjustarData = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!ajusteItem) return;
    const novaData = parseDataInput(novaDataInput);
    if (!novaData) return;
    setAjustando(true);
    try {
      await ajustarDataEntrega(ajusteItem.id, novaData, profile.uid, profile.nome);
      const atualizado = await buscar(ajusteItem.id);
      if (atualizado) setData(prev => prev.map(item => item.id === ajusteItem.id ? atualizado : item));
      toast({ title: 'Data de entrega ajustada' });
      setAjusteItem(null);
    } catch (err) {
      toast({ title: 'Erro ao ajustar data', description: err.message, variant: 'destructive' });
    } finally {
      setAjustando(false);
    }
  };

  const columns = [
    { header: 'Município', render: (r) => <span className="font-medium">{r.municipioNome}</span> },
    { header: 'Avaliação', render: (r) => <span className="text-muted-foreground">{r.avaliacaoNome}</span> },
    { header: 'Série', render: (r) => <span className="text-muted-foreground">{r.serieNome}</span> },
    { header: 'Ano', render: (r) => <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-semibold">{r.ano}</span> },
    { header: 'Status', render: (r) => <StatusBadge status={r.liberado ? 'liberado' : 'pendente'} /> },
    {
      header: 'Entregue em', render: (r) => r.entregueEm ? (
        <div>
          <div className="text-sm">{formatarData(r.entregueEm)}</div>
          {r.entreguePorNome && <div className="text-xs text-muted-foreground">{r.entreguePorNome}</div>}
        </div>
      ) : <span className="text-muted-foreground text-sm">—</span>
    },
    {
      header: 'Ações', className: 'text-right', isActions: true,
      render: (r) => (
        <div className="flex items-center justify-end gap-2">
          <Link to={`/pedagogico/relatorio/${r.id}`}>
            <button className="p-1.5 rounded-lg hover:bg-blue-50 transition-colors text-muted-foreground hover:text-blue-600">
              <Eye className="w-4 h-4" />
            </button>
          </Link>
          {r.entregueEm && (
            <button
              onClick={() => openAjustarData(r)}
              title="Ajustar data de entrega"
              className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <CalendarClock className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => handleToggle(r)}
            disabled={updatingId === r.id}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              r.liberado
                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                : 'bg-green-50 text-green-700 hover:bg-green-100'
            } disabled:opacity-50`}
          >
            {updatingId === r.id ? (
              <div className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
            ) : r.liberado ? (
              <><XCircle className="w-3.5 h-3.5" />Revogar</>
            ) : (
              <><CheckCircle2 className="w-3.5 h-3.5" />Liberar</>
            )}
          </button>
        </div>
      )
    }
  ];

  return (
    <AppLayout role="pedagogico" userName={profile?.nome || 'Usuário'}>
      <PageHeader
        title="Relatórios"
        subtitle="Analise e controle a liberação para os municípios"
      />

      <FilterBar
        resultCount={filtered.length}
        totalCount={data.length}
        hasActiveFilters={hasActiveFilters}
        onClear={clearFilters}
        itemLabel="relatórios"
      >
        <div className="relative flex-1 sm:min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar..." value={search} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)} className="pl-9 h-10 rounded-xl" />
        </div>
        <Select value={filterMunicipio} onValueChange={setFilterMunicipio}>
          <SelectTrigger className="w-full sm:w-44 h-10 rounded-xl"><SelectValue placeholder="Município" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os municípios</SelectItem>
            {municipios.map(m => <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterAvaliacao} onValueChange={setFilterAvaliacao}>
          <SelectTrigger className="w-full sm:w-44 h-10 rounded-xl"><SelectValue placeholder="Avaliação" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas as avaliações</SelectItem>
            {avaliacoes.map(a => <SelectItem key={a.id} value={a.id}>{a.nome} ({a.ano})</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterSerie} onValueChange={setFilterSerie}>
          <SelectTrigger className="w-full sm:w-44 h-10 rounded-xl"><SelectValue placeholder="Série" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas as séries</SelectItem>
            {series.map(s => <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterAno} onValueChange={setFilterAno}>
          <SelectTrigger className="w-full sm:w-32 h-10 rounded-xl"><SelectValue placeholder="Ano" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os anos</SelectItem>
            {anos.map(a => <SelectItem key={a} value={String(a)}>{a}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-36 h-10 rounded-xl"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="liberado">Liberados</SelectItem>
            <SelectItem value="pendente">Pendentes</SelectItem>
          </SelectContent>
        </Select>
      </FilterBar>

      <DataTable columns={columns} data={filtered} loading={loading} emptyTitle="Nenhum relatório encontrado" emptyDescription="Ajuste os filtros para ver os resultados." />

      <FormModal
        open={!!ajusteItem}
        onClose={() => setAjusteItem(null)}
        title="Ajustar data de entrega"
        subtitle={ajusteItem ? `${ajusteItem.municipioNome} — ${ajusteItem.avaliacaoNome} — ${ajusteItem.serieNome}` : undefined}
        size="sm"
      >
        <form onSubmit={handleAjustarData} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nova data de entrega</Label>
            <Input
              type="date"
              value={novaDataInput}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNovaDataInput(e.target.value)}
              className="rounded-xl h-10"
              required
            />
            <p className="text-xs text-muted-foreground">
              Use quando a entrega foi feita antes do clique no sistema (ex.: em reunião ou ofício).
            </p>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setAjusteItem(null)}>Cancelar</Button>
            <Button type="submit" disabled={ajustando} className="flex-1 rounded-xl">
              {ajustando ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />Salvando...</> : 'Salvar'}
            </Button>
          </div>
        </form>
      </FormModal>
    </AppLayout>
  );
}
