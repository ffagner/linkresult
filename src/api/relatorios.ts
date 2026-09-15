import type { DocumentData, DocumentSnapshot } from 'firebase/firestore'
import {
  collection, addDoc, updateDoc, deleteDoc, doc, getDocs, getDoc, query, where, orderBy,
  serverTimestamp, writeBatch, arrayUnion, Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

const COLLECTION = 'relatorios'

export type HistoricoAcao = 'liberado' | 'revogado' | 'data_ajustada'

export interface HistoricoItemData {
  acao: HistoricoAcao
  em: Date
  por: string
  porNome: string
  dataAnterior?: Date | null
  dataNova?: Date | null
}

interface HistoricoItemFirestore {
  acao: HistoricoAcao
  em: Timestamp
  por: string
  porNome: string
  dataAnterior?: Timestamp | null
  dataNova?: Timestamp | null
}

export interface RelatorioData {
  id: string
  municipioId: string
  municipioNome: string
  avaliacaoId: string
  avaliacaoNome: string
  serieId: string
  serieNome: string
  linkEncriptado: string
  liberado: boolean
  liberadoEm: Date | null
  liberadoPor: string | null
  /** Data em que o relatório foi entregue pela 1ª vez — nunca é apagada ao revogar. */
  entregueEm: Date | null
  entreguePor: string | null
  entreguePorNome: string | null
  historico: HistoricoItemData[]
  createdAt: Date | null
}

export interface RelatorioInput {
  linkEncriptado: string
  serieId: string
  serieNome?: string
  municipioId: string
  municipioNome?: string
  avaliacaoId: string
  avaliacaoNome?: string
}

export interface CriarEmLoteInput {
  municipioId: string
  municipioNome?: string
  avaliacaoId: string
  avaliacaoNome?: string
  itens: Array<{ serieId: string; linkEncriptado: string; serieNome?: string }>
}

function fromFirestore(snapshot: DocumentSnapshot<DocumentData>): RelatorioData {
  const data = snapshot.data()!
  const historicoRaw = (data.historico as HistoricoItemFirestore[] | undefined) || []

  return {
    id: snapshot.id,
    municipioId: data.municipioId, municipioNome: data.municipioNome || '',
    avaliacaoId: data.avaliacaoId, avaliacaoNome: data.avaliacaoNome || '',
    serieId: data.serieId, serieNome: data.serieNome || '',
    linkEncriptado: data.linkEncriptado || '',
    liberado: data.liberado || false,
    liberadoEm: data.liberadoEm?.toDate() || null,
    liberadoPor: data.liberadoPor || null,
    // Relatórios liberados antes desta feature não têm entregueEm — a data de
    // liberação já registrada vira a data de entrega retroativamente.
    entregueEm: (data.entregueEm ?? data.liberadoEm)?.toDate() || null,
    entreguePor: data.entreguePor ?? data.liberadoPor ?? null,
    entreguePorNome: data.entreguePorNome || null,
    historico: historicoRaw.map(h => ({
      acao: h.acao,
      em: h.em?.toDate() || null,
      por: h.por,
      porNome: h.porNome,
      dataAnterior: h.dataAnterior?.toDate() || null,
      dataNova: h.dataNova?.toDate() || null,
    })) as HistoricoItemData[],
    createdAt: data.createdAt?.toDate() || null,
  }
}

export async function listar(): Promise<RelatorioData[]> {
  const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(fromFirestore)
}

export async function buscar(id: string): Promise<RelatorioData | null> {
  const snapshot = await getDoc(doc(db, COLLECTION, id))
  if (!snapshot.exists()) return null
  return fromFirestore(snapshot)
}

export async function listarPorMunicipio(municipioId: string): Promise<RelatorioData[]> {
  const q = query(
    collection(db, COLLECTION),
    where('municipioId', '==', municipioId),
    where('liberado', '==', true),
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(fromFirestore)
}

export async function criar(data: RelatorioInput): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...data, liberado: false, liberadoEm: null, liberadoPor: null,
    entregueEm: null, entreguePor: null, entreguePorNome: null, historico: [],
    createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function criarEmLote(input: CriarEmLoteInput): Promise<void> {
  const batch = writeBatch(db)
  for (const item of input.itens) {
    const ref = doc(collection(db, COLLECTION))
    batch.set(ref, {
      municipioId: input.municipioId, municipioNome: input.municipioNome || '',
      avaliacaoId: input.avaliacaoId, avaliacaoNome: input.avaliacaoNome || '',
      serieId: item.serieId, serieNome: item.serieNome || '',
      linkEncriptado: item.linkEncriptado,
      liberado: false, liberadoEm: null, liberadoPor: null,
      entregueEm: null, entreguePor: null, entreguePorNome: null, historico: [],
      createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
    })
  }
  await batch.commit()
}

export async function atualizar(id: string, data: Partial<RelatorioData>): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), { ...data, updatedAt: serverTimestamp() })
}

export async function excluir(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id))
}

/**
 * Libera ou revoga o acesso de um relatório. Na 1ª liberação, grava a data de
 * entrega (entregueEm/entreguePor/entreguePorNome) — esses campos nunca são
 * apagados ou sobrescritos em liberações/revogações seguintes. Cada ação fica
 * registrada em `historico`.
 */
export async function liberar(id: string, uid: string, nome: string, valor: boolean): Promise<void> {
  const ref = doc(db, COLLECTION, id)
  const snapshot = await getDoc(ref)
  const atual = snapshot.data()
  const jaTemEntrega = !!(atual?.entregueEm || atual?.liberadoEm)

  const updateData: Record<string, unknown> = {
    liberado: valor,
    liberadoEm: valor ? serverTimestamp() : null,
    liberadoPor: valor ? uid : null,
    updatedAt: serverTimestamp(),
    // serverTimestamp() não é permitido dentro de arrays — usa-se Timestamp.now()
    // (relógio do cliente) só nas entradas de histórico, que são informativas.
    historico: arrayUnion({
      acao: valor ? 'liberado' : 'revogado',
      em: Timestamp.now(),
      por: uid,
      porNome: nome,
    }),
  }

  if (valor && !jaTemEntrega) {
    updateData.entregueEm = serverTimestamp()
    updateData.entreguePor = uid
    updateData.entreguePorNome = nome
  }

  await updateDoc(ref, updateData)
}

/** Corrige manualmente a data de entrega registrada (ex.: entrega feita em ofício antes do clique no sistema). */
export async function ajustarDataEntrega(id: string, novaData: Date, uid: string, nome: string): Promise<void> {
  const ref = doc(db, COLLECTION, id)
  const snapshot = await getDoc(ref)
  const atual = snapshot.data()
  const dataAnterior: Timestamp | null = atual?.entregueEm ?? atual?.liberadoEm ?? null
  const dataNova = Timestamp.fromDate(novaData)

  await updateDoc(ref, {
    entregueEm: dataNova,
    updatedAt: serverTimestamp(),
    historico: arrayUnion({
      acao: 'data_ajustada' as HistoricoAcao,
      em: Timestamp.now(),
      por: uid,
      porNome: nome,
      dataAnterior,
      dataNova,
    }),
  })
}
