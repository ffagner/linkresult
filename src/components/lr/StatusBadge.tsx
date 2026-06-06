import React from 'react';
import { CheckCircle2, Clock, XCircle, ShieldAlert } from 'lucide-react';

const variants = {
  liberado: {
    label: 'Liberado',
    icon: CheckCircle2,
    className: 'bg-green-50 text-green-700 border border-green-200',
  },
  pendente: {
    label: 'Pendente',
    icon: Clock,
    className: 'bg-amber-50 text-amber-700 border border-amber-200',
  },
  revogado: {
    label: 'Revogado',
    icon: XCircle,
    className: 'bg-red-50 text-red-700 border border-red-200',
  },
  inativo: {
    label: 'Inativo',
    icon: ShieldAlert,
    className: 'bg-slate-100 text-slate-500 border border-slate-200',
  },
  ativo: {
    label: 'Ativo',
    icon: CheckCircle2,
    className: 'bg-green-50 text-green-700 border border-green-200',
  },
  admin: {
    label: 'Admin',
    className: 'bg-purple-50 text-purple-700 border border-purple-200',
  },
  pedagogico: {
    label: 'Pedagógico',
    className: 'bg-blue-50 text-blue-700 border border-blue-200',
  },
  municipio: {
    label: 'Município',
    className: 'bg-cyan-50 text-cyan-700 border border-cyan-200',
  },
};

export default function StatusBadge({ status, className = '' }) {
  const v = variants[status] || variants.pendente;
  const Icon = v.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${v.className} ${className}`}>
      {Icon && <Icon className="w-3 h-3" />}
      {v.label}
    </span>
  );
}