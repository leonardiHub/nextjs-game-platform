'use client'

import { useState } from 'react'
import { User, Withdrawal } from '@/types'
import {
  Wallet,
  DollarSign,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  Building2,
  User as UserIcon,
  Gift,
  Star,
  Trophy,
  Target,
} from 'lucide-react'

interface WalletTabProps {
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

export default function WalletTab({
  user,
  balance,
  canWithdraw,
  withdrawals,
  onWithdrawalSubmit,
}: WalletTabProps) {
  const [bankName, setBankName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountHolder, setAccountHolder] = useState('')
  const [bankBranch, setBankBranch] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const getStatusMessage = () => {
    if (canWithdraw && user?.kyc_status === 'approved') {
      return {
        message: 'Ready to withdraw! You can request your $50 withdrawal.',
        type: 'success' as const,
      }
    } else if (canWithdraw && user?.kyc_status !== 'approved') {
      return {
        message:
          'Balance reached $1000! Complete KYC verification to withdraw.',
        type: 'warning' as const,
      }
    } else {
      const needed = (1000 - balance).toFixed(2)
      return {
        message: `Keep playing! You need $${needed} more to reach withdrawal threshold.`,
        type: 'info' as const,
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!canWithdraw) {
      const needed = (1000 - balance).toFixed(2)
      alert(
        `Withdrawal not available yet!\n\nYou need $${needed} more to reach the $1000 withdrawal threshold.\n\nCurrent balance: $${balance.toFixed(2)}\nRequired balance: $1000.00`
      )
      return
    }

    if (!user || user.kyc_status !== 'approved') {
      alert(
        `KYC Verification Required!\n\nYou must complete KYC verification before withdrawing.\n\nPlease go to the KYC tab to upload your documents.`
      )
      return
    }

    if (
      !bankName.trim() ||
      !accountNumber.trim() ||
      !accountHolder.trim() ||
      !bankBranch.trim()
    ) {
      alert(
        'Please fill in all bank details:\n\n• Bank Name\n• Account Number\n• Account Holder Name\n• Bank Branch'
      )
      return
    }

    const confirmMessage = `Confirm Withdrawal Request\n\nAmount: $50.00\nBank: ${bankName}\nAccount: ${accountNumber}\nHolder: ${accountHolder}\nBranch: ${bankBranch}\n\nProceed with withdrawal request?`

    if (!confirm(confirmMessage)) {
      return
    }

    setIsSubmitting(true)

    const success = await onWithdrawalSubmit({
      bank_name: bankName,
      account_number: accountNumber,
      account_holder: accountHolder,
      bank_branch: bankBranch,
    })

    if (success) {
      setBankName('')
      setAccountNumber('')
      setAccountHolder('')
      setBankBranch('')
    }

    setIsSubmitting(false)
  }

  const status = getStatusMessage()

  return (
    <div className="max-w-3xl mx-auto p-3 space-y-4">
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold gradient-gold mb-1">
          Wallet Management
        </h1>
        <p className="text-gray-400 text-sm">
          Manage your withdrawals and view transaction history
        </p>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-[#2a2a2a] to-[#1f1f1f] rounded-xl p-4 border border-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-[#D4B145] to-[#C29331] rounded-full flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-[#212121]" />
            </div>
            <div>
              <p className="text-gray-400 text-xs">Current Balance</p>
              <p className="text-2xl font-bold gradient-gold">
                ${balance.toFixed(2)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-xs">Withdrawal Threshold</p>
            <p className="text-lg font-semibold text-white">$1,000.00</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Progress to withdrawal</span>
            <span>{((balance / 1000) * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1.5">
            <div
              className="bg-gradient-to-r from-[#D4B145] to-[#C29331] h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((balance / 1000) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Status Card */}
      <div
        className={`rounded-xl p-4 border ${
          status.type === 'success'
            ? 'bg-gradient-to-r from-green-900/20 to-green-800/20 border-green-600/30'
            : status.type === 'warning'
              ? 'bg-gradient-to-r from-yellow-900/20 to-yellow-800/20 border-yellow-600/30'
              : 'bg-gradient-to-r from-gray-800/50 to-gray-700/50 border-gray-600/30'
        }`}
      >
        <div className="flex items-start space-x-3">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center ${
              status.type === 'success'
                ? 'bg-green-600/20'
                : status.type === 'warning'
                  ? 'bg-yellow-600/20'
                  : 'bg-gray-600/20'
            }`}
          >
            {status.type === 'success' ? (
              <CheckCircle className="w-3 h-3 text-green-400" />
            ) : status.type === 'warning' ? (
              <AlertCircle className="w-3 h-3 text-yellow-400" />
            ) : (
              <Clock className="w-3 h-3 text-gray-400" />
            )}
          </div>
          <div className="flex-1">
            <h3
              className={`font-medium text-sm mb-1 ${
                status.type === 'success'
                  ? 'text-green-300'
                  : status.type === 'warning'
                    ? 'text-yellow-300'
                    : 'text-gray-300'
              }`}
            >
              Withdrawal Status
            </h3>
            <p className="text-gray-300 text-sm">{status.message}</p>
          </div>
        </div>
      </div>

      {/* Free Credit Achievement Tracker */}
      <div className="bg-gradient-to-br from-[#2a2a2a] to-[#1f1f1f] rounded-xl p-5 border border-gray-700/50">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-6 h-6 bg-gradient-to-r from-[#D4B145] to-[#C29331] rounded-full flex items-center justify-center">
            <Gift className="w-3 h-3 text-[#212121]" />
          </div>
          <div>
            <h2 className="text-lg font-bold gradient-gold">
              Free Credit Achievements
            </h2>
            <p className="text-gray-400 text-xs">
              Complete tasks to earn free credits
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Daily Login Achievement */}
          <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-blue-600/20 rounded-full flex items-center justify-center">
                  <Calendar className="w-3 h-3 text-blue-400" />
                </div>
                <h3 className="text-sm font-medium text-white">Daily Login</h3>
              </div>
              <span className="text-xs text-blue-400 font-medium">+$5</span>
            </div>
            <p className="text-xs text-gray-400 mb-2">Login 7 days in a row</p>
            <div className="flex items-center space-x-1 mb-1">
              <div className="flex-1 bg-gray-700 rounded-full h-1">
                <div
                  className="bg-blue-400 h-1 rounded-full"
                  style={{ width: '71%' }}
                ></div>
              </div>
              <span className="text-xs text-gray-400">5/7</span>
            </div>
          </div>

          {/* First Deposit Achievement */}
          <div className="bg-gray-800/30 rounded-lg p-3 border border-green-600/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-green-600/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-green-400" />
                </div>
                <h3 className="text-sm font-medium text-white">
                  First Deposit
                </h3>
              </div>
              <span className="text-xs text-green-400 font-medium">+$10</span>
            </div>
            <p className="text-xs text-gray-400 mb-2">
              Make your first deposit
            </p>
            <div className="flex items-center space-x-1">
              <CheckCircle className="w-3 h-3 text-green-400" />
              <span className="text-xs text-green-400">Completed</span>
            </div>
          </div>

          {/* Play Games Achievement */}
          <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-purple-600/20 rounded-full flex items-center justify-center">
                  <Target className="w-3 h-3 text-purple-400" />
                </div>
                <h3 className="text-sm font-medium text-white">Game Master</h3>
              </div>
              <span className="text-xs text-purple-400 font-medium">+$15</span>
            </div>
            <p className="text-xs text-gray-400 mb-2">
              Play 50 different games
            </p>
            <div className="flex items-center space-x-1 mb-1">
              <div className="flex-1 bg-gray-700 rounded-full h-1">
                <div
                  className="bg-purple-400 h-1 rounded-full"
                  style={{ width: '68%' }}
                ></div>
              </div>
              <span className="text-xs text-gray-400">34/50</span>
            </div>
          </div>

          {/* High Roller Achievement */}
          <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-yellow-600/20 rounded-full flex items-center justify-center">
                  <Trophy className="w-3 h-3 text-yellow-400" />
                </div>
                <h3 className="text-sm font-medium text-white">High Roller</h3>
              </div>
              <span className="text-xs text-yellow-400 font-medium">+$25</span>
            </div>
            <p className="text-xs text-gray-400 mb-2">Bet $5,000 total</p>
            <div className="flex items-center space-x-1 mb-1">
              <div className="flex-1 bg-gray-700 rounded-full h-1">
                <div
                  className="bg-yellow-400 h-1 rounded-full"
                  style={{ width: '42%' }}
                ></div>
              </div>
              <span className="text-xs text-gray-400">$2,100/$5,000</span>
            </div>
          </div>

          {/* Referral Achievement */}
          <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-orange-600/20 rounded-full flex items-center justify-center">
                  <UserIcon className="w-3 h-3 text-orange-400" />
                </div>
                <h3 className="text-sm font-medium text-white">Referral Pro</h3>
              </div>
              <span className="text-xs text-orange-400 font-medium">+$20</span>
            </div>
            <p className="text-xs text-gray-400 mb-2">Refer 3 active friends</p>
            <div className="flex items-center space-x-1 mb-1">
              <div className="flex-1 bg-gray-700 rounded-full h-1">
                <div
                  className="bg-orange-400 h-1 rounded-full"
                  style={{ width: '33%' }}
                ></div>
              </div>
              <span className="text-xs text-gray-400">1/3</span>
            </div>
          </div>

          {/* Lucky Streak Achievement */}
          <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-pink-600/20 rounded-full flex items-center justify-center">
                  <Star className="w-3 h-3 text-pink-400" />
                </div>
                <h3 className="text-sm font-medium text-white">Lucky Streak</h3>
              </div>
              <span className="text-xs text-pink-400 font-medium">+$30</span>
            </div>
            <p className="text-xs text-gray-400 mb-2">Win 10 games in a row</p>
            <div className="flex items-center space-x-1 mb-1">
              <div className="flex-1 bg-gray-700 rounded-full h-1">
                <div
                  className="bg-pink-400 h-1 rounded-full"
                  style={{ width: '60%' }}
                ></div>
              </div>
              <span className="text-xs text-gray-400">6/10</span>
            </div>
          </div>
        </div>

        {/* Total Credits Earned */}
        <div className="mt-4 bg-gradient-to-r from-green-900/20 to-green-800/20 border border-green-600/30 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Gift className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-green-300">
                Total Free Credits Earned
              </span>
            </div>
            <span className="text-lg font-bold text-green-400">$10.00</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Keep completing achievements to earn more!
          </p>
        </div>
      </div>

      {/* Withdrawal Form */}
      <div className="bg-gradient-to-br from-[#2a2a2a] to-[#1f1f1f] rounded-xl p-5 border border-gray-700/50">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-6 h-6 bg-gradient-to-r from-[#D4B145] to-[#C29331] rounded-full flex items-center justify-center">
            <CreditCard className="w-3 h-3 text-[#212121]" />
          </div>
          <div>
            <h2 className="text-lg font-bold gradient-gold">
              Withdrawal Request
            </h2>
            <p className="text-gray-400 text-xs">
              Request your $50 withdrawal by providing bank details
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="flex items-center space-x-1 text-xs font-medium text-gray-300">
                <Building2 className="w-3 h-3" />
                <span>Bank Name</span>
              </label>
              <input
                type="text"
                value={bankName}
                onChange={e => setBankName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 text-white rounded-lg focus:border-[#C29331] focus:ring-1 focus:ring-[#C29331] focus:outline-none transition-all placeholder-gray-500 text-sm"
                placeholder="e.g., Chase Bank"
              />
            </div>

            <div className="space-y-1">
              <label className="flex items-center space-x-1 text-xs font-medium text-gray-300">
                <CreditCard className="w-3 h-3" />
                <span>Account Number</span>
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={e => setAccountNumber(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 text-white rounded-lg focus:border-[#C29331] focus:ring-1 focus:ring-[#C29331] focus:outline-none transition-all placeholder-gray-500 text-sm"
                placeholder="Enter your account number"
              />
            </div>

            <div className="space-y-1">
              <label className="flex items-center space-x-1 text-xs font-medium text-gray-300">
                <UserIcon className="w-3 h-3" />
                <span>Account Holder Name</span>
              </label>
              <input
                type="text"
                value={accountHolder}
                onChange={e => setAccountHolder(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 text-white rounded-lg focus:border-[#C29331] focus:ring-1 focus:ring-[#C29331] focus:outline-none transition-all placeholder-gray-500 text-sm"
                placeholder="Full name as on account"
              />
            </div>

            <div className="space-y-1">
              <label className="flex items-center space-x-1 text-xs font-medium text-gray-300">
                <Building2 className="w-3 h-3" />
                <span>Bank Branch</span>
              </label>
              <input
                type="text"
                value={bankBranch}
                onChange={e => setBankBranch(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 text-white rounded-lg focus:border-[#C29331] focus:ring-1 focus:ring-[#C29331] focus:outline-none transition-all placeholder-gray-500 text-sm"
                placeholder="Branch name or code"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={
              isSubmitting || !canWithdraw || user?.kyc_status !== 'approved'
            }
            className={`w-full py-2.5 rounded-lg font-medium text-sm transition-all duration-300 ${
              canWithdraw && user?.kyc_status === 'approved' && !isSubmitting
                ? 'text-[#212121] hover:opacity-90'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed border border-gray-600'
            }`}
            style={{
              background:
                canWithdraw && user?.kyc_status === 'approved' && !isSubmitting
                  ? 'linear-gradient(180deg, #af8135, #f0e07c, #c69b3a)'
                  : undefined,
            }}
          >
            {isSubmitting
              ? 'Processing Request...'
              : canWithdraw && user?.kyc_status === 'approved'
                ? 'Request Withdrawal ($50)'
                : canWithdraw
                  ? 'Complete KYC Verification First'
                  : `Need $${(1000 - balance).toFixed(2)} More to Withdraw`}
          </button>
        </form>
      </div>

      {/* Withdrawal History */}
      <div className="bg-gradient-to-br from-[#2a2a2a] to-[#1f1f1f] rounded-xl p-5 border border-gray-700/50">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-6 h-6 bg-gradient-to-r from-[#D4B145] to-[#C29331] rounded-full flex items-center justify-center">
            <Calendar className="w-3 h-3 text-[#212121]" />
          </div>
          <div>
            <h2 className="text-lg font-bold gradient-gold">
              Withdrawal History
            </h2>
            <p className="text-gray-400 text-xs">
              Track all your withdrawal requests
            </p>
          </div>
        </div>

        {withdrawals.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-400 mb-1">
              No Withdrawals Yet
            </h3>
            <p className="text-gray-500 text-sm">
              Your withdrawal history will appear here once you make your first
              request.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {withdrawals.map(withdrawal => (
              <div
                key={withdrawal.id}
                className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/30 hover:border-gray-600/50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        withdrawal.status === 'approved'
                          ? 'bg-green-600/20'
                          : withdrawal.status === 'rejected'
                            ? 'bg-red-600/20'
                            : withdrawal.status === 'submitted'
                              ? 'bg-blue-600/20'
                              : 'bg-yellow-600/20'
                      }`}
                    >
                      {withdrawal.status === 'approved' ? (
                        <CheckCircle className="w-3 h-3 text-green-400" />
                      ) : withdrawal.status === 'rejected' ? (
                        <XCircle className="w-3 h-3 text-red-400" />
                      ) : withdrawal.status === 'submitted' ? (
                        <Clock className="w-3 h-3 text-blue-400" />
                      ) : (
                        <AlertCircle className="w-3 h-3 text-yellow-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-base font-semibold text-white">
                          ${withdrawal.amount.toFixed(2)}
                        </h3>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            withdrawal.status === 'approved'
                              ? 'bg-green-900/40 text-green-300 border border-green-600/40'
                              : withdrawal.status === 'rejected'
                                ? 'bg-red-900/40 text-red-300 border border-red-600/40'
                                : withdrawal.status === 'submitted'
                                  ? 'bg-blue-900/40 text-blue-300 border border-blue-600/40'
                                  : 'bg-yellow-900/40 text-yellow-300 border border-yellow-600/40'
                          }`}
                        >
                          {withdrawal.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs">
                        {new Date(withdrawal.created_at).toLocaleDateString(
                          'en-US',
                          {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          }
                        )}
                      </p>
                    </div>
                  </div>
                  {withdrawal.admin_notes && (
                    <div className="max-w-xs">
                      <p className="text-xs text-gray-300 bg-gray-700/50 px-2 py-1 rounded">
                        {withdrawal.admin_notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
