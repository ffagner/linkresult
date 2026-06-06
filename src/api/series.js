import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'

const COLLECTION = 'series'

function fromFirestore(snapshot) {
  const data = snapshot.data()
  return { id: snapshot.id, nome: data.nome, ordem: data.ordem }
}

export async function listar() {
  const q = query(collection(db, COLLECTION), orderBy('ordem'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(fromFirestore)
}

export async function criar(data) {
  const ref = await addDoc(collection(db, COLLECTION), data)
  return ref.id
}

export async function atualizar(id, data) {
  await updateDoc(doc(db, COLLECTION, id), data)
}

export async function excluir(id) {
  await deleteDoc(doc(db, COLLECTION, id))
}
