import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { listProducts } from '../api/products'
import Layout from '../components/Layout'
import { Package, Check, AlertTriangle, AlertCircle, ScanLine } from 'lucide-react'

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
            <h1 className="text-2xl font-bold text-on-surface capitalize mt-0.5">{user?.role}</h1>
          </div>
          <button
            onClick={logout}
            className="md:hidden text-sm font-medium text-on-surface-variant
              bg-surface-variant hover:bg-outline/40 rounded-xl px-4 py-2 min-h-[48px] transition-colors"
          >
            Sign out
          </button>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          <StatCard label="Total" value={loading ? '—' : stats.total}
            icon={<Package className="w-5 h-5" />} iconColor="text-primary" />
          <StatCard label="In Stock" value={loading ? '—' : stats.inStock}
            icon={<Check className="w-5 h-5" />} iconColor="text-success" />
          <StatCard label="Low Stock" value={loading ? '—' : stats.low}
            icon={<AlertTriangle className="w-5 h-5" />} iconColor="text-warning" />
          <StatCard label="Out of Stock" value={loading ? '—' : stats.out}
            icon={<AlertCircle className="w-5 h-5" />} iconColor="text-error" />
        </div>

        {/* Two-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Scan CTA */}
          <button
            onClick={() => navigate('/scan')}
            className="bg-primary text-on-primary rounded-2xl p-6 flex flex-col items-start gap-4
              hover:bg-[#0077ed] active:opacity-80 transition-all text-left shadow-sm"
          >
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <ScanLine className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-on-primary/60 mb-1">Quick Action</p>
              <p className="text-xl font-semibold">Scan Barcode</p>
              <p className="text-sm text-on-primary/70 mt-1">Open camera to scan a product</p>
            </div>
          </button>

          {/* Needs Attention */}
          <div className="bg-surface-variant rounded-2xl p-4">
            <h2 className="text-sm font-semibold text-on-surface mb-3">Needs Attention</h2>
            {loading ? (
              <div className="flex justify-center py-6">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : recentLow.length === 0 ? (
              <p className="text-sm text-on-surface-variant text-center py-6">All products are well-stocked</p>
            ) : (
              <div className="flex flex-col gap-1">
                {recentLow.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => navigate(`/product/${p.id}`, { state: { product: p } })}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl
                      hover:bg-outline/30 transition-colors text-left"
                  >
                    <span className="text-sm text-on-surface truncate flex-1">{p.name}</span>
                    <span className={`text-xs font-semibold ml-3 shrink-0 ${p.stock === 0 ? 'text-error' : 'text-warning'}`}>
                      {p.stock === 0 ? 'Out' : `${p.stock} left`}
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

function StatCard({ label, value, icon, iconColor }) {
  return (
    <div className="bg-surface rounded-2xl shadow-sm p-4 md:p-5 flex items-center gap-3 md:flex-col md:items-start">
      <div className={iconColor}>{icon}</div>
      <div>
        <p className="text-2xl md:text-3xl font-bold text-on-surface leading-none">{value}</p>
        <p className="text-xs text-on-surface-variant mt-1">{label}</p>
      </div>
    </div>
  )
}
