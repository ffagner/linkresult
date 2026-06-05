import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/shared/lib/firebase'
import { Button } from '@/shared/ui/Button'

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate('/', { replace: true })
    } catch {
      setError('Email ou senha inválidos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-gutter">
      <div className="w-full max-w-sm rounded-xl bg-surface p-8 shadow-card">
        <div className="mb-8 text-center">
          <h1 className="text-headline-lg font-bold text-text-primary">LinkResults</h1>
          <p className="mt-1 text-body-sm text-text-secondary">
            Tendência Consultoria Educacional
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-stack-md">
          <div>
            <label htmlFor="email" className="block text-label-sm font-medium text-text-secondary">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-border-technical bg-surface px-3 py-3 text-body-sm text-text-primary shadow-sm focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-label-sm font-medium text-text-secondary">
              Senha
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-border-technical bg-surface px-3 py-3 text-body-sm text-text-primary shadow-sm focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-body-sm text-error">{error}</p>
          )}

          <div className="text-right">
            <Link to="/recuperar-senha" className="text-body-sm text-secondary hover:text-primary">
              Esqueci minha senha
            </Link>
          </div>

          <Button type="submit" loading={loading} className="w-full">
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </div>
    </div>
  )
}
