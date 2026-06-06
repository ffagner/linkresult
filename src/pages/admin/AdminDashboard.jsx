import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, ClipboardList, FileText, CheckCircle2, Plus, ArrowRight, Clock } from 'lucide-react';
import AppLayout from '@/components/lr/AppLayout';
import StatsCard from '@/components/lr/StatsCard';
import PageHeader from '@/components/lr/PageHeader';
import StatusBadge from '@/components/lr/StatusBadge';
import { Button } from '@/components/ui/button';
import { mockRelatorios, mockMunicipios, mockAvaliacoes } from '@/lib/mockData';
import { mockCurrentUser } from '@/lib/mockData';

const quickActions = [
  { label: 'Novo Município', href: '/admin/municipios', icon: Building2, color: 'bg-blue-50 text-blue-600 hover:bg-blue-100' },
  { label: 'Nova Avaliação', href: '/admin/avaliacoes', icon: ClipboardList, color: 'bg-purple-50 text-purple-600 hover:bg-purple-100' },
  { label: 'Novo Relatório', href: '/admin/relatorios', icon: FileText, color: 'bg-green-50 text-green-600 hover:bg-green-100' },
  { label: 'Cadastro em Lote', href: '/admin/relatorios/lote', icon: Plus, color: 'bg-amber-50 text-amber-600 hover:bg-amber-100' },
];

export default function AdminDashboard() {
  const user = mockCurrentUser.admin;
  const totalLiberados = mockRelatorios.filter(r => r.liberado).length;
  const totalPendentes = mockRelatorios.filter(r => !r.liberado).length;

  return (
    <AppLayout role="admin" userName={user.nome}>
      <PageHeader
        title="Dashboard"
        subtitle="Visão geral do sistema LinkResults"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard label="Municípios" value={mockMunicipios.length} icon={Building2} color="blue" />
        <StatsCard label="Avaliações" value={mockAvaliacoes.length} icon={ClipboardList} color="purple" />
        <StatsCard label="Relatórios liberados" value={totalLiberados} icon={CheckCircle2} color="green" />
        <StatsCard label="Aguardando liberação" value={totalPendentes} icon={Clock} color="amber" />
      </div>

      {/* Quick actions */}
      <div className="bg-card rounded-2xl border border-border p-5 mb-6">
        <h2 className="font-display font-semibold text-base mb-4">Ações rápidas</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map(action => (
            <Link
              key={action.href}
              to={action.href}
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl transition-all text-center ${action.color}`}
            >
              <action.icon className="w-6 h-6" />
              <span className="text-xs font-medium leading-tight">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent reports */}
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
              {mockRelatorios.slice(0, 6).map(r => (
                <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium">{r.municipioNome}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{r.avaliacaoNome}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{r.serieNome}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.liberado ? 'liberado' : 'pendente'} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}