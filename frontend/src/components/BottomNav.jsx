import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Home, ScanLine, LayoutList, Shield, BarChart2 } from 'lucide-react'

export default function BottomNav() {
  const { isAdmin } = useAuth()

  const base = 'flex flex-col items-center justify-center gap-1 flex-1 py-2 min-h-[48px] transition-colors'
  const active = 'text-primary'
  const inactive = 'text-on-surface-variant'

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface/90 backdrop-blur-md  flex z-40 safe-area-pb">
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
      {isAdmin && (
        <>
          <NavLink to="/admin" end className={({ isActive }) => `${base} ${isActive ? active : inactive}`}>
            <Shield className="w-5 h-5" />
            <span className="text-[10px] font-medium">Admin</span>
          </NavLink>
          <NavLink to="/admin/analytics" className={({ isActive }) => `${base} ${isActive ? active : inactive}`}>
            <BarChart2 className="w-5 h-5" />
            <span className="text-[10px] font-medium">Analytics</span>
          </NavLink>
        </>
      )}
    </nav>
  )
}
