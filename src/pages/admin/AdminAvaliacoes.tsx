import React, { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash2, Filter } from 'lucide-react';
import { listar, criar, atualizar, excluir } from '@/api/avaliacoes';
import AppLayout from '@/components/lr/AppLayout';
import PageHeader from '@/components/lr/PageHeader';
import DataTable from '@/components/lr/DataTable';
import FormModal from '@/components/lr/FormModal';
import ConfirmDialog from '@/components/lr/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function AdminAvaliacoes() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [filterAno, setFilterAno] = useState<string>('todos');
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [deleteItem, setDeleteItem] = useState<any>(null);
  const [form, setForm] = useState<any>({ nome: '', ano: '' });
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => { listar().then(r => { setData(r); setLoading(false) }) }, []);

  const anos = [...new Set(data.map(a => a.ano))].sort((a, b) => b - a);

  const filtered = data.filter(a => {
    const matchSearch = a.nome.toLowerCase().includes(search.toLowerCase());
    const matchAno = filterAno === 'todos' || String(a.ano) === filterAno;
    return matchSearch && matchAno;
  });

  const openCreate = (): void => { setEditItem(null); setForm({ nome: '', ano: '' }); setModalOpen(true); };
  const openEdit = (item: any): void => { setEditItem(item); setForm({ nome: item.nome, ano: String(item.ano) }); setModalOpen(true); };

  const handleSave = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editItem) {
        await atualizar(editItem.id, { nome: form.nome, ano: parseInt(form.ano) });
        setData(prev => prev.map(a => a.id === editItem.id ? { ...a, nome: form.nome, ano: parseInt(form.ano) } : a));
        toast({ title: 'Avaliação atualizada', variant: 'edit' });
      } else {
        const id = await criar({ nome: form.nome, ano: parseInt(form.ano) });
        setData(prev => [...prev, { id, nome: form.nome, ano: parseInt(form.ano), createdAt: new Date().toISOString().split('T')[0] }]);
        toast({ title: 'Avaliação criada', variant: 'create' });
      }
      setModalOpen(false);
    } catch { toast({ title: 'Erro ao salvar', variant: 'destructive' }) }
    finally { setSaving(false) }
  };

  const handleDelete = async (): Promise<void> => {
    try {
      await excluir(deleteItem.id);
      setData(prev => prev.filter(a => a.id !== deleteItem.id));
      toast({ title: 'Avaliação excluída', variant: 'delete' });
    } catch { toast({ title: 'Erro ao excluir', variant: 'destructive' }) }
    setDeleteItem(null);
  };

  const columns = [
    { header: 'Nome', key: 'nome', render: (row) => <span className="font-medium">{row.nome}</span> },
    { header: 'Ano', key: 'ano', render: (row) => (
      <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">{row.ano}</span>
    )},
    { header: 'Cadastrado em', key: 'createdAt', render: (row) => <span className="text-muted-foreground">{row.createdAt}</span> },
    {
      header: 'Ações', className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button onClick={() => openEdit(row)} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={() => setDeleteItem(row)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-muted-foreground hover:text-destructive">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <AppLayout role="admin" userName={profile?.nome || 'Admin'}>
      <PageHeader
        title="Avaliações"
        subtitle={`${data.length} avaliações cadastradas`}
        actions={
          <Button onClick={openCreate} className="rounded-xl gap-2">
            <Plus className="w-4 h-4" />
            Nova Avaliação
          </Button>
        }
      />

      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome..." value={search} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)} className="pl-9 h-10 rounded-xl" />
        </div>
        <Select value={filterAno} onValueChange={setFilterAno}>
          <SelectTrigger className="w-36 h-10 rounded-xl">
            <Filter className="w-4 h-4 mr-1.5 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os anos</SelectItem>
            {anos.map(a => <SelectItem key={a} value={String(a)}>{a}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <DataTable columns={columns} data={filtered} loading={loading} emptyTitle="Nenhuma avaliação encontrada" emptyDescription="Clique em 'Nova Avaliação' para adicionar." />

      <FormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'Editar Avaliação' : 'Nova Avaliação'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nome da avaliação</Label>
            <Input placeholder="Ex: CADERNO 1" value={form.nome} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, nome: e.target.value }))} className="rounded-xl h-10" required />
            </div>
            <div className="space-y-1.5">
              <Label>Ano</Label>
              <Input type="number" placeholder="2025" value={form.ano} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, ano: e.target.value }))} className="rounded-xl h-10" required />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving} className="flex-1 rounded-xl">
              {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />Salvando...</> : 'Salvar'}
            </Button>
          </div>
        </form>
      </FormModal>

      <ConfirmDialog open={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete} title="Excluir avaliação" description={`Excluir "${deleteItem?.nome}"? Esta ação não pode ser desfeita.`} confirmLabel="Excluir" />
    </AppLayout>
  );
}
