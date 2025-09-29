'use client'

import { useState, useEffect } from 'react'
import { Save, RefreshCw, AlertCircle, CheckCircle2, Target, Eye, BarChart3, Globe, Code, Settings } from 'lucide-react'

interface AdvertisingSettingsData {
  facebook: {
    pixelId: string
    accessToken: string
    conversionApiEnabled: boolean
    testEventCode: string
    events: {
      pageView: boolean
      purchase: boolean
      addToCart: boolean
      initiateCheckout: boolean
      completeRegistration: boolean
      deposit: boolean
      withdrawal: boolean
    }
  }
  google: {
    analyticsId: string
    adsId: string
    tagManagerId: string
    conversionId: string
    conversionLabel: string
    enhancedConversions: boolean
  }
  tiktok: {
    pixelId: string
    accessToken: string
    eventsApiEnabled: boolean
  }
  tracking: {
    utmTracking: boolean
    crossDomainTracking: boolean
    userIdTracking: boolean
    customDimensions: string[]
  }
}

export default function AdvertisingSettings() {
  const [settings, setSettings] = useState<AdvertisingSettingsData>({
    facebook: {
      pixelId: '',
      accessToken: '',
      conversionApiEnabled: false,
      testEventCode: '',
      events: {
        pageView: true,
        purchase: true,
        addToCart: true,
        initiateCheckout: true,
        completeRegistration: true,
        deposit: true,
        withdrawal: true
      }
    },
    google: {
      analyticsId: '',
      adsId: '',
      tagManagerId: '',
      conversionId: '',
      conversionLabel: '',
      enhancedConversions: false
    },
    tiktok: {
      pixelId: '',
      accessToken: '',
      eventsApiEnabled: false
    },
    tracking: {
      utmTracking: true,
      crossDomainTracking: false,
      userIdTracking: true,
      customDimensions: []
    }
  })
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [activeTab, setActiveTab] = useState('facebook')

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/admin/advertising', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.settings) {
          setSettings(data.settings)
        }
      }
    } catch (error) {
      console.error('Error loading advertising settings:', error)
      setMessage({ type: 'error', text: 'Failed to load advertising settings' })
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    try {
      setSaving(true)
      setMessage(null)
      
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/admin/advertising', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      })
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'Advertising settings saved successfully!' })
        setTimeout(() => setMessage(null), 3000)
      } else {
        throw new Error('Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving advertising settings:', error)
      setMessage({ type: 'error', text: 'Failed to save advertising settings' })
    } finally {
      setSaving(false)
    }
  }

  const updateFacebookSetting = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      facebook: {
        ...prev.facebook,
        [key]: value
      }
    }))
  }

  const updateFacebookEvent = (event: string, enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      facebook: {
        ...prev.facebook,
        events: {
          ...prev.facebook.events,
          [event]: enabled
        }
      }
    }))
  }

  const updateGoogleSetting = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      google: {
        ...prev.google,
        [key]: value
      }
    }))
  }

  const updateTiktokSetting = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      tiktok: {
        ...prev.tiktok,
        [key]: value
      }
    }))
  }

  const updateTrackingSetting = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      tracking: {
        ...prev.tracking,
        [key]: value
      }
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-6 h-6 animate-spin text-gray-600" />
          <span className="text-gray-600">Loading advertising settings...</span>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'facebook', label: 'Facebook', icon: Target, color: 'blue' },
    { id: 'google', label: 'Google', icon: BarChart3, color: 'green' },
    { id: 'tiktok', label: 'TikTok', icon: Eye, color: 'pink' },
    { id: 'tracking', label: 'Tracking', icon: Globe, color: 'purple' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Marketing & Advertising</h2>
            <p className="text-gray-600">Configure tracking pixels, conversion APIs, and advertising integrations</p>
          </div>
        </div>
        <button
          onClick={saveSettings}
          disabled={saving}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg border border-gray-200 p-1">
        <div className="flex space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? `bg-${tab.color}-100 text-${tab.color}-700`
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg border border-gray-200">
        {/* Facebook Settings */}
        {activeTab === 'facebook' && (
          <div className="p-6 space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Facebook Pixel & Conversion API</h3>
                <p className="text-sm text-gray-600">Configure Facebook pixel and server-side tracking</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Facebook Pixel ID
                  </label>
                  <input
                    type="text"
                    value={settings.facebook.pixelId}
                    onChange={(e) => updateFacebookSetting('pixelId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="123456789012345"
                  />
                  <p className="text-xs text-gray-500 mt-1">Your Facebook Pixel ID from Events Manager</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Conversion API Access Token
                  </label>
                  <input
                    type="password"
                    value={settings.facebook.accessToken}
                    onChange={(e) => updateFacebookSetting('accessToken', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter access token"
                  />
                  <p className="text-xs text-gray-500 mt-1">Server-side API access token for Conversion API</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Test Event Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={settings.facebook.testEventCode}
                    onChange={(e) => updateFacebookSetting('testEventCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="TEST12345"
                  />
                  <p className="text-xs text-gray-500 mt-1">Test event code for debugging events</p>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="conversionApiEnabled"
                    checked={settings.facebook.conversionApiEnabled}
                    onChange={(e) => updateFacebookSetting('conversionApiEnabled', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="conversionApiEnabled" className="text-sm font-medium text-gray-700">
                    Enable Conversion API (Server-Side Tracking)
                  </label>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Tracked Events</h4>
                <div className="space-y-2">
                  {Object.entries(settings.facebook.events).map(([event, enabled]) => (
                    <div key={event} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id={`event-${event}`}
                        checked={enabled}
                        onChange={(e) => updateFacebookEvent(event, e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor={`event-${event}`} className="text-sm text-gray-700 capitalize">
                        {event.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Google Settings */}
        {activeTab === 'google' && (
          <div className="p-6 space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Google Analytics & Ads</h3>
                <p className="text-sm text-gray-600">Configure Google Analytics, Google Ads, and Tag Manager</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Google Analytics 4 ID
                  </label>
                  <input
                    type="text"
                    value={settings.google.analyticsId}
                    onChange={(e) => updateGoogleSetting('analyticsId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="G-XXXXXXXXXX"
                  />
                  <p className="text-xs text-gray-500 mt-1">Your Google Analytics 4 Measurement ID</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Google Ads ID
                  </label>
                  <input
                    type="text"
                    value={settings.google.adsId}
                    onChange={(e) => updateGoogleSetting('adsId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="AW-123456789"
                  />
                  <p className="text-xs text-gray-500 mt-1">Your Google Ads Conversion ID</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Google Tag Manager ID
                  </label>
                  <input
                    type="text"
                    value={settings.google.tagManagerId}
                    onChange={(e) => updateGoogleSetting('tagManagerId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="GTM-XXXXXXX"
                  />
                  <p className="text-xs text-gray-500 mt-1">Google Tag Manager Container ID</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Conversion ID
                  </label>
                  <input
                    type="text"
                    value={settings.google.conversionId}
                    onChange={(e) => updateGoogleSetting('conversionId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="123456789"
                  />
                  <p className="text-xs text-gray-500 mt-1">Google Ads Conversion Tracking ID</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Conversion Label
                  </label>
                  <input
                    type="text"
                    value={settings.google.conversionLabel}
                    onChange={(e) => updateGoogleSetting('conversionLabel', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="abcdefghijk"
                  />
                  <p className="text-xs text-gray-500 mt-1">Conversion action label</p>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="enhancedConversions"
                    checked={settings.google.enhancedConversions}
                    onChange={(e) => updateGoogleSetting('enhancedConversions', e.target.checked)}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <label htmlFor="enhancedConversions" className="text-sm font-medium text-gray-700">
                    Enable Enhanced Conversions
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TikTok Settings */}
        {activeTab === 'tiktok' && (
          <div className="p-6 space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-pink-100 rounded-lg">
                <Eye className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">TikTok Pixel & Events API</h3>
                <p className="text-sm text-gray-600">Configure TikTok pixel and server-side tracking</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    TikTok Pixel ID
                  </label>
                  <input
                    type="text"
                    value={settings.tiktok.pixelId}
                    onChange={(e) => updateTiktokSetting('pixelId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="C123456789012345678"
                  />
                  <p className="text-xs text-gray-500 mt-1">Your TikTok Pixel ID from TikTok Ads Manager</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Events API Access Token
                  </label>
                  <input
                    type="password"
                    value={settings.tiktok.accessToken}
                    onChange={(e) => updateTiktokSetting('accessToken', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Enter access token"
                  />
                  <p className="text-xs text-gray-500 mt-1">Server-side API access token for Events API</p>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="eventsApiEnabled"
                    checked={settings.tiktok.eventsApiEnabled}
                    onChange={(e) => updateTiktokSetting('eventsApiEnabled', e.target.checked)}
                    className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                  />
                  <label htmlFor="eventsApiEnabled" className="text-sm font-medium text-gray-700">
                    Enable Events API (Server-Side Tracking)
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tracking Settings */}
        {activeTab === 'tracking' && (
          <div className="p-6 space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Globe className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Advanced Tracking Options</h3>
                <p className="text-sm text-gray-600">Configure UTM tracking, cross-domain tracking, and custom dimensions</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="utmTracking"
                      checked={settings.tracking.utmTracking}
                      onChange={(e) => updateTrackingSetting('utmTracking', e.target.checked)}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <label htmlFor="utmTracking" className="text-sm font-medium text-gray-700">
                      Enable UTM Parameter Tracking
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="crossDomainTracking"
                      checked={settings.tracking.crossDomainTracking}
                      onChange={(e) => updateTrackingSetting('crossDomainTracking', e.target.checked)}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <label htmlFor="crossDomainTracking" className="text-sm font-medium text-gray-700">
                      Enable Cross-Domain Tracking
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="userIdTracking"
                      checked={settings.tracking.userIdTracking}
                      onChange={(e) => updateTrackingSetting('userIdTracking', e.target.checked)}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <label htmlFor="userIdTracking" className="text-sm font-medium text-gray-700">
                      Enable User ID Tracking
                    </label>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Tracking Status</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span>Facebook Pixel:</span>
                      <span className={settings.facebook.pixelId ? 'text-green-600' : 'text-red-600'}>
                        {settings.facebook.pixelId ? 'Configured' : 'Not configured'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Google Analytics:</span>
                      <span className={settings.google.analyticsId ? 'text-green-600' : 'text-red-600'}>
                        {settings.google.analyticsId ? 'Configured' : 'Not configured'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>TikTok Pixel:</span>
                      <span className={settings.tiktok.pixelId ? 'text-green-600' : 'text-red-600'}>
                        {settings.tiktok.pixelId ? 'Configured' : 'Not configured'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Implementation Guide */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Code className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-900 mb-2">Implementation Guide</h3>
            <div className="text-xs text-blue-800 space-y-1">
              <p>• Facebook Pixel: Tracks user interactions and sends data to Facebook for ad optimization</p>
              <p>• Conversion API: Server-side tracking for better data accuracy and iOS 14.5+ compatibility</p>
              <p>• Google Analytics: Comprehensive user behavior tracking and conversion measurement</p>
              <p>• TikTok Pixel: Track user actions for TikTok advertising campaigns</p>
              <p>• UTM Tracking: Monitor campaign performance with UTM parameters</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
