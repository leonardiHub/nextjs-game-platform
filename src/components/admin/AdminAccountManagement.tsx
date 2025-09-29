'use client'

import { useState, useEffect } from 'react'
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  RefreshCw, 
  Shield, 
  Crown, 
  User,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  X
} from 'lucide-react'

interface AdminAccount {
  id: number
  username: string
  role: 'admin' | 'super_admin' | 'moderator'
  created_at: string
}

interface AdminAccountFormData {
  username: string
  password: string
  role: 'admin' | 'super_admin' | 'moderator'
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function AdminAccountManagement() {
  const [admins, setAdmins] = useState<AdminAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState<AdminAccount | null>(null)

  // Form states
  const [formData, setFormData] = useState<AdminAccountFormData>({
    username: '',
    password: '',
    role: 'admin'
  })
  const [showPassword, setShowPassword] = useState(false)
  const [formLoading, setFormLoading] = useState(false)

  // Message state
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Current admin info
  const [currentAdmin, setCurrentAdmin] = useState({ role: 'admin', id: 0 })

  useEffect(() => {
    loadAdmins()
    loadCurrentAdminInfo()
  }, [pagination.page, searchTerm])

  const loadCurrentAdminInfo = () => {
    const token = localStorage.getItem('adminToken')
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        setCurrentAdmin({
          role: payload.role || 'admin',
          id: payload.adminId || 0
        })
      } catch (error) {
        console.error('Failed to parse admin token:', error)
      }
    }
  }

  const loadAdmins = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('adminToken')
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: searchTerm
      })

      const response = await fetch(`/api/admin/accounts?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setAdmins(data.admins)
        setPagination(data.pagination)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to load admin accounts')
      }
    } catch (error) {
      console.error('Error loading admins:', error)
      showMessage('error', 'Failed to load admin accounts')
    } finally {
      setLoading(false)
    }
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const handleCreateAdmin = async () => {
    if (!formData.username || !formData.password) {
      showMessage('error', 'Username and password are required')
      return
    }

    try {
      setFormLoading(true)
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/admin/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        showMessage('success', 'Admin account created successfully')
        setShowCreateModal(false)
        resetForm()
        loadAdmins()
      } else {
        throw new Error(data.error || 'Failed to create admin account')
      }
    } catch (error: any) {
      showMessage('error', error.message)
    } finally {
      setFormLoading(false)
    }
  }

  const handleUpdateAdmin = async () => {
    if (!selectedAdmin || !formData.username) {
      showMessage('error', 'Username is required')
      return
    }

    try {
      setFormLoading(true)
      const token = localStorage.getItem('adminToken')
      
      // Only send fields that have values
      const updateData: any = {
        username: formData.username,
        role: formData.role
      }
      
      if (formData.password) {
        updateData.password = formData.password
      }

      const response = await fetch(`/api/admin/accounts/${selectedAdmin.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      })

      const data = await response.json()

      if (response.ok) {
        showMessage('success', 'Admin account updated successfully')
        setShowEditModal(false)
        resetForm()
        loadAdmins()
      } else {
        throw new Error(data.error || 'Failed to update admin account')
      }
    } catch (error: any) {
      showMessage('error', error.message)
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteAdmin = async () => {
    if (!selectedAdmin) return

    try {
      setFormLoading(true)
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/accounts/${selectedAdmin.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (response.ok) {
        showMessage('success', 'Admin account deleted successfully')
        setShowDeleteModal(false)
        setSelectedAdmin(null)
        loadAdmins()
      } else {
        throw new Error(data.error || 'Failed to delete admin account')
      }
    } catch (error: any) {
      showMessage('error', error.message)
    } finally {
      setFormLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      role: 'admin'
    })
    setShowPassword(false)
    setSelectedAdmin(null)
  }

  const openCreateModal = () => {
    resetForm()
    setShowCreateModal(true)
  }

  const openEditModal = (admin: AdminAccount) => {
    setSelectedAdmin(admin)
    setFormData({
      username: admin.username,
      password: '',
      role: admin.role
    })
    setShowEditModal(true)
  }

  const openDeleteModal = (admin: AdminAccount) => {
    setSelectedAdmin(admin)
    setShowDeleteModal(true)
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Crown className="w-4 h-4 text-yellow-600" />
      case 'admin':
        return <Shield className="w-4 h-4 text-blue-600" />
      case 'moderator':
        return <User className="w-4 h-4 text-green-600" />
      default:
        return <User className="w-4 h-4 text-gray-600" />
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'admin':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'moderator':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const canManageAdmin = (adminRole: string, targetAdminId: number) => {
    // Super admins can manage all except themselves for deletion
    if (currentAdmin.role === 'super_admin') {
      return true
    }
    // Regular admins can only manage their own account
    return currentAdmin.id === targetAdminId
  }

  const canDeleteAdmin = (targetAdminId: number) => {
    // Only super admins can delete, and not themselves
    return currentAdmin.role === 'super_admin' && currentAdmin.id !== targetAdminId
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-6 h-6 animate-spin text-gray-600" />
          <span className="text-gray-600">Loading admin accounts...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gray-900 rounded-lg">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Admin Account Management</h2>
            <p className="text-gray-600">Manage administrator accounts and permissions</p>
          </div>
        </div>
        {currentAdmin.role === 'super_admin' && (
          <button
            onClick={openCreateModal}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Admin</span>
          </button>
        )}
      </div>

      {/* Message */}
      {message && (
        <div className={`flex items-center space-x-3 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600" />
          )}
          <span className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {message.text}
          </span>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by username or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
          <button
            onClick={loadAdmins}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Admin Accounts Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {admins.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    No admin accounts found
                  </td>
                </tr>
              ) : (
                admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {getRoleIcon(admin.role)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {admin.username}
                            {currentAdmin.id === admin.id && (
                              <span className="ml-2 text-xs text-blue-600">(You)</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">ID: {admin.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(admin.role)}`}>
                        {admin.role.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(admin.created_at).toLocaleDateString('zh-CN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {canManageAdmin(admin.role, admin.id) && (
                          <button
                            onClick={() => openEditModal(admin)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit admin"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {canDeleteAdmin(admin.id) && (
                          <button
                            onClick={() => openDeleteModal(admin)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete admin"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Admin Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Create Admin Account</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="Enter username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                >
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="moderator">Moderator</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAdmin}
                disabled={formLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {formLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                <span>Create Admin</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Admin Modal */}
      {showEditModal && selectedAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Admin Account</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="Enter username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password (leave empty to keep current)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {currentAdmin.role === 'super_admin' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  >
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                    <option value="moderator">Moderator</option>
                  </select>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateAdmin}
                disabled={formLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {formLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                <span>Update Admin</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Admin Modal */}
      {showDeleteModal && selectedAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Delete Admin Account</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <div>
                  <p className="text-sm text-red-800">
                    Are you sure you want to delete the admin account <strong>{selectedAdmin.username}</strong>?
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAdmin}
                disabled={formLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {formLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                <span>Delete Admin</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
