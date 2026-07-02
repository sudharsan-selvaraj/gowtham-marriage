import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function LoginModal({ open, onClose }) {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | sending | sent | error
  const [msg, setMsg] = useState('')

  if (!open) return null

  const submit = async (e) => {
    e.preventDefault()
    setStatus('sending')
    const error = await signIn(email.trim())
    if (error) {
      setStatus('error')
      setMsg(error.message)
    } else {
      setStatus('sent')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="card w-full max-w-md shadow-pop animate-fade-up relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted hover:text-ink"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="mb-6">
          <h2 className="font-display text-2xl text-ink">Sign in</h2>
          <p className="text-muted text-sm mt-1.5">
            Anyone can browse. Sign in to add and edit — we'll email you a secure
            link, no password needed.
          </p>
        </div>

        {status === 'sent' ? (
          <div className="py-6 text-center">
            <p className="font-display text-lg text-ink">Check your inbox</p>
            <p className="text-muted text-sm mt-1.5">
              We sent a magic link to <span className="text-ink font-medium">{email}</span>.
              Open it to sign in.
            </p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input"
              />
            </div>
            {status === 'error' && <p className="text-sm text-accent">{msg}</p>}
            <button type="submit" disabled={status === 'sending'} className="btn-primary w-full">
              {status === 'sending' ? 'Sending…' : 'Send magic link'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
