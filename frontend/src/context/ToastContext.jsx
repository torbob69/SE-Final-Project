import { createContext, useContext, useState, useCallback } from 'react'
import { Check, X } from 'lucide-react'

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
    <div className="fixed bottom-24 left-0 right-0 flex flex-col items-center gap-2 z-50 px-4 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium w-full max-w-sm pointer-events-auto
            ${t.type === 'success'
              ? 'bg-success text-on-success'
              : 'bg-error text-on-error'}`}
        >
          {t.type === 'success'
            ? <Check className="w-4 h-4 shrink-0" />
            : <X className="w-4 h-4 shrink-0" />}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  )
}

export const useToast = () => useContext(ToastContext)
