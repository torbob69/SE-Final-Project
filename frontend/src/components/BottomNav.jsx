import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { Home, ScanLine, LayoutList, ShoppingCart, Shield } from 'lucide-react'

export default function BottomNav() {
  const { isAdmin } = useAuth()
  const { itemCount } = useCart()

  const base = 'flex flex-col items-center justify-center gap-1 flex-1 py-2 min-h-[48px] transition-colors'
  const active = 'text-primary'
  const inactive = 'text-on-surface-variant'

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface/90 backdrop-blur-md border-t border-outline flex z-40 safe-area-pb">
      <NavLink to="/dashboard" className={({ isActive }) => `${base} ${isActive ? active : inactive}`}>
        <Home className="w-5 h-5" />
        <span className="text-[10px] font-medium">Home</span>
      </NavLink>
      <NavLink to="/scan" className={({ isActive }) => `${base} ${isActive ? active : inactive}`}>
        <ScanLine className="w-5 h-5" />
        <span className="text-[10px] font-medium">Scan</span>
      </NavLink>
      <NavLink to="/inventory" className={({ isActive }) => `${base} ${isActive ? active : inactive}`}>
        <LayoutList className="w-5 h-5" />
        <span className="text-[10px] font-medium">Catalog</span>
      </NavLink>
      {itemCount > 0 && (
        <NavLink to="/cart" className={({ isActive }) => `${base} ${isActive ? active : inactive} relative`}>
          <div className="relative">
            <ShoppingCart className="w-5 h-5" />
            <span className="absolute -top-1 -right-2 bg-primary text-on-primary text-[9px] font-bold
              w-4 h-4 rounded-full flex items-center justify-center leading-none">
              {itemCount > 9 ? '9+' : itemCount}
            </span>
          </div>
          <span className="text-[10px] font-medium">Cart</span>
        </NavLink>
      )}
      {isAdmin && (
        <NavLink to="/admin" className={({ isActive }) => `${base} ${isActive ? active : inactive}`}>
          <Shield className="w-5 h-5" />
          <span className="text-[10px] font-medium">Admin</span>
        </NavLink>
      )}
    </nav>
  )
}
