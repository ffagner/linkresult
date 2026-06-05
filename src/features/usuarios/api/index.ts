import { collection, updateDoc, doc, getDocs, query, orderBy, Timestamp, deleteDoc } from 'firebase/firestore'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { db, auth } from '@/shared/lib/firebase'
import type { UserProfile } from '@/shared/types'

const COLLECTION = 'users'

function fromFirestore(doc: { id: string; data: () => Record<string, unknown> }): UserProfile {
  const data = doc.data()
  return {
    uid: doc.id,
    nome: data.nome as string,
    email: data.email as string,
    role: data.role as UserProfile['role'],
    municipioId: data.municipioId as string | null,
    createdAt: (data.createdAt as Timestamp).toDate(),
  }
}

export async function listarUsuarios(): Promise<UserProfile[]> {
  const q = query(collection(db, COLLECTION), orderBy('nome'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(fromFirestore)
}

export async function criarUsuario(data: { nome: string; email: string; senha: string; role: UserProfile['role']; municipioId: string | null }) {
  const credential = await createUserWithEmailAndPassword(auth, data.email, data.senha)
  const uid = credential.user.uid

  await updateDoc(doc(db, COLLECTION, uid), {
    nome: data.nome,
    email: data.email,
    role: data.role,
    municipioId: data.municipioId ?? null,
    createdAt: Timestamp.now(),
  })

  return uid
}

export async function atualizarUsuario(uid: string, data: { nome: string; email: string; role: UserProfile['role']; municipioId: string | null }) {
  await updateDoc(doc(db, COLLECTION, uid), data)
}

export async function excluirUsuario(uid: string) {
  await deleteDoc(doc(db, COLLECTION, uid))
}
