import React, { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash2, Eye, Filter, FileText, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import { listar, criar, atualizar, excluir } from '@/api/relatorios';
import type { RelatorioData } from '@/api/relatorios';
import { listar as listarMunicipios } from '@/api/municipios';
import type { MunicipioData } from '@/api/municipios';
import { listar as listarAvaliacoes } from '@/api/avaliacoes';
import type { AvaliacaoData } from '@/api/avaliacoes';
import { listar as listarSeries } from '@/api/series';
import type { SerieData } from '@/api/series';
import { encryptLink } from '@/lib/crypto';
import { formatarData } from '@/lib/date';
import AppLayout from '@/components/lr/AppLayout';
import PageHeader from '@/components/lr/PageHeader';
import DataTable from '@/components/lr/DataTable';
import FormModal from '@/components/lr/FormModal';
import ConfirmDialog from '@/components/lr/ConfirmDialog';
import FilterBar from '@/components/lr/FilterBar';
import StatusBadge from '@/components/lr/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function AdminRelatorios() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<RelatorioData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [municipios, setMunicipios] = useState<MunicipioData[]>([]);
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoData[]>([]);
  const [series, setSeries] = useState<SerieData[]>([]);
  const [search, setSearch] = useState<string>('');
  const [filterMunicipio, setFilterMunicipio] = useState<string>('todos');
  const [filterAvaliacao, setFilterAvaliacao] = useState<string>('todos');
  const [filterSerie, setFilterSerie] = useState<string>('todos');
  const [filterAno, setFilterAno] = useState<string>('todos');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editItem, setEditItem] = useState<RelatorioData | null>(null);
  const [deleteItem, setDeleteItem] = useState<RelatorioData | null>(null);
  const [form, setForm] = useState<{ municipioId: string; avaliacaoId: string; serieId: string; ano: string; link: string }>({ municipioId: '', avaliacaoId: '', serieId: '', ano: String(new Date().getFullYear()), link: '' });
  const [saving, setSaving] = useState<boolean>(false);

  // Listas para os selects de filtro/formulário — carregadas uma vez.
  useEffect(() => {
    Promise.all([listarMunicipios(), listarAvaliacoes(), listarSeries()]).then(([muns, avas, sers]) => {
      setMunicipios(muns);
      setAvaliacoes(avas);
      setSeries(sers);
    });
  }, []);

  // Relatórios: refeito no Firestore sempre que o filtro de município muda
  // (where server-side) em vez de sempre trazer a coleção inteira — ver
  // docs/PLANO-MELHORIAS.md item 5. Avaliação/série/status/busca continuam
  // aplicados no cliente sobre esse conjunto.
  useEffect(() => {
    setLoading(true);
    listar(filterMunicipio !== 'todos' ? filterMunicipio : undefined).then(rel => {
      setData(rel);
      setLoading(false);
    });
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

  const openCreate = (): void => { setEditItem(null); setForm({ municipioId: '', avaliacaoId: '', serieId: '', ano: String(new Date().getFullYear()), link: '' }); setModalOpen(true); };
  const openEdit = (item: RelatorioData): void => {
    setEditItem(item);
    setForm({ municipioId: item.municipioId, avaliacaoId: item.avaliacaoId, serieId: item.serieId, ano: String(item.ano), link: '' });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setSaving(true);
    try {
      const linkEncriptado = form.link ? await encryptLink(form.link) : undefined;
      const mun = municipios.find(m => m.id === form.municipioId);
      const ava = avaliacoes.find(a => a.id === form.avaliacaoId);
      const ser = series.find(s => s.id === form.serieId);
      if (editItem) {
        const updateData: Partial<RelatorioData> = {};
        if (form.municipioId) { updateData.municipioId = form.municipioId; updateData.municipioNome = mun?.nome; }
        if (form.avaliacaoId) { updateData.avaliacaoId = form.avaliacaoId; updateData.avaliacaoNome = ava?.nome; }
        if (form.serieId) { updateData.serieId = form.serieId; updateData.serieNome = ser?.nome; }
        if (form.ano) updateData.ano = parseInt(form.ano);
        if (linkEncriptado) updateData.linkEncriptado = linkEncriptado;
        await atualizar(editItem.id, updateData);
        // Se o município mudou e não bate mais com o filtro ativo, some da lista.
        setData(prev => prev
          .map(r => r.id === editItem.id ? { ...r, ...updateData } : r)
          .filter(r => filterMunicipio === 'todos' || r.municipioId === filterMunicipio));
        toast({ title: 'Relatório atualizado', variant: 'edit' });
      } else {
        const id = await criar({
          municipioId: form.municipioId, municipioNome: mun?.nome,
          avaliacaoId: form.avaliacaoId, avaliacaoNome: ava?.nome,
          serieId: form.serieId, serieNome: ser?.nome,
          ano: parseInt(form.ano),
          linkEncriptado,
        });
        const novo: RelatorioData = {
          id, municipioId: form.municipioId, municipioNome: mun?.nome || '',
          avaliacaoId: form.avaliacaoId, avaliacaoNome: ava?.nome || '',
          serieId: form.serieId, serieNome: ser?.nome || '',
          ano: parseInt(form.ano),
          linkEncriptado: linkEncriptado || '',
          liberado: false, liberadoEm: null, liberadoPor: null,
          entregueEm: null, entreguePor: null, entreguePorNome: null, historico: [],
          createdAt: new Date(),
        };
        // Só aparece na lista já filtrada se pertencer ao município selecionado.
        if (filterMunicipio === 'todos' || filterMunicipio === form.municipioId) {
          setData(prev => [novo, ...prev]);
        }
        toast({ title: 'Relatório criado', variant: 'create' });
      }
      setModalOpen(false);
    } catch { toast({ title: 'Erro ao salvar', variant: 'destructive' }) }
    finally { setSaving(false) }
  };

  const handleDelete = async (): Promise<void> => {
    try {
      await excluir(deleteItem.id);
      setData(prev => prev.filter(r => r.id !== deleteItem.id));
      toast({ title: 'Relatório excluído', variant: 'delete' });
    } catch { toast({ title: 'Erro ao excluir', variant: 'destructive' }) }
    setDeleteItem(null);
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
          <Link to={`/admin/relatorio/${r.id}`}>
            <button className="p-1.5 rounded-lg hover:bg-blue-50 transition-colors text-muted-foreground hover:text-blue-600">
              <Eye className="w-4 h-4" />
            </button>
          </Link>
          <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={() => setDeleteItem(r)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-muted-foreground hover:text-destructive">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <AppLayout role="admin" userName={profile?.nome || 'Admin'}>
      <PageHeader
        title="Relatórios"
        subtitle={`${data.length} relatórios cadastrados`}
        actions={
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Link to="/admin/relatorios/lote" className="w-full sm:w-auto">
              <Button variant="outline" className="rounded-xl gap-2 w-full sm:w-auto">
                <Layers className="w-4 h-4" />
                Cadastro em Lote
              </Button>
            </Link>
            <Button onClick={openCreate} className="rounded-xl gap-2 w-full sm:w-auto">
              <Plus className="w-4 h-4" />
              Novo Relatório
            </Button>
          </div>
        }
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
          <SelectTrigger className="w-full sm:w-44 h-10 rounded-xl">
            <SelectValue placeholder="Município" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os municípios</SelectItem>
            {municipios.map(m => <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterAvaliacao} onValueChange={setFilterAvaliacao}>
          <SelectTrigger className="w-full sm:w-44 h-10 rounded-xl">
            <SelectValue placeholder="Avaliação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas as avaliações</SelectItem>
            {avaliacoes.map(a => <SelectItem key={a.id} value={a.id}>{a.nome} ({a.ano})</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterSerie} onValueChange={setFilterSerie}>
          <SelectTrigger className="w-full sm:w-44 h-10 rounded-xl">
            <SelectValue placeholder="Série" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas as séries</SelectItem>
            {series.map(s => <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterAno} onValueChange={setFilterAno}>
          <SelectTrigger className="w-full sm:w-32 h-10 rounded-xl">
            <SelectValue placeholder="Ano" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os anos</SelectItem>
            {anos.map(a => <SelectItem key={a} value={String(a)}>{a}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-36 h-10 rounded-xl">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="liberado">Liberado</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
          </SelectContent>
        </Select>
      </FilterBar>

      <DataTable columns={columns} data={filtered} loading={loading} emptyTitle="Nenhum relatório encontrado" emptyDescription="Adicione relatórios individuais ou use o cadastro em lote." />

      <FormModal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Editar Relatório' : 'Novo Relatório'} subtitle="Preencha os dados do relatório">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Município</Label>
            <Select value={form.municipioId} onValueChange={v => setForm(f => ({ ...f, municipioId: v }))}>
              <SelectTrigger className="rounded-xl h-10"><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>{municipios.map(m => <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Avaliação</Label>
            <Select value={form.avaliacaoId} onValueChange={v => setForm(f => ({ ...f, avaliacaoId: v }))}>
              <SelectTrigger className="rounded-xl h-10"><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>{avaliacoes.map(a => <SelectItem key={a.id} value={a.id}>{a.nome} ({a.ano})</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Série</Label>
            <Select value={form.serieId} onValueChange={v => setForm(f => ({ ...f, serieId: v }))}>
              <SelectTrigger className="rounded-xl h-10"><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>{series.map(s => <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Ano</Label>
            <Input type="number" placeholder="2026" value={form.ano} onChange={e => setForm(f => ({ ...f, ano: e.target.value }))} className="rounded-xl h-10" required />
            <p className="text-xs text-muted-foreground">Ano de referência do relatório — ajuda a organizar quando a mesma avaliação se repete todo ano.</p>
          </div>
          <div className="space-y-1.5">
            <Label>Link do Power BI</Label>
            <Input type="url" placeholder="https://app.powerbi.com/..." value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} className="rounded-xl h-10" />
            <p className="text-xs text-muted-foreground">O link será encriptado automaticamente antes de ser salvo.</p>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving} className="flex-1 rounded-xl">
              {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />Salvando...</> : 'Salvar'}
            </Button>
          </div>
        </form>
      </FormModal>

      <ConfirmDialog open={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete} title="Excluir relatório" description="Excluir este relatório? Esta ação não pode ser desfeita." confirmLabel="Excluir" />
    </AppLayout>
  );
}
