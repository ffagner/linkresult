import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { onAuthStateChanged, signOut, type User } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'

export interface UserProfile {
  uid: string
  nome: string
  email: string
  role: string
  municipioId: string | null
  municipioNome: string | null
  status: string
  createdAt: Date | null
}

interface AuthContextValue {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  /** 'inativo' quando o próprio backend derrubou a sessão por status inativo. */
  authError: 'inativo' | null
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState<'inativo' | null>(null)
  // signOut(auth) reentra em onAuthStateChanged com firebaseUser=null antes do
  // fim desta função — sem essa ref, o "setAuthError(null)" do próprio ciclo
  // apagaria o motivo do logout forçado antes da tela de login conseguir lê-lo.
  const forcedLogoutReasonRef = useRef<'inativo' | null>(null)

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot()
        unsubscribeSnapshot = null
      }

      setUser(firebaseUser)

      if (!firebaseUser) {
        setProfile(null)
        setAuthError(forcedLogoutReasonRef.current)
        forcedLogoutReasonRef.current = null
        setLoading(false)
        return
      }

      // Novo ciclo de autenticação (novo login) — limpa erro de sessão anterior.
      setAuthError(null)

      const userDocRef = doc(db, 'users', firebaseUser.uid)
      unsubscribeSnapshot = onSnapshot(userDocRef, (snapshot) => {
        const data = snapshot.exists() ? snapshot.data() : null

        if (data && data.status === 'inativo') {
          // Conta desativada pelo admin — inclusive em tempo real, se o
          // usuário já estava com o app aberto. Derruba a sessão.
          forcedLogoutReasonRef.current = 'inativo'
          signOut(auth)
          return
        }

        setProfile(data ? {
          uid: snapshot.id,
          nome: data.nome,
          email: data.email,
          role: data.role,
          municipioId: data.municipioId || null,
          municipioNome: data.municipioNome || null,
          status: data.status || 'ativo',
          createdAt: data.createdAt?.toDate() || null,
        } : null)
        setLoading(false)
      })
    })

    return () => {
      unsubscribeAuth()
      if (unsubscribeSnapshot) unsubscribeSnapshot()
    }
  }, [])

  const logout = async () => {
    await signOut(auth)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, authError, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
