'use client'

import { useState, useEffect } from 'react'

interface User {
  id: number
  username: string
  email: string
  balance: number
  created_at: string
  last_login: string
  status: string
}

interface UserManagementProps {
  onStatsUpdate: () => void
}

export default function UserManagement({ onStatsUpdate }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    balance: 0
  })

  useEffect(() => {
    loadUsers()
  }, [])

  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        headers: getAuthHeaders()
      })
      const data = await response.json()
      
      if (response.ok) {
        setUsers(data.users || [])
      } else {
        console.error('Failed to load users:', data.error)
      }
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setEditForm({
      username: user.username,
      email: user.email,
      balance: user.balance
    })
    setShowEditModal(true)
  }

  const handleSaveUser = async () => {
    if (!selectedUser) return

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(editForm)
      })

      if (response.ok) {
        await loadUsers()
        onStatsUpdate()
        setShowEditModal(false)
        setSelectedUser(null)
      } else {
        const data = await response.json()
        alert(`Failed to update user: ${data.error}`)
      }
    } catch (error) {
      console.error('Error updating user:', error)
      alert('Failed to update user')
    }
  }

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })

      if (response.ok) {
        await loadUsers()
        onStatsUpdate()
      } else {
        const data = await response.json()
        alert(`Failed to delete user: ${data.error}`)
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Failed to delete user')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatBalance = (balance: number) => {
    return `$${balance.toFixed(2)}`
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
        <h2 className="text-2xl font-semibold text-gray-900">User Management</h2>
        <div className="text-sm text-gray-600">
          Total Users: {users.length}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="border-b border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">ID</th>
              <th className="border-b border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">Username</th>
              <th className="border-b border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">Email</th>
              <th className="border-b border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">Balance</th>
              <th className="border-b border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">Created</th>
              <th className="border-b border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">Last Login</th>
              <th className="border-b border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="border-b border-gray-200 px-4 py-3">{user.id}</td>
                <td className="border-b border-gray-200 px-4 py-3 font-medium">{user.username}</td>
                <td className="border-b border-gray-200 px-4 py-3">{user.email}</td>
                <td className="border-b border-gray-200 px-4 py-3 font-mono">
                  <span className={user.balance >= 1000 ? 'text-green-600 font-semibold' : 'text-gray-800'}>
                    {formatBalance(user.balance)}
                  </span>
                </td>
                <td className="border-b border-gray-200 px-4 py-3 text-sm text-gray-600">
                  {formatDate(user.created_at)}
                </td>
                <td className="border-b border-gray-200 px-4 py-3 text-sm text-gray-600">
                  {user.last_login ? formatDate(user.last_login) : 'Never'}
                </td>
                <td className="border-b border-gray-200 px-4 py-3">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No users found
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit User: {selectedUser.username}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Balance ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editForm.balance}
                  onChange={(e) => setEditForm({ ...editForm, balance: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUser}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
