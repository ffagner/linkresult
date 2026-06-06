import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'

const COLLECTION = 'avaliacoes'

function fromFirestore(snapshot) {
  const data = snapshot.data()
  return { id: snapshot.id, nome: data.nome, ano: data.ano, createdAt: data.createdAt?.toDate()?.toISOString().split('T')[0] || '' }
}

export async function listar() {
  const q = query(collection(db, COLLECTION), orderBy('ano', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(fromFirestore)
}

export async function criar(data) {
  const ref = await addDoc(collection(db, COLLECTION), { ...data, createdAt: serverTimestamp() })
  return ref.id
}

export async function atualizar(id, data) {
  await updateDoc(doc(db, COLLECTION, id), data)
}

export async function excluir(id) {
  await deleteDoc(doc(db, COLLECTION, id))
}
