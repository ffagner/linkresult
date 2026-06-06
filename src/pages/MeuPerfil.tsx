import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { User, Mail, Shield, Building2, Lock, Eye, EyeOff, CheckCircle2, ArrowLeft, LogOut } from 'lucide-react';
import AppLayout from '@/components/lr/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/AuthContext';
import StatusBadge from '@/components/lr/StatusBadge';

export default function MeuPerfil() {
  const [searchParams] = useSearchParams();
  const roleParam: string = searchParams.get('role') || 'admin';
  const { profile, logout } = useAuth();

  const [senhaAtual, setSenhaAtual] = useState<string>('');
  const [novaSenha, setNovaSenha] = useState<string>('');
  const [confirmarSenha, setConfirmarSenha] = useState<string>('');
  const [showSenhas, setShowSenhas] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  const handleAlterarSenha = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setSaving(true);
    // lógica a implementar: updatePassword
    await new Promise(r => setTimeout(r, 1200));
    setSaving(false);
    setSuccess(true);
    setSenhaAtual(''); setNovaSenha(''); setConfirmarSenha('');
    setTimeout(() => setSuccess(false), 3000);
  };

  const backHref = roleParam === 'admin' ? '/admin' : roleParam === 'pedagogico' ? '/pedagogico' : '/municipio';

  return (
    <AppLayout role={roleParam} userName={profile?.nome || 'Usuário'}>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link to={backHref} className="p-2 rounded-xl hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-display font-bold">Meu Perfil</h1>
        </div>

        {/* Profile card */}
        <div className="bg-card rounded-2xl border border-border p-6 mb-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold">{profile?.nome || 'Usuário'}</h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <StatusBadge status={profile?.role} />
                {profile?.municipioNome && (
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" />
                    {profile.municipioNome}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-5 pt-5 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="text-xs text-muted-foreground">E-mail</div>
                  <div className="text-sm font-medium">{profile?.email || ''}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="text-xs text-muted-foreground">Perfil de acesso</div>
                <div className="text-sm font-medium capitalize">
                  {profile?.role === 'pedagogico' ? 'Pedagógico' : profile?.role === 'municipio' ? 'Município' : 'Administrador'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Change password */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-display font-semibold text-lg mb-1 flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            Alterar senha
          </h3>
          <p className="text-muted-foreground text-sm mb-5">Escolha uma senha forte com pelo menos 8 caracteres.</p>

          {success && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 text-green-700 text-sm mb-5">
              <CheckCircle2 className="w-4 h-4" />
              Senha alterada com sucesso!
            </div>
          )}

          <form onSubmit={handleAlterarSenha} className="space-y-4">
            {[
              { id: 'atual', label: 'Senha atual', value: senhaAtual, set: setSenhaAtual },
              { id: 'nova', label: 'Nova senha', value: novaSenha, set: setNovaSenha },
              { id: 'confirmar', label: 'Confirmar nova senha', value: confirmarSenha, set: setConfirmarSenha },
            ].map(field => (
              <div key={field.id} className="space-y-1.5">
                <Label htmlFor={field.id}>{field.label}</Label>
                <div className="relative">
                  <Input
                    id={field.id}
                    type={showSenhas ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={field.value}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.set(e.target.value)}
                    className="h-10 rounded-xl pr-10"
                  />
                  <button type="button" onClick={() => setShowSenhas(!showSenhas)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showSenhas ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={saving} className="flex-1 rounded-xl">
                {saving ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Salvando...
                  </div>
                ) : 'Salvar nova senha'}
              </Button>
              <Button onClick={logout} variant="outline" className="rounded-xl flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                Sair
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}