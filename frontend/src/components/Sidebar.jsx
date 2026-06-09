import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Home, ScanLine, LayoutList, Package, Users, BarChart2 } from 'lucide-react'
import logo from '../assets/logo.png'

const NAV = [
  { to: '/dashboard', label: 'Home', icon: <Home className="w-4 h-4 shrink-0" /> },
  { to: '/scan', label: 'Scan', icon: <ScanLine className="w-4 h-4 shrink-0" /> },
  { to: '/inventory', label: 'Catalog', icon: <LayoutList className="w-4 h-4 shrink-0" /> },
]

const ADMIN_NAV = [
  { to: '/admin', label: 'Products', icon: <Package className="w-4 h-4 shrink-0" /> },
  { to: '/admin/users', label: 'Users', icon: <Users className="w-4 h-4 shrink-0" /> },
  { to: '/admin/analytics', label: 'Analytics', icon: <BarChart2 className="w-4 h-4 shrink-0" /> },
]

export default function Sidebar() {
  const { user, isAdmin, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-60 bg-surface z-40">
      {/* Brand */}
      <div className="px-5 py-5">
        <img src={logo} alt="StockSync" className="h-12 w-auto" />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 flex flex-col gap-0.5 overflow-y-auto">
        {NAV.map((item) => (
          <SidebarLink key={item.to} {...item} />
        ))}

        {isAdmin && (
          <>
            <p className="text-xs font-medium text-on-surface-variant px-3 mt-4 mb-1">Admin</p>
            {ADMIN_NAV.map((item) => (
              <SidebarLink key={item.to} {...item} />
            ))}
          </>
        )}
      </nav>

      {/* User footer */}
      <div className="px-4 py-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
            <span className="text-xs font-semibold text-on-primary">
              {user?.email?.[0]?.toUpperCase() ?? '?'}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-on-surface truncate">{user?.email}</p>
            <p className="text-[11px] text-on-surface-variant capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-sm font-medium text-on-surface-variant
            bg-surface-variant hover:bg-outline/40 rounded-xl py-2 transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}

function SidebarLink({ to, label, icon }) {
  return (
    <NavLink
      to={to}
      end={to === '/admin'}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
        ${isActive
          ? 'bg-primary/10 text-primary'
          : 'text-on-surface-variant hover:bg-surface-variant hover:text-on-surface'}`
      }
    >
      {icon}
      {label}
    </NavLink>
  )
}
