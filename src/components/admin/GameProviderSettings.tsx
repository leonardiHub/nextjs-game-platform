'use client'

import { useState, useEffect } from 'react'
import { Save, RefreshCw, AlertCircle, CheckCircle2, Plus, Edit3, Trash2, Eye, EyeOff, Server, Key, Globe } from 'lucide-react'

interface GameProvider {
  id: string
  name: string
  code: string
  agency_uid: string
  aes_key: string
  server_url: string
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

interface GameProviderSettingsData {
  providers: GameProvider[]
}

export default function GameProviderSettings() {
  const [settings, setSettings] = useState<GameProviderSettingsData>({
    providers: []
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProvider, setEditingProvider] = useState<GameProvider | null>(null)
  const [showSecrets, setShowSecrets] = useState<{[key: string]: boolean}>({})

  const [newProvider, setNewProvider] = useState<Partial<GameProvider>>({
    name: '',
    code: '',
    agency_uid: '',
    aes_key: '',
    server_url: '',
    status: 'active'
  })

  useEffect(() => {
    loadProviders()
  }, [])

  const loadProviders = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/admin/game-providers', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      } else {
        // Load default/demo data if API not implemented
        setSettings({
          providers: [
            {
              id: '1',
              name: 'JILI Gaming',
              code: 'JILI',
              agency_uid: '45370b4f27dfc8a2875ba78d07e8a81a',
              aes_key: '08970240475e1255d2b4ac023ac658f3',
              server_url: 'https://jsgame.live',
              status: 'active',
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z'
            }
          ]
        })
      }
    } catch (error) {
      console.error('Error loading providers:', error)
      setMessage({ type: 'error', text: 'Failed to load game providers' })
    } finally {
      setLoading(false)
    }
  }

  const saveProvider = async (provider: Partial<GameProvider>) => {
    try {
      setSaving(true)
      const token = localStorage.getItem('adminToken')
      
      const url = provider.id ? `/api/admin/game-providers/${provider.id}` : '/api/admin/game-providers'
      const method = provider.id ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(provider)
      })

      if (response.ok) {
        setMessage({ type: 'success', text: `Provider ${provider.id ? 'updated' : 'created'} successfully` })
        await loadProviders()
        setShowAddForm(false)
        setEditingProvider(null)
        setNewProvider({
          name: '',
          code: '',
          agency_uid: '',
          aes_key: '',
          server_url: '',
          status: 'active'
        })
      } else {
        throw new Error('Failed to save provider')
      }
    } catch (error) {
      console.error('Error saving provider:', error)
      setMessage({ type: 'error', text: 'Failed to save provider' })
    } finally {
      setSaving(false)
    }
  }

  const deleteProvider = async (providerId: string) => {
    if (!confirm('Are you sure you want to delete this provider? This action cannot be undone.')) {
      return
    }

    try {
      setSaving(true)
      const token = localStorage.getItem('adminToken')
      
      const response = await fetch(`/api/admin/game-providers/${providerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Provider deleted successfully' })
        await loadProviders()
      } else {
        throw new Error('Failed to delete provider')
      }
    } catch (error) {
      console.error('Error deleting provider:', error)
      setMessage({ type: 'error', text: 'Failed to delete provider' })
    } finally {
      setSaving(false)
    }
  }

  const toggleSecret = (providerId: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [providerId]: !prev[providerId]
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const providerData = editingProvider ? { ...editingProvider } : newProvider
    saveProvider(providerData)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-6 h-6 animate-spin text-gray-600" />
          <span className="text-gray-600">Loading game providers...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Server className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Game Provider Settings</h2>
              <p className="text-gray-600">Manage game provider configurations and API credentials</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span>Add Provider</span>
          </button>
        </div>

        {message && (
          <div className={`mt-4 p-4 rounded-lg flex items-center space-x-2 ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{message.text}</span>
          </div>
        )}
      </div>

      {/* Add/Edit Provider Form */}
      {(showAddForm || editingProvider) && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {editingProvider ? 'Edit Provider' : 'Add New Provider'}
            </h3>
            <button
              onClick={() => {
                setShowAddForm(false)
                setEditingProvider(null)
                setNewProvider({
                  name: '',
                  code: '',
                  agency_uid: '',
                  aes_key: '',
                  server_url: '',
                  status: 'active'
                })
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provider Name
                </label>
                <input
                  type="text"
                  value={editingProvider ? editingProvider.name : newProvider.name}
                  onChange={(e) => {
                    if (editingProvider) {
                      setEditingProvider({ ...editingProvider, name: e.target.value })
                    } else {
                      setNewProvider({ ...newProvider, name: e.target.value })
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., JILI Gaming"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provider Code
                </label>
                <input
                  type="text"
                  value={editingProvider ? editingProvider.code : newProvider.code}
                  onChange={(e) => {
                    if (editingProvider) {
                      setEditingProvider({ ...editingProvider, code: e.target.value })
                    } else {
                      setNewProvider({ ...newProvider, code: e.target.value })
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., JILI"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Agency UID
                </label>
                <input
                  type="text"
                  value={editingProvider ? editingProvider.agency_uid : newProvider.agency_uid}
                  onChange={(e) => {
                    if (editingProvider) {
                      setEditingProvider({ ...editingProvider, agency_uid: e.target.value })
                    } else {
                      setNewProvider({ ...newProvider, agency_uid: e.target.value })
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 45370b4f27dfc8a2875ba78d07e8a81a"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AES Key
                </label>
                <input
                  type="password"
                  value={editingProvider ? editingProvider.aes_key : newProvider.aes_key}
                  onChange={(e) => {
                    if (editingProvider) {
                      setEditingProvider({ ...editingProvider, aes_key: e.target.value })
                    } else {
                      setNewProvider({ ...newProvider, aes_key: e.target.value })
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter AES encryption key"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Server URL
                </label>
                <input
                  type="url"
                  value={editingProvider ? editingProvider.server_url : newProvider.server_url}
                  onChange={(e) => {
                    if (editingProvider) {
                      setEditingProvider({ ...editingProvider, server_url: e.target.value })
                    } else {
                      setNewProvider({ ...newProvider, server_url: e.target.value })
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://api.provider.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={editingProvider ? editingProvider.status : newProvider.status}
                  onChange={(e) => {
                    const status = e.target.value as 'active' | 'inactive'
                    if (editingProvider) {
                      setEditingProvider({ ...editingProvider, status })
                    } else {
                      setNewProvider({ ...newProvider, status })
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false)
                  setEditingProvider(null)
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving && <RefreshCw className="w-4 h-4 animate-spin" />}
                <span>{editingProvider ? 'Update Provider' : 'Add Provider'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Providers List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Active Providers</h3>
          <p className="text-sm text-gray-600">Manage your game provider configurations</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Provider
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Server URL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Agency UID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  AES Key
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {settings.providers.map((provider) => (
                <tr key={provider.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg mr-3">
                        <Server className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{provider.name}</div>
                        <div className="text-sm text-gray-500">{provider.code}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Globe className="w-4 h-4 text-gray-400 mr-2" />
                      {provider.server_url}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {provider.agency_uid.substring(0, 8)}...
                      </code>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {showSecrets[provider.id] 
                          ? provider.aes_key 
                          : '••••••••••••••••'
                        }
                      </code>
                      <button
                        onClick={() => toggleSecret(provider.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {showSecrets[provider.id] ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      provider.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {provider.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => setEditingProvider(provider)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteProvider(provider.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {settings.providers.length === 0 && (
          <div className="text-center py-12">
            <Server className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No providers</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding your first game provider.</p>
            <div className="mt-6">
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Provider
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
