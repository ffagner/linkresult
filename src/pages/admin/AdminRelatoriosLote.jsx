import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft, Layers, CheckCircle2, AlertCircle, Link as LinkIcon } from 'lucide-react';
import { criarEmLote } from '@/api/relatorios';
import { listar as listarMunicipios } from '@/api/municipios';
import { listar as listarAvaliacoes } from '@/api/avaliacoes';
import { listar as listarSeries } from '@/api/series';
import { encryptLink } from '@/lib/crypto';
import AppLayout from '@/components/lr/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function AdminRelatoriosLote() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [municipios, setMunicipios] = useState([]);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [series, setSeries] = useState([]);
  const [municipioId, setMunicipioId] = useState('');
  const [avaliacaoId, setAvaliacaoId] = useState('');
  const [items, setItems] = useState([{ serieId: '', link: '', id: Date.now() }]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    Promise.all([
      listarMunicipios(),
      listarAvaliacoes(),
      listarSeries(),
    ]).then(([muns, avas, sers]) => {
      setMunicipios(muns);
      setAvaliacoes(avas);
      setSeries(sers);
    });
  }, []);

  const addItem = () => setItems(prev => [...prev, { serieId: '', link: '', id: Date.now() }]);
  const removeItem = (id) => setItems(prev => prev.filter(i => i.id !== id));
  const updateItem = (id, field, value) => setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const mun = municipios.find(m => m.id === municipioId);
      const ava = avaliacoes.find(a => a.id === avaliacaoId);
      const itens = await Promise.all(items.map(async (item) => {
        const ser = series.find(s => s.id === item.serieId);
        return {
          serieId: item.serieId,
          serieNome: ser?.nome || '',
          linkEncriptado: await encryptLink(item.link),
        };
      }));
      await criarEmLote({
        municipioId,
        municipioNome: mun?.nome || '',
        avaliacaoId,
        avaliacaoNome: ava?.nome || '',
        itens,
      });
      setSaving(false);
      setSaved(true);
      toast({ title: `${items.length} relatório(s) salvos com sucesso` });
      setTimeout(() => navigate('/admin/relatorios'), 2000);
    } catch {
      toast({ title: 'Erro ao salvar relatórios', variant: 'destructive' });
      setSaving(false);
    }
  };

  const mun = municipios.find(m => m.id === municipioId);
  const ava = avaliacoes.find(a => a.id === avaliacaoId);

  if (saved) {
    return (
      <AppLayout role="admin" userName={profile?.nome || 'Admin'}>
        <div className="max-w-2xl mx-auto flex flex-col items-center justify-center py-20 text-center animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-display font-bold mb-2">Relatórios salvos!</h2>
          <p className="text-muted-foreground">{items.length} relatórios foram cadastrados com sucesso para {mun?.nome} — {ava?.nome}.</p>
          <div className="mt-6 text-sm text-muted-foreground">Redirecionando...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout role="admin" userName={profile?.nome || 'Admin'}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/admin/relatorios" className="p-2 rounded-xl hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-display font-bold flex items-center gap-2">
              <Layers className="w-6 h-6 text-primary" />
              Cadastro em Lote
            </h1>
            <p className="text-muted-foreground text-sm">Cadastre vários relatórios de uma vez para o mesmo município e avaliação.</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-card rounded-2xl border border-border p-5">
            <h2 className="font-display font-semibold text-base mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">1</span>
              Selecione o município e a avaliação
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Município</Label>
                <Select value={municipioId} onValueChange={setMunicipioId} required>
                  <SelectTrigger className="rounded-xl h-10"><SelectValue placeholder="Selecione o município" /></SelectTrigger>
                  <SelectContent>{municipios.map(m => <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Avaliação</Label>
                <Select value={avaliacaoId} onValueChange={setAvaliacaoId} required>
                  <SelectTrigger className="rounded-xl h-10"><SelectValue placeholder="Selecione a avaliação" /></SelectTrigger>
                  <SelectContent>{avaliacoes.map(a => <SelectItem key={a.id} value={a.id}>{a.nome} ({a.ano})</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-base flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">2</span>
                Adicione as séries e seus links
              </h2>
              <span className="text-sm text-muted-foreground">{items.length} série(s)</span>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={item.id} className="flex items-start gap-3 p-3 bg-muted/40 rounded-xl border border-border">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Série</Label>
                      <Select value={item.serieId} onValueChange={v => updateItem(item.id, 'serieId', v)}>
                        <SelectTrigger className="rounded-lg h-9 text-sm"><SelectValue placeholder="Selecione a série" /></SelectTrigger>
                        <SelectContent>{series.map(s => <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Link do Power BI</Label>
                      <div className="relative">
                        <LinkIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <Input
                          type="url"
                          placeholder="https://app.powerbi.com/..."
                          value={item.link}
                          onChange={e => updateItem(item.id, 'link', e.target.value)}
                          className="rounded-lg h-9 text-sm pl-8"
                        />
                      </div>
                    </div>
                  </div>
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeItem(item.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-destructive transition-colors mt-5">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addItem}
              className="mt-3 w-full py-2.5 border-2 border-dashed border-border rounded-xl text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Adicionar mais uma série
            </button>
          </div>

          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">Sobre a encriptação</p>
              <p className="text-xs text-blue-600 mt-0.5">Todos os links serão encriptados automaticamente antes de serem salvos. Os municípios nunca verão o link real.</p>
            </div>
          </div>

          {saving && (
            <div className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Salvando relatórios...</span>
                <span className="text-sm text-muted-foreground">{progress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Link to="/admin/relatorios" className="flex-1">
              <Button type="button" variant="outline" className="w-full rounded-xl" disabled={saving}>Cancelar</Button>
            </Link>
            <Button type="submit" disabled={saving || !municipioId || !avaliacaoId} className="flex-1 rounded-xl">
              {saving ? 'Salvando...' : `Salvar ${items.length} relatório(s)`}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
