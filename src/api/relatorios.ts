import type { DocumentData, DocumentSnapshot } from 'firebase/firestore'
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, getDoc, query, where, orderBy, serverTimestamp, writeBatch } from 'firebase/firestore'
import { db } from '@/lib/firebase'

const COLLECTION = 'relatorios'

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
  liberadoEm: string | null
  liberadoPor: string | null
  createdAt: string
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
  return {
    id: snapshot.id,
    municipioId: data.municipioId, municipioNome: data.municipioNome || '',
    avaliacaoId: data.avaliacaoId, avaliacaoNome: data.avaliacaoNome || '',
    serieId: data.serieId, serieNome: data.serieNome || '',
    linkEncriptado: data.linkEncriptado || '',
    liberado: data.liberado || false,
    liberadoEm: data.liberadoEm?.toDate()?.toISOString().split('T')[0] || null,
    liberadoPor: data.liberadoPor || null,
    createdAt: data.createdAt?.toDate()?.toISOString().split('T')[0] || '',
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

export async function liberar(id: string, uid: string, valor: boolean): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    liberado: valor,
    liberadoEm: valor ? serverTimestamp() : null,
    liberadoPor: valor ? uid : null,
    updatedAt: serverTimestamp(),
  })
}
