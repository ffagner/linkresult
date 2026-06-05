import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { MobileNav } from './MobileNav'

export function AdminLayout() {
  return (
    <div>
      <Header />
      <div className="flex min-h-[calc(100vh-64px)]">
        <Sidebar />
        <main className="flex-1 md:ml-64 p-gutter mx-auto w-full" style={{ maxWidth: 'var(--spacing-container-max)' }}>
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
