import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Play, LogOut, User, FileText } from 'lucide-react';
import Logo from '@/components/lr/Logo';
import EmptyState from '@/components/lr/EmptyState';
import LoadingSpinner from '@/components/lr/LoadingSpinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { listarPorMunicipio as listarRelatoriosPorMunicipio } from '@/api/relatorios';
import { listar as listarAvaliacoes } from '@/api/avaliacoes';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function MunicipioRelatorios() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [relatorios, setRelatorios] = useState([]);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterAvaliacao, setFilterAvaliacao] = useState('todos');

  useEffect(() => {
    async function load() {
      try {
        const [relatoriosData, avaliacoesData] = await Promise.all([
          listarRelatoriosPorMunicipio(profile.municipioId),
          listarAvaliacoes(),
        ]);
        setRelatorios(relatoriosData);
        setAvaliacoes(avaliacoesData);
      } catch (err) {
        toast({ title: 'Erro ao carregar', description: err.message, variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    }
    if (profile?.municipioId) load();
  }, [profile]);

  const filtered = relatorios.filter(r =>
    filterAvaliacao === 'todos' || r.avaliacaoId === filterAvaliacao
  );

  const grouped = filtered.reduce((acc, r) => {
    const key = r.avaliacaoId;
    if (!acc[key]) acc[key] = { avaliacaoNome: r.avaliacaoNome, items: [] };
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
            <Link to="/perfil?role=municipio" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="hidden sm:block font-medium">{profile?.nome || profile?.municipioNome}</span>
            </Link>
            <Link to="/login" className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
              <LogOut className="w-4 h-4" />
            </Link>
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
          <div className="flex items-center gap-3 mb-6">
            <Select value={filterAvaliacao} onValueChange={setFilterAvaliacao}>
              <SelectTrigger className="w-56 h-9 rounded-xl text-sm">
                <SelectValue placeholder="Todas as avaliações" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas as avaliações</SelectItem>
                {avaliacoes.map(a => <SelectItem key={a.id} value={a.id}>{a.nome}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}

        {filtered.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Nenhum relatório disponível"
            description="Ainda não há relatórios liberados para o seu município. Entre em contato com a equipe pedagógica."
          />
        ) : (
          <div className="space-y-6 animate-fade-in">
            {Object.values(grouped).map(group => (
              <div key={group.avaliacaoNome}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
                    {group.avaliacaoNome}
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
                      <p className="text-xs text-muted-foreground mb-4">{r.avaliacaoNome}</p>
                      <div className="flex items-center gap-2 text-primary text-xs font-medium group-hover:gap-3 transition-all">
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
