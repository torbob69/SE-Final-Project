import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { listProducts } from '../api/products'
import Layout from '../components/Layout'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listProducts().then(setProducts).finally(() => setLoading(false))
  }, [])

  const stats = {
    total: products.length,
    inStock: products.filter((p) => p.stock > 10).length,
    low: products.filter((p) => p.stock > 0 && p.stock <= 10).length,
    out: products.filter((p) => p.stock === 0).length,
  }

  const recentLow = products
    .filter((p) => p.stock <= 10)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 5)

  return (
    <Layout>
      <div className="px-4 md:px-8 pt-6 md:pt-8 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div>
            <p className="text-sm text-on-surface-variant">Welcome back,</p>
            <h1 className="text-2xl font-bold text-on-surface capitalize">{user?.role}</h1>
          </div>
          {/* Sign out visible on mobile (desktop uses sidebar) */}
          <button
            onClick={logout}
            className="md:hidden text-sm text-on-surface-variant border border-outline rounded-xl px-3 py-2 min-h-[48px]"
          >
            Sign out
          </button>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          <StatCard label="Total Products" value={loading ? '—' : stats.total}
            color="bg-primary-container text-on-primary-container"
            icon={<BoxIcon />} />
          <StatCard label="In Stock" value={loading ? '—' : stats.inStock}
            color="bg-success-container text-success"
            icon={<CheckIcon />} />
          <StatCard label="Low Stock" value={loading ? '—' : stats.low}
            color="bg-warning-container text-warning"
            icon={<WarnIcon />} />
          <StatCard label="Out of Stock" value={loading ? '—' : stats.out}
            color="bg-error-container text-error"
            icon={<ErrorIcon />} />
        </div>

        {/* Desktop: two-column, Mobile: stack */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Scan CTA */}
          <button
            onClick={() => navigate('/scan')}
            className="bg-primary text-on-primary rounded-2xl p-6 flex flex-col items-start gap-3
              active:scale-95 transition-transform shadow-lg shadow-primary/20 text-left"
          >
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
                <path d="M9.5 6.5v3h-3v-3h3M11 5H5v6h6V5zm-1.5 9.5v3h-3v-3h3M11 13H5v6h6v-6zm6.5-6.5v3h-3v-3h3M19 5h-6v6h6V5zm-6 8h1.5v1.5H13V13zm1.5 1.5H16V16h-1.5v-1.5zM16 13h1.5v1.5H16V13zm-3 3h1.5v1.5H13V16zm1.5 1.5H16V19h-1.5v-1.5zM16 16h1.5v1.5H16V16zm1.5-1.5H19V16h-1.5v-1.5zm0 3H19V19h-1.5v-1.5zM22 7h-2V4h-3V2h5v5zm0 15v-5h-2v3h-3v2h5zM2 22h5v-2H4v-3H2v5zM2 2v5h2V4h3V2H2z"/>
              </svg>
            </div>
            <div>
              <p className="text-lg font-bold">Scan Barcode</p>
              <p className="text-sm text-on-primary/70 mt-0.5">Open camera to scan a product</p>
            </div>
          </button>

          {/* Low / out alert list */}
          <div className="bg-surface border border-surface-variant rounded-2xl p-4">
            <h2 className="font-semibold text-on-surface mb-3 text-sm">Needs Attention</h2>
            {loading ? (
              <div className="flex justify-center py-6">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : recentLow.length === 0 ? (
              <p className="text-sm text-on-surface-variant text-center py-6">All products are well-stocked ✓</p>
            ) : (
              <div className="flex flex-col gap-2">
                {recentLow.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => navigate(`/product/${p.id}`, { state: { product: p } })}
                    className="flex items-center justify-between rounded-xl px-3 py-2 hover:bg-surface-variant active:bg-surface-variant transition-colors text-left"
                  >
                    <span className="text-sm text-on-surface truncate flex-1">{p.name}</span>
                    <span className={`text-xs font-bold ml-3 shrink-0 ${p.stock === 0 ? 'text-error' : 'text-warning'}`}>
                      {p.stock === 0 ? 'OUT' : `${p.stock} left`}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

function StatCard({ label, value, color, icon }) {
  return (
    <div className={`rounded-2xl p-4 ${color} flex items-center gap-3 md:flex-col md:items-start`}>
      <div className="opacity-70">{icon}</div>
      <div>
        <p className="text-2xl md:text-3xl font-bold leading-none">{value}</p>
        <p className="text-xs font-medium mt-1 leading-tight">{label}</p>
      </div>
    </div>
  )
}

const BoxIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M20 7H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm0 12H4V9h16v10zM12 3H8L6 7h12l-2-4z"/>
  </svg>
)
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
  </svg>
)
const WarnIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
  </svg>
)
const ErrorIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
  </svg>
)
