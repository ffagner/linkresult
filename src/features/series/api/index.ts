import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '@/shared/lib/firebase'
import type { Serie } from '@/shared/types'

const COLLECTION = 'series'

function fromFirestore(doc: { id: string; data: () => Record<string, unknown> }): Serie {
  const data = doc.data()
  return {
    id: doc.id,
    nome: data.nome as string,
    ordem: data.ordem as number,
  }
}

export async function listarSeries(): Promise<Serie[]> {
  const q = query(collection(db, COLLECTION), orderBy('ordem'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(fromFirestore)
}

export async function criarSerie(data: { nome: string; ordem: number }) {
  const docRef = await addDoc(collection(db, COLLECTION), data)
  return docRef.id
}

export async function atualizarSerie(id: string, data: { nome: string; ordem: number }) {
  await updateDoc(doc(db, COLLECTION, id), data)
}

export async function excluirSerie(id: string) {
  await deleteDoc(doc(db, COLLECTION, id))
}
