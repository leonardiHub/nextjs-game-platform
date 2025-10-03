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
        return 'bg-green-100 text-green-800 border border-green-200'
      case 'loss':
      case 'bet':
        return 'bg-red-100 text-red-800 border border-red-200'
      case 'bonus':
      case 'reward':
        return 'bg-blue-100 text-blue-800 border border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200'
    }
  }

  const formatAmount = (amount: number) => {
    const sign = amount >= 0 ? '+' : ''
    return `${sign}$${amount.toFixed(2)}`
  }

  const getAmountClass = (amount: number) => {
    return amount >= 0 ? 'text-green-600' : 'text-red-600'
  }

  return (
    <div className="max-w-3xl mx-auto p-3 space-y-4">
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold text-[#00a6ff] mb-1">
          Transaction History
        </h1>
        <p className="text-gray-600 text-sm">
          Track all your gaming transactions and balance changes
        </p>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-xl p-5 border border-[#00a6ff]/20 shadow-lg">
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-600 mb-1">
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
                className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-[#00a6ff]/30 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        transaction.amount >= 0 ? 'bg-green-100' : 'bg-red-100'
                      }`}
                    >
                      {transaction.amount >= 0 ? (
                        <TrendingUp className="w-3 h-3 text-green-600" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-red-600" />
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
                      <p className="text-gray-600 text-xs">
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
                    <p className="text-gray-800 font-medium text-sm">
                      ${transaction.balance_after.toFixed(2)}
                    </p>
                    <p className="text-gray-600 text-xs">Balance After</p>
                  </div>
                </div>
                {transaction.description && transaction.description !== '-' && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <p className="text-gray-700 text-sm">
                      {transaction.description}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {transactions.length > 0 && (
          <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-5 h-5 bg-[#00a6ff] rounded-full flex items-center justify-center">
                <DollarSign className="w-3 h-3 text-white" />
              </div>
              <h4 className="font-medium text-[#00a6ff] text-sm">
                Transaction Summary
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex items-center space-x-2 mb-1">
                  <Clock className="w-4 h-4 text-gray-600" />
                  <span className="text-xs text-gray-600">
                    Total Transactions
                  </span>
                </div>
                <span className="text-lg font-bold text-gray-800">
                  {transactions.length}
                </span>
              </div>
              <div className="bg-white rounded-lg p-3 border border-green-200">
                <div className="flex items-center space-x-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-gray-600">Total Wins</span>
                </div>
                <span className="text-lg font-bold text-green-600">
                  $
                  {transactions
                    .filter(t => t.amount > 0)
                    .reduce((sum, t) => sum + t.amount, 0)
                    .toFixed(2)}
                </span>
              </div>
              <div className="bg-white rounded-lg p-3 border border-red-200">
                <div className="flex items-center space-x-2 mb-1">
                  <TrendingDown className="w-4 h-4 text-red-600" />
                  <span className="text-xs text-gray-600">Total Losses</span>
                </div>
                <span className="text-lg font-bold text-red-600">
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
