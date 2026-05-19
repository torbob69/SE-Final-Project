import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute'

import OfflineBanner from './components/OfflineBanner'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Scanner from './pages/Scanner'
import Inventory from './pages/Inventory'
import ProductDetail from './pages/ProductDetail'
import AdminConsole from './pages/admin/AdminConsole'
import UserManagement from './pages/admin/UserManagement'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <OfflineBanner />
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/scan" element={<Scanner />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/product/:id" element={<ProductDetail />} />
            </Route>

            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminConsole />} />
              <Route path="/admin/users" element={<UserManagement />} />
            </Route>

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
