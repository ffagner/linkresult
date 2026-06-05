import { NavLink, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '@/shared/lib/firebase'
import { Icon } from '@/shared/ui/Icon'

const links = [
  { to: '/admin', label: 'Dashboard', icon: 'dashboard' },
  { to: '/admin/municipios', label: 'Municípios', icon: 'location_city' },
  { to: '/admin/avaliacoes', label: 'Avaliações', icon: 'assignment' },
  { to: '/admin/series', label: 'Séries', icon: 'layers' },
  { to: '/admin/relatorios', label: 'Relatórios', icon: 'analytics' },
  { to: '/admin/usuarios', label: 'Usuários', icon: 'group' },
]

export function Sidebar() {
  const navigate = useNavigate()

  async function handleLogout() {
    await signOut(auth)
    navigate('/login')
  }

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-64px)] w-64 flex-col border-r border-border-technical bg-surface hidden md:flex z-40">
      <div className="px-6 mb-stack-lg mt-stack-lg">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-container">
            <Icon name="dashboard" fill className="text-on-primary-container" />
          </div>
          <div>
            <h3 className="text-label-md font-semibold text-primary">Gestão Educacional</h3>
            <p className="text-body-sm text-text-secondary">LinkResults Admin</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/admin'}
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
        <a className="flex items-center gap-3 px-6 py-3 text-text-secondary hover:bg-surface-container-low hover:text-primary transition-all rounded-lg cursor-pointer">
          <Icon name="help" />
          <span className="text-label-md">Suporte</span>
        </a>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-6 py-3 text-error hover:bg-error/10 transition-all rounded-lg"
        >
          <Icon name="logout" />
          <span className="text-label-md">Sair</span>
        </button>
      </div>
    </aside>
  )
}
