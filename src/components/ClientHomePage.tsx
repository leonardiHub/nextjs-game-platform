'use client'

import { useState, useEffect } from 'react'
import Dashboard from '@/components/Dashboard'
import { User } from '@/types'
import { Loader2 } from 'lucide-react'
import { useGameContext } from '@/components/ClientLayoutProvider'

export default function ClientHomePage() {
  const [isLoading, setIsLoading] = useState(true)

  // Use context instead of local state
  const gameContext = useGameContext()
  const {
    user: currentUser,
    balance: currentBalance,
    canWithdraw,
    onLogin: handleLogin,
    onLogout: handleLogout,
    onRefreshBalance: loadBalance,
  } = gameContext

  // Check authentication on mount
  useEffect(() => {
    // Only run on client side to avoid hydration mismatch
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken')
      if (token) {
        // User is authenticated, context will handle loading
        setIsLoading(false)
      } else {
        setIsLoading(false)
      }
    } else {
      setIsLoading(false)
    }
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="flex items-center space-x-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#00a6ff]" />
          <span className="text-gray-300 text-lg">Loading...</span>
        </div>
      </div>
    )
  }

  // Always show Dashboard, but handle authentication via modal

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
