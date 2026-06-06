import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, AlertCircle, ShieldCheck } from 'lucide-react';
import Logo from '@/components/lr/Logo';
import LoadingSpinner from '@/components/lr/LoadingSpinner';
import { buscar as buscarRelatorio } from '@/api/relatorios';
import type { RelatorioData } from '@/api/relatorios';
import { decryptLink } from '@/lib/crypto';
import { useAuth } from '@/lib/AuthContext';

export default function MunicipioReportViewer() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [relatorio, setRelatorio] = useState<RelatorioData | null>(null);
  const [decryptedLink, setDecryptedLink] = useState<string>('');
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await buscarRelatorio(id);
        if (!data || data.municipioId !== profile?.municipioId || !data.liberado) {
          setError(true);
          setLoading(false);
          return;
        }
        setRelatorio(data);
        const link = await decryptLink(data.linkEncriptado);
        setDecryptedLink(link);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    if (profile?.municipioId) load();
  }, [id, profile]);

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
            <LoadingSpinner size="lg" text="Carregando relatório..." />
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
          <iframe
            src={decryptedLink}
            className="absolute inset-0 w-full h-full border-0"
            title="Relatório Power BI"
            allowFullScreen
          />
        )}
      </div>
    </div>
  );
}
