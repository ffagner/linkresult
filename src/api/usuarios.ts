import type { DocumentData, DocumentSnapshot } from 'firebase/firestore'
import { collection, updateDoc, deleteDoc, doc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { db, auth } from '@/lib/firebase'

const COLLECTION = 'users'

export interface UsuarioData {
  uid: string
  nome: string
  email: string
  role: string
  municipioId: string | null
  municipioNome: string | null
  status: string
  createdAt: string
}

function fromFirestore(snapshot: DocumentSnapshot<DocumentData>): UsuarioData {
  const data = snapshot.data()!
  return {
    uid: snapshot.id, nome: data.nome, email: data.email,
    role: data.role, municipioId: data.municipioId || null,
    municipioNome: data.municipioNome || null, status: data.status || 'ativo',
    createdAt: data.createdAt?.toDate()?.toISOString().split('T')[0] || '',
  }
}

export async function listar(): Promise<UsuarioData[]> {
  const q = query(collection(db, COLLECTION), orderBy('nome'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(fromFirestore)
}

export async function criar(data: { nome: string; email: string; senha: string; role: string; municipioId?: string | null; municipioNome?: string | null }): Promise<string> {
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

export async function atualizar(uid: string, data: Partial<UsuarioData>): Promise<void> {
  await updateDoc(doc(db, COLLECTION, uid), data)
}

export async function excluir(uid: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, uid))
}
