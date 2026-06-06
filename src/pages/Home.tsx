import { Navigate } from 'react-router-dom'
import { useAuth } from '@/lib/AuthContext'

const roleHome: Record<string, string> = {
  admin: '/admin',
  pedagogico: '/pedagogico',
  municipio: '/municipio',
}

export default function Home() {
  const { user, profile, loading } = useAuth()

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!user || !profile) return <Navigate to="/login" replace />
  return <Navigate to={roleHome[profile.role] || '/login'} replace />
}
