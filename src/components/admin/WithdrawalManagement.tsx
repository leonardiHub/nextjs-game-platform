'use client'

import { useState, useEffect } from 'react'

interface Withdrawal {
  id: number
  user_id: number
  username: string
  amount: number
  status: string
  created_at: string
  processed_at: string
  admin_notes: string
}

interface WithdrawalManagementProps {
  onStatsUpdate: () => void
}

export default function WithdrawalManagement({ onStatsUpdate }: WithdrawalManagementProps) {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null)
  const [showProcessModal, setShowProcessModal] = useState(false)
  const [processForm, setProcessForm] = useState({
    action: 'approve',
    admin_notes: ''
  })

  useEffect(() => {
    loadWithdrawals()
  }, [])

  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  const loadWithdrawals = async () => {
    try {
      const response = await fetch('/api/admin/withdrawals', {
        headers: getAuthHeaders()
      })
      const data = await response.json()
      
      if (response.ok) {
        setWithdrawals(data.withdrawals || [])
      } else {
        console.error('Failed to load withdrawals:', data.error)
      }
    } catch (error) {
      console.error('Error loading withdrawals:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProcessWithdrawal = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal)
    setProcessForm({
      action: 'approve',
      admin_notes: ''
    })
    setShowProcessModal(true)
  }

  const handleSaveProcess = async () => {
    if (!selectedWithdrawal) return

    try {
      const response = await fetch(`/api/admin/withdrawal/${selectedWithdrawal.id}/process`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(processForm)
      })

      if (response.ok) {
        await loadWithdrawals()
        onStatsUpdate()
        setShowProcessModal(false)
        setSelectedWithdrawal(null)
      } else {
        const data = await response.json()
        alert(`Failed to process withdrawal: ${data.error}`)
      }
    } catch (error) {
      console.error('Error processing withdrawal:', error)
      alert('Failed to process withdrawal')
    }
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-block px-3 py-1 rounded-full text-xs font-medium uppercase"
    
    switch (status) {
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      case 'approved':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatAmount = (amount: number) => {
    return `$${amount.toFixed(2)}`
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Withdrawal Management</h2>
        <div className="text-sm text-gray-600">
          Total: {withdrawals.length} | Pending: {withdrawals.filter(w => w.status === 'pending').length}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="border-b border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">ID</th>
              <th className="border-b border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">User</th>
              <th className="border-b border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">Amount</th>
              <th className="border-b border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">Status</th>
              <th className="border-b border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">Requested</th>
              <th className="border-b border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">Processed</th>
              <th className="border-b border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">Notes</th>
              <th className="border-b border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {withdrawals.map((withdrawal) => (
              <tr key={withdrawal.id} className="hover:bg-gray-50">
                <td className="border-b border-gray-200 px-4 py-3">{withdrawal.id}</td>
                <td className="border-b border-gray-200 px-4 py-3 font-medium">{withdrawal.username}</td>
                <td className="border-b border-gray-200 px-4 py-3 font-mono font-semibold text-green-600">
                  {formatAmount(withdrawal.amount)}
                </td>
                <td className="border-b border-gray-200 px-4 py-3">
                  <span className={getStatusBadge(withdrawal.status)}>
                    {withdrawal.status}
                  </span>
                </td>
                <td className="border-b border-gray-200 px-4 py-3 text-sm text-gray-600">
                  {formatDate(withdrawal.created_at)}
                </td>
                <td className="border-b border-gray-200 px-4 py-3 text-sm text-gray-600">
                  {formatDate(withdrawal.processed_at)}
                </td>
                <td className="border-b border-gray-200 px-4 py-3 text-sm">
                  {withdrawal.admin_notes ? (
                    <div className="max-w-xs truncate" title={withdrawal.admin_notes}>
                      {withdrawal.admin_notes}
                    </div>
                  ) : (
                    <span className="text-gray-400">No notes</span>
                  )}
                </td>
                <td className="border-b border-gray-200 px-4 py-3">
                  {withdrawal.status === 'pending' ? (
                    <button
                      onClick={() => handleProcessWithdrawal(withdrawal)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      Process
                    </button>
                  ) : (
                    <span className="text-gray-400 text-sm">Processed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {withdrawals.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No withdrawal requests found
        </div>
      )}

      {/* Process Withdrawal Modal */}
      {showProcessModal && selectedWithdrawal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              Process Withdrawal #{selectedWithdrawal.id}
            </h3>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><strong>User:</strong> {selectedWithdrawal.username}</div>
                <div><strong>Amount:</strong> {formatAmount(selectedWithdrawal.amount)}</div>
                <div><strong>Requested:</strong> {formatDate(selectedWithdrawal.created_at)}</div>
                <div><strong>Status:</strong> 
                  <span className={`ml-1 ${getStatusBadge(selectedWithdrawal.status)}`}>
                    {selectedWithdrawal.status}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="action"
                      value="approve"
                      checked={processForm.action === 'approve'}
                      onChange={(e) => setProcessForm({ ...processForm, action: e.target.value })}
                      className="mr-2"
                    />
                    <span className="text-green-600">Approve</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="action"
                      value="reject"
                      checked={processForm.action === 'reject'}
                      onChange={(e) => setProcessForm({ ...processForm, action: e.target.value })}
                      className="mr-2"
                    />
                    <span className="text-red-600">Reject</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notes</label>
                <textarea
                  value={processForm.admin_notes}
                  onChange={(e) => setProcessForm({ ...processForm, admin_notes: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter admin notes..."
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowProcessModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProcess}
                className={`px-4 py-2 text-white rounded-lg ${
                  processForm.action === 'approve' 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {processForm.action === 'approve' ? 'Approve' : 'Reject'} Withdrawal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
