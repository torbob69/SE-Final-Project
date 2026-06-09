import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listProducts } from '../api/products'
import Layout from '../components/Layout'

function statusBadge(stock) {
  if (stock === 0) return { label: 'Out of Stock', cls: 'bg-error-container text-error' }
  if (stock <= 10) return { label: 'Low Stock', cls: 'bg-warning-container text-warning' }
  return { label: 'In Stock', cls: 'bg-success-container text-success' }
}

export default function Inventory() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    listProducts().then(setProducts).finally(() => setLoading(false))
  }, [])

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode.includes(search),
  )

  return (
    <Layout>
      <div className="px-4 md:px-8 pt-6 md:pt-8">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h1 className="text-2xl font-bold text-on-surface">Inventory</h1>
          <span className="text-sm text-on-surface-variant">{filtered.length} products</span>
        </div>

        <input
          type="search"
          placeholder="Search name or barcode…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:max-w-sm px-4 py-3 rounded-full border border-outline bg-surface text-on-surface
            focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 mb-4 md:mb-6 min-h-[48px]"
        />

        {loading ? (
          <div className="flex justify-center pt-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-on-surface-variant py-12">No products found.</p>
        ) : (
          <>
            {/* Mobile: cards */}
            <div className="flex flex-col gap-3 md:hidden pb-4">
              {filtered.map((p) => <ProductCard key={p.id} product={p} onClick={() => navigate(`/product/${p.id}`, { state: { product: p } })} />)}
            </div>

            {/* Desktop: table */}
            <div className="hidden md:block bg-surface border border-surface-variant rounded-2xl overflow-hidden mb-8">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-variant bg-surface-variant/50">
                    <th className="text-left px-4 py-3 font-semibold text-on-surface-variant">Product</th>
                    <th className="text-left px-4 py-3 font-semibold text-on-surface-variant">Barcode</th>
                    <th className="text-left px-4 py-3 font-semibold text-on-surface-variant">Price</th>
                    <th className="text-right px-4 py-3 font-semibold text-on-surface-variant">Stock</th>
                    <th className="text-center px-4 py-3 font-semibold text-on-surface-variant">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, i) => {
                    const badge = statusBadge(p.stock)
                    return (
                      <tr
                        key={p.id}
                        onClick={() => navigate(`/product/${p.id}`, { state: { product: p } })}
                        className={`cursor-pointer hover:bg-surface-variant/40 transition-colors
                          ${i !== filtered.length - 1 ? 'border-b border-surface-variant' : ''}`}
                      >
                        <td className="px-4 py-3">
                          <p className="font-medium text-on-surface">{p.name}</p>
                          {p.description && <p className="text-xs text-on-surface-variant truncate max-w-xs">{p.description}</p>}
                        </td>
                        <td className="px-4 py-3 font-mono text-on-surface-variant text-xs">{p.barcode}</td>
                        <td className="px-4 py-3 text-on-surface">
                          {p.base_price != null ? `Rp ${Number(p.base_price).toLocaleString('id-ID')}` : '—'}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-on-surface">{p.stock}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${badge.cls}`}>{badge.label}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}

function ProductCard({ product: p, onClick }) {
  const badge = statusBadge(p.stock)
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-surface border border-surface-variant rounded-2xl p-4 active:bg-surface-variant transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-on-surface truncate">{p.name}</p>
          <p className="text-xs text-on-surface-variant font-mono mt-0.5">{p.barcode}</p>
        </div>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full shrink-0 ${badge.cls}`}>{badge.label}</span>
      </div>
      <div className="flex items-center justify-between mt-3">
        <span className="text-sm text-on-surface-variant">
          {p.base_price != null ? `Rp ${Number(p.base_price).toLocaleString('id-ID')}` : '—'}
        </span>
        <span className="text-lg font-bold text-on-surface">
          {p.stock} <span className="text-xs font-normal text-on-surface-variant">units</span>
        </span>
      </div>
    </button>
  )
}
