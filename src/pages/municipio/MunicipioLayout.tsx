import { Outlet, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { useAuth } from '@/app/providers/AuthProvider'
import { auth } from '@/shared/lib/firebase'
import { Button } from '@/shared/ui/Button'

export function MunicipioLayout() {
  const { profile } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await signOut(auth)
    navigate('/login')
  }

  return (
    <div className="flex h-screen flex-col">
      <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-gray-900">LinkResults</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-700">{profile?.nome}</span>
          <Button variant="secondary" onClick={handleLogout}>Sair</Button>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
        <Outlet />
      </main>
    </div>
  )
}
