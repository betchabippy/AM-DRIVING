'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function SignUpPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSignUp = async () => {
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })
    setLoading(false)
    if (error) { setError(error.message); return }
    setSuccess(true)
  }

  if (success) return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-full bg-green-900/40 border border-green-700 flex items-center justify-center mx-auto mb-6">
          <span className="text-2xl">✓</span>
        </div>
        <h2 className="font-display text-3xl text-white mb-3">Check your email</h2>
        <p className="text-gray-500 text-sm leading-relaxed">
          We sent a confirmation link to <span className="text-gold-400">{email}</span>. Click it to activate your account.
        </p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#C9A84C' }}>
              <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="5" stroke="#0a0a0a" strokeWidth="1.5"/>
                <path d="M4 8 L8 5 L12 8" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-display text-2xl tracking-widest text-white">RALLY</span>
          </div>
          <h1 className="font-display text-4xl text-white mb-2">Join Rally</h1>
          <p className="text-gray-500 text-sm">Create your account and start driving</p>
        </div>

        <div className="space-y-3 mb-6">
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="input-dark"
          />
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="input-dark"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="input-dark"
          />
        </div>

        {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}

        <button
          onClick={handleSignUp}
          disabled={loading || !name || !email || !password}
          className="w-full btn-gold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-gold-400 hover:text-gold-200">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
