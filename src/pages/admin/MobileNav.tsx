import { NavLink } from 'react-router-dom'
import { Icon } from '@/shared/ui/Icon'

const links = [
  { to: '/admin', label: 'Home', icon: 'dashboard' },
  { to: '/admin/municipios', label: 'Cidades', icon: 'location_city' },
  { to: '/admin/avaliacoes', label: 'Avaliações', icon: 'assignment' },
  { to: '/admin/relatorios', label: 'Relatórios', icon: 'analytics' },
]

export function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 z-50 flex h-16 w-full items-center justify-around border-t border-border-technical bg-surface shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] md:hidden">
      {links.map(link => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.to === '/admin'}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 ${isActive ? 'text-primary' : 'text-text-secondary'}`
          }
        >
          <Icon name={link.icon} fill />
          <span className={`text-[10px] ${link.to === '/admin' ? 'font-bold' : ''}`}>{link.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
