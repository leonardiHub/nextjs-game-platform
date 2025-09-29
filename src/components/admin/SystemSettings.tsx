'use client'

import { useState, useEffect } from 'react'
import { Save, RefreshCw, AlertCircle, CheckCircle2, DollarSign, Gift, Settings, Database } from 'lucide-react'

interface SystemSettingsData {
  wallet: {
    freeCreditAmount: number
    minBalanceThreshold: number
    withdrawalThreshold: number
    withdrawalAmount: number
  }
  security: {
    sessionTimeout: number
    maxLoginAttempts: number
    passwordMinLength: number
  }
}

export default function SystemSettings() {
  const [settings, setSettings] = useState<SystemSettingsData>({
    wallet: {
      freeCreditAmount: 50,
      minBalanceThreshold: 0.1,
      withdrawalThreshold: 1000,
      withdrawalAmount: 50
    },
    security: {
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      passwordMinLength: 6
    }
  })
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/admin/settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      } else {
        throw new Error('Failed to load settings')
      }
    } catch (error) {
      console.error('Error loading settings:', error)
      setMessage({ type: 'error', text: 'Failed to load settings, please try again' })
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    try {
      setSaving(true)
      setMessage(null)
      
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      })
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'Settings saved successfully!' })
        setTimeout(() => setMessage(null), 3000)
      } else {
        throw new Error('Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      setMessage({ type: 'error', text: 'Failed to save settings, please try again' })
    } finally {
      setSaving(false)
    }
  }

  const updateWalletSetting = (key: keyof SystemSettingsData['wallet'], value: number) => {
    setSettings(prev => ({
      ...prev,
      wallet: {
        ...prev.wallet,
        [key]: value
      }
    }))
  }


  const updateSecuritySetting = (key: keyof SystemSettingsData['security'], value: number) => {
    setSettings(prev => ({
      ...prev,
      security: {
        ...prev.security,
        [key]: value
      }
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-6 h-6 animate-spin text-gray-600" />
          <span className="text-gray-600">Loading system settings...</span>
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
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
            <p className="text-gray-600">Manage platform core parameters and configuration</p>
          </div>
        </div>
        <button
          onClick={saveSettings}
          disabled={saving}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Wallet Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Wallet Settings</h3>
              <p className="text-sm text-gray-600">Manage user balance and withdrawal parameters</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New User Free Credit Amount ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={settings.wallet.freeCreditAmount || 0}
                onChange={(e) => updateWalletSetting('freeCreditAmount', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="50.00"
              />
              <p className="text-xs text-gray-500 mt-1">Amount of free credits given to newly registered users</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Balance Threshold ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={settings.wallet.minBalanceThreshold || 0}
                onChange={(e) => updateWalletSetting('minBalanceThreshold', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="0.10"
              />
              <p className="text-xs text-gray-500 mt-1">All balance will be cleared when total balance falls to or below this amount</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Withdrawal Threshold ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={settings.wallet.withdrawalThreshold || 0}
                onChange={(e) => updateWalletSetting('withdrawalThreshold', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="1000.00"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum balance required to enable withdrawal</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Standard Withdrawal Amount ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={settings.wallet.withdrawalAmount || 0}
                onChange={(e) => updateWalletSetting('withdrawalAmount', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="50.00"
              />
              <p className="text-xs text-gray-500 mt-1">Fixed amount that users can apply for withdrawal (one-time only)</p>
            </div>
          </div>
        </div>


        {/* Security Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
              <p className="text-sm text-gray-600">Manage platform security-related parameters</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                min="5"
                max="120"
                value={settings.security.sessionTimeout || 30}
                onChange={(e) => updateSecuritySetting('sessionTimeout', parseInt(e.target.value) || 30)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="30"
              />
              <p className="text-xs text-gray-500 mt-1">User session automatic expiration time</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Login Attempts
              </label>
              <input
                type="number"
                min="3"
                max="10"
                value={settings.security.maxLoginAttempts || 5}
                onChange={(e) => updateSecuritySetting('maxLoginAttempts', parseInt(e.target.value) || 5)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="5"
              />
              <p className="text-xs text-gray-500 mt-1">Maximum failed attempts before account lockout</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Password Length
              </label>
              <input
                type="number"
                min="6"
                max="20"
                value={settings.security.passwordMinLength || 6}
                onChange={(e) => updateSecuritySetting('passwordMinLength', parseInt(e.target.value) || 6)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="6"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum length requirement for user passwords</p>
            </div>
          </div>
        </div>

        {/* Database Stats */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Database className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
              <p className="text-sm text-gray-600">Current system runtime status information</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Configuration Status</span>
              <span className="text-sm font-medium text-green-600">Running Normally</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Database Connection</span>
              <span className="text-sm font-medium text-green-600">Connected</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Last Updated</span>
              <span className="text-sm font-medium text-gray-900">Just now</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">System Version</span>
              <span className="text-sm font-medium text-gray-900">v1.0.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
