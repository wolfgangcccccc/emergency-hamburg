import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchUser() }, [])

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' })
      if (res.ok) setUser(await res.json())
      else setUser(null)
    } catch { setUser(null) }
    finally  { setLoading(false) }
  }

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    setUser(null)
  }

  const can  = (perm) => {
    if (!user) return false
    const map = {
      admin:     ['einsaetze','profile','strafen','kennzeichen','admin','benutzer','funk'],
      leitung:   ['einsaetze','profile','strafen','kennzeichen','admin','funk'],
      polizei:   ['einsaetze','profile','strafen','kennzeichen','funk'],
      zuschauer: ['einsaetze','profile','kennzeichen','funk'],
    }
    return (map[user.role] || []).includes(perm)
  }

  const isAdmin   = () => user?.role === 'admin'
  const isLeitung = () => ['admin','leitung'].includes(user?.role)
  const canWrite  = () => ['admin','leitung','polizei'].includes(user?.role)

  return (
    <AuthContext.Provider value={{ user, loading, logout, can, isAdmin, isLeitung, canWrite, refetch: fetchUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
