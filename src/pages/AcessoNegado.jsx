import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '@/components/lr/Logo';
import { Button } from '@/components/ui/button';
import { ShieldX, ArrowLeft } from 'lucide-react';

export default function AcessoNegado() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 flex flex-col items-center justify-center p-6 text-center">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-red-500 rounded-full blur-3xl" />
      </div>
      <div className="relative">
        <Logo size="md" />
        <div className="mt-12 mb-6">
          <div className="w-24 h-24 rounded-3xl bg-red-500/20 flex items-center justify-center mx-auto mb-6">
            <ShieldX className="w-12 h-12 text-red-400" />
          </div>
          <h1 className="text-2xl font-display font-bold text-white mb-3">Acesso restrito</h1>
          <p className="text-slate-400 max-w-sm leading-relaxed">
            Você não tem permissão para acessar esta área. Entre em contato com o administrador caso precise de acesso.
          </p>
        </div>
        <Link to="/login">
          <Button variant="outline" className="rounded-xl gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20">
            <ArrowLeft className="w-4 h-4" />
            Voltar para o início
          </Button>
        </Link>
      </div>
    </div>
  );
}