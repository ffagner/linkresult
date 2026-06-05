import { useNavigate, Link } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { useAuth } from '@/app/providers/AuthProvider'
import { auth } from '@/shared/lib/firebase'
import { Button } from '@/shared/ui/Button'

export function Header() {
  const { profile } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await signOut(auth)
    navigate('/login')
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div>
        <p className="text-sm text-gray-500">
          Admin
        </p>
      </div>
      <div className="flex items-center gap-4">
        <Link to="/perfil" className="text-sm text-blue-600 hover:text-blue-700">
          {profile?.nome}
        </Link>
        <Button variant="secondary" onClick={handleLogout}>
          Sair
        </Button>
      </div>
    </header>
  )
}
