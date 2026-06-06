import type { DocumentData, DocumentSnapshot } from 'firebase/firestore'
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'

const COLLECTION = 'avaliacoes'

export interface AvaliacaoData {
  id: string
  nome: string
  ano: number
  createdAt: string
}

function fromFirestore(snapshot: DocumentSnapshot<DocumentData>): AvaliacaoData {
  const data = snapshot.data()!
  return { id: snapshot.id, nome: data.nome, ano: data.ano, createdAt: data.createdAt?.toDate()?.toISOString().split('T')[0] || '' }
}

export async function listar(): Promise<AvaliacaoData[]> {
  const q = query(collection(db, COLLECTION), orderBy('ano', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(fromFirestore)
}

export async function criar(data: { nome: string; ano: number }): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), { ...data, createdAt: serverTimestamp() })
  return ref.id
}

export async function atualizar(id: string, data: { nome: string; ano: number }): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), data)
}

export async function excluir(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id))
}
