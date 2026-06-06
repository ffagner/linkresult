import type { DocumentData, DocumentSnapshot } from 'firebase/firestore'
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'

const COLLECTION = 'series'

export interface SerieData {
  id: string
  nome: string
  ordem: number
}

function fromFirestore(snapshot: DocumentSnapshot<DocumentData>): SerieData {
  const data = snapshot.data()!
  return { id: snapshot.id, nome: data.nome, ordem: data.ordem }
}

export async function listar(): Promise<SerieData[]> {
  const q = query(collection(db, COLLECTION), orderBy('ordem'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(fromFirestore)
}

export async function criar(data: { nome: string; ordem: number }): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), data)
  return ref.id
}

export async function atualizar(id: string, data: { nome: string; ordem: number }): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), data)
}

export async function excluir(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id))
}
