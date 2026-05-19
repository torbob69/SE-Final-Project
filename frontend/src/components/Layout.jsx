import Sidebar from './Sidebar'
import BottomNav from './BottomNav'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-surface">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Content — offset by sidebar width on desktop */}
      <div className="md:ml-60">
        <main className="pb-20 md:pb-0 min-h-screen">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  )
}
