'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import MobileNavigation from '@/components/MobileNavigation'
import AuthModal from '@/components/AuthModal'
import GameFrame from '@/components/GameFrame'
import { Loader2 } from 'lucide-react'
import { User, Transaction, Withdrawal, GameData } from '@/types'
import { createContext, useContext } from 'react'

// Client-side only wrapper to prevent hydration issues
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) {
    return null
  }

  return <>{children}</>
}

// Create context for game functions
interface GameContextType {
  games: GameData[]
  onPlayGame: (gameUid: string) => void
  user: User | null
  balance: number
  canWithdraw: boolean
  isRefreshing: boolean
  onRefreshBalance: () => void
  onLogout: () => void
  onLogin: (user: User, token: string) => void
  transactions: Transaction[]
  withdrawals: Withdrawal[]
  onWithdrawalSubmit: (bankDetails: {
    bank_name: string
    account_number: string
    account_holder: string
    bank_branch: string
  }) => Promise<boolean>
  onKYCUpload: (formData: FormData) => Promise<boolean>
  showGame: boolean
  setShowGame: (show: boolean) => void
  gameUrl: string
  setGameUrl: (url: string) => void
  isClosingGame: boolean
  setIsClosingGame: (closing: boolean) => void
}

const GameContext = createContext<GameContextType | null>(null)

const useGameContext = () => {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGameContext must be used within GameProvider')
  }
  return context
}

export default function ClientLayoutProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin')
  const [user, setUser] = useState<User | null>(null)
  const [balance, setBalance] = useState(0)
  const [canWithdraw, setCanWithdraw] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>(
    'login'
  )
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [games, setGames] = useState<GameData[]>([])
  const [gameUrl, setGameUrl] = useState('')
  const [showGame, setShowGame] = useState(false)
  const [isClosingGame, setIsClosingGame] = useState(false)

  // Authentication helper functions
  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken')
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  }

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
        setUser(data.user)
        await Promise.all([
          loadBalance(),
          loadTransactionHistory(),
          loadWithdrawalHistory(),
        ])
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
        setBalance(data.balance)
        setCanWithdraw(data.can_withdraw)
      }
    } catch (error) {
      console.error('Error loading balance:', error)
    }
  }

  const loadGames = async () => {
    try {
      const response = await fetch('/api/games')
      const data = await response.json()

      if (data.success) {
        const allGames = [
          ...(data.games?.fishGames || []),
          ...(data.games?.slotGames || []),
        ]
        setGames(allGames)
      }
    } catch (error) {
      console.error('Error loading games:', error)
    }
  }

  const loadTransactionHistory = async () => {
    try {
      const response = await fetch('/api/transactions', {
        headers: getAuthHeaders(),
      })

      if (response.ok) {
        const data = await response.json()
        setTransactions(data.transactions || [])
      }
    } catch (error) {
      console.error('Error loading transactions:', error)
    }
  }

  const loadWithdrawalHistory = async () => {
    try {
      const response = await fetch('/api/withdrawal/history', {
        headers: getAuthHeaders(),
      })

      if (response.ok) {
        const data = await response.json()
        setWithdrawals(data.withdrawals || [])
      }
    } catch (error) {
      console.error('Error loading withdrawals:', error)
    }
  }

  const handleRefreshBalance = async () => {
    setIsRefreshing(true)
    try {
      await loadBalance()
    } catch (error) {
      console.error('Error refreshing balance:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handlePlayGame = async (gameUid: string) => {
    try {
      const response = await fetch('/api/game/launch', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ game_uid: gameUid }),
      })

      const data = await response.json()

      if (response.ok && data.success && data.game_url) {
        setGameUrl(data.game_url)
        setShowGame(true)
      } else {
        alert(`Failed to launch game: ${data.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Game launch error:', error)
      alert('Failed to launch game. Please try again.')
    }
  }

  const handleCloseGame = async () => {
    setIsClosingGame(true)
    setIsRefreshing(true)
    try {
      // Refresh balance and transaction history immediately after closing game
      await Promise.all([loadBalance(), loadTransactionHistory()])
    } catch (error) {
      console.error('Error refreshing data after game close:', error)
    } finally {
      setIsClosingGame(false)
      setIsRefreshing(false)
      setShowGame(false)
      setGameUrl('')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    setUser(null)
    setBalance(0)
    setCanWithdraw(false)
    setTransactions([])
    setWithdrawals([])
    setIsAuthenticated(false)
  }

  const handleLogin = async (user: User, token: string) => {
    localStorage.setItem('authToken', token)
    setUser(user)
    setIsAuthenticated(true)
    await Promise.all([
      loadBalance(),
      loadTransactionHistory(),
      loadWithdrawalHistory(),
    ])
  }

  const handleWithdrawalSubmit = async (bankDetails: {
    bank_name: string
    account_number: string
    account_holder: string
    bank_branch: string
  }) => {
    try {
      const response = await fetch('/api/withdrawal/request', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ bank_details: bankDetails }),
      })

      const data = await response.json()

      if (response.ok) {
        alert('✅ Withdrawal request submitted successfully!')
        loadWithdrawalHistory()
        return true
      } else {
        alert(`❌ Withdrawal request failed: ${data.error}`)
        return false
      }
    } catch (error) {
      console.error('Error submitting withdrawal:', error)
      alert('❌ Network error occurred. Please try again.')
      return false
    }
  }

  const handleKYCUpload = async (formData: FormData) => {
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch('/api/kyc/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        alert('✅ KYC documents uploaded successfully!')
        return true
      } else {
        alert(`❌ Upload failed: ${data.error}`)
        return false
      }
    } catch (error) {
      console.error('Error uploading KYC:', error)
      alert('❌ Network error occurred. Please try again.')
      return false
    }
  }

  // Check authentication on mount
  useEffect(() => {
    loadGames()
    const token = localStorage.getItem('authToken')
    if (token) {
      setIsAuthenticated(true)
      loadUserProfile() // This will load profile and then call other APIs if successful
    } else {
      setIsLoading(false)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading && !isAdminRoute) {
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-[#212121] via-[#2a2a2a] to-[#212121] flex items-center justify-center"
        suppressHydrationWarning={true}
      >
        <Loader2 className="text-[#C29331] text-lg animate-spin" />
      </div>
    )
  }

  return (
    <ClientOnly>
      {/* Show different layouts for admin vs regular pages */}
      {isAdminRoute ? (
        /* Admin pages - no header/footer, handle their own loading */
        <div suppressHydrationWarning={true}>{children}</div>
      ) : (
        /* Regular pages - show header/footer when not in game mode */
        !showGame && (
          <>
            {/* Header */}
            <Header
              user={user}
              balance={balance}
              canWithdraw={canWithdraw}
              onLogout={handleLogout}
              onRefreshBalance={handleRefreshBalance}
              isRefreshing={isRefreshing}
              onLogin={handleLogin}
              withdrawals={withdrawals}
              onWithdrawalSubmit={handleWithdrawalSubmit}
              transactions={transactions}
              onKYCUpload={handleKYCUpload}
            />

            {/* Main Content */}
            <GameContext.Provider
              value={{
                games,
                onPlayGame: handlePlayGame,
                user,
                balance,
                canWithdraw,
                isRefreshing,
                onRefreshBalance: handleRefreshBalance,
                onLogout: handleLogout,
                onLogin: handleLogin,
                transactions,
                withdrawals,
                onWithdrawalSubmit: handleWithdrawalSubmit,
                onKYCUpload: handleKYCUpload,
                showGame,
                setShowGame,
                gameUrl,
                setGameUrl,
                isClosingGame,
                setIsClosingGame,
              }}
            >
              <div
                className="lg:mt-[66px] mt-[65px]"
                suppressHydrationWarning={true}
              >
                {children}
              </div>
            </GameContext.Provider>

            {/* Footer */}
            <Footer />

            {/* Mobile Navigation */}
            <MobileNavigation
              onLoginClick={() => {
                setAuthModalTab('login')
                setShowAuthModal(true)
              }}
              onRegisterClick={() => {
                setAuthModalTab('register')
                setShowAuthModal(true)
              }}
              user={user}
              balance={balance}
              canWithdraw={canWithdraw}
              withdrawals={withdrawals}
              onWithdrawalSubmit={handleWithdrawalSubmit}
            />
          </>
        )
      )}

      {/* Show game frame when in game mode (only for non-admin pages) */}
      {!isAdminRoute && showGame && (
        <GameFrame
          gameUrl={gameUrl}
          onClose={handleCloseGame}
          isClosing={isClosingGame}
        />
      )}

      {/* Auth Modal (only for non-admin pages) */}
      {!isAdminRoute && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onLogin={(user, token) => {
            handleLogin(user, token)
            setShowAuthModal(false)
          }}
          initialTab={authModalTab}
        />
      )}
    </ClientOnly>
  )
}

export { useGameContext }
