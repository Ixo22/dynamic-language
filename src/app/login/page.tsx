'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Mode = 'login' | 'signup'

export default function LoginPage() {
  const router   = useRouter()
  const [mode, setMode]       = useState<Mode>('login')
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
      }
      router.push('/lesson')
      router.refresh()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error desconocido'
      setError(
        msg.includes('Invalid login') ? 'Email o contraseña incorrectos' :
        msg.includes('already registered') ? 'Este email ya tiene cuenta, inicia sesión' :
        msg.includes('Password should') ? 'La contraseña debe tener al menos 6 caracteres' :
        msg
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', color: 'var(--text)',
    }}>
      {/* Ambient kanji */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none breathe" aria-hidden>
        <span className="jp font-black" style={{ fontSize: 'clamp(16rem, 60vw, 28rem)', color: 'var(--text)', opacity: 0.03, lineHeight: 1 }}>語</span>
      </div>

      <div className="relative w-full max-w-sm mx-auto px-5 fade-up">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-10">
          <div className="w-14 h-14 flex items-center justify-center jp font-black text-2xl select-none sway"
            style={{ background: 'var(--red)', color: '#f5ede0', borderRadius: 6 }}>語</div>
          <div className="text-center">
            <h1 className="jp font-bold text-xl leading-none" style={{ color: 'var(--text)' }}>動的言語</h1>
            <p className="text-[10px] tracking-[0.2em] uppercase mt-1" style={{ color: 'var(--muted)' }}>Japonés real para hispanohablantes</p>
          </div>
        </div>

        {/* Card */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
          {/* Mode toggle */}
          <div className="flex" style={{ borderBottom: '1px solid var(--border)' }}>
            {(['login', 'signup'] as Mode[]).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(null) }}
                className="flex-1 py-3.5 text-sm font-bold transition-all"
                style={{
                  color: mode === m ? 'var(--amber)' : 'var(--muted)',
                  background: mode === m ? 'rgba(196,125,23,0.06)' : 'transparent',
                  borderBottom: `2px solid ${mode === m ? 'var(--amber)' : 'transparent'}`,
                }}
              >
                {m === 'login' ? 'Entrar' : 'Crear cuenta'}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] tracking-[0.2em] uppercase font-semibold" style={{ color: 'var(--muted)' }}>
                Email
              </label>
              <input
                type="email" required autoComplete="email"
                value={email} onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full px-3 py-2.5 text-sm outline-none transition-colors"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 3, color: 'var(--text)' }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--amber)')}
                onBlur={e  => (e.currentTarget.style.borderColor = 'var(--border)')}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] tracking-[0.2em] uppercase font-semibold" style={{ color: 'var(--muted)' }}>
                Contraseña
              </label>
              <input
                type="password" required autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full px-3 py-2.5 text-sm outline-none transition-colors"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 3, color: 'var(--text)' }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--amber)')}
                onBlur={e  => (e.currentTarget.style.borderColor = 'var(--border)')}
              />
            </div>

            {error && (
              <p className="text-xs slide-down px-3 py-2.5" style={{ color: 'var(--red)', background: 'rgba(158,50,34,0.08)', border: '1px solid rgba(158,50,34,0.2)', borderRadius: 3 }}>
                {error}
              </p>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 text-sm font-bold transition-all mt-1"
              style={{
                background: loading ? 'var(--muted)' : 'var(--amber)',
                color: '#0d0b08',
                borderRadius: 3,
                opacity: loading ? 0.7 : 1,
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'var(--amber-l)' }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = 'var(--amber)' }}
            >
              {loading ? '...' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-[9px] tracking-[0.15em] uppercase" style={{ color: 'var(--muted)', opacity: 0.4 }}>
          © {new Date().getFullYear()} Dynamic Language
        </p>
      </div>
    </div>
  )
}
