import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { listProducts } from '../api/products'
import Layout from '../components/Layout'
import { ScanLine, ChevronRight } from 'lucide-react'

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
      <div className="px-4 md:px-8 pt-8 md:pt-12 max-w-2xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-xs text-on-surface-variant mb-0.5">Welcome back</p>
            <h1 className="text-base font-medium text-on-surface capitalize">{user?.role}</h1>
          </div>
          <button
            onClick={logout}
            className="md:hidden text-sm text-primary active:opacity-60 transition-opacity"
          >
            Sign out
          </button>
        </div>

        {/* Stats — flat inline row */}
        <div className="flex gap-16 py-8 justify-center lg:justify-start">
          <div className="flex flex-col justify-center items-center">
            <p className={`text-2xl font-semibold text-on-surface`}>
              {loading ? '—' : stats.total}
            </p>
            <p className="text-xs text-on-surface-variant mt-1">Total</p>
          </div>
          <div className="flex flex-col justify-center items-center">
            <p className={`text-2xl font-semibold text-on-surface`}>
              {loading ? '—' : stats.inStock}
            </p>
            <p className="text-xs text-on-surface-variant mt-1">In Stock</p>
          </div>
          <div className="flex flex-col justify-center items-center">
            <p className={`text-2xl font-semibold text-on-surface`}>
              {loading ? '—' : stats.low}
            </p>
            <p className="text-xs text-on-surface-variant mt-1">Low</p>
          </div>
          <div className="flex flex-col justify-center items-center">
            <p className={`text-2xl font-semibold text-on-surface`}>
              {loading ? '—' : stats.out}
            </p>
            <p className="text-xs text-on-surface-variant mt-1">Out</p>
          </div>
        </div>

        {/* Actions */}
        <div className="">
          <button
            onClick={() => navigate('/scan')}
            className="w-full flex items-center justify-between py-3.5
              hover:bg-surface-variant active:bg-surface-variant transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <ScanLine className="w-4 h-4 text-primary" />
              <span className="text-sm text-on-surface">Scan Barcode</span>
            </div>
            <ChevronRight className="w-4 h-4 text-on-surface-variant" />
          </button>

          <button
            onClick={() => navigate('/inventory')}
            className="w-full flex items-center justify-between py-3.5
              hover:bg-surface-variant active:bg-surface-variant transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <span className="w-4 h-4 flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant" />
              </span>
              <span className="text-sm text-on-surface">View Catalog</span>
            </div>
            <ChevronRight className="w-4 h-4 text-on-surface-variant" />
          </button>
        </div>

        {/* Needs Attention */}
        {/* {!loading && recentLow.length > 0 && (
          <div className="mt-10">
            <p className="text-xs text-on-surface-variant mb-3">Needs Attention</p>
            <div className="border-t border-outline">
              {recentLow.map((p) => (
                <button
                  key={p.id}
                  onClick={() => navigate(`/product/${p.id}`, { state: { product: p } })}
                  className="w-full flex items-center justify-between py-3.5 border-b border-outline
                    hover:bg-surface-variant active:bg-surface-variant transition-colors text-left"
                >
                  <span className="text-sm text-on-surface truncate flex-1">{p.name}</span>
                  <span className={`text-xs ml-4 shrink-0 ${p.stock === 0 ? 'text-error' : 'text-warning'}`}>
                    {p.stock === 0 ? 'Out of stock' : `${p.stock} left`}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )} */}

      </div>
    </Layout>
  )
}
