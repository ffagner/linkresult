import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function formatarData(d: Date | null | undefined): string {
  if (!d) return '—'
  return format(d, 'dd/MM/yyyy', { locale: ptBR })
}

export function formatarDataHora(d: Date | null | undefined): string {
  if (!d) return '—'
  return format(d, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
}

/**
 * Converte o valor de um <input type="date"> (YYYY-MM-DD) para Date local.
 * `new Date('2025-03-15')` seria interpretado como UTC — no Brasil (UTC-3)
 * isso vira 14/03 às 21h. Este parser evita o off-by-one.
 */
export function parseDataInput(valor: string): Date | null {
  if (!valor) return null
  const [ano, mes, dia] = valor.split('-').map(Number)
  if (!ano || !mes || !dia) return null
  return new Date(ano, mes - 1, dia)
}

/** Formata uma Date para o valor esperado por <input type="date"> (YYYY-MM-DD), em horário local. */
export function paraDataInput(d: Date | null | undefined): string {
  if (!d) return ''
  const ano = d.getFullYear()
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}
