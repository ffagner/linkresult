export type Role = 'admin' | 'pedagogico' | 'municipio'

export interface UserProfile {
  uid: string
  nome: string
  email: string
  role: Role
  municipioId: string | null
  createdAt: Date
}

export interface Municipio {
  id: string
  nome: string
  estado: string
  createdAt: Date
}

export interface Avaliacao {
  id: string
  nome: string
  ano: number
  createdAt: Date
}

export interface Serie {
  id: string
  nome: string
  ordem: number
}

export interface Relatorio {
  id: string
  municipioId: string
  avaliacaoId: string
  serieId: string
  linkEncriptado: string
  liberado: boolean
  liberadoEm: Date | null
  liberadoPor: string | null
  createdAt: Date
  updatedAt: Date
}

export interface RelatorioInput {
  municipioId: string
  avaliacaoId: string
  serieId: string
  linkEncriptado: string
}

export interface RelatorioLoteInput {
  municipioId: string
  avaliacaoId: string
  itens: { serieId: string; linkEncriptado: string }[]
}
