import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { useAuth } from '@/app/providers/AuthProvider'
import { auth } from '@/shared/lib/firebase'
import { Button } from '@/shared/ui/Button'
import { Icon } from '@/shared/ui/Icon'

const links = [
  { to: '/pedagogico', label: 'Dashboard', icon: 'dashboard' },
  { to: '/pedagogico/relatorios', label: 'Relatórios', icon: 'analytics' },
]

export function PedagogicoLayout() {
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
        </div>
        <div className="flex items-center gap-4">
          <Link to="/perfil" className="text-body-sm text-secondary hover:text-primary">{profile?.nome}</Link>
          <Button variant="secondary" onClick={handleLogout}>Sair</Button>
        </div>
      </header>
      <div className="flex min-h-[calc(100vh-64px)]">
        <aside className="fixed left-0 top-16 h-[calc(100vh-64px)] w-64 flex-col border-r border-border-technical bg-surface hidden md:flex z-40">
          <div className="px-6 mb-stack-lg mt-stack-lg">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-container">
                <Icon name="school" fill className="text-on-primary-container" />
              </div>
              <div>
                <h3 className="text-label-md font-semibold text-primary">Pedagógico</h3>
                <p className="text-body-sm text-text-secondary">LinkResults</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 space-y-1">
            {links.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/pedagogico'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-6 py-3 mx-2 rounded-lg transition-all ${
                    isActive
                      ? 'bg-primary-container text-on-primary-container'
                      : 'text-text-secondary hover:bg-surface-container-low hover:text-primary'
                  }`
                }
              >
                <Icon name={link.icon} fill />
                <span className="text-label-md">{link.label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="mt-auto border-t border-border-technical px-2 pt-4 space-y-1 pb-6">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-6 py-3 text-error hover:bg-error/10 transition-all rounded-lg"
            >
              <Icon name="logout" />
              <span className="text-label-md">Sair</span>
            </button>
          </div>
        </aside>
        <main className="flex-1 md:ml-64 p-gutter mx-auto w-full" style={{ maxWidth: 'var(--spacing-container-max)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
