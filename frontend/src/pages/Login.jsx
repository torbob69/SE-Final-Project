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
      <div className="hidden md:flex flex-col justify-between w-2/5 bg-[#1d1d1f] px-12 py-10">
        <div>
          <p className="text-white text-xl font-semibold">StockSync</p>
        </div>

        <div>
          <h2 className="text-white text-5xl font-bold leading-tight mb-5">
            Smart Inventory<br />Management.
          </h2>
          <p className="text-white/60 text-lg leading-relaxed max-w-xs">
            Scan barcodes, adjust stock, and manage your catalog — all from one place.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {[
            'Barcode scanning via camera',
            'Role-based access control',
            'Real-time stock tracking',
          ].map((f) => (
            <div key={f} className="flex items-center gap-3 text-white/50">
              <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              <span className="text-sm">{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 bg-surface-variant">
        {/* Mobile brand */}
        <div className="md:hidden mb-8 text-center">
          <h1 className="text-3xl font-bold text-on-background">StockSync</h1>
          <p className="text-on-surface-variant mt-1 text-sm">Inventory Management</p>
        </div>

        <div className="w-full max-w-sm bg-surface rounded-2xl shadow-sm px-8 py-10">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-on-background">Sign in</h1>
            <p className="text-on-surface-variant text-sm mt-1">to your StockSync account</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-on-surface">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-outline bg-surface text-on-surface
                  focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                  text-sm min-h-[48px] transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-on-surface">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-outline bg-surface text-on-surface
                  focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                  text-sm min-h-[48px] transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-on-primary text-sm font-medium
                py-3 rounded-full min-h-[48px] mt-2 hover:bg-[#0077ed] active:opacity-80
                transition-all disabled:opacity-50"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
