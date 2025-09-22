'use client'

import { useState, useEffect } from 'react'
import LoginForm from '@/components/LoginForm'
import RegisterForm from '@/components/RegisterForm'
import Dashboard from '@/components/Dashboard'
import { User } from '@/types'
import { Loader2 } from 'lucide-react'

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [currentBalance, setCurrentBalance] = useState(0)
  const [canWithdraw, setCanWithdraw] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (token) {
      setIsAuthenticated(true)
      loadUserProfile()
    } else {
      setIsLoading(false)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const loadUserProfile = async () => {
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch('/api/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setCurrentUser(data.user)
        await loadBalance()
      } else if (response.status === 401) {
        handleLogout()
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadBalance = async () => {
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch('/api/balance', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setCurrentBalance(data.balance)
        setCanWithdraw(data.can_withdraw)
      }
    } catch (error) {
      console.error('Error loading balance:', error)
    }
  }

  const handleLogin = (user: User, token: string) => {
    localStorage.setItem('authToken', token)
    setCurrentUser(user)
    setIsAuthenticated(true)
    setShowRegister(false)
    loadBalance()
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    setCurrentUser(null)
    setIsAuthenticated(false)
    setShowRegister(false)
    setCurrentBalance(0)
    setCanWithdraw(false)
  }

  const handleShowRegister = () => {
    setShowRegister(true)
  }

  const handleShowLogin = () => {
    setShowRegister(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#212121] via-[#2a2a2a] to-[#212121] flex items-center justify-center">
        <Loader2 className="text-[#C29331] text-lg animate-spin" />
      </div>
    )
  }

  // if (!isAuthenticated) {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600">
  //       {showRegister ? (
  //         <RegisterForm onLogin={handleLogin} onShowLogin={handleShowLogin} />
  //       ) : (
  //         <LoginForm
  //           onLogin={handleLogin}
  //           onShowRegister={handleShowRegister}
  //         />
  //       )}
  //     </div>
  //   )
  // }

  return (
    <Dashboard
      user={currentUser}
      balance={currentBalance}
      canWithdraw={canWithdraw}
      onLogout={handleLogout}
      onBalanceUpdate={loadBalance}
      onLogin={handleLogin}
    />
  )
}
