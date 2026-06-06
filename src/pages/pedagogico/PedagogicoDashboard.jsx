import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, CheckCircle2, Clock, ArrowRight, Eye } from 'lucide-react';
import AppLayout from '@/components/lr/AppLayout';
import StatsCard from '@/components/lr/StatsCard';
import PageHeader from '@/components/lr/PageHeader';
import StatusBadge from '@/components/lr/StatusBadge';
import { Button } from '@/components/ui/button';
import { mockRelatorios, mockCurrentUser } from '@/lib/mockData';

export default function PedagogicoDashboard() {
  const user = mockCurrentUser.pedagogico;
  const total = mockRelatorios.length;
  const liberados = mockRelatorios.filter(r => r.liberado).length;
  const pendentes = mockRelatorios.filter(r => !r.liberado).length;
  const recentes = mockRelatorios.filter(r => !r.liberado).slice(0, 5);

  return (
    <AppLayout role="pedagogico" userName={user.nome}>
      <PageHeader
        title="Dashboard"
        subtitle="Acompanhe a análise e liberação de relatórios"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatsCard label="Total de relatórios" value={total} icon={FileText} color="blue" />
        <StatsCard label="Liberados" value={liberados} icon={CheckCircle2} color="green" />
        <StatsCard label="Aguardando análise" value={pendentes} icon={Clock} color="amber" />
      </div>

      {/* Progress bar */}
      <div className="bg-card rounded-2xl border border-border p-5 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Progresso de liberação</span>
          <span className="text-sm font-bold text-primary">{Math.round((liberados / total) * 100)}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2.5">
          <div
            className="bg-gradient-to-r from-blue-500 to-green-500 h-2.5 rounded-full transition-all duration-700"
            style={{ width: `${(liberados / total) * 100}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">{liberados} de {total} relatórios liberados para os municípios</p>
      </div>

      {/* Pending reports */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-display font-semibold">Relatórios aguardando análise</h2>
          <Link to="/pedagogico/relatorios">
            <Button variant="ghost" size="sm" className="gap-1.5 text-primary">
              Ver todos <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
        {recentes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-green-500" />
            Todos os relatórios foram analisados!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Município</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Avaliação</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Série</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ação</th>
                </tr>
              </thead>
              <tbody>
                {recentes.map(r => (
                  <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium">{r.municipioNome}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{r.avaliacaoNome}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{r.serieNome}</td>
                    <td className="px-4 py-3">
                      <Link to={`/pedagogico/relatorio/${r.id}`}>
                        <Button size="sm" variant="outline" className="rounded-lg gap-1.5 h-7 text-xs">
                          <Eye className="w-3 h-3" />
                          Analisar
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}