import { Navigate } from 'react-router-dom'
import { useAuth } from '@/lib/AuthContext'

const roleHome = {
  admin: '/admin',
  pedagogico: '/pedagogico',
  municipio: '/municipio',
}

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (!profile) return <Navigate to="/login" replace />

  if (allowedRoles.length > 0 && !allowedRoles.includes(profile.role)) {
    return <Navigate to={roleHome[profile.role] || '/login'} replace />
  }

  return children
}
