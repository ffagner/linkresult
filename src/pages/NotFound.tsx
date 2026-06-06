import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '@/components/lr/Logo';
import { Button } from '@/components/ui/button';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col items-center justify-center p-6 text-center">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-blue-500 rounded-full blur-3xl" />
      </div>
      <div className="relative">
        <Logo size="md" />
        <div className="mt-12 mb-6">
          <div className="text-[8rem] font-display font-black text-white/10 leading-none select-none">404</div>
          <h1 className="text-2xl font-display font-bold text-white -mt-6 mb-3">Página não encontrada</h1>
          <p className="text-slate-400 max-w-sm">
            A página que você está procurando não existe ou foi movida.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/login">
            <Button variant="outline" className="rounded-xl gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20">
              <Home className="w-4 h-4" />
              Ir para o início
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}