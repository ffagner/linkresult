import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';
import { FileText } from 'lucide-react';

export default function DataTable({ columns, data, loading, emptyTitle = 'Nenhum registro encontrado', emptyDescription = 'Não há dados para exibir.' }) {
  if (loading) return <LoadingSpinner text="Carregando dados..." />;

  if (!data || data.length === 0) {
    return (
      <div className="bg-card rounded-2xl border border-border">
        <EmptyState
          icon={FileText}
          title={emptyTitle}
          description={emptyDescription}
        />
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              {columns.map((col, i) => (
                <th key={i} className={`px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, ri) => (
              <tr key={ri} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                {columns.map((col, ci) => (
                  <td key={ci} className={`px-4 py-3.5 text-sm ${col.cellClassName || ''}`}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}