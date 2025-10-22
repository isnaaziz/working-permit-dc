import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import api from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  })
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('accessToken'))
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('refreshToken'))

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user))
    else localStorage.removeItem('user')
  }, [user])

  useEffect(() => {
    if (accessToken) localStorage.setItem('accessToken', accessToken)
    else localStorage.removeItem('accessToken')
  }, [accessToken])

  useEffect(() => {
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken)
    else localStorage.removeItem('refreshToken')
  }, [refreshToken])

  const login = async (username, password) => {
    const { data } = await api.post('/api/auth/login', { username, password })
    setUser({
      id: data.userId,
      username: data.username,
      fullName: data.fullName,
      role: data.role,
      email: data.email,
      phoneNumber: data.phoneNumber,
      company: data.company,
    })
    setAccessToken(data.accessToken)
    setRefreshToken(data.refreshToken)
    return data
  }

  const logout = () => {
    setUser(null)
    setAccessToken(null)
    setRefreshToken(null)
  }

  const value = useMemo(
    () => ({ user, accessToken, refreshToken, isAuthenticated: !!accessToken && !!user, login, logout }),
    [user, accessToken, refreshToken]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
