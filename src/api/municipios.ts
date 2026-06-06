import type { DocumentData, DocumentSnapshot } from 'firebase/firestore'
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'

const COLLECTION = 'municipios'

export interface MunicipioData {
  id: string
  nome: string
  estado: string
  createdAt: string
}

function fromFirestore(snapshot: DocumentSnapshot<DocumentData>): MunicipioData {
  const data = snapshot.data()!
  return { id: snapshot.id, nome: data.nome, estado: data.estado, createdAt: data.createdAt?.toDate()?.toISOString().split('T')[0] || '' }
}

export async function listar(): Promise<MunicipioData[]> {
  const q = query(collection(db, COLLECTION), orderBy('nome'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(fromFirestore)
}

export async function criar(data: { nome: string; estado: string }): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), { ...data, createdAt: serverTimestamp() })
  return ref.id
}

export async function atualizar(id: string, data: { nome: string; estado: string }): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), data)
}

export async function excluir(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id))
}
