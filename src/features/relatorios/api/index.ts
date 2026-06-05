import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, getDoc, query, where, orderBy, Timestamp, writeBatch } from 'firebase/firestore'
import { db } from '@/shared/lib/firebase'
import type { Relatorio, RelatorioInput, RelatorioLoteInput } from '@/shared/types'

const COLLECTION = 'relatorios'

function fromFirestore(doc: { id: string; data: () => Record<string, unknown> }): Relatorio {
  const data = doc.data()
  return {
    id: doc.id,
    municipioId: data.municipioId as string,
    avaliacaoId: data.avaliacaoId as string,
    serieId: data.serieId as string,
    linkEncriptado: data.linkEncriptado as string,
    liberado: data.liberado as boolean,
    liberadoEm: data.liberadoEm ? (data.liberadoEm as Timestamp).toDate() : null,
    liberadoPor: data.liberadoPor as string | null,
    createdAt: (data.createdAt as Timestamp).toDate(),
    updatedAt: (data.updatedAt as Timestamp).toDate(),
  }
}

export async function listarRelatorios(): Promise<Relatorio[]> {
  const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(fromFirestore)
}

export async function listarRelatoriosPorMunicipio(municipioId: string): Promise<Relatorio[]> {
  const q = query(
    collection(db, COLLECTION),
    where('municipioId', '==', municipioId),
    where('liberado', '==', true),
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(fromFirestore)
}

export async function buscarRelatorio(id: string): Promise<Relatorio | null> {
  const snapshot = await getDoc(doc(db, COLLECTION, id))
  if (!snapshot.exists()) return null
  return fromFirestore({ id: snapshot.id, data: () => snapshot.data() })
}

export async function criarRelatorio(data: RelatorioInput) {
  const now = Timestamp.now()
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    liberado: false,
    liberadoEm: null,
    liberadoPor: null,
    createdAt: now,
    updatedAt: now,
  })
  return docRef.id
}

export async function criarRelatoriosEmLote(input: RelatorioLoteInput) {
  const now = Timestamp.now()
  const batch = writeBatch(db)

  for (const item of input.itens) {
    const ref = doc(collection(db, COLLECTION))
    batch.set(ref, {
      municipioId: input.municipioId,
      avaliacaoId: input.avaliacaoId,
      serieId: item.serieId,
      linkEncriptado: item.linkEncriptado,
      liberado: false,
      liberadoEm: null,
      liberadoPor: null,
      createdAt: now,
      updatedAt: now,
    })
  }

  await batch.commit()
}

export async function atualizarRelatorio(id: string, data: Partial<RelatorioInput>) {
  await updateDoc(doc(db, COLLECTION, id), { ...data, updatedAt: Timestamp.now() })
}

export async function excluirRelatorio(id: string) {
  await deleteDoc(doc(db, COLLECTION, id))
}

export async function liberarRelatorio(id: string, uid: string, liberado: boolean) {
  await updateDoc(doc(db, COLLECTION, id), {
    liberado,
    liberadoEm: liberado ? Timestamp.now() : null,
    liberadoPor: liberado ? uid : null,
    updatedAt: Timestamp.now(),
  })
}
