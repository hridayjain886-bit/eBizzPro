import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { authApi } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('ebizzpro_user')
    return raw ? JSON.parse(raw) : null
  })
  const [token, setToken] = useState(() => localStorage.getItem('ebizzpro_token'))
  const [loading, setLoading] = useState(true)

  const persist = useCallback((nextToken, nextUser) => {
    if (nextToken) {
      localStorage.setItem('ebizzpro_token', nextToken)
      setToken(nextToken)
    }
    if (nextUser) {
      localStorage.setItem('ebizzpro_user', JSON.stringify(nextUser))
      setUser(nextUser)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('ebizzpro_token')
    localStorage.removeItem('ebizzpro_user')
    setToken(null)
    setUser(null)
  }, [])

  useEffect(() => {
    let active = true
    async function bootstrap() {
      if (!token) {
        setLoading(false)
        return
      }
      try {
        const res = await authApi.me()
        if (active) {
          setUser(res.data)
          localStorage.setItem('ebizzpro_user', JSON.stringify(res.data))
        }
      } catch {
        if (active) logout()
      } finally {
        if (active) setLoading(false)
      }
    }
    bootstrap()
    return () => { active = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login = useCallback(async (email, password) => {
    const res = await authApi.login({ email, password })
    persist(res.data.token, res.data.user)
    return res.data
  }, [persist])

  const loginWithAuthResponse = useCallback((data) => {
    persist(data.token, data.user)
  }, [persist])

  const refreshMe = useCallback(async () => {
    const res = await authApi.me()
    setUser(res.data)
    localStorage.setItem('ebizzpro_user', JSON.stringify(res.data))
    return res.data
  }, [])

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    login,
    loginWithAuthResponse,
    logout,
    refreshMe,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
