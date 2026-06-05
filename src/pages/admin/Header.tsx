import { Link } from 'react-router-dom'
import { useAuth } from '@/app/providers/AuthProvider'
import { Icon } from '@/shared/ui/Icon'

export function Header() {
  const { profile } = useAuth()

  return (
    <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-border-technical bg-surface px-gutter shadow-sm">
      <div className="flex items-center gap-stack-md">
        <span className="text-headline-md font-bold text-primary">LinkResults</span>
      </div>

      <div className="flex items-center gap-gutter">
        <div className="hidden md:flex items-center gap-2 rounded-lg border border-border-technical bg-surface-container-low px-stack-md py-2">
          <Icon name="search" className="text-text-secondary" />
          <input
            className="w-64 bg-transparent text-body-sm text-text-primary focus:outline-none"
            placeholder="Buscar relatórios..."
            type="text"
          />
        </div>

        <div className="flex items-center gap-4">
          <Link to="/perfil" className="text-sm text-secondary hover:text-primary">
            {profile?.nome}
          </Link>
          <button className="relative rounded-full p-2 transition-colors hover:bg-surface-container-low">
            <Icon name="notifications" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-error" />
          </button>
          <button className="rounded-full p-2 transition-colors hover:bg-surface-container-low">
            <Icon name="settings" />
          </button>
        </div>
      </div>
    </header>
  )
}
