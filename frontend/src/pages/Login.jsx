import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard', { replace: true })
    } catch {
      showToast('Invalid email or password', 'error')
      setPassword('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Desktop hero panel */}
      <div className="hidden md:flex flex-col justify-between w-2/5 bg-primary px-12 py-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6">
              <path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
            </svg>
          </div>
          <span className="text-white font-bold text-xl">StockSync</span>
        </div>

        <div>
          <h2 className="text-white text-4xl font-bold leading-tight mb-4">
            Smart Inventory<br />Management
          </h2>
          <p className="text-white/70 text-lg leading-relaxed">
            Scan barcodes, adjust stock, and manage your catalog — all from one place.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {[
            { icon: '⚡', text: 'Barcode scanning via camera' },
            { icon: '🔒', text: 'Role-based access control' },
            { icon: '📊', text: 'Real-time stock tracking' },
          ].map((f) => (
            <div key={f.text} className="flex items-center gap-3 text-white/80">
              <span className="text-xl">{f.icon}</span>
              <span className="text-sm">{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 bg-background">
        {/* Mobile logo */}
        <div className="md:hidden mb-10 text-center">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg viewBox="0 0 24 24" fill="white" className="w-8 h-8">
              <path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-on-background">StockSync</h1>
          <p className="text-on-surface-variant mt-1 text-sm">Inventory Management</p>
        </div>

        <div className="w-full max-w-sm">
          <div className="hidden md:block mb-8">
            <h1 className="text-2xl font-bold text-on-background">Welcome back</h1>
            <p className="text-on-surface-variant mt-1">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-on-surface-variant">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-outline bg-surface text-on-surface
                  focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-base min-h-[48px]"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-on-surface-variant">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-outline bg-surface text-on-surface
                  focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-base min-h-[48px]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-on-primary font-semibold py-3 rounded-xl
                min-h-[48px] mt-2 active:scale-95 transition-transform disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
