'use client'

import { Check } from 'lucide-react'

interface ProgressSectionProps {
  balance: number
  canWithdraw: boolean
}

export default function ProgressSection({ balance }: ProgressSectionProps) {
  const progress = Math.min((balance / 1000) * 100, 100)

  const getMilestoneClass = (milestone: 'start' | 'current' | 'goal') => {
    switch (milestone) {
      case 'start':
        return 'bg-gradient-to-br from-[#B08428] to-[#9E7520] text-white'
      case 'current':
        return balance >= 1000
          ? 'bg-gradient-to-br from-[#C29331] to-[#B08428] text-white'
          : balance > 0
            ? 'bg-gradient-to-br from-[#D4B145] to-[#C29331] text-white animate-pulse'
            : 'bg-gray-700 text-gray-400'
      case 'goal':
        return balance >= 1000
          ? 'bg-gradient-to-br from-[#C29331] to-[#B08428] text-white'
          : 'bg-gray-700 text-gray-400'
      default:
        return 'bg-gray-700 text-gray-400'
    }
  }

  return (
    <div className="border border-gray-700 rounded-xl p-6 lg:p-8 mb-10">
      <h3 className="text-2xl font-bold mb-6 gradient-gold">
        Your Journey to Withdrawal
      </h3>

      <div className="mb-6">
        {/* Desktop Milestones */}
        <div className="hidden md:flex justify-between items-center mb-4">
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-2 ${getMilestoneClass('start')}`}
            >
              S
            </div>
            <div className="text-center text-sm">
              <div className="font-medium text-[#C29331]">Start</div>
              <div className="text-xs text-[#D4B145]">$50</div>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-2 ${getMilestoneClass('current')}`}
            >
              P
            </div>
            <div className="text-center text-sm">
              <div className="font-medium text-[#C29331]">Playing</div>
              <div className="text-xs text-[#D4B145]">
                ${balance.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-2 ${getMilestoneClass('goal')}`}
            >
              W
            </div>
            <div className="text-center text-sm">
              <div className="font-medium text-[#C29331]">Withdraw</div>
              <div className="text-xs text-[#D4B145]">$1000</div>
            </div>
          </div>
        </div>

        {/* Mobile Milestones */}
        <div className="md:hidden space-y-3 mb-4">
          <div className="flex items-center space-x-3">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${getMilestoneClass('start')}`}
            >
              S
            </div>
            <span className="text-sm text-[#C29331]">Start: $50</span>
          </div>
          <div className="flex items-center space-x-3">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${getMilestoneClass('current')}`}
            >
              P
            </div>
            <span className="text-sm text-[#C29331]">
              Playing: ${balance.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${getMilestoneClass('goal')}`}
            >
              W
            </div>
            <span className="text-sm text-[#C29331]">Withdraw: $1000</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gradient-to-r from-[#2a2a2a] via-[#323232] to-[#2a2a2a] rounded-full h-8 mb-3 overflow-hidden border-2 border-[#B08428]/40 shadow-inner relative">
          {/* Background glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#C29331]/10 via-[#D4B145]/20 to-[#C29331]/10 animate-pulse"></div>

          {/* Main progress fill */}
          <div
            className="h-full bg-gradient-to-r from-[#D4B145] via-[#C29331] to-[#B08428] transition-all duration-1000 ease-out relative shadow-lg overflow-hidden"
            style={{ width: `${progress}%` }}
          >
            {/* Inner glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#E4C157]/50 via-[#F0D168]/30 to-[#E4C157]/50"></div>

            {/* Shimmer effect - only within the progress fill */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer-slow w-full"></div>
            </div>

            {/* Top highlight */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#F0D168]/60 via-white/80 to-[#F0D168]/60"></div>

            {/* Progress end glow */}
            <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-l from-[#E4C157] to-transparent animate-pulse"></div>
          </div>
        </div>

        <div className="text-center text-sm font-medium text-[#C29331]">
          Progress to withdrawal: ${balance.toFixed(2)} / $1000
        </div>
      </div>

      <ul className="space-y-2 text-sm text-[#E4C157]">
        <li className="flex items-center space-x-2">
          <Check className="w-4 h-4" />
          <span>Start with $50 in your wallet to play games</span>
        </li>
        <li className="flex items-start space-x-2">
          <Check className="w-4 h-4" />
          <span>Win or lose, your balance changes in real-time</span>
        </li>
        <li className="flex items-start space-x-2">
          <Check className="w-4 h-4" />
          <span>Reach $1000 to unlock $50 withdrawal</span>
        </li>
        <li className="flex items-start space-x-2">
          <Check className="w-4 h-4" />
          <span>Balance under $0.10 resets to $0</span>
        </li>
        <li className="flex items-start space-x-2">
          <Check className="w-4 h-4" />
          <span>Complete KYC verification to withdraw</span>
        </li>
      </ul>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes shimmer-slow {
          0% {
            transform: translateX(-200%);
          }
          100% {
            transform: translateX(200%);
          }
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }

        .animate-shimmer-slow {
          animation: shimmer-slow 3s infinite ease-in-out;
        }
      `}</style>
    </div>
  )
}
