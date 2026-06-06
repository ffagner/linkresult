import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Monitor, AlertCircle, ShieldCheck } from 'lucide-react';
import Logo from '@/components/lr/Logo';
import { mockRelatorios, mockCurrentUser } from '@/lib/mockData';

export default function MunicipioReportViewer() {
  const { id } = useParams();
  const user = mockCurrentUser.municipio;
  const [loading, setLoading] = useState(true);
  const [relatorio, setRelatorio] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const found = mockRelatorios.find(r => r.id === id);
    const t = setTimeout(() => {
      if (found && found.liberado && found.municipioId === '1') {
        setRelatorio(found);
      } else {
        setError(true);
      }
      setLoading(false);
    }, 1200);
    return () => clearTimeout(t);
  }, [id]);

  return (
    <div className="flex flex-col h-screen bg-slate-900">
      <header className="flex items-center justify-between px-4 lg:px-6 h-14 bg-slate-800 border-b border-slate-700 flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/municipio" className="p-1.5 rounded-lg hover:bg-slate-700 transition-colors text-slate-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Logo size="sm" />
          {relatorio && (
            <div className="hidden sm:flex items-center gap-2 text-slate-300 text-sm">
              <span className="font-medium text-white">{relatorio.municipioNome}</span>
              <span className="text-slate-500">—</span>
              <span>{relatorio.avaliacaoNome}</span>
              <span className="text-slate-500">—</span>
              <span>{relatorio.serieNome}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-green-400" />
          <span className="text-xs text-green-400 hidden sm:block">Acesso seguro</span>
        </div>
      </header>

      <div className="flex-1 relative overflow-hidden">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900">
            <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-slate-400 text-sm">Carregando relatório...</p>
            <p className="text-slate-600 text-xs mt-1">Verificando acesso...</p>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Acesso não disponível</h3>
              <p className="text-slate-400 text-sm mb-6">Este relatório não está disponível ou ainda não foi liberado para o seu município.</p>
              <Link to="/municipio" className="text-primary hover:text-primary/80 text-sm underline">
                ← Voltar para meus relatórios
              </Link>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800">
            {/* Placeholder — would be a real iframe in production */}
            <div className="text-center">
              <div className="w-20 h-20 rounded-2xl bg-blue-600/20 flex items-center justify-center mx-auto mb-4">
                <Monitor className="w-10 h-10 text-blue-400" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Relatório Power BI</h3>
              <p className="text-slate-400 text-sm mb-1">{relatorio?.municipioNome}</p>
              <p className="text-slate-500 text-sm mb-1">{relatorio?.avaliacaoNome} — {relatorio?.serieNome}</p>
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-green-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                Link protegido — exibido apenas no iframe
              </div>
              <div className="mt-4 px-6 py-3 bg-blue-600/20 rounded-xl border border-blue-500/30">
                <p className="text-blue-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5" />
                  O relatório seria exibido aqui de forma integrada
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}