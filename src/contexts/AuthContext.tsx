import React, { createContext, useContext, useEffect, useState } from 'react'

interface Guest {
  id: string
  name: string
  email: string
  phone?: string
  maxCompanions: number
  confirmed: boolean
  companionsCount: number
  companionNames: string[]
  dietaryRestrictions?: string
  createdAt: string
  updatedAt: string
}

interface AuthContextType {
  guest: Guest | null
  loading: boolean
  token: string | null
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string, phone?: string) => Promise<boolean>
  updateGuest: (updatedGuest: Guest) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [guest, setGuest] = useState<Guest | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const guestData = localStorage.getItem('wedding-guest')
    const guestToken = localStorage.getItem('wedding-guest-token')
    
    if (guestData && guestToken) {
      try {
        setGuest(JSON.parse(guestData))
        setToken(guestToken)
      } catch (error) {
        localStorage.removeItem('wedding-guest')
        localStorage.removeItem('wedding-guest-token')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:3001/api/guests/login', {
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
      
      setGuest(data.guest)
      setToken(data.token)
      localStorage.setItem('wedding-guest', JSON.stringify(data.guest))
      localStorage.setItem('wedding-guest-token', data.token)
      
      return true
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const register = async (name: string, email: string, password: string, phone?: string): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:3001/api/guests/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, phone }),
      })

      if (!response.ok) {
        return false
      }

      const data = await response.json()
      
      setGuest(data.guest)
      setToken(data.token)
      localStorage.setItem('wedding-guest', JSON.stringify(data.guest))
      localStorage.setItem('wedding-guest-token', data.token)
      
      return true
    } catch (error) {
      console.error('Register error:', error)
      return false
    }
  }

  const updateGuest = (updatedGuest: Guest) => {
    setGuest(updatedGuest)
    localStorage.setItem('wedding-guest', JSON.stringify(updatedGuest))
  }

  const logout = () => {
    setGuest(null)
    setToken(null)
    localStorage.removeItem('wedding-guest')
    localStorage.removeItem('wedding-guest-token')
  }

  return (
    <AuthContext.Provider value={{ guest, loading, token, login, register, updateGuest, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}