import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} />
    </ToastContext.Provider>
  )
}

function ToastContainer({ toasts }) {
  if (!toasts.length) return null
  return (
    <div className="fixed bottom-24 md:bottom-8 left-0 right-0 flex flex-col items-center gap-2 z-[60] px-4 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="flex items-center gap-2.5 px-4 py-2.5 bg-on-surface text-surface rounded-full
            text-sm font-medium max-w-xs w-fit pointer-events-auto"
        >
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${t.type === 'success' ? 'bg-success' : 'bg-error'}`} />
          <span className="leading-snug">{t.message}</span>
        </div>
      ))}
    </div>
  )
}

export const useToast = () => useContext(ToastContext)
