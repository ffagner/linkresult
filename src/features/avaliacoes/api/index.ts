import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy, Timestamp } from 'firebase/firestore'
import { db } from '@/shared/lib/firebase'
import type { Avaliacao } from '@/shared/types'

const COLLECTION = 'avaliacoes'

function fromFirestore(doc: { id: string; data: () => Record<string, unknown> }): Avaliacao {
  const data = doc.data()
  return {
    id: doc.id,
    nome: data.nome as string,
    ano: data.ano as number,
    createdAt: (data.createdAt as Timestamp).toDate(),
  }
}

export async function listarAvaliacoes(): Promise<Avaliacao[]> {
  const q = query(collection(db, COLLECTION), orderBy('ano', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(fromFirestore)
}

export async function criarAvaliacao(data: { nome: string; ano: number }) {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: Timestamp.now(),
  })
  return docRef.id
}

export async function atualizarAvaliacao(id: string, data: { nome: string; ano: number }) {
  await updateDoc(doc(db, COLLECTION, id), data)
}

export async function excluirAvaliacao(id: string) {
  await deleteDoc(doc(db, COLLECTION, id))
}
