import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { checkout } from '../api/checkout'
import Layout from '../components/Layout'

export default function Cart() {
  const { items, removeItem, updateQty, clear, total, itemCount } = useCart()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  async function handleCheckout() {
    if (!items.length) return
    setLoading(true)
    try {
      const res = await checkout(items)
      clear()
      showToast(`Checkout successful — Rp ${Number(res.total_amount).toLocaleString('id-ID')}`, 'success')
      navigate('/dashboard')
    } catch (err) {
      const msg = err?.response?.data?.detail ?? 'Checkout failed'
      showToast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="px-4 md:px-8 pt-6 max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="min-w-[48px] min-h-[48px] flex items-center justify-center rounded-full hover:bg-surface-variant">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-on-surface">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
              </svg>
            </button>
            <h1 className="text-xl font-bold text-on-surface">Cart</h1>
            {itemCount > 0 && (
              <span className="bg-primary text-on-primary text-xs font-bold px-2 py-0.5 rounded-full">
                {itemCount}
              </span>
            )}
          </div>
          {items.length > 0 && (
            <button onClick={clear} className="text-sm text-error font-medium min-h-[48px] px-2">
              Clear all
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16 flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-surface-variant rounded-full flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-on-surface-variant">
                <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96C5 16.1 6.9 18 9 18h12v-2H9.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63H19c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0 0 23.25 5H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
            </div>
            <p className="text-on-surface-variant font-medium">Your cart is empty</p>
            <button onClick={() => navigate('/scan')}
              className="bg-primary text-on-primary px-6 py-3 rounded-xl font-semibold min-h-[48px] active:scale-95 transition-transform">
              Scan Items
            </button>
          </div>
        ) : (
          <>
            {/* Item list */}
            <div className="flex flex-col gap-3 mb-6">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="bg-surface border border-surface-variant rounded-2xl p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-on-surface truncate">{product.name}</p>
                      <p className="text-xs text-on-surface-variant font-mono">{product.barcode}</p>
                    </div>
                    <button onClick={() => removeItem(product.id)}
                      className="text-error min-w-[32px] min-h-[32px] flex items-center justify-center rounded-full hover:bg-error-container active:bg-error-container">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                      </svg>
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    {/* Qty stepper */}
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQty(product.id, quantity - 1)}
                        className="w-8 h-8 rounded-full bg-surface-variant text-on-surface font-bold flex items-center justify-center active:scale-90 transition-transform">
                        −
                      </button>
                      <span className="w-8 text-center font-bold text-on-surface">{quantity}</span>
                      <button onClick={() => updateQty(product.id, quantity + 1)}
                        disabled={quantity >= product.stock}
                        className="w-8 h-8 rounded-full bg-primary text-on-primary font-bold flex items-center justify-center active:scale-90 transition-transform disabled:opacity-40">
                        +
                      </button>
                    </div>

                    {/* Subtotal */}
                    <div className="text-right">
                      <p className="text-xs text-on-surface-variant">
                        Rp {Number(product.base_price || 0).toLocaleString('id-ID')} × {quantity}
                      </p>
                      <p className="font-bold text-on-surface">
                        Rp {(Number(product.base_price || 0) * quantity).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>

                  {quantity >= product.stock && (
                    <p className="text-xs text-warning mt-2">⚠ Max stock reached ({product.stock} available)</p>
                  )}
                </div>
              ))}
            </div>

            {/* Summary + checkout */}
            <div className="bg-surface-variant rounded-2xl p-4 mb-6">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-on-surface-variant">{itemCount} items</span>
                <span className="text-sm text-on-surface-variant">Total</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-on-surface-variant">Prices from product catalog</span>
                <span className="text-2xl font-bold text-on-surface">
                  Rp {total.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full bg-primary text-on-primary font-bold py-4 rounded-2xl text-lg
                min-h-[56px] active:scale-95 transition-transform disabled:opacity-60 shadow-lg shadow-primary/20 mb-4"
            >
              {loading ? 'Processing…' : `Confirm Checkout — Rp ${total.toLocaleString('id-ID')}`}
            </button>
          </>
        )}
      </div>
    </Layout>
  )
}
