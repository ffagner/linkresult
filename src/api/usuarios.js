import { collection, updateDoc, deleteDoc, doc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { db, auth } from '@/lib/firebase'

const COLLECTION = 'users'

function fromFirestore(snapshot) {
  const data = snapshot.data()
  return {
    uid: snapshot.id, nome: data.nome, email: data.email,
    role: data.role, municipioId: data.municipioId || null,
    municipioNome: data.municipioNome || null, status: data.status || 'ativo',
    createdAt: data.createdAt?.toDate()?.toISOString().split('T')[0] || '',
  }
}

export async function listar() {
  const q = query(collection(db, COLLECTION), orderBy('nome'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(fromFirestore)
}

export async function criar(data) {
  const credential = await createUserWithEmailAndPassword(auth, data.email, data.senha)
  const uid = credential.user.uid
  await updateDoc(doc(db, COLLECTION, uid), {
    nome: data.nome, email: data.email, role: data.role,
    municipioId: data.municipioId || null,
    municipioNome: data.municipioNome || null,
    status: 'ativo', createdAt: serverTimestamp(),
  })
  return uid
}

export async function atualizar(uid, data) {
  await updateDoc(doc(db, COLLECTION, uid), data)
}

export async function excluir(uid) {
  await deleteDoc(doc(db, COLLECTION, uid))
}
