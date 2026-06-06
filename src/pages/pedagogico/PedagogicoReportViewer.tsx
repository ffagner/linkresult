import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import Logo from '@/components/lr/Logo';
import StatusBadge from '@/components/lr/StatusBadge';
import LoadingSpinner from '@/components/lr/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { buscar as buscarRelatorio, liberar } from '@/api/relatorios';
import type { RelatorioData } from '@/api/relatorios';
import { decryptLink } from '@/lib/crypto';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function PedagogicoReportViewer() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState<boolean>(true);
  const [relatorio, setRelatorio] = useState<RelatorioData | null>(null);
  const [decryptedLink, setDecryptedLink] = useState<string>('');
  const [toggling, setToggling] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    async function load() {
      try {
        const data = await buscarRelatorio(id);
        if (!data) {
          setError('Relatório não encontrado');
          setLoading(false);
          return;
        }
        setRelatorio(data);
        const link = await decryptLink(data.linkEncriptado);
        setDecryptedLink(link);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleToggle = async (): Promise<void> => {
    setToggling(true);
    try {
      const novoValor = !relatorio.liberado;
      await liberar(id, profile.uid, novoValor);
      setRelatorio(prev => ({ ...prev, liberado: novoValor }));
      toast({ title: novoValor ? 'Relatório liberado' : 'Acesso revogado' });
    } catch (err) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900">
      <header className="flex items-center justify-between px-4 lg:px-6 h-14 bg-slate-800 border-b border-slate-700 flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/pedagogico/relatorios" className="p-1.5 rounded-lg hover:bg-slate-700 transition-colors text-slate-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Logo size="sm" />
          {relatorio && (
            <div className="hidden sm:flex items-center gap-2 text-slate-300 text-sm">
              <span className="font-medium">{relatorio.municipioNome}</span>
              <span className="text-slate-500">—</span>
              <span>{relatorio.avaliacaoNome}</span>
              <span className="text-slate-500">—</span>
              <span>{relatorio.serieNome}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          {relatorio && <StatusBadge status={relatorio.liberado ? 'liberado' : 'pendente'} />}
          {relatorio && (
            <Button
              onClick={handleToggle}
              disabled={toggling}
              size="sm"
              className={`rounded-lg gap-1.5 text-xs ${relatorio.liberado ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
            >
              {toggling ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : relatorio.liberado ? (
                <><XCircle className="w-3.5 h-3.5" />Revogar acesso</>
              ) : (
                <><CheckCircle2 className="w-3.5 h-3.5" />Liberar relatório</>
              )}
            </Button>
          )}
        </div>
      </header>

      <div className="flex-1 relative overflow-hidden">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900">
            <LoadingSpinner size="lg" text="Carregando relatório..." />
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Erro ao carregar</h3>
              <p className="text-slate-400 text-sm">{error}</p>
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
