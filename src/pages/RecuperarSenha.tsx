import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '@/shared/lib/firebase'
import { Button } from '@/shared/ui/Button'

export function RecuperarSenhaPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await sendPasswordResetEmail(auth, email)
      setSent(true)
    } catch {
      setError('Erro ao enviar email. Verifique o endereço.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-gutter">
      <div className="w-full max-w-sm rounded-xl bg-surface p-8 shadow-card">
        <div className="mb-8 text-center">
          <h1 className="text-headline-lg font-bold text-text-primary">Recuperar Senha</h1>
          <p className="mt-1 text-body-sm text-text-secondary">LinkResults — Tendência Consultoria Educacional</p>
        </div>

        {sent ? (
          <div className="text-center">
            <p className="mb-stack-md text-body-sm text-success">Email de recuperação enviado! Verifique sua caixa de entrada.</p>
            <Link to="/login">
              <Button>Voltar ao login</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-stack-md">
            <div>
              <label className="block text-label-sm font-medium text-text-secondary">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-border-technical bg-surface px-3 py-3 text-body-sm text-text-primary focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
                placeholder="seu@email.com"
              />
            </div>
            {error && <p className="text-body-sm text-error">{error}</p>}
            <Button type="submit" loading={loading} className="w-full">
              Enviar link de recuperação
            </Button>
            <p className="text-center text-body-sm">
              <Link to="/login" className="text-secondary hover:text-primary">Voltar ao login</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
