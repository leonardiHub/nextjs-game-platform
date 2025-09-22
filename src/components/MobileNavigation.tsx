'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { X } from 'lucide-react'
import WalletTab from '@/components/tabs/WalletTab'
import { User, Withdrawal } from '@/types'

interface MobileNavigationProps {
  onLoginClick: () => void
  onRegisterClick: () => void
  user: User | null
  balance: number
  canWithdraw: boolean
  withdrawals: Withdrawal[]
  onWithdrawalSubmit: (bankDetails: {
    bank_name: string
    account_number: string
    account_holder: string
    bank_branch: string
  }) => Promise<boolean>
}

export default function MobileNavigation({
  onLoginClick,
  onRegisterClick,
  user,
  balance,
  canWithdraw,
  withdrawals,
  onWithdrawalSubmit,
}: MobileNavigationProps) {
  const router = useRouter()
  const [showWalletModal, setShowWalletModal] = useState(false)

  return (
    <>
      <div className="z-[9999] lg:hidden flex items-center justify-around w-full h-[65px] bg-black rounded-t-3xl sticky bottom-0 border-t border-l border-r border-gray-500">
        <button
          onClick={() => router.push('/')}
          className="flex flex-col items-center justify-center mb-6 hover:opacity-80 transition-opacity"
        >
          <img src="nav-1.webp" className="w-12 h-auto" />
          <span className="text-white text-sm">Home</span>
        </button>
        <button
          onClick={() => router.push('/promotions')}
          className="flex flex-col items-center justify-center mb-6 hover:opacity-80 transition-opacity"
        >
          <img src="nav-2.webp" className="w-12 h-auto" />
          <span className="text-white text-sm">Promotions</span>
        </button>
        {user ? (
          // When logged in - show Play Now button
          <button
            onClick={() => router.push('/')}
            className="flex flex-col items-center justify-center mb-6 hover:opacity-80 transition-opacity"
          >
            <div className="relative">
              {/* Beaming animation background - smaller */}
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#c29331] via-[#d4b145] to-[#c29331] animate-pulse opacity-30"></div>
              <div className="absolute inset-0 rounded-full bg-[#c29331]/20 animate-ping"></div>

              {/* Main image with shake animation */}
              <img
                src="nav-3.webp"
                className="w-14 h-auto relative z-10 animate-shake"
              />
            </div>
            <span className="text-white text-sm mt-1">Play Now</span>
          </button>
        ) : (
          // When not logged in - show Login button
          <button
            onClick={onLoginClick}
            className="flex flex-col items-center justify-center mb-6 hover:opacity-80 transition-opacity"
          >
            <div className="relative">
              {/* Beaming animation background - smaller */}
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#c29331] via-[#d4b145] to-[#c29331] animate-pulse opacity-30"></div>
              <div className="absolute inset-0 rounded-full bg-[#c29331]/20 animate-ping"></div>

              {/* Main image with shake animation */}
              <img
                src="nav-3.webp"
                className="w-14 h-auto relative z-10 animate-shake"
              />
            </div>
            <span className="text-white text-sm mt-1">Login</span>
          </button>
        )}

        {user ? (
          // When logged in - show Wallet button
          <button
            onClick={() => setShowWalletModal(true)}
            className="flex flex-col items-center justify-center mb-6 hover:opacity-80 transition-opacity"
          >
            <img src="nav-4.webp" className="w-12 h-auto" />
            <span className="text-white text-sm">Wallet</span>
          </button>
        ) : (
          // When not logged in - show Register button
          <button
            onClick={onRegisterClick}
            className="flex flex-col items-center justify-center mb-6 hover:opacity-80 transition-opacity"
          >
            <img src="nav-4.webp" className="w-12 h-auto" />
            <span className="text-white text-sm">Register</span>
          </button>
        )}
        <div className="flex flex-col items-center justify-center mb-6">
          <img src="nav-5.webp" className="w-12 h-auto" />
          <span className="text-white text-sm">Free Credit</span>
        </div>
      </div>

      {/* Wallet Modal */}
      {showWalletModal && (
        <div className="bg-[#212121] px-4 pt-8 pb-22 fixed inset-0 backdrop-blur-sm z-[99999] flex items-start justify-center min-h-screen max-w-screen overflow-y-auto lg:px-0 lg:pb-20 lg:pt-8">
          <div className="relative bg-[#212121] w-full max-w-md mx-auto min-h-fit max-h-full overflow-y-auto flex flex-col">
            <button
              onClick={() => setShowWalletModal(false)}
              className="absolute top-0 right-0 text-gray-500 hover:text-gray-700 z-10 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <WalletTab
              user={user}
              balance={balance}
              canWithdraw={canWithdraw}
              withdrawals={withdrawals}
              onWithdrawalSubmit={onWithdrawalSubmit}
            />
          </div>
        </div>
      )}
    </>
  )
}
