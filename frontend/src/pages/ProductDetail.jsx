import { useState, useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { adjustStock } from '../api/stock'
import { getProduct } from '../api/products'
import { listTransactions } from '../api/transactions'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'

export default function ProductDetail() {
  const { id } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { isAdmin } = useAuth()

  const [product, setProduct] = useState(state?.product ?? null)
  const [delta, setDelta] = useState(0)
  const [loading, setLoading] = useState(false)
  const [txs, setTxs] = useState([])
  const [txLoading, setTxLoading] = useState(false)

  useEffect(() => {
    if (!product) {
      getProduct(id).then(setProduct).catch(() => navigate('/inventory'))
    }
  }, [id])

  useEffect(() => {
    if (isAdmin && product) {
      setTxLoading(true)
      listTransactions(product.id, 20).then(setTxs).finally(() => setTxLoading(false))
    }
  }, [isAdmin, product?.id])

  if (!product) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    )
  }

  const newStock = product.stock + delta
  const canConfirm = delta !== 0 && newStock >= 0

  function handleDelta(change) {
    setDelta((prev) => {
      const next = prev + change
      if (product.stock + next < 0) return prev
      return next
    })
  }

  function handleInput(raw) {
    const val = raw.replace(/[^0-9-]/g, '')
    const num = parseInt(val, 10)
    if (isNaN(num)) { setDelta(0); return }
    if (product.stock + num < 0) return
    setDelta(num)
  }

  async function handleConfirm() {
    if (!canConfirm) return
    setLoading(true)
    try {
      const res = await adjustStock(product.id, delta)
      setProduct((p) => ({ ...p, stock: res.new_total }))
      if (isAdmin) {
        listTransactions(product.id, 20).then(setTxs)
      }
      setDelta(0)
      showToast('Stock Updated Successfully', 'success')
    } catch (err) {
      showToast(err?.response?.data?.detail ?? 'Failed to update stock', 'error')
    } finally {
      setLoading(false)
    }
  }

  const stockColor =
    product.stock === 0 ? 'text-error' : product.stock <= 10 ? 'text-warning' : 'text-success'

  return (
    <Layout>
      <div className="px-4 md:px-8 pt-6 md:pt-8">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="min-w-[48px] min-h-[48px] flex items-center justify-center rounded-full hover:bg-surface-variant active:bg-surface-variant">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-on-surface">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
          </button>
          <h1 className="text-xl font-bold text-on-surface">Product Detail</h1>
        </div>

        {/* Desktop: side-by-side — Mobile: stacked */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-4xl">
          {/* Left — product info */}
          <div className="flex flex-col gap-4">
            <div className="bg-surface-variant rounded-2xl p-5">
              <p className="text-xs font-mono text-on-surface-variant mb-1">{product.barcode}</p>
              <h2 className="text-2xl font-bold text-on-surface mb-1">{product.name}</h2>
              {product.description && (
                <p className="text-sm text-on-surface-variant mb-4">{product.description}</p>
              )}
              <div className="flex items-end justify-between mt-4">
                {product.base_price != null ? (
                  <div>
                    <p className="text-xs text-on-surface-variant">Base Price</p>
                    <p className="font-semibold text-on-surface">
                      Rp {Number(product.base_price).toLocaleString('id-ID')}
                    </p>
                  </div>
                ) : <div />}
                <div className="text-right">
                  <p className="text-xs text-on-surface-variant">Current Stock</p>
                  <p className={`text-3xl font-bold ${stockColor}`}>{product.stock}</p>
                </div>
              </div>
            </div>

            {/* Transaction history — admin only, desktop visible here */}
            {isAdmin && (
              <div className="bg-surface border border-surface-variant rounded-2xl p-4">
                <h3 className="font-semibold text-on-surface text-sm mb-3">Recent Adjustments</h3>
                {txLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : txs.length === 0 ? (
                  <p className="text-xs text-on-surface-variant text-center py-4">No transactions yet.</p>
                ) : (
                  <div className="flex flex-col gap-2 max-h-56 overflow-y-auto">
                    {txs.map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between text-xs py-1 border-b border-surface-variant last:border-0">
                        <span className="text-on-surface-variant">
                          {new Date(tx.timestamp).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                        <span className={`font-bold ${tx.adjustment > 0 ? 'text-success' : 'text-error'}`}>
                          {tx.adjustment > 0 ? '+' : ''}{tx.adjustment}
                        </span>
                        <span className="text-on-surface font-medium">→ {tx.new_total}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right — adjustment controls */}
          <div className="bg-surface border border-surface-variant rounded-2xl p-5 h-fit">
            <p className="font-semibold text-on-surface mb-4">Adjust Stock</p>
            <div className="flex items-center gap-4 justify-center mb-4">
              <button
                onClick={() => handleDelta(-1)}
                disabled={newStock <= 0}
                className="w-12 h-12 rounded-full bg-surface-variant text-on-surface text-2xl font-bold
                  flex items-center justify-center active:scale-90 transition-transform disabled:opacity-30"
              >
                −
              </button>
              <input
                type="text"
                inputMode="numeric"
                value={delta === 0 ? '' : String(delta)}
                onChange={(e) => handleInput(e.target.value)}
                placeholder="0"
                className="w-24 text-center text-3xl font-bold text-on-surface border-b-2 border-primary
                  bg-transparent focus:outline-none py-1"
              />
              <button
                onClick={() => handleDelta(1)}
                className="w-12 h-12 rounded-full bg-primary text-on-primary text-2xl font-bold
                  flex items-center justify-center active:scale-90 transition-transform"
              >
                +
              </button>
            </div>

            {delta !== 0 && (
              <div className="text-center text-sm text-on-surface-variant mb-4 bg-surface-variant rounded-xl py-2">
                New stock:{' '}
                <span className={`font-bold ${newStock === 0 ? 'text-error' : 'text-on-surface'}`}>
                  {newStock}
                </span>
                <span className="ml-2 text-on-surface-variant">
                  {delta > 0 ? `(+${delta})` : `(${delta})`}
                </span>
              </div>
            )}

            <button
              onClick={handleConfirm}
              disabled={!canConfirm || loading}
              className="w-full bg-primary text-on-primary font-semibold py-3 rounded-xl
                min-h-[48px] active:scale-95 transition-transform disabled:opacity-40"
            >
              {loading ? 'Updating…' : 'Confirm Adjustment'}
            </button>

            {product.stock === 0 && delta === 0 && (
              <p className="text-xs text-error text-center mt-3">⚠ This product is out of stock</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
