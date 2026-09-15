import React from 'react';
import { CheckCircle2, Clock, XCircle, ShieldAlert, type LucideIcon } from 'lucide-react';

interface Variant {
  label: string
  icon?: LucideIcon
  className: string
}

const variants: Record<string, Variant> = {
  liberado: {
    label: 'Liberado',
    icon: CheckCircle2,
    className: 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20',
  },
  pendente: {
    label: 'Pendente',
    icon: Clock,
    className: 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
  },
  revogado: {
    label: 'Revogado',
    icon: XCircle,
    className: 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20',
  },
  inativo: {
    label: 'Inativo',
    icon: ShieldAlert,
    className: 'bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20',
  },
  ativo: {
    label: 'Ativo',
    icon: CheckCircle2,
    className: 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20',
  },
  admin: {
    label: 'Admin',
    className: 'bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20',
  },
  pedagogico: {
    label: 'Pedagógico',
    className: 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
  },
  municipio: {
    label: 'Município',
    className: 'bg-cyan-50 text-cyan-700 border border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/20',
  },
};

interface StatusBadgeProps {
  status: string
  className?: string
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const v = variants[status] || variants.pendente;
  const Icon = v.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${v.className} ${className}`}>
      {Icon && <Icon className="w-3 h-3" />}
      {v.label}
    </span>
  );
}