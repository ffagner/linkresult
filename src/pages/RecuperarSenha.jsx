import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, Send } from 'lucide-react';
import Logo from '@/components/lr/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function RecuperarSenha() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { setError('Digite seu e-mail.'); return; }
    setLoading(true);
    setError('');
    // lógica a implementar: sendPasswordResetEmail(auth, email)
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setSuccess(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 animate-fade-in">
          <div className="flex justify-center mb-8">
            <Logo size="lg" />
          </div>

          {success ? (
            <div className="text-center py-4 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-display font-bold mb-2">E-mail enviado!</h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Enviamos as instruções para <strong>{email}</strong>. Verifique sua caixa de entrada e a pasta de spam.
              </p>
              <Link to="/login">
                <Button variant="outline" className="w-full rounded-xl">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar ao login
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-display font-bold">Recuperar senha</h1>
                <p className="text-muted-foreground text-sm mt-1">
                  Digite seu e-mail e enviaremos um link para redefinir sua senha.
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm mb-5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">E-mail cadastrado</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com.br"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="h-11 rounded-xl"
                    disabled={loading}
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full h-11 rounded-xl font-semibold">
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Enviando...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      Enviar link de recuperação
                    </div>
                  )}
                </Button>

                <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-1">
                  <ArrowLeft className="w-4 h-4" />
                  Voltar ao login
                </Link>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}