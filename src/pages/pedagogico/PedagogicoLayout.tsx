import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { useAuth } from '@/app/providers/AuthProvider'
import { auth } from '@/shared/lib/firebase'
import { Button } from '@/shared/ui/Button'

const links = [
  { to: '/pedagogico', label: 'Dashboard', icon: '📊' },
  { to: '/pedagogico/relatorios', label: 'Relatórios', icon: '📄' },
]

export function PedagogicoLayout() {
  const { profile } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await signOut(auth)
    navigate('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="flex h-full w-64 flex-col border-r border-gray-200 bg-white">
        <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-6">
          <span className="text-xl font-bold text-gray-900">LinkResults</span>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/pedagogico'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <span>{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
          <p className="text-sm text-gray-500">Pedagógico</p>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700">{profile?.nome}</span>
            <Button variant="secondary" onClick={handleLogout}>Sair</Button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
