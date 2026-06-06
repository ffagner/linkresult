import React, { useState } from 'react';
import { Plus, Search, Pencil, Trash2, Building2 } from 'lucide-react';
import AppLayout from '@/components/lr/AppLayout';
import PageHeader from '@/components/lr/PageHeader';
import DataTable from '@/components/lr/DataTable';
import FormModal from '@/components/lr/FormModal';
import ConfirmDialog from '@/components/lr/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockMunicipios, estadosBrasileiros, mockCurrentUser } from '@/lib/mockData';

export default function AdminMunicipios() {
  const user = mockCurrentUser.admin;
  const [data, setData] = useState(mockMunicipios);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [form, setForm] = useState({ nome: '', estado: '' });
  const [saving, setSaving] = useState(false);

  const filtered = data.filter(m =>
    m.nome.toLowerCase().includes(search.toLowerCase()) ||
    m.estado.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => { setEditItem(null); setForm({ nome: '', estado: '' }); setModalOpen(true); };
  const openEdit = (item) => { setEditItem(item); setForm({ nome: item.nome, estado: item.estado }); setModalOpen(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    // lógica a implementar: addDoc / updateDoc
    await new Promise(r => setTimeout(r, 800));
    if (editItem) {
      setData(prev => prev.map(m => m.id === editItem.id ? { ...m, ...form } : m));
    } else {
      setData(prev => [...prev, { id: String(Date.now()), ...form, createdAt: new Date().toISOString().split('T')[0] }]);
    }
    setSaving(false);
    setModalOpen(false);
  };

  const handleDelete = () => {
    // lógica a implementar: deleteDoc
    setData(prev => prev.filter(m => m.id !== deleteItem.id));
  };

  const columns = [
    { header: 'Nome', key: 'nome', render: (row) => <span className="font-medium">{row.nome}</span> },
    { header: 'Estado', key: 'estado', render: (row) => <span className="text-muted-foreground">{row.estado}</span> },
    { header: 'Cadastrado em', key: 'createdAt', render: (row) => <span className="text-muted-foreground">{row.createdAt}</span> },
    {
      header: 'Ações', key: 'acoes', className: 'text-right',
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
    <AppLayout role="admin" userName={user.nome}>
      <PageHeader
        title="Municípios"
        subtitle={`${data.length} municípios cadastrados`}
        actions={
          <Button onClick={openCreate} className="rounded-xl gap-2">
            <Plus className="w-4 h-4" />
            Novo Município
          </Button>
        }
      />

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou estado..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9 h-10 rounded-xl"
        />
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        emptyTitle="Nenhum município encontrado"
        emptyDescription="Clique em 'Novo Município' para começar a cadastrar."
      />

      <FormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'Editar Município' : 'Novo Município'}
        subtitle={editItem ? `Editando: ${editItem.nome}` : 'Preencha os dados do município'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nome do município</Label>
            <Input
              placeholder="Ex: Fortaleza"
              value={form.nome}
              onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
              className="rounded-xl h-10"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>Estado (UF)</Label>
            <Select value={form.estado} onValueChange={v => setForm(f => ({ ...f, estado: v }))}>
              <SelectTrigger className="rounded-xl h-10">
                <SelectValue placeholder="Selecione o estado" />
              </SelectTrigger>
              <SelectContent>
                {estadosBrasileiros.map(uf => (
                  <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving} className="flex-1 rounded-xl">
              {saving ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Salvando...
                </div>
              ) : 'Salvar'}
            </Button>
          </div>
        </form>
      </FormModal>

      <ConfirmDialog
        open={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        title="Excluir município"
        description={`Tem certeza que deseja excluir "${deleteItem?.nome}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
      />
    </AppLayout>
  );
}