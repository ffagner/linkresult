import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Eye, CheckCircle2, XCircle } from 'lucide-react';
import AppLayout from '@/components/lr/AppLayout';
import PageHeader from '@/components/lr/PageHeader';
import DataTable from '@/components/lr/DataTable';
import StatusBadge from '@/components/lr/StatusBadge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { listar, liberar } from '@/api/relatorios';
import { listar as listarMunicipios } from '@/api/municipios';
import { listar as listarAvaliacoes } from '@/api/avaliacoes';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function PedagogicoRelatorios() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterMunicipio, setFilterMunicipio] = useState('todos');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [relatoriosData, municipiosData, avaliacoesData] = await Promise.all([
          listar(),
          listarMunicipios(),
          listarAvaliacoes(),
        ]);
        setData(relatoriosData);
        setMunicipios(municipiosData);
        setAvaliacoes(avaliacoesData);
      } catch (err) {
        toast({ title: 'Erro ao carregar', description: err.message, variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = data.filter(r => {
    const matchSearch = (r.municipioNome || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.avaliacaoNome || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.serieNome || '').toLowerCase().includes(search.toLowerCase());
    const matchM = filterMunicipio === 'todos' || r.municipioId === filterMunicipio;
    const matchS = filterStatus === 'todos' || (filterStatus === 'liberado' ? r.liberado : !r.liberado);
    return matchSearch && matchM && matchS;
  });

  const handleToggle = async (r) => {
    setUpdatingId(r.id);
    try {
      const novoValor = !r.liberado;
      await liberar(r.id, profile.uid, novoValor);
      setData(prev => prev.map(item =>
        item.id === r.id ? { ...item, liberado: novoValor, liberadoEm: novoValor ? new Date().toISOString().split('T')[0] : null, liberadoPor: novoValor ? profile.uid : null } : item
      ));
      toast({ title: novoValor ? 'Relatório liberado' : 'Acesso revogado', description: `${r.municipioNome} — ${r.avaliacaoNome}` });
    } catch (err) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    } finally {
      setUpdatingId(null);
    }
  };

  const columns = [
    { header: 'Município', render: (r) => <span className="font-medium">{r.municipioNome}</span> },
    { header: 'Avaliação', render: (r) => <span className="text-muted-foreground">{r.avaliacaoNome}</span> },
    { header: 'Série', render: (r) => <span className="text-muted-foreground">{r.serieNome}</span> },
    { header: 'Status', render: (r) => <StatusBadge status={r.liberado ? 'liberado' : 'pendente'} /> },
    {
      header: 'Ações', className: 'text-right',
      render: (r) => (
        <div className="flex items-center justify-end gap-2">
          <Link to={`/pedagogico/relatorio/${r.id}`}>
            <button className="p-1.5 rounded-lg hover:bg-blue-50 transition-colors text-muted-foreground hover:text-blue-600">
              <Eye className="w-4 h-4" />
            </button>
          </Link>
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

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-10 rounded-xl" />
        </div>
        <Select value={filterMunicipio} onValueChange={setFilterMunicipio}>
          <SelectTrigger className="w-44 h-10 rounded-xl"><SelectValue placeholder="Município" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os municípios</SelectItem>
            {municipios.map(m => <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36 h-10 rounded-xl"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="liberado">Liberados</SelectItem>
            <SelectItem value="pendente">Pendentes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable columns={columns} data={filtered} loading={loading} emptyTitle="Nenhum relatório encontrado" emptyDescription="Ajuste os filtros para ver os resultados." />
    </AppLayout>
  );
}
