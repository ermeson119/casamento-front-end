import React, { createContext, useContext, useEffect, useState } from 'react'

interface AdminUser {
  id: string
  name: string
  email: string
  role: string
}

interface AdminAuthContextType {
  user: AdminUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  token: string | null
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if admin is already logged in
    const adminData = localStorage.getItem('wedding-admin')
    const adminToken = localStorage.getItem('wedding-admin-token')
    
    if (adminData && adminToken) {
      try {
        setUser(JSON.parse(adminData))
        setToken(adminToken)
      } catch (error) {
        localStorage.removeItem('wedding-admin')
        localStorage.removeItem('wedding-admin-token')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        return false
      }

      const data = await response.json()
      
      setUser(data.user)
      setToken(data.token)
      localStorage.setItem('wedding-admin', JSON.stringify(data.user))
      localStorage.setItem('wedding-admin-token', data.token)
      
      return true
    } catch (error) {
      console.error('Admin login error:', error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('wedding-admin')
    localStorage.removeItem('wedding-admin-token')
  }

  return (
    <AdminAuthContext.Provider value={{ user, loading, login, logout, token }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  }
  return context
}
