import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { checkout } from '../api/checkout'
import Layout from '../components/Layout'
import { ArrowLeft, ShoppingCart, Trash2, AlertTriangle } from 'lucide-react'

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
            <button onClick={() => navigate(-1)} className="min-w-[48px] min-h-[48px] flex items-center justify-center hover:bg-surface-variant">
              <ArrowLeft className="w-6 h-6 text-on-surface" />
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
            <div className="w-16 h-16 bg-surface-variant flex items-center justify-center">
              <ShoppingCart className="w-8 h-8 text-on-surface-variant" />
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
                <div key={product.id} className="bg-surface border border-outline p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-on-surface truncate">{product.name}</p>
                      <p className="text-xs text-on-surface-variant font-mono">{product.barcode}</p>
                    </div>
                    <button onClick={() => removeItem(product.id)}
                      className="text-error min-w-[32px] min-h-[32px] flex items-center justify-center hover:bg-error-container active:bg-error-container">
                      <Trash2 className="w-4 h-4" />
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
                    <p className="text-xs text-warning mt-2 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Max stock reached ({product.stock} available)
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Summary + checkout */}
            <div className="bg-surface-variant p-4 mb-6">
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
              className="w-full bg-primary text-on-primary font-bold py-4 text-lg
                min-h-[56px] active:opacity-80 transition-opacity disabled:opacity-60 mb-4"
            >
              {loading ? 'Processing…' : `Confirm Checkout — Rp ${total.toLocaleString('id-ID')}`}
            </button>
          </>
        )}
      </div>
    </Layout>
  )
}
