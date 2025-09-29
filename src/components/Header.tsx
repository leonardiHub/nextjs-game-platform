'use client'

import Navbar from '@/components/Navbar'
import { User, Transaction, Withdrawal } from '@/types'

interface HeaderProps {
  user: User | null
  balance: number
  canWithdraw: boolean
  onLogout: () => void
  onRefreshBalance: () => void
  isRefreshing: boolean
  onLogin?: (user: User, token: string) => void
  withdrawals: Withdrawal[]
  onWithdrawalSubmit: (bankDetails: {
    bank_name: string
    account_number: string
    account_holder: string
    bank_branch: string
  }) => Promise<boolean>
  transactions: Transaction[]
  onKYCUpload: (formData: FormData) => Promise<boolean>
}

export default function Header({
  user,
  balance,
  canWithdraw,
  onLogout,
  onRefreshBalance,
  isRefreshing,
  onLogin,
  withdrawals,
  onWithdrawalSubmit,
  transactions,
  onKYCUpload,
}: HeaderProps) {
  return (
    <div className="w-full flex items-center justify-center">
      <Navbar
        user={user}
        balance={balance}
        canWithdraw={canWithdraw}
        onLogout={onLogout}
        onRefreshBalance={onRefreshBalance}
        isRefreshing={isRefreshing}
        onLogin={onLogin}
        withdrawals={withdrawals}
        onWithdrawalSubmit={onWithdrawalSubmit}
        transactions={transactions}
        onKYCUpload={onKYCUpload}
      />
    </div>
  )
}
