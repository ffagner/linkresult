import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Monitor, AlertCircle } from 'lucide-react';
import Logo from '@/components/lr/Logo';
import StatusBadge from '@/components/lr/StatusBadge';
import { mockRelatorios, mockCurrentUser } from '@/lib/mockData';

export default function AdminReportViewer() {
  const { id } = useParams();
  const user = mockCurrentUser.admin;
  const [loading, setLoading] = useState(true);

  const relatorio = mockRelatorios.find(r => r.id === id) || mockRelatorios[0];

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-slate-900">
      {/* Header */}
      <header className="flex items-center justify-between px-4 lg:px-6 h-14 bg-slate-800 border-b border-slate-700 flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/admin/relatorios" className="p-1.5 rounded-lg hover:bg-slate-700 transition-colors text-slate-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Logo size="sm" />
          <div className="hidden sm:flex items-center gap-2 text-slate-300 text-sm">
            <span className="font-medium">{relatorio?.municipioNome}</span>
            <span className="text-slate-500">—</span>
            <span>{relatorio?.avaliacaoNome}</span>
            <span className="text-slate-500">—</span>
            <span>{relatorio?.serieNome}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={relatorio?.liberado ? 'liberado' : 'pendente'} />
        </div>
      </header>

      {/* Viewer */}
      <div className="flex-1 relative overflow-hidden">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900">
            <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-slate-400 text-sm">Carregando relatório...</p>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800">
            {/* Placeholder for iframe */}
            <div className="text-center">
              <div className="w-20 h-20 rounded-2xl bg-blue-600/20 flex items-center justify-center mx-auto mb-4">
                <Monitor className="w-10 h-10 text-blue-400" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Relatório Power BI</h3>
              <p className="text-slate-400 text-sm mb-1">{relatorio?.municipioNome} — {relatorio?.avaliacaoNome}</p>
              <p className="text-slate-500 text-sm">{relatorio?.serieNome}</p>
              <div className="mt-6 px-6 py-3 bg-blue-600/20 rounded-xl border border-blue-500/30">
                <p className="text-blue-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5" />
                  O iframe do Power BI seria carregado aqui com o link descriptografado
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}