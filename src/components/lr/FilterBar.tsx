import React, { type ReactNode } from 'react';
import { X } from 'lucide-react';

interface FilterBarProps {
  /** Campos de busca e selects. Em mobile ocupam a largura total. */
  children: ReactNode
  /** Registros após os filtros. */
  resultCount?: number
  /** Total de registros carregados. */
  totalCount?: number
  /** Exibe o botão de limpar quando há algum filtro aplicado. */
  hasActiveFilters?: boolean
  onClear?: () => void
  /** Nome do que está sendo listado, no plural. Ex.: 'relatórios'. */
  itemLabel?: string
}

export default function FilterBar({
  children,
  resultCount,
  totalCount,
  hasActiveFilters = false,
  onClear,
  itemLabel = 'registros',
}: FilterBarProps) {
  const showCount = typeof resultCount === 'number';

  return (
    <div className="mb-4 space-y-2">
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
        {children}
      </div>

      {(showCount || hasActiveFilters) && (
        <div className="flex items-center justify-between gap-3 min-h-8">
          {showCount && (
            <p className="text-xs text-muted-foreground">
              {hasActiveFilters && typeof totalCount === 'number'
                ? `${resultCount} de ${totalCount} ${itemLabel}`
                : `${resultCount} ${itemLabel}`}
            </p>
          )}
          {hasActiveFilters && onClear && (
            <button
              type="button"
              onClick={onClear}
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors ml-auto"
            >
              <X className="w-3.5 h-3.5" />
              Limpar filtros
            </button>
          )}
        </div>
      )}
    </div>
  );
}
