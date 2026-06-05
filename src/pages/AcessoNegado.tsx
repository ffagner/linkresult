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
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-gutter">
      <h1 className="text-6xl font-bold text-text-secondary">403</h1>
      <p className="mt-stack-md text-lg text-text-primary">Acesso Negado</p>
      <p className="mt-1 text-body-sm text-text-secondary">Você não tem permissão para acessar esta página.</p>
      <Link to={getHome(profile?.role)} className="mt-stack-lg">
        <Button>Voltar para minha área</Button>
      </Link>
    </div>
  )
}
