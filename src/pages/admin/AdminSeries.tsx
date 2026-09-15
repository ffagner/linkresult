import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, GripVertical, BookOpen } from 'lucide-react';
import { listar, criar, atualizar, excluir } from '@/api/series';
import AppLayout from '@/components/lr/AppLayout';
import PageHeader from '@/components/lr/PageHeader';
import FormModal from '@/components/lr/FormModal';
import ConfirmDialog from '@/components/lr/ConfirmDialog';
import LoadingSpinner from '@/components/lr/LoadingSpinner';
import EmptyState from '@/components/lr/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function AdminSeries() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [deleteItem, setDeleteItem] = useState<any>(null);
  const [form, setForm] = useState<any>({ nome: '', ordem: '' });
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => { listar().then(r => { setData(r); setLoading(false) }) }, []);

  const openCreate = (): void => { setEditItem(null); setForm({ nome: '', ordem: String(data.length + 1) }); setModalOpen(true); };
  const openEdit = (item: any): void => { setEditItem(item); setForm({ nome: item.nome, ordem: String(item.ordem) }); setModalOpen(true); };

  const handleSave = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editItem) {
        await atualizar(editItem.id, { nome: form.nome, ordem: parseInt(form.ordem) });
        setData(prev => prev.map(s => s.id === editItem.id ? { ...s, nome: form.nome, ordem: parseInt(form.ordem) } : s).sort((a, b) => a.ordem - b.ordem));
        toast({ title: 'Série atualizada', variant: 'edit' });
      } else {
        const id = await criar({ nome: form.nome, ordem: parseInt(form.ordem) });
        setData(prev => [...prev, { id, nome: form.nome, ordem: parseInt(form.ordem) }].sort((a, b) => a.ordem - b.ordem));
        toast({ title: 'Série criada', variant: 'create' });
      }
      setModalOpen(false);
    } catch { toast({ title: 'Erro ao salvar', variant: 'destructive' }) }
    finally { setSaving(false) }
  };

  const handleDelete = async (): Promise<void> => {
    try {
      await excluir(deleteItem.id);
      setData(prev => prev.filter(s => s.id !== deleteItem.id));
      toast({ title: 'Série excluída', variant: 'delete' });
    } catch { toast({ title: 'Erro ao excluir', variant: 'destructive' }) }
    setDeleteItem(null);
  };

  return (
    <AppLayout role="admin" userName={profile?.nome || 'Admin'}>
      <PageHeader
        title="Séries / Etapas"
        subtitle="Gerencie as séries escolares do sistema"
        actions={
          <Button onClick={openCreate} className="rounded-xl gap-2">
            <Plus className="w-4 h-4" />
            Nova Série
          </Button>
        }
      />

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="hidden sm:block px-4 py-3 bg-muted/40 border-b border-border">
          <div className="flex items-center gap-4">
            <div className="w-16 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ord.</div>
            <div className="flex-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nome</div>
            <div className="w-24 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Ações</div>
          </div>
        </div>
        {loading ? (
          <LoadingSpinner text="Carregando séries..." />
        ) : data.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Nenhuma série cadastrada"
            description='Clique em "Nova Série" para começar a cadastrar as séries e etapas.'
          />
        ) : data.map(serie => (
          <div key={serie.id} className="px-4 py-3.5 border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 sm:w-16 flex items-center gap-2 flex-shrink-0">
                <GripVertical className="hidden sm:block w-4 h-4 text-muted-foreground/40 cursor-grab" />
                <span className="text-sm font-mono text-muted-foreground">{serie.ordem}</span>
              </div>
              <div className="flex-1 flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-sm font-medium truncate">{serie.nome}</span>
              </div>
              <div className="w-24 flex items-center justify-end gap-2 flex-shrink-0">
                <button onClick={() => openEdit(serie)} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => setDeleteItem(serie)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-muted-foreground hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <FormModal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Editar Série' : 'Nova Série'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nome da série</Label>
            <Input placeholder="Ex: 3º ano" value={form.nome} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, nome: e.target.value }))} className="rounded-xl h-10" required />
          </div>
          <div className="space-y-1.5">
            <Label>Ordem de exibição</Label>
            <Input type="number" min="1" value={form.ordem} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, ordem: e.target.value }))} className="rounded-xl h-10" required />
            <p className="text-xs text-muted-foreground">Define a posição na listagem (1 = primeiro)</p>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving} className="flex-1 rounded-xl">
              {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />Salvando...</> : 'Salvar'}
            </Button>
          </div>
        </form>
      </FormModal>

      <ConfirmDialog open={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete} title="Excluir série" description={`Excluir "${deleteItem?.nome}"?`} confirmLabel="Excluir" />
    </AppLayout>
  );
}
