import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, ClipboardList, FileText, CheckCircle2, Plus, ArrowRight, Clock } from 'lucide-react';
import { listar as listarMunicipios } from '@/api/municipios';
import { listar as listarAvaliacoes } from '@/api/avaliacoes';
import { listar as listarRelatorios } from '@/api/relatorios';
import { useAuth } from '@/lib/AuthContext';
import AppLayout from '@/components/lr/AppLayout';
import StatsCard from '@/components/lr/StatsCard';
import PageHeader from '@/components/lr/PageHeader';
import StatusBadge from '@/components/lr/StatusBadge';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/lr/LoadingSpinner';

const quickActions = [
  { label: 'Novo Município', href: '/admin/municipios', icon: Building2, color: 'bg-blue-50 text-blue-600 hover:bg-blue-100' },
  { label: 'Nova Avaliação', href: '/admin/avaliacoes', icon: ClipboardList, color: 'bg-purple-50 text-purple-600 hover:bg-purple-100' },
  { label: 'Novo Relatório', href: '/admin/relatorios', icon: FileText, color: 'bg-green-50 text-green-600 hover:bg-green-100' },
  { label: 'Cadastro em Lote', href: '/admin/relatorios/lote', icon: Plus, color: 'bg-amber-50 text-amber-600 hover:bg-amber-100' },
];

export default function AdminDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({ municipios: 0, avaliacoes: 0, liberados: 0, pendentes: 0 });
  const [recentes, setRecentes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([listarMunicipios(), listarAvaliacoes(), listarRelatorios()]).then(([m, a, r]) => {
      setStats({
        municipios: m.length, avaliacoes: a.length,
        liberados: r.filter(x => x.liberado).length,
        pendentes: r.filter(x => !x.liberado).length,
      });
      setRecentes(r.slice(0, 6));
      setLoading(false);
    });
  }, []);

  if (loading) return <AppLayout role="admin" userName={profile?.nome || 'Admin'}><LoadingSpinner text="Carregando dashboard..." /></AppLayout>;

  return (
    <AppLayout role="admin" userName={profile?.nome || 'Admin'}>
      <PageHeader title="Dashboard" subtitle="Visão geral do sistema LinkResults" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard label="Municípios" value={stats.municipios} icon={Building2} color="blue" />
        <StatsCard label="Avaliações" value={stats.avaliacoes} icon={ClipboardList} color="purple" />
        <StatsCard label="Relatórios liberados" value={stats.liberados} icon={CheckCircle2} color="green" />
        <StatsCard label="Aguardando liberação" value={stats.pendentes} icon={Clock} color="amber" />
      </div>

      <div className="bg-card rounded-2xl border border-border p-5 mb-6">
        <h2 className="font-display font-semibold text-base mb-4">Ações rápidas</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map(action => (
            <Link key={action.href} to={action.href} className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl transition-all text-center ${action.color}`}>
              <action.icon className="w-6 h-6" />
              <span className="text-xs font-medium leading-tight">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-display font-semibold text-base">Relatórios recentes</h2>
          <Link to="/admin/relatorios">
            <Button variant="ghost" size="sm" className="gap-1.5 text-primary">
              Ver todos <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Município</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Avaliação</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Série</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentes.map(r => (
                <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium">{r.municipioNome}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{r.avaliacaoNome}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{r.serieNome}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.liberado ? 'liberado' : 'pendente'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
