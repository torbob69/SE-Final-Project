import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { NotFoundException } from '@zxing/library'
import { getByBarcode } from '../api/products'
import { useToast } from '../context/ToastContext'
import { useCart } from '../context/CartContext'
import Layout from '../components/Layout'
import { ArrowLeft, ShoppingCart } from 'lucide-react'

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

  const handleBarcode = useCallback(async (barcode) => {
    try {
      const product = await getByBarcode(barcode)
      if (mode === 'Cashier') {
        addItem(product)
        showToast(`Added: ${product.name}`, 'success')
        setScanKey((k) => k + 1)
      } else {
        navigate(`/product/${product.id}`, { state: { product } })
      }
    } catch (err) {
      const msg = err?.response?.status === 404
        ? 'Barcode not recognized in catalog'
        : 'Failed to look up barcode'
      showToast(msg, 'error')
      setScanKey((k) => k + 1)
    }
  }, [mode, addItem, navigate, showToast])

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
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="min-w-[48px] min-h-[48px] flex items-center justify-center hover:bg-surface-variant active:bg-surface-variant">
              <ArrowLeft className="w-6 h-6 text-on-surface" />
            </button>
            <h1 className="text-xl font-bold text-on-surface">Scan Barcode</h1>
          </div>

          {/* Mode toggle */}
          <div className="flex bg-surface-variant rounded-xl p-0.5 gap-0.5">
            {MODES.map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors min-h-[36px]
                  ${mode === m
                    ? 'bg-primary text-on-primary shadow-sm'
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
            onClick={() => navigate('/cart')}
            className="mx-4 mb-2 bg-primary-container text-on-primary-container rounded-xl px-4 py-2.5
              flex items-center justify-between text-sm font-medium active:scale-95 transition-transform"
          >
            <span className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              {itemCount} item{itemCount !== 1 ? 's' : ''} in cart
            </span>
            <span className="text-primary font-semibold">View Cart</span>
          </button>
        )}

        {/* Camera viewport */}
        <div className="relative flex-1 bg-black overflow-hidden">
          <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline muted />

          {/* Targeting reticle */}
          {/* <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-40 relative">
              {['top-0 left-0', 'top-0 right-0 rotate-90', 'bottom-0 right-0 rotate-180', 'bottom-0 left-0 -rotate-90'].map((pos, i) => (
                <div key={i} className={`absolute ${pos} w-8 h-8`}>
                  <div className="absolute top-0 left-0 w-full h-1 bg-primary rounded-full" />
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary rounded-full" />
                </div>
              ))}
              {scanning && (
                <div className="absolute inset-x-0 top-0 h-0.5 bg-primary animate-bounce" style={{ animationDuration: '1s' }} />
              )}
            </div>
          </div> */}

          {/* Mode label overlay */}
          <div className={`absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold
            ${mode === 'Cashier' ? 'bg-primary text-on-primary' : 'bg-black/50 text-white'}`}>
            {mode === 'Cashier' ? 'Cashier Mode' : 'Inventory Mode'}
          </div>

          {cameraError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 px-6">
              <div className="bg-surface rounded-2xl p-6 text-center max-w-xs">
                <p className="text-error font-medium mb-4">{cameraError}</p>
                <button onClick={() => setScanKey((k) => k + 1)}
                  className="bg-primary text-on-primary px-6 py-3 rounded-xl font-semibold min-h-[48px]">
                  Retry
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="px-4 pt-3 pb-4 bg-surface space-y-2">
          <p className="text-xs text-center text-on-surface-variant">
            {scanning
              ? mode === 'Cashier' ? 'Scan item to add to cart…' : 'Point camera at a barcode…'
              : 'Initializing camera…'}
          </p>

          {/* Manual barcode entry fallback */}
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Enter barcode manually…"
              className="flex-1 bg-surface-variant text-on-surface rounded-xl px-4 py-2.5 text-sm
                placeholder:text-on-surface-variant/50 outline-none focus:ring-2 focus:ring-primary min-h-[48px]"
            />
            <button
              type="submit"
              disabled={!manualInput.trim() || isLookingUp}
              className="bg-primary text-on-primary px-4 rounded-xl font-semibold text-sm min-h-[48px]
                disabled:opacity-40 active:scale-95 transition-transform"
            >
              {isLookingUp ? '…' : 'Go'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  )
}
