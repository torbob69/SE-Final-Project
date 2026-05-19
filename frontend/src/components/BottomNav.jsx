import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
  </svg>
)
const ScanIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M9.5 6.5v3h-3v-3h3M11 5H5v6h6V5zm-1.5 9.5v3h-3v-3h3M11 13H5v6h6v-6zm6.5-6.5v3h-3v-3h3M19 5h-6v6h6V5zm-6 8h1.5v1.5H13V13zm1.5 1.5H16V16h-1.5v-1.5zM16 13h1.5v1.5H16V13zm-3 3h1.5v1.5H13V16zm1.5 1.5H16V19h-1.5v-1.5zM16 16h1.5v1.5H16V16zm1.5-1.5H19V16h-1.5v-1.5zm0 3H19V19h-1.5v-1.5zM22 7h-2V4h-3V2h5v5zm0 15v-5h-2v3h-3v2h5zM2 22h5v-2H4v-3H2v5zM2 2v5h2V4h3V2H2z" />
  </svg>
)
const ListIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
  </svg>
)
const AdminIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 4l5 2.18V11c0 3.5-2.33 6.79-5 7.93C9.33 17.79 7 14.5 7 11V7.18L12 5z" />
  </svg>
)

export default function BottomNav() {
  const { isAdmin } = useAuth()

  const base = 'flex flex-col items-center justify-center gap-1 flex-1 py-2 text-xs min-h-[48px] transition-colors'
  const active = 'text-primary font-semibold'
  const inactive = 'text-on-surface-variant'

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-surface-variant flex z-40 safe-area-pb">
      <NavLink to="/dashboard" className={({ isActive }) => `${base} ${isActive ? active : inactive}`}>
        <HomeIcon />
        <span>Home</span>
      </NavLink>
      <NavLink to="/scan" className={({ isActive }) => `${base} ${isActive ? active : inactive}`}>
        <ScanIcon />
        <span>Scan</span>
      </NavLink>
      <NavLink to="/inventory" className={({ isActive }) => `${base} ${isActive ? active : inactive}`}>
        <ListIcon />
        <span>Catalog</span>
      </NavLink>
      {isAdmin && (
        <NavLink to="/admin" className={({ isActive }) => `${base} ${isActive ? active : inactive}`}>
          <AdminIcon />
          <span>Admin</span>
        </NavLink>
      )}
    </nav>
  )
}
