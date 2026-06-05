import { NavLink } from 'react-router-dom'

const links = [
  { to: '/admin', label: 'Dashboard', icon: '📊' },
  { to: '/admin/municipios', label: 'Municípios', icon: '🏛️' },
  { to: '/admin/avaliacoes', label: 'Avaliações', icon: '📝' },
  { to: '/admin/series', label: 'Séries', icon: '📚' },
  { to: '/admin/relatorios', label: 'Relatórios', icon: '📄' },
  { to: '/admin/usuarios', label: 'Usuários', icon: '👥' },
]

export function Sidebar() {
  return (
    <aside className="flex h-full w-64 flex-col border-r border-gray-200 bg-white">
      <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-6">
        <span className="text-xl font-bold text-gray-900">LinkResults</span>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/admin'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <span>{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
