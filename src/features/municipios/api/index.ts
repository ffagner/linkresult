import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy, Timestamp } from 'firebase/firestore'
import { db } from '@/shared/lib/firebase'
import type { Municipio } from '@/shared/types'

const COLLECTION = 'municipios'

function fromFirestore(doc: { id: string; data: () => Record<string, unknown> }): Municipio {
  const data = doc.data()
  return {
    id: doc.id,
    nome: data.nome as string,
    estado: data.estado as string,
    createdAt: (data.createdAt as Timestamp).toDate(),
  }
}

export async function listarMunicipios(): Promise<Municipio[]> {
  const q = query(collection(db, COLLECTION), orderBy('nome'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(fromFirestore)
}

export async function criarMunicipio(data: { nome: string; estado: string }) {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: Timestamp.now(),
  })
  return docRef.id
}

export async function atualizarMunicipio(id: string, data: { nome: string; estado: string }) {
  await updateDoc(doc(db, COLLECTION, id), data)
}

export async function excluirMunicipio(id: string) {
  await deleteDoc(doc(db, COLLECTION, id))
}
