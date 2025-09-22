export interface User {
  id: number
  username: string
  full_name: string
  kyc_status: 'pending' | 'submitted' | 'approved' | 'rejected'
  created_at: string
}

export interface GameData {
  game_uid: string
  name: string
  type: string
  category?: string
}

export interface Transaction {
  id: number
  transaction_type: string
  amount: number
  balance_after: number
  description?: string
  created_at: string
}

export interface Withdrawal {
  id: number
  amount: number
  status: 'pending' | 'approved' | 'rejected' | 'submitted'
  admin_notes?: string
  created_at: string
  bank_details?: {
    bank_name: string
    account_number: string
    account_holder: string
    bank_branch: string
  }
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface GameLaunchResponse {
  success: boolean
  game_url?: string
  error?: string
}

export interface BalanceResponse {
  balance: number
  free_credit: number
  can_withdraw: boolean
}
