'use client'

import { useState, useEffect, useCallback } from 'react'
import LoginForm from '@/components/LoginForm'
import RegisterForm from '@/components/RegisterForm'
import Dashboard from '@/components/Dashboard'
import { User } from '@/types'
import { Loader2 } from 'lucide-react'

export default function ClientHomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [currentBalance, setCurrentBalance] = useState(0)
  const [canWithdraw, setCanWithdraw] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const loadBalance = useCallback(async () => {
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
  }, [])

  const loadUserProfile = useCallback(async () => {
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
        localStorage.removeItem('authToken')
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setIsLoading(false)
    }
  }, [loadBalance])

  // Check authentication on mount
  useEffect(() => {
    // Only run on client side to avoid hydration mismatch
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken')
      if (token) {
        setIsAuthenticated(true)
        loadUserProfile()
      } else {
        setIsLoading(false)
      }
    } else {
      setIsLoading(false)
    }
  }, [loadUserProfile])

  const handleLogin = (user: User, token: string) => {
    setCurrentUser(user)
    setIsAuthenticated(true)
    localStorage.setItem('authToken', token)
    loadBalance()
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    setCurrentUser(null)
    setCurrentBalance(0)
    setCanWithdraw(false)
    setIsAuthenticated(false)
  }

  const handleSwitchToRegister = () => {
    setShowRegister(true)
  }

  const handleSwitchToLogin = () => {
    setShowRegister(false)
  }

  const handleRegisterSuccess = (user: User, token: string) => {
    handleLogin(user, token)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#212121] via-[#2a2a2a] to-[#212121]">
        <div className="flex items-center space-x-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#C29331]" />
          <span className="text-gray-300 text-lg">Loading...</span>
        </div>
      </div>
    )
  }

  // if (!isAuthenticated) {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-[#212121] via-[#2a2a2a] to-[#212121] flex items-center justify-center p-4">
  //       <div className="w-full max-w-md">
  //         {showRegister ? (
  //           <RegisterForm
  //             onShowLogin={handleSwitchToLogin}
  //             onLogin={handleRegisterSuccess}
  //           />
  //         ) : (
  //           <LoginForm
  //             onShowRegister={handleSwitchToRegister}
  //             onLogin={handleLogin}
  //           />
  //         )}
  //       </div>
  //     </div>
  //   )
  // }

  return (
    <Dashboard
      user={currentUser!}
      balance={currentBalance}
      canWithdraw={canWithdraw}
      onLogout={handleLogout}
      onBalanceUpdate={loadBalance}
    />
  )
}
