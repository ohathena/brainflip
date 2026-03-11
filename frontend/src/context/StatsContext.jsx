import React, { createContext, useContext, useState, useCallback } from 'react'
import api from '../services/api'

const StatsContext = createContext(null)

export function StatsProvider({ children }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)

  const refreshStats = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/user/stats')
      setStats(res.data)
    } catch {
      // user might not be logged in; silently ignore
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <StatsContext.Provider value={{ stats, loading, refreshStats, setStats }}>
      {children}
    </StatsContext.Provider>
  )
}

export function useStats() {
  const ctx = useContext(StatsContext)
  if (!ctx) throw new Error('useStats must be used inside StatsProvider')
  return ctx
}
