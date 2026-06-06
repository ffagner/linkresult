import React, { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash2, Eye, Filter, FileText, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import { listar, criar, atualizar, excluir } from '@/api/relatorios';
import { listar as listarMunicipios } from '@/api/municipios';
import { listar as listarAvaliacoes } from '@/api/avaliacoes';
import { listar as listarSeries } from '@/api/series';
import { encryptLink } from '@/lib/crypto';
import AppLayout from '@/components/lr/AppLayout';
import PageHeader from '@/components/lr/PageHeader';
import DataTable from '@/components/lr/DataTable';
import FormModal from '@/components/lr/FormModal';
import ConfirmDialog from '@/components/lr/ConfirmDialog';
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
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [municipios, setMunicipios] = useState<any[]>([]);
  const [avaliacoes, setAvaliacoes] = useState<any[]>([]);
  const [series, setSeries] = useState<any[]>([]);
  const [search, setSearch] = useState<string>('');
  const [filterMunicipio, setFilterMunicipio] = useState<string>('todos');
  const [filterAvaliacao, setFilterAvaliacao] = useState<string>('todos');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [deleteItem, setDeleteItem] = useState<any>(null);
  const [form, setForm] = useState<any>({ municipioId: '', avaliacaoId: '', serieId: '', link: '' });
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    Promise.all([
      listar(),
      listarMunicipios(),
      listarAvaliacoes(),
      listarSeries(),
    ]).then(([rel, muns, avas, sers]) => {
      setData(rel);
      setMunicipios(muns);
      setAvaliacoes(avas);
      setSeries(sers);
      setLoading(false);
    });
  }, []);

  const filtered = data.filter(r => {
    const matchSearch = (r.municipioNome || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.avaliacaoNome || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.serieNome || '').toLowerCase().includes(search.toLowerCase());
    const matchM = filterMunicipio === 'todos' || r.municipioId === filterMunicipio;
    const matchA = filterAvaliacao === 'todos' || r.avaliacaoId === filterAvaliacao;
    const matchS = filterStatus === 'todos' || (filterStatus === 'liberado' ? r.liberado : !r.liberado);
    return matchSearch && matchM && matchA && matchS;
  });

  const openCreate = (): void => { setEditItem(null); setForm({ municipioId: '', avaliacaoId: '', serieId: '', link: '' }); setModalOpen(true); };
  const openEdit = (item: any): void => {
    setEditItem(item);
    setForm({ municipioId: item.municipioId, avaliacaoId: item.avaliacaoId, serieId: item.serieId, link: '' });
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
        const updateData: any = {};
        if (form.municipioId) { updateData.municipioId = form.municipioId; updateData.municipioNome = mun?.nome; }
        if (form.avaliacaoId) { updateData.avaliacaoId = form.avaliacaoId; updateData.avaliacaoNome = ava?.nome; }
        if (form.serieId) { updateData.serieId = form.serieId; updateData.serieNome = ser?.nome; }
        if (linkEncriptado) updateData.linkEncriptado = linkEncriptado;
        await atualizar(editItem.id, updateData);
        setData(prev => prev.map(r => r.id === editItem.id ? { ...r, ...updateData } : r));
        toast({ title: 'Relatório atualizado', variant: 'edit' });
      } else {
        const id = await criar({
          municipioId: form.municipioId, municipioNome: mun?.nome,
          avaliacaoId: form.avaliacaoId, avaliacaoNome: ava?.nome,
          serieId: form.serieId, serieNome: ser?.nome,
          linkEncriptado,
        });
        setData(prev => [{
          id, municipioId: form.municipioId, municipioNome: mun?.nome,
          avaliacaoId: form.avaliacaoId, avaliacaoNome: ava?.nome,
          serieId: form.serieId, serieNome: ser?.nome,
          liberado: false, liberadoEm: null, createdAt: new Date().toISOString().split('T')[0],
        }, ...prev]);
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
    { header: 'Status', render: (r) => <StatusBadge status={r.liberado ? 'liberado' : 'pendente'} /> },
    {
      header: 'Ações', className: 'text-right',
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
          <div className="flex gap-2">
            <Link to="/admin/relatorios/lote">
              <Button variant="outline" className="rounded-xl gap-2">
                <Layers className="w-4 h-4" />
                Cadastro em Lote
              </Button>
            </Link>
            <Button onClick={openCreate} className="rounded-xl gap-2">
              <Plus className="w-4 h-4" />
              Novo Relatório
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar..." value={search} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)} className="pl-9 h-10 rounded-xl" />
        </div>
        <Select value={filterMunicipio} onValueChange={setFilterMunicipio}>
          <SelectTrigger className="w-44 h-10 rounded-xl">
            <SelectValue placeholder="Município" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os municípios</SelectItem>
            {municipios.map(m => <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterAvaliacao} onValueChange={setFilterAvaliacao}>
          <SelectTrigger className="w-44 h-10 rounded-xl">
            <SelectValue placeholder="Avaliação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas as avaliações</SelectItem>
            {avaliacoes.map(a => <SelectItem key={a.id} value={a.id}>{a.nome} ({a.ano})</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36 h-10 rounded-xl">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="liberado">Liberado</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
          </SelectContent>
        </Select>
      </div>

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
