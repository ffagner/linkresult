import React, { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Filter, UserX, UserCheck } from 'lucide-react';
import { listar, criar, atualizar, excluir } from '@/api/usuarios';
import { listar as listarMunicipios } from '@/api/municipios';
import AppLayout from '@/components/lr/AppLayout';
import PageHeader from '@/components/lr/PageHeader';
import DataTable from '@/components/lr/DataTable';
import FormModal from '@/components/lr/FormModal';
import StatusBadge from '@/components/lr/StatusBadge';
import ConfirmDialog from '@/components/lr/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function AdminUsuarios() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [municipios, setMunicipios] = useState<any[]>([]);
  const [search, setSearch] = useState<string>('');
  const [filterRole, setFilterRole] = useState<string>('todos');
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [toggleItem, setToggleItem] = useState<any>(null);
  const [form, setForm] = useState<any>({ nome: '', email: '', senha: '', role: 'municipio', municipioId: '' });
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    Promise.all([listar(), listarMunicipios()]).then(([users, muns]) => {
      setData(users);
      setMunicipios(muns);
      setLoading(false);
    });
  }, []);

  const filtered = data.filter(u => {
    const matchSearch = u.nome.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === 'todos' || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const openCreate = (): void => { setEditItem(null); setForm({ nome: '', email: '', senha: '', role: 'municipio', municipioId: '' }); setModalOpen(true); };
  const openEdit = (u: any): void => { setEditItem(u); setForm({ nome: u.nome, email: u.email, senha: '', role: u.role, municipioId: u.municipioId || '' }); setModalOpen(true); };

  const handleSave = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setSaving(true);
    try {
      const mun = municipios.find(m => m.id === form.municipioId);
      if (editItem) {
        const updateData: any = { nome: form.nome, email: form.email, role: form.role, municipioId: form.municipioId || null, municipioNome: mun?.nome || null };
        await atualizar(editItem.uid, updateData);
        setData(prev => prev.map(u => u.uid === editItem.uid ? { ...u, ...updateData } : u));
        toast({ title: 'Usuário atualizado', variant: 'edit' });
      } else {
        await criar({ ...form, municipioNome: mun?.nome || null });
        const refetched = await listar();
        setData(refetched);
        toast({ title: 'Usuário criado', variant: 'create' });
      }
      setModalOpen(false);
    } catch { toast({ title: 'Erro ao salvar', variant: 'destructive' }) }
    finally { setSaving(false) }
  };

  const handleToggleStatus = async (): Promise<void> => {
    const novoStatus = toggleItem.status === 'ativo' ? 'inativo' : 'ativo';
    try {
      await atualizar(toggleItem.uid, { status: novoStatus });
      setData(prev => prev.map(u => u.uid === toggleItem.uid ? { ...u, status: novoStatus } : u));
      toast({ title: `Usuário ${novoStatus === 'ativo' ? 'reativado' : 'desativado'}`, variant: 'delete' });
    } catch { toast({ title: 'Erro ao alterar status', variant: 'destructive' }) }
    setToggleItem(null);
  };

  const roleLabel = { admin: 'Admin', pedagogico: 'Pedagógico', municipio: 'Município' };

  const columns = [
    { header: 'Nome', render: (u) => (
      <div>
        <div className="font-medium text-sm">{u.nome}</div>
        <div className="text-xs text-muted-foreground">{u.email}</div>
      </div>
    )},
    { header: 'Perfil', render: (u) => <StatusBadge status={u.role} /> },
    { header: 'Município', render: (u) => <span className="text-sm text-muted-foreground">{u.municipioNome || '—'}</span> },
    { header: 'Status', render: (u) => <StatusBadge status={u.status} /> },
    {
      header: 'Ações', className: 'text-right',
      render: (u) => (
        <div className="flex items-center justify-end gap-2">
          <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => setToggleItem(u)}
            className={`p-1.5 rounded-lg transition-colors ${u.status === 'ativo' ? 'hover:bg-red-50 text-muted-foreground hover:text-destructive' : 'hover:bg-green-50 text-muted-foreground hover:text-green-600'}`}
          >
            {u.status === 'ativo' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
          </button>
        </div>
      )
    }
  ];

  return (
    <AppLayout role="admin" userName={profile?.nome || 'Admin'}>
      <PageHeader
        title="Usuários"
        subtitle={`${data.length} usuários cadastrados`}
        actions={
          <Button onClick={openCreate} className="rounded-xl gap-2">
            <Plus className="w-4 h-4" />
            Novo Usuário
          </Button>
        }
      />

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome ou e-mail..." value={search} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)} className="pl-9 h-10 rounded-xl" />
        </div>
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-36 h-10 rounded-xl">
            <Filter className="w-4 h-4 mr-1 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os perfis</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="pedagogico">Pedagógico</SelectItem>
            <SelectItem value="municipio">Município</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable columns={columns} data={filtered} loading={loading} emptyTitle="Nenhum usuário encontrado" emptyDescription="Crie o primeiro usuário clicando em 'Novo Usuário'." />

      <FormModal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Editar Usuário' : 'Novo Usuário'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nome completo</Label>
            <Input placeholder="Nome do usuário" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} className="rounded-xl h-10" required />
          </div>
          <div className="space-y-1.5">
            <Label>E-mail</Label>
            <Input type="email" placeholder="email@exemplo.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="rounded-xl h-10" required />
          </div>
          {!editItem && (
            <div className="space-y-1.5">
              <Label>Senha inicial</Label>
              <Input type="password" placeholder="Mínimo 8 caracteres" value={form.senha} onChange={e => setForm(f => ({ ...f, senha: e.target.value }))} className="rounded-xl h-10" />
            </div>
          )}
          <div className="space-y-1.5">
            <Label>Perfil de acesso</Label>
            <Select value={form.role} onValueChange={v => setForm(f => ({ ...f, role: v, municipioId: '' }))}>
              <SelectTrigger className="rounded-xl h-10"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="pedagogico">Pedagógico</SelectItem>
                <SelectItem value="municipio">Município</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {form.role === 'municipio' && (
            <div className="space-y-1.5">
              <Label>Município vinculado</Label>
              <Select value={form.municipioId} onValueChange={v => setForm(f => ({ ...f, municipioId: v }))}>
                <SelectTrigger className="rounded-xl h-10"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>{municipios.map(m => <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving} className="flex-1 rounded-xl">
              {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />Salvando...</> : 'Salvar'}
            </Button>
          </div>
        </form>
      </FormModal>

      <ConfirmDialog
        open={!!toggleItem}
        onClose={() => setToggleItem(null)}
        onConfirm={handleToggleStatus}
        title={toggleItem?.status === 'ativo' ? 'Desativar usuário' : 'Reativar usuário'}
        description={`${toggleItem?.status === 'ativo' ? 'Desativar' : 'Reativar'} o acesso de "${toggleItem?.nome}"?`}
        confirmLabel={toggleItem?.status === 'ativo' ? 'Desativar' : 'Reativar'}
        variant={toggleItem?.status === 'ativo' ? 'destructive' : 'default'}
      />
    </AppLayout>
  );
}
