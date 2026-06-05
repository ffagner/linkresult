import { Navigate } from 'react-router-dom'
import { useAuth } from '@/app/providers/AuthProvider'
import { Spinner } from '@/shared/ui/Spinner'

const roleHome: Record<string, string> = {
  admin: '/admin',
  pedagogico: '/pedagogico',
  municipio: '/municipio',
}

export function HomePage() {
  const { user, profile, loading } = useAuth()

  if (loading) return <Spinner />

  if (!user) return <Navigate to="/login" replace />

  if (profile) return <Navigate to={roleHome[profile.role]} replace />

  return <Navigate to="/login" replace />
}
