'use client'

import { useState, useEffect } from 'react'
import { Save, RefreshCw, AlertCircle, CheckCircle2, Edit3, Eye, EyeOff, Server, Key, Globe } from 'lucide-react'

interface PlatformProvider {
  id: string
  name: string
  server_url: string
  agency_uid: string
  aes_key: string
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

interface PlatformProviderSettingsData {
  provider: PlatformProvider | null
}

export default function PlatformProviderSettings() {
  const [settings, setSettings] = useState<PlatformProviderSettingsData>({
    provider: null
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [showSecrets, setShowSecrets] = useState(false)

  const [formData, setFormData] = useState({
    name: 'Merchant Gaming Platform',
    server_url: 'https://jsgame.live',
    agency_uid: '45370b4f27dfc8a2875ba78d07e8a81a',
    aes_key: '08970240475e1255d2b4ac023ac658f3',
    status: 'active' as 'active' | 'inactive'
  })

  useEffect(() => {
    loadProvider()
  }, [])

  const loadProvider = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/admin/platform-provider', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSettings({ provider: data.provider })
        if (data.provider) {
          setFormData({
            name: data.provider.name,
            server_url: data.provider.server_url,
            agency_uid: data.provider.agency_uid,
            aes_key: data.provider.aes_key,
            status: data.provider.status
          })
        }
      } else {
        // Initialize with current values from server_enhanced.js
        setSettings({
          provider: {
            id: '1',
            name: 'Merchant Gaming Platform',
            server_url: 'https://jsgame.live',
            agency_uid: '45370b4f27dfc8a2875ba78d07e8a81a',
            aes_key: '08970240475e1255d2b4ac023ac658f3',
            status: 'active',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          }
        })
      }
    } catch (error) {
      console.error('Error loading provider:', error)
      setMessage({ type: 'error', text: 'Failed to load platform provider settings' })
    } finally {
      setLoading(false)
    }
  }

  const saveProvider = async () => {
    try {
      setSaving(true)
      const token = localStorage.getItem('adminToken')
      
      const response = await fetch('/api/admin/platform-provider', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Platform provider settings updated successfully' })
        await loadProvider()
        setIsEditing(false)
      } else {
        throw new Error('Failed to save provider')
      }
    } catch (error) {
      console.error('Error saving provider:', error)
      setMessage({ type: 'error', text: 'Failed to save platform provider settings' })
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    saveProvider()
  }

  const toggleSecrets = () => {
    setShowSecrets(!showSecrets)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-6 h-6 animate-spin text-gray-600" />
          <span className="text-gray-600">Loading platform provider settings...</span>
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
              <h2 className="text-2xl font-bold text-gray-900">Platform Provider Settings</h2>
              <p className="text-gray-600">Configure your merchant gaming platform connection</p>
            </div>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Settings</span>
            </button>
          )}
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

      {/* Provider Configuration */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Merchant Platform Configuration</h3>
          <p className="text-sm text-gray-600">API credentials and connection settings for your gaming platform</p>
        </div>

        <div className="p-6">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Platform Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Platform name"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Server URL
                  </label>
                  <input
                    type="url"
                    value={formData.server_url}
                    onChange={(e) => setFormData({ ...formData, server_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://api.merchant.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agency UID
                  </label>
                  <input
                    type="text"
                    value={formData.agency_uid}
                    onChange={(e) => setFormData({ ...formData, agency_uid: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your agency UID from merchant"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    AES Key
                  </label>
                  <input
                    type="password"
                    value={formData.aes_key}
                    onChange={(e) => setFormData({ ...formData, aes_key: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your AES encryption key"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
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
                    setIsEditing(false)
                    if (settings.provider) {
                      setFormData({
                        name: settings.provider.name,
                        server_url: settings.provider.server_url,
                        agency_uid: settings.provider.agency_uid,
                        aes_key: settings.provider.aes_key,
                        status: settings.provider.status
                      })
                    }
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
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {settings.provider ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Platform Name</label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <Server className="w-5 h-5 text-gray-400 mr-3" />
                        <span className="text-gray-900 font-medium">{settings.provider.name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Server URL</label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <Globe className="w-5 h-5 text-gray-400 mr-3" />
                        <span className="text-gray-900">{settings.provider.server_url}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Agency UID</label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <Key className="w-5 h-5 text-gray-400 mr-3" />
                        <code className="text-sm bg-white px-2 py-1 rounded border">
                          {settings.provider.agency_uid}
                        </code>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">AES Key</label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Key className="w-5 h-5 text-gray-400 mr-3" />
                          <code className="text-sm bg-white px-2 py-1 rounded border">
                            {showSecrets 
                              ? settings.provider.aes_key 
                              : '••••••••••••••••••••••••••••••••'
                            }
                          </code>
                        </div>
                        <button
                          onClick={toggleSecrets}
                          className="ml-2 text-gray-400 hover:text-gray-600"
                        >
                          {showSecrets ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        settings.provider.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {settings.provider.status}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600 text-sm">
                        {new Date(settings.provider.updated_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Server className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No platform provider configured</h3>
                  <p className="mt-1 text-sm text-gray-500">Configure your merchant platform connection to get started.</p>
                  <div className="mt-6">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Configure Platform
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Information Panel */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <h3 className="text-sm font-medium text-blue-900 mb-2">About Merchant Platform Integration</h3>
        <div className="text-xs text-blue-800 space-y-1">
          <p>• <strong>Single Provider Model</strong>: Your merchant serves as the unified gaming platform provider</p>
          <p>• <strong>Multi-Brand Support</strong>: Access games from JILI, Pragmatic Play, PG Soft, and more through your merchant</p>
          <p>• <strong>Unified API</strong>: All game brands use the same Server URL, Agency UID, and AES Key</p>
          <p>• <strong>Game Management</strong>: Add games by specifying Game Code, Name, UID, Type, RTP, Currency, and Language</p>
        </div>
      </div>
    </div>
  )
}
