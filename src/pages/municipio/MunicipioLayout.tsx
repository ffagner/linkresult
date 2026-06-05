import { Outlet, useNavigate, Link } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { useAuth } from '@/app/providers/AuthProvider'
import { auth } from '@/shared/lib/firebase'
import { Icon } from '@/shared/ui/Icon'

export function MunicipioLayout() {
  const { profile } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await signOut(auth)
    navigate('/login')
  }

  return (
    <div>
      <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-border-technical bg-surface px-gutter shadow-sm">
        <div className="flex items-center gap-stack-md">
          <span className="text-headline-md font-bold text-primary">LinkResults</span>
          <span className="hidden text-body-sm text-text-secondary md:inline">| Meus Relatórios</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Icon name="location_city" className="text-text-secondary" />
            <span className="text-body-sm text-text-secondary">{profile?.municipioId || 'Município'}</span>
          </div>
          <Link to="/perfil" className="text-body-sm text-secondary hover:text-primary">{profile?.nome}</Link>
          <button
            onClick={handleLogout}
            className="rounded-full p-2 transition-colors hover:bg-surface-container-low"
          >
            <Icon name="logout" className="text-error" />
          </button>
        </div>
      </header>
      <main className="min-h-[calc(100vh-64px)] bg-background p-gutter">
        <div className="mx-auto" style={{ maxWidth: 'var(--spacing-container-max)' }}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
