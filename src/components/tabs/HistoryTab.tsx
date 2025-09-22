'use client'

import { Transaction } from '@/types'
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
} from 'lucide-react'

interface HistoryTabProps {
  transactions: Transaction[]
}

export default function HistoryTab({ transactions }: HistoryTabProps) {
  const getTransactionTypeClass = (type: string) => {
    switch (type.toLowerCase()) {
      case 'win':
      case 'deposit':
        return 'bg-green-900/30 text-green-300 border border-green-600/30'
      case 'loss':
      case 'bet':
        return 'bg-red-900/30 text-red-300 border border-red-600/30'
      case 'bonus':
      case 'reward':
        return 'bg-blue-900/30 text-blue-300 border border-blue-600/30'
      default:
        return 'bg-gray-800/50 text-gray-300 border border-gray-600/30'
    }
  }

  const formatAmount = (amount: number) => {
    const sign = amount >= 0 ? '+' : ''
    return `${sign}$${amount.toFixed(2)}`
  }

  const getAmountClass = (amount: number) => {
    return amount >= 0 ? 'text-green-400' : 'text-red-400'
  }

  return (
    <div className="max-w-3xl mx-auto p-3 space-y-4">
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold gradient-gold mb-1">
          Transaction History
        </h1>
        <p className="text-gray-400 text-sm">
          Track all your gaming transactions and balance changes
        </p>
      </div>

      {/* Transaction History */}
      <div className="bg-gradient-to-br from-[#2a2a2a] to-[#1f1f1f] rounded-xl p-5 border border-gray-700/50">
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-400 mb-1">
              No Transactions Yet
            </h3>
            <p className="text-gray-500 text-sm">
              Start playing games to see your transaction history here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map(transaction => (
              <div
                key={transaction.id}
                className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/30 hover:border-gray-600/50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        transaction.amount >= 0
                          ? 'bg-green-600/20'
                          : 'bg-red-600/20'
                      }`}
                    >
                      {transaction.amount >= 0 ? (
                        <TrendingUp className="w-3 h-3 text-green-400" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-red-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTransactionTypeClass(transaction.transaction_type)}`}
                        >
                          {transaction.transaction_type.toUpperCase()}
                        </span>
                        <h3
                          className={`text-base font-semibold ${getAmountClass(transaction.amount)}`}
                        >
                          {formatAmount(transaction.amount)}
                        </h3>
                      </div>
                      <p className="text-gray-400 text-xs">
                        {new Date(transaction.created_at).toLocaleDateString(
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
                  <div className="text-right">
                    <p className="text-white font-medium text-sm">
                      ${transaction.balance_after.toFixed(2)}
                    </p>
                    <p className="text-gray-400 text-xs">Balance After</p>
                  </div>
                </div>
                {transaction.description && transaction.description !== '-' && (
                  <div className="mt-2 pt-2 border-t border-gray-700/30">
                    <p className="text-gray-300 text-sm">
                      {transaction.description}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {transactions.length > 0 && (
          <div className="mt-4 bg-gradient-to-r from-gray-800/30 to-gray-700/30 border border-gray-600/30 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-5 h-5 bg-gradient-to-r from-[#D4B145] to-[#C29331] rounded-full flex items-center justify-center">
                <DollarSign className="w-3 h-3 text-[#212121]" />
              </div>
              <h4 className="font-medium gradient-gold text-sm">
                Transaction Summary
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700/30">
                <div className="flex items-center space-x-2 mb-1">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-400">
                    Total Transactions
                  </span>
                </div>
                <span className="text-lg font-bold text-white">
                  {transactions.length}
                </span>
              </div>
              <div className="bg-gray-800/30 rounded-lg p-3 border border-green-600/30">
                <div className="flex items-center space-x-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-gray-400">Total Wins</span>
                </div>
                <span className="text-lg font-bold text-green-400">
                  $
                  {transactions
                    .filter(t => t.amount > 0)
                    .reduce((sum, t) => sum + t.amount, 0)
                    .toFixed(2)}
                </span>
              </div>
              <div className="bg-gray-800/30 rounded-lg p-3 border border-red-600/30">
                <div className="flex items-center space-x-2 mb-1">
                  <TrendingDown className="w-4 h-4 text-red-400" />
                  <span className="text-xs text-gray-400">Total Losses</span>
                </div>
                <span className="text-lg font-bold text-red-400">
                  $
                  {Math.abs(
                    transactions
                      .filter(t => t.amount < 0)
                      .reduce((sum, t) => sum + t.amount, 0)
                  ).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
