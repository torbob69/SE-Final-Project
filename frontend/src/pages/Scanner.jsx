import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { getByBarcode } from '../api/products'
import { useToast } from '../context/ToastContext'
import Layout from '../components/Layout'

export default function Scanner() {
  const videoRef = useRef(null)
  const readerRef = useRef(null)
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [scanning, setScanning] = useState(false)
  const [cameraError, setCameraError] = useState(null)

  useEffect(() => {
    let cancelled = false
    const reader = new BrowserMultiFormatReader()
    readerRef.current = reader

    async function startScan() {
      try {
        setScanning(true)
        setCameraError(null)
        const result = await reader.decodeOnceFromVideoDevice(undefined, videoRef.current)
        if (cancelled) return
        setScanning(false)
        stopCamera()
        await handleBarcode(result.getText())
      } catch (err) {
        if (cancelled) return
        setScanning(false)
        stopCamera()
        if (err?.name !== 'NotFoundException') {
          setCameraError('Camera access denied or not available.')
        }
      }
    }

    startScan()

    return () => {
      cancelled = true
      stopCamera()
    }
  }, [])

  function stopCamera() {
    try {
      BrowserMultiFormatReader.releaseAllStreams()
    } catch {}
  }

  async function handleBarcode(barcode) {
    try {
      const product = await getByBarcode(barcode)
      navigate(`/product/${product.id}`, { state: { product } })
    } catch (err) {
      const msg = err?.response?.status === 404
        ? 'Barcode not recognized in catalog'
        : 'Failed to look up barcode'
      showToast(msg, 'error')
      // restart scanner after failed lookup
      navigate('/scan')
    }
  }

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-5rem)]">
        <div className="px-4 pt-6 pb-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="min-w-[48px] min-h-[48px] flex items-center justify-center rounded-full hover:bg-surface-variant active:bg-surface-variant">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-on-surface">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
          </button>
          <h1 className="text-xl font-bold text-on-surface">Scan Barcode</h1>
        </div>

        <div className="relative flex-1 bg-black overflow-hidden">
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            playsInline
            muted
          />

          {/* Targeting overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-40 relative">
              {/* corner marks */}
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
          </div>

          {cameraError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 px-6">
              <div className="bg-surface rounded-2xl p-6 text-center max-w-xs">
                <p className="text-error font-medium mb-4">{cameraError}</p>
                <button
                  onClick={() => navigate('/scan')}
                  className="bg-primary text-on-primary px-6 py-3 rounded-xl font-semibold min-h-[48px]"
                >
                  Retry
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="px-4 py-4 bg-surface text-center">
          <p className="text-sm text-on-surface-variant">
            {scanning ? 'Point camera at a barcode…' : 'Initializing camera…'}
          </p>
        </div>
      </div>
    </Layout>
  )
}
