import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Play, LogOut, User, FileText, Search, X } from 'lucide-react';
import Logo from '@/components/lr/Logo';
import EmptyState from '@/components/lr/EmptyState';
import LoadingSpinner from '@/components/lr/LoadingSpinner';
import ThemeToggle from '@/components/lr/ThemeToggle';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { listarPorMunicipio as listarRelatoriosPorMunicipio } from '@/api/relatorios';
import type { RelatorioData } from '@/api/relatorios';
import { formatarData } from '@/lib/date';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/hooks/use-toast';


export default function MunicipioRelatorios() {
  const { profile, logout } = useAuth();
  const { toast } = useToast();
  const [relatorios, setRelatorios] = useState<RelatorioData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterAvaliacao, setFilterAvaliacao] = useState<string>('todos');
  const [filterSerie, setFilterSerie] = useState<string>('todos');
  const [filterAno, setFilterAno] = useState<string>('todos');
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    async function load() {
      try {
        const relatoriosData = await listarRelatoriosPorMunicipio(profile.municipioId);
        setRelatorios(relatoriosData);
      } catch (err) {
        toast({ title: 'Erro ao carregar', description: err.message, variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    }
    if (profile?.municipioId) load();
  }, [profile]);

  // Avaliações derivadas dos relatórios já liberados — sem busca extra ao Firestore
  const avaliacoes = Array.from(
    new Map(relatorios.map(r => [r.avaliacaoId, { id: r.avaliacaoId, nome: r.avaliacaoNome }])).values()
  );

  // Séries derivadas dos relatórios liberados, na ordem em que vieram do Firestore
  const seriesDisponiveis = Array.from(
    new Map(relatorios.map(r => [r.serieId, { id: r.serieId, nome: r.serieNome }])).values()
  );

  // Anos derivados dos relatórios liberados, mais recente primeiro — uma
  // mesma avaliação (ex.: "CADERNO 1") se repete ano após ano.
  const anosDisponiveis = [...new Set(relatorios.map(r => r.ano))].sort((a, b) => b - a);

  const termo = search.trim().toLowerCase();

  const filtered = relatorios.filter(r => {
    const matchAvaliacao = filterAvaliacao === 'todos' || r.avaliacaoId === filterAvaliacao;
    const matchSerie = filterSerie === 'todos' || r.serieId === filterSerie;
    const matchAno = filterAno === 'todos' || String(r.ano) === filterAno;
    const matchSearch = termo === '' ||
      (r.serieNome || '').toLowerCase().includes(termo) ||
      (r.avaliacaoNome || '').toLowerCase().includes(termo);
    return matchAvaliacao && matchSerie && matchAno && matchSearch;
  });

  const hasActiveFilters = search !== '' || filterAvaliacao !== 'todos' || filterSerie !== 'todos' || filterAno !== 'todos';

  const clearFilters = (): void => {
    setSearch('');
    setFilterAvaliacao('todos');
    setFilterSerie('todos');
    setFilterAno('todos');
  };

  // Agrupa por avaliação + ano — sem o ano, "CADERNO 1" de anos diferentes
  // apareceria misturado na mesma seção.
  const grouped = filtered.reduce<Record<string, { avaliacaoNome: string; ano: number; items: RelatorioData[] }>>((acc, r) => {
    const key = `${r.avaliacaoId}-${r.ano}`;
    if (!acc[key]) acc[key] = { avaliacaoNome: r.avaliacaoNome, ano: r.ano, items: [] };
    acc[key].items.push(r);
    return acc;
  }, {});

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <LoadingSpinner size="lg" text="Carregando relatórios..." />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-3">
            <ThemeToggle className="p-1.5" />
            <Link to="/perfil?role=municipio" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="hidden sm:block font-medium">{profile?.nome || profile?.municipioNome}</span>
            </Link>
            <button onClick={logout} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold">Meus Relatórios</h1>
              <p className="text-sm text-muted-foreground">{profile?.municipioNome} — {relatorios.length} relatório(s) disponível(is)</p>
            </div>
          </div>
        </div>

        {relatorios.length > 0 && (
          <div className="mb-6 space-y-2">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por série ou avaliação..."
                  value={search}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                  className="pl-9 h-9 rounded-xl text-sm"
                />
              </div>
              <Select value={filterAvaliacao} onValueChange={setFilterAvaliacao}>
                <SelectTrigger className="w-full sm:w-56 h-9 rounded-xl text-sm">
                  <SelectValue placeholder="Todas as avaliações" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas as avaliações</SelectItem>
                  {avaliacoes.map(a => <SelectItem key={a.id} value={a.id}>{a.nome}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterSerie} onValueChange={setFilterSerie}>
                <SelectTrigger className="w-full sm:w-44 h-9 rounded-xl text-sm">
                  <SelectValue placeholder="Todas as séries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas as séries</SelectItem>
                  {seriesDisponiveis.map(s => <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterAno} onValueChange={setFilterAno}>
                <SelectTrigger className="w-full sm:w-32 h-9 rounded-xl text-sm">
                  <SelectValue placeholder="Todos os anos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os anos</SelectItem>
                  {anosDisponiveis.map(a => <SelectItem key={a} value={String(a)}>{a}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {hasActiveFilters && (
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                  {filtered.length} de {relatorios.length} relatório(s)
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Limpar filtros
                </button>
              </div>
            )}
          </div>
        )}

        {filtered.length === 0 ? (
          <EmptyState
            icon={FileText}
            title={hasActiveFilters ? 'Nenhum relatório encontrado' : 'Nenhum relatório disponível'}
            description={hasActiveFilters
              ? 'Nenhum relatório corresponde à busca ou aos filtros selecionados.'
              : 'Ainda não há relatórios liberados para o seu município. Entre em contato com a equipe pedagógica.'}
          />
        ) : (
          <div className="space-y-6 animate-fade-in">
            {Object.values(grouped)
              .sort((a, b) => b.ano - a.ano || a.avaliacaoNome.localeCompare(b.avaliacaoNome))
              .map(group => (
              <div key={`${group.avaliacaoNome}-${group.ano}`}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
                    {group.avaliacaoNome} · {group.ano}
                  </span>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {group.items.map(r => (
                    <Link
                      key={r.id}
                      to={`/municipio/relatorio/${r.id}`}
                      className="group bg-card rounded-2xl border border-border p-4 hover:shadow-md hover:border-primary/30 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors flex items-center justify-center">
                          <BarChart3 className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          Disponível
                        </div>
                      </div>
                      <h3 className="font-semibold text-sm mb-0.5">{r.serieNome}</h3>
                      <p className="text-xs text-muted-foreground mb-1">{r.avaliacaoNome}</p>
                      {r.entregueEm && (
                        <p className="text-xs text-muted-foreground/70 mb-3">Disponível desde {formatarData(r.entregueEm)}</p>
                      )}
                      <div className="flex items-center gap-2 text-primary text-xs font-medium group-hover:gap-3 transition-all mt-3">
                        <Play className="w-3.5 h-3.5" />
                        Ver relatório
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
