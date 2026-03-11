import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('arcadehub_token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      try {
        // Decode JWT payload (not verifying, just reading)
        const payload = JSON.parse(atob(token.split('.')[1]))
        if (payload.exp * 1000 > Date.now()) {
          setUser({ id: payload.id, email: payload.email, username: payload.username })
        } else {
          logout()
        }
      } catch {
        logout()
      }
    }
    setLoading(false)
  }, [token])

  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    const { token: newToken, user: userData } = res.data
    localStorage.setItem('arcadehub_token', newToken)
    setToken(newToken)
    setUser(userData)
    return userData
  }, [])

  const signup = useCallback(async (email, username, password) => {
    const res = await api.post('/auth/signup', { email, username, password })
    const { token: newToken, user: userData } = res.data
    localStorage.setItem('arcadehub_token', newToken)
    setToken(newToken)
    setUser(userData)
    return userData
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('arcadehub_token')
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export default AuthContext
