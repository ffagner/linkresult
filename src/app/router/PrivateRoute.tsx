import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/app/providers/AuthProvider'
import type { Role } from '@/shared/types'

const roleHome: Record<Role, string> = {
  admin: '/admin',
  pedagogico: '/pedagogico',
  municipio: '/municipio',
}

interface PrivateRouteProps {
  allowedRoles: Role[]
  children: React.ReactNode
}

export function PrivateRoute({ allowedRoles, children }: PrivateRouteProps) {
  const { user, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!profile || !allowedRoles.includes(profile.role)) {
    return <Navigate to={profile ? roleHome[profile.role] : '/login'} replace />
  }

  return <>{children}</>
}
