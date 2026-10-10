import React, { createContext, useContext, useState } from 'react'
import { api } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })
  const [loading, setLoading] = useState(false)

  const login = async (username, password) => {
    setLoading(true)
    try {
      const res = await api.login(username, password)
      const token = res.access_token || res.token
      api.setToken(token)
      const userData = res.user || { username, role: res.role || 'admin' }
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      return userData
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    api.setToken(null)
    setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
