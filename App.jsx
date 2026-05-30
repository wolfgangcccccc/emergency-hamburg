import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage     from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import './styles/global.css'

function Guard({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="boot-screen"><div className="boot-spinner"/></div>
  return user ? children : <Navigate to="/" replace />
}

function AppRoutes() {
  const { user, loading } = useAuth()
  if (loading) return <div className="boot-screen"><div className="boot-spinner"/></div>
  return (
    <Routes>
      <Route path="/"          element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/dashboard" element={<Guard><DashboardPage /></Guard>} />
      <Route path="*"          element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
