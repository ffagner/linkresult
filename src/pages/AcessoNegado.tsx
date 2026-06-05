import { Link } from 'react-router-dom'
import { useAuth } from '@/app/providers/AuthProvider'
import { Button } from '@/shared/ui/Button'

function getHome(role: string | undefined) {
  if (!role) return '/login'
  return role === 'admin' ? '/admin' : role === 'pedagogico' ? '/pedagogico' : '/municipio'
}

export function AcessoNegadoPage() {
  const { profile } = useAuth()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <h1 className="text-6xl font-bold text-gray-300">403</h1>
      <p className="mt-4 text-lg text-gray-600">Acesso Negado</p>
      <p className="mt-1 text-sm text-gray-400">Você não tem permissão para acessar esta página.</p>
      <Link to={getHome(profile?.role)} className="mt-6">
        <Button>Voltar para minha área</Button>
      </Link>
    </div>
  )
}
