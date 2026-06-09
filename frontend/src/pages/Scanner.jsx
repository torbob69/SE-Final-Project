import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { NotFoundException } from '@zxing/library'
import { getByBarcode } from '../api/products'
import { checkout } from '../api/checkout'
import { useToast } from '../context/ToastContext'
import { useCart } from '../context/CartContext'
import Layout from '../components/Layout'
import ProductOverlay from '../components/ProductOverlay'
import { ArrowLeft, ShoppingCart, Trash2, AlertTriangle, X } from 'lucide-react'

const MODES = ['Inventory', 'Cashier']

export default function Scanner() {
  const videoRef = useRef(null)
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { addItem, itemCount } = useCart()
  const [mode, setMode] = useState('Inventory')
  const [scanning, setScanning] = useState(false)
  const [cameraError, setCameraError] = useState(null)
  const [scanKey, setScanKey] = useState(0)
  const [manualInput, setManualInput] = useState('')
  const [isLookingUp, setIsLookingUp] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showCart, setShowCart] = useState(false)

  const handleBarcode = useCallback(async (barcode) => {
    try {
      const product = await getByBarcode(barcode)
      if (mode === 'Cashier') {
        addItem(product)
        showToast(`Added: ${product.name}`, 'success')
        setScanKey((k) => k + 1)
      } else {
        setSelectedProduct(product)
      }
    } catch (err) {
      const msg = err?.response?.status === 404
        ? 'Barcode not recognized in catalog'
        : 'Failed to look up barcode'
      showToast(msg, 'error')
      setScanKey((k) => k + 1)
    }
  }, [mode, addItem, showToast])

  async function handleManualSubmit(e) {
    e.preventDefault()
    const val = manualInput.trim()
    if (!val || isLookingUp) return
    setManualInput('')
    setIsLookingUp(true)
    await handleBarcode(val)
    setIsLookingUp(false)
  }

  useEffect(() => {
    if (!videoRef.current) return

    let controls = null
    let stopped = false

    function stopScan() {
      stopped = true
      try { controls?.stop() } catch {}
      try { BrowserMultiFormatReader.releaseAllStreams() } catch {}
    }

    setCameraError(null)
    setScanning(true)

    const reader = new BrowserMultiFormatReader()

    reader
      .decodeFromConstraints(
        { video: { facingMode: { ideal: 'environment' } } },
        videoRef.current,
        (result, err) => {
          if (stopped) return
          if (result) {
            console.log('[Scanner] barcode detected:', result.getText())
            stopScan()
            handleBarcode(result.getText())
            return
          }
          if (err && !(err instanceof NotFoundException)) {
            console.warn('[Scanner] decode error:', err)
          }
        }
      )
      .then((c) => {
        controls = c
        if (stopped) c.stop()
        else console.log('[Scanner] ready — pointing at a barcode now')
      })
      .catch((err) => {
        if (stopped) return
        console.error('[Scanner] startup error:', err)
        setScanning(false)
        setCameraError('Camera access denied or not available.')
      })

    return stopScan
  }, [scanKey, handleBarcode])

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-5rem)]">
        {/* Header */}
        <div className="px-4 pt-5 pb-3 flex items-center justify-between gap-3 bg-surface">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(-1)} className="min-w-[48px] min-h-[48px] flex items-center justify-center hover:bg-surface-variant active:bg-surface-variant">
              <ArrowLeft className="w-6 h-6 text-on-surface" />
            </button>
            <h1 className="text-md font-semibold text-on-surface">Scan Barcode</h1>
          </div>

          {/* Mode toggle */}
          <div className="flex rounded-xl p-0.5 gap-0.5">
            {MODES.map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors min-h-[36px]
                  ${mode === m
                    ? 'bg-primary text-on-primary'
                    : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Cashier mode — cart badge */}
        {mode === 'Cashier' && itemCount > 0 && (
          <button
            onClick={() => setShowCart(true)}
            className="mx-4 mb-2 px-4 py-2.5 flex items-center justify-between text-sm active:opacity-60 transition-opacity"
          >
            <span className="flex items-center gap-2 text-on-surface-variant">
              <ShoppingCart className="w-4 h-4" />
              {itemCount} item{itemCount !== 1 ? 's' : ''} in cart
            </span>
            <span className="text-primary font-medium">View Cart</span>
          </button>
        )}

        {/* Camera viewport */}
        <div className="relative flex-1 bg-black overflow-hidden">
          <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline muted />

          {/* Mode label overlay */}
          <div className={`absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold
            ${mode === 'Cashier' ? 'bg-primary text-on-primary' : 'bg-black/50 text-white'}`}>
            {mode === 'Cashier' ? 'Cashier Mode' : 'Inventory Mode'}
          </div>

          {cameraError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 px-6">
              <div className="bg-surface rounded-4xl p-6 text-center max-w-xs">
                <p className="text-error font-normal mb-4">{cameraError}</p>
                <button onClick={() => setScanKey((k) => k + 1)}
                  className="text-primary px-6 py-3 rounded-xl font-normal min-h-[48px]">
                  Retry
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="px-4 pt-3 pb-4 bg-surface space-y-2">
          <p className="text-xs text-center font-extralight text-on-surface-variant mb-4">
            Problem with Scanner? Use manual input instead
          </p>
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Enter barcode manually…"
              className="flex-1 bg-surface-variant text-on-surface rounded-full px-4 py-2.5 text-sm
                placeholder:text-on-surface-variant/50 outline-none focus:ring-2 focus:ring-primary min-h-[48px]"
            />
            <button
              type="submit"
              disabled={!manualInput.trim() || isLookingUp}
              className="text-primary px-4 text-sm min-h-[48px] disabled:opacity-40 active:scale-95 transition-transform"
            >
              {isLookingUp ? '…' : 'Go'}
            </button>
          </form>
        </div>
      </div>

      {/* Product overlay (inventory mode) */}
      {selectedProduct && (
        <ProductOverlay
          product={selectedProduct}
          onClose={() => {
            setSelectedProduct(null)
            setScanKey((k) => k + 1)
          }}
        />
      )}

      {/* Cart overlay (cashier mode) */}
      {showCart && (
        <CartOverlay onClose={() => setShowCart(false)} />
      )}
    </Layout>
  )
}

function CartOverlay({ onClose }) {
  const { items, removeItem, updateQty, clear, total, itemCount } = useCart()
  const { showToast } = useToast()
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  function close() {
    setVisible(false)
    setTimeout(onClose, 150)
  }

  async function handleCheckout() {
    if (!items.length) return
    setLoading(true)
    try {
      const res = await checkout(items)
      clear()
      showToast(`Checkout successful — Rp ${Number(res.total_amount).toLocaleString('id-ID')}`, 'success')
      close()
    } catch (err) {
      showToast(err?.response?.data?.detail ?? 'Checkout failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end md:items-stretch md:justify-end backdrop-blur-sm bg-black/40
        transition-opacity duration-150 ${visible ? 'opacity-100' : 'opacity-0'}`}
      onClick={close}
    >
      <div
        className={`bg-surface w-full md:w-[420px] rounded-t-2xl md:rounded-none
          overflow-hidden flex flex-col max-h-[92vh] md:max-h-full md:h-full transition-transform duration-150
          ${visible ? 'translate-y-0 md:translate-x-0' : 'translate-y-6 md:translate-y-0 md:translate-x-full'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-on-surface">Cart</h2>
            {itemCount > 0 && (
              <span className="text-sm text-on-surface-variant">{itemCount} items</span>
            )}
          </div>
          <div className="flex items-center gap-5">
            {items.length > 0 && (
              <button onClick={clear} className="text-xs text-error active:opacity-60 transition-opacity">
                Clear all
              </button>
            )}
            <button onClick={close} className="text-on-surface-variant active:opacity-60 transition-opacity">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 pb-10">
            <ShoppingCart className="w-8 h-8 text-on-surface-variant" />
            <p className="text-sm text-on-surface-variant">Cart is empty</p>
          </div>
        ) : (
          <>
            {/* Item list */}
            <div className="overflow-y-auto flex-1 px-5">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="py-4 border-b border-outline last:border-0">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-on-surface truncate">{product.name}</p>
                      <p className="text-xs text-on-surface-variant font-mono">{product.barcode}</p>
                    </div>
                    <button
                      onClick={() => removeItem(product.id)}
                      className="text-on-surface-variant active:opacity-60 transition-opacity shrink-0 min-w-[32px] flex justify-center pt-0.5"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateQty(product.id, quantity - 1)}
                        className="w-10 h-10 rounded-full border text-on-surface text-lg
                          flex items-center justify-center active:scale-90 transition-transform"
                      >
                        −
                      </button>
                      <span className="w-6 text-center font-semibold text-on-surface tabular-nums">{quantity}</span>
                      <button
                        onClick={() => updateQty(product.id, quantity + 1)}
                        disabled={quantity >= product.stock}
                        className="w-10 h-10 rounded-full border text-primary text-lg
                          flex items-center justify-center active:scale-90 transition-transform disabled:opacity-30"
                      >
                        +
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-on-surface-variant tabular-nums">
                        Rp {Number(product.base_price || 0).toLocaleString('id-ID')} × {quantity}
                      </p>
                      <p className="font-semibold text-on-surface tabular-nums">
                        Rp {(Number(product.base_price || 0) * quantity).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                  {quantity >= product.stock && (
                    <p className="text-xs text-warning mt-2 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Max stock ({product.stock} available)
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Total + checkout */}
            <div className="px-5 pb-6 pt-4 shrink-0">
              <div className="flex items-end justify-between mb-4">
                <p className="text-xs text-on-surface-variant">Total</p>
                <p className="text-2xl font-bold text-on-surface tabular-nums">
                  Rp {total.toLocaleString('id-ID')}
                </p>
              </div>
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full bg-primary text-on-primary font-semibold py-4 rounded-full text-sm
                  min-h-[52px] active:scale-95 transition-transform disabled:opacity-50"
              >
                {loading ? 'Processing…' : `Confirm Checkout — Rp ${total.toLocaleString('id-ID')}`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
