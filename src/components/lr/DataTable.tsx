import React, { type ReactNode } from 'react';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';
import { FileText } from 'lucide-react';

interface Column<T> {
  header: string
  key?: string
  render?: (row: T) => ReactNode
  className?: string
  cellClassName?: string
  /** Coluna de ações: no mobile vai para o rodapé do card, sem rótulo. */
  isActions?: boolean
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  emptyTitle?: string
  emptyDescription?: string
}

export default function DataTable<T extends Record<string, unknown>>({ columns, data, loading, emptyTitle = 'Nenhum registro encontrado', emptyDescription = 'Não há dados para exibir.' }: DataTableProps<T>) {
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

  const cell = (col: Column<T>, row: T): ReactNode =>
    col.render ? col.render(row) : (row[col.key] as ReactNode);

  const dataColumns = columns.filter(col => !col.isActions);
  const actionColumns = columns.filter(col => col.isActions);

  return (
    <>
      {/* Mobile: cards empilhados */}
      <div className="space-y-3 md:hidden">
        {data.map((row, ri) => (
          <div key={ri} className="bg-card rounded-2xl border border-border p-4">
            <div className="space-y-2.5">
              {dataColumns.map((col, ci) => (
                <div key={ci} className="flex items-start justify-between gap-3">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pt-0.5 flex-shrink-0">
                    {col.header}
                  </span>
                  <span className="text-sm text-right min-w-0 break-words">{cell(col, row)}</span>
                </div>
              ))}
            </div>
            {actionColumns.length > 0 && (
              <div className="flex flex-wrap items-center justify-end gap-2 mt-4 pt-3 border-t border-border">
                {actionColumns.map((col, ci) => (
                  <React.Fragment key={ci}>{cell(col, row)}</React.Fragment>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Desktop: tabela */}
      <div className="hidden md:block bg-card rounded-2xl border border-border overflow-hidden">
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
                      {cell(col, row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
