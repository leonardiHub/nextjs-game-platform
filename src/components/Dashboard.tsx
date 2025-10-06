'use client'

import GameFrame from '@/components/GameFrame'
import Header from '@/components/Header'
import ProgressSection from '@/components/ProgressSection'
import GamesTab from '@/components/tabs/GamesTab'
import Footer from '@/components/Footer'
import MobileNavigation from '@/components/MobileNavigation'
import { GameData, Transaction, User, Withdrawal } from '@/types'
import { useEffect, useState } from 'react'

// Define ApiGame interface for the actual API response
interface ApiGame {
  code: number
  name: string
  game_uid: string
  type: string
  rtp?: number
}
import Hero from './Hero'
import AuthModal from '@/components/AuthModal'
import { useRouter } from 'next/navigation'
import { useGameContext } from '@/components/ClientLayoutProvider'
import Herov2 from './Herov2'

interface DashboardProps {
  user: User | null
  balance: number
  canWithdraw: boolean
  onLogout: () => void
  onBalanceUpdate: () => void
  onLogin?: (user: User, token: string) => void
}

export default function Dashboard({
  user,
  balance,
  canWithdraw,
  onLogout,
  onBalanceUpdate,
  onLogin,
}: DashboardProps) {
  const router = useRouter()
  const gameContext = useGameContext()
  const [activeTab, setActiveTab] = useState('games')
  const [games, setGames] = useState<{
    fishGames?: ApiGame[]
    slotGames?: ApiGame[]
  } | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>(
    'login'
  )

  useEffect(() => {
    loadGames()
    // Only load user-specific data if user is authenticated
    if (user) {
      loadTransactionHistory()
      loadWithdrawalHistory()
    }
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  const getAuthHeaders = () => {
    // Only access localStorage on client side
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  }

  const loadGames = async () => {
    try {
      const response = await fetch('/api/games')
      const data = await response.json()

      if (data.success) {
        // Keep the original structure with fishGames and slotGames
        setGames(data.games)
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
      await onBalanceUpdate()
    } catch (error) {
      console.error('Error refreshing balance:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handlePlayGame = async (gameUid: string) => {
    // Check if user is authenticated
    if (!user) {
      setAuthModalTab('login')
      setShowAuthModal(true)
      return
    }

    try {
      const response = await fetch('/api/game/launch', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ game_uid: gameUid }),
      })

      const data = await response.json()

      if (response.ok && data.success && data.game_url) {
        gameContext.setGameUrl(data.game_url)
        gameContext.setShowGame(true)
      } else {
        alert(`Failed to launch game: ${data.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Game launch error:', error)
      alert('Failed to launch game. Please try again.')
    }
  }

  const handleCloseGame = async () => {
    gameContext.setIsClosingGame(true)
    setIsRefreshing(true)
    try {
      // Refresh balance and transaction history immediately after closing game
      await Promise.all([onBalanceUpdate(), loadTransactionHistory()])
    } catch (error) {
      console.error('Error refreshing data after game close:', error)
    } finally {
      gameContext.setIsClosingGame(false)
      setIsRefreshing(false)
      gameContext.setShowGame(false)
      gameContext.setGameUrl('')
    }
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
      const token =
        typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
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
    // Only run on client side to avoid hydration mismatch
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken')
      if (token) {
        setIsAuthenticated(true)
        // loadUserProfile()
      } else {
        setIsLoading(false)
      }
    } else {
      setIsLoading(false)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-white">
      {/* Only show header when not in game mode */}
      {/* {!showGame && (
        <Header
          user={user}
          balance={balance}
          canWithdraw={canWithdraw}
          onLogout={onLogout}
          onRefreshBalance={handleRefreshBalance}
          isRefreshing={isRefreshing}
          onLogin={onLogin}
          withdrawals={withdrawals}
          onWithdrawalSubmit={handleWithdrawalSubmit}
          transactions={transactions}
          onKYCUpload={handleKYCUpload}
        />
      )} */}

      {/* Only show main content when not in game mode */}
      {!gameContext.showGame && (
        <>
          {/* <Hero /> */}
          <Herov2 />
          <div className="max-w-[1400px] mx-auto p-4 bg-white">
            {/* {user && (
              <ProgressSection balance={balance} canWithdraw={canWithdraw} />
            )} */}

            {/* <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} /> */}

            <div className="flex py-4 gap-2">
              <button
                className="w-1/4 lg:w-1/6 flex lg:flex-row flex-col items-center justify-around lg:justify-center py-1 lg:py-3 px-4 lg:px-8 rounded-lg lg:gap-4 text-[#00a6ff] border border-blue-300 hover:border-blue-400 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
                style={{
                  background: 'linear-gradient(0deg, #ffffff, #e6f3ff)',
                }}
              >
                <img
                  src="slot-icon.webp"
                  alt="slot"
                  className="w-7 h-7 lg:w-10 lg:h-10"
                />
                <span className="text-[#00a6ff] text-sm lg:text-[17px] font-medium">
                  Slot
                </span>
              </button>
              <button
                className="w-1/4 lg:w-1/6 flex lg:flex-row flex-col items-center justify-around lg:justify-center py-1 lg:py-3 px-4 lg:px-8 rounded-lg lg:gap-4 text-[#00a6ff] border border-blue-300 hover:border-blue-400 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
                style={{
                  background: 'linear-gradient(0deg, #ffffff, #e6f3ff)',
                }}
              >
                <img
                  src="poker-icon.webp"
                  alt="slot"
                  className="w-7 h-7 lg:w-10 lg:h-10"
                />
                <span className="text-[#00a6ff] text-sm lg:text-[17px] font-medium">
                  Poker
                </span>
              </button>
              <button
                className="w-1/4 lg:w-1/6 flex lg:flex-row flex-col items-center justify-around lg:justify-center py-1 lg:py-3 px-4 lg:px-8 rounded-lg lg:gap-4 text-[#00a6ff] border border-blue-300 hover:border-blue-400 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
                style={{
                  background: 'linear-gradient(0deg, #ffffff, #e6f3ff)',
                }}
              >
                <img
                  src="football-icon.webp"
                  alt="slot"
                  className="w-10 h-10"
                />
                <span className="text-[#00a6ff] text-sm lg:text-[17px] font-medium">
                  Football
                </span>
              </button>
              <button
                className="relative w-1/4 lg:w-1/6 flex lg:flex-row flex-col items-center justify-around lg:justify-center py-1 lg:py-3 px-4 lg:px-8 rounded-lg lg:gap-4 text-[#00a6ff] border border-blue-300 hover:border-blue-400 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
                style={{
                  background: 'linear-gradient(0deg, #ffffff, #e6f3ff)',
                }}
              >
                <div className="text-white bg-[#00a6ff] absolute rounded-r-lg left-0 bottom-6 lg:bottom-2 text-xs px-1 lg:px-2 font-bold">
                  New
                </div>
                <img
                  src="pool-icon.webp"
                  alt="slot"
                  className="w-7 h-7 lg:w-10 lg:h-10"
                />
                <span className="text-[#00a6ff] text-sm lg:text-[17px] font-medium">
                  Pool
                </span>
              </button>
              <button
                className="w-1/6 hidden lg:flex items-center justify-center py-3 px-8 rounded-lg gap-4 text-[#00a6ff] border border-blue-300 hover:border-blue-400 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
                style={{
                  background: 'linear-gradient(0deg, #ffffff, #e6f3ff)',
                }}
              >
                <img
                  src="gift-icon.webp"
                  alt="slot"
                  className="w-7 h-7 lg:w-10 lg:h-10"
                />
                <span className="text-[#00a6ff] text-sm lg:text-[17px] font-medium">
                  Gift
                </span>
              </button>
              <button
                className="w-1/6 hidden lg:flex items-center justify-center py-3 px-8 rounded-lg gap-4 text-[#00a6ff] border border-blue-300 hover:border-blue-400 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
                style={{
                  background: 'linear-gradient(0deg, #ffffff, #e6f3ff)',
                }}
              >
                <img src="star-icon.webp" alt="slot" className="w-10 h-10" />
                <span className="text-[#00a6ff] text-sm lg:text-[17px] font-medium">
                  Star
                </span>
              </button>
            </div>
            <div className="">
              {/* {activeTab === 'games' && ( */}
              <GamesTab
                user={user}
                games={games}
                onPlayGame={handlePlayGame}
                onShowAuthModal={() => {
                  setAuthModalTab('login')
                  setShowAuthModal(true)
                }}
              />
              {/* )} */}
            </div>
          </div>
        </>
      )}

      {/* Footer */}
      {/* <Footer /> */}

      {/* Mobile Navigation */}
      {/* <MobileNavigation
        onLoginClick={() => {
          setAuthModalTab('login')
          setShowAuthModal(true)
        }}
        onRegisterClick={() => {
          setAuthModalTab('register')
          setShowAuthModal(true)
        }}
      /> */}
      {/* Show game frame when in game mode */}
      {gameContext.showGame && (
        <GameFrame
          gameUrl={gameContext.gameUrl}
          onClose={handleCloseGame}
          isClosing={gameContext.isClosingGame}
        />
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={(user, token) => {
          if (onLogin) {
            onLogin(user, token)
          }
          setShowAuthModal(false)
        }}
        initialTab={authModalTab}
      />
    </div>
  )
}
