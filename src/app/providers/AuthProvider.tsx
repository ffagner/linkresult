import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import { auth, db } from '@/shared/lib/firebase'
import type { UserProfile, Role } from '@/shared/types'

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
})

export function useAuth() {
  return useContext(AuthContext)
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)

      if (!firebaseUser) {
        setProfile(null)
        setLoading(false)
        return
      }

      const userDocRef = doc(db, 'users', firebaseUser.uid)
      const unsubscribeSnapshot = onSnapshot(userDocRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data()
          setProfile({
            uid: snapshot.id,
            nome: data.nome,
            email: data.email,
            role: data.role as Role,
            municipioId: data.municipioId ?? null,
            createdAt: data.createdAt?.toDate() ?? new Date(),
          })
        } else {
          setProfile(null)
        }
        setLoading(false)
      })

      return () => {
        unsubscribeSnapshot()
      }
    })

    return () => {
      unsubscribeAuth()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
