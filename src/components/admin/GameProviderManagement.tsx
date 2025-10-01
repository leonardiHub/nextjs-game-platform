'use client'

import { useState, useEffect } from 'react'
import { Save, RefreshCw, AlertCircle, CheckCircle2, Plus, Edit3, Trash2, Gamepad2, Image as ImageIcon } from 'lucide-react'


interface GameProvider {
  id: string
  name: string
  code: string
  description: string
  logo_url?: string
  status: 'active' | 'inactive'
  game_count: number
  created_at: string
  updated_at: string
}

interface GameProvidersData {
  providers: GameProvider[]
}

export default function GameProviderManagement() {
  const [data, setData] = useState<GameProvidersData>({ providers: [] })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProvider, setEditingProvider] = useState<GameProvider | null>(null)

  const [newProvider, setNewProvider] = useState({
    name: '',
    code: '',
    description: '',
    logo_url: '',
    status: 'active' as 'active' | 'inactive'
  })

  useEffect(() => {
    loadProviders()
  }, [])

  const loadProviders = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/admin/game-library-providers', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const result = await response.json()
        setData(result)
      } else {
        // Load default providers if API not implemented
        setData({
          providers: [
            {
              id: '1',
              name: 'JILI Gaming',
              code: 'JILI',
              description: 'Asian-focused online casino games (not displayed in frontend)',
              logo_url: '/images/providers/jili-logo.png',
              status: 'inactive',
              game_count: 5,
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z'
            },
            {
              id: '2',
              name: 'PG Soft',
              code: 'PG',
              description: 'Mobile-first game developer known for stunning visuals and unique features',
              logo_url: '/images/providers/pgsoft-logo.png',
              status: 'active',
              game_count: 28,
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z'
            },
            {
              id: '3',
              name: 'Pragmatic Play',
              code: 'PP',
              description: 'Leading content provider for the iGaming industry (no games currently)',
              logo_url: '/images/providers/pragmatic-logo.png',
              status: 'active',
              game_count: 0,
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

  const saveProvider = async (provider: typeof newProvider & { id?: string }) => {
    try {
      setSaving(true)
      const token = localStorage.getItem('adminToken')
      
      // Use editingProvider's id if we're editing
      const providerData = editingProvider ? { ...provider, id: editingProvider.id } : provider
      
      const url = providerData.id ? `/api/admin/game-library-providers/${providerData.id}` : '/api/admin/game-library-providers'
      const method = providerData.id ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(providerData)
      })

      if (response.ok) {
        setMessage({ type: 'success', text: `Provider ${providerData.id ? 'updated' : 'created'} successfully` })
        await loadProviders()
        setShowAddForm(false)
        setEditingProvider(null)
        resetNewProvider()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save provider')
      }
    } catch (error) {
      console.error('Error saving provider:', error)
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to save provider' })
    } finally {
      setSaving(false)
    }
  }

  const deleteProvider = async (providerId: string) => {
    if (!confirm('Are you sure you want to delete this provider? This will affect all associated games.')) {
      return
    }

    try {
      setSaving(true)
      const token = localStorage.getItem('adminToken')
      
      const response = await fetch(`/api/admin/game-library-providers/${providerId}`, {
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

  const resetNewProvider = () => {
    setNewProvider({
      name: '',
      code: '',
      description: '',
      logo_url: '',
      status: 'active'
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    saveProvider(newProvider)
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
            <div className="p-2 bg-green-100 rounded-lg">
              <Gamepad2 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Game Provider Management</h2>
              <p className="text-gray-600">Manage game providers available through Game Library</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
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

      {/* Add/Edit Form */}
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
                resetNewProvider()
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
                  Provider Name *
                </label>
                <input
                  type="text"
                  value={newProvider.name}
                  onChange={(e) => setNewProvider({ ...newProvider, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., JILI Gaming"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provider Code *
                </label>
                <input
                  type="text"
                  value={newProvider.code}
                  onChange={(e) => setNewProvider({ ...newProvider, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., JILI"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newProvider.description}
                  onChange={(e) => setNewProvider({ ...newProvider, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                  placeholder="Brief description of the game provider"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo URL
                </label>
                <input
                  type="url"
                  value={newProvider.logo_url}
                  onChange={(e) => setNewProvider({ ...newProvider, logo_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="/images/providers/provider-logo.png"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={newProvider.status}
                  onChange={(e) => setNewProvider({ ...newProvider, status: e.target.value as 'active' | 'inactive' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                  resetNewProvider()
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
          <h3 className="text-lg font-semibold text-gray-900">Available Game Providers</h3>
          <p className="text-sm text-gray-600">
            {data.providers.length} providers • {data.providers.reduce((sum, provider) => sum + provider.game_count, 0)} total games
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {data.providers.map((provider) => (
            <div key={provider.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {provider.logo_url ? (
                    <img 
                      src={provider.logo_url} 
                      alt={provider.name}
                      className="w-10 h-10 rounded-lg object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        target.nextElementSibling?.classList.remove('hidden')
                      }}
                    />
                  ) : null}
                  <div className={`w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center ${provider.logo_url ? 'hidden' : ''}`}>
                    <Gamepad2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{provider.name}</h4>
                    <p className="text-sm text-gray-500">{provider.code}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  provider.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {provider.status}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {provider.description || 'No description available'}
              </p>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  <span className="font-medium text-gray-900">{provider.game_count}</span> games
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setEditingProvider(provider)
                      setNewProvider({
                        name: provider.name,
                        code: provider.code,
                        description: provider.description,
                        logo_url: provider.logo_url || '',
                        status: provider.status
                      })
                    }}
                    className="text-green-600 hover:text-green-900"
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
              </div>
            </div>
          ))}
        </div>

        {data.providers.length === 0 && (
          <div className="text-center py-12">
            <Gamepad2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No game providers</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding your first game provider.</p>
            <div className="mt-6">
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
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
