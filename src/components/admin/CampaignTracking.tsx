'use client'

import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, TrendingDown, Eye, MousePointer, DollarSign, Users, Calendar, Filter, Download, RefreshCw } from 'lucide-react'

interface CampaignData {
  id: string
  name: string
  platform: 'facebook' | 'google' | 'tiktok'
  status: 'active' | 'paused' | 'completed'
  budget: number
  spent: number
  impressions: number
  clicks: number
  conversions: number
  revenue: number
  ctr: number
  cpc: number
  roas: number
  startDate: string
  endDate: string
}

export default function CampaignTracking() {
  const [campaigns, setCampaigns] = useState<CampaignData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all')
  const [dateRange, setDateRange] = useState<string>('7d')
  const [showCustomDatePicker, setShowCustomDatePicker] = useState<boolean>(false)
  const [customStartDate, setCustomStartDate] = useState<string>('')
  const [customEndDate, setCustomEndDate] = useState<string>('')

  // Mock data for demonstration
  useEffect(() => {
    const mockCampaigns: CampaignData[] = [
      {
        id: '1',
        name: 'Facebook Registration Campaign',
        platform: 'facebook',
        status: 'active',
        budget: 5000,
        spent: 3420,
        impressions: 125000,
        clicks: 2850,
        conversions: 142,
        revenue: 7100,
        ctr: 2.28,
        cpc: 1.20,
        roas: 2.08,
        startDate: '2024-01-15',
        endDate: '2024-02-15'
      },
      {
        id: '2',
        name: 'Google Search - Gaming Keywords',
        platform: 'google',
        status: 'active',
        budget: 8000,
        spent: 6750,
        impressions: 89000,
        clicks: 3200,
        conversions: 198,
        revenue: 9900,
        ctr: 3.60,
        cpc: 2.11,
        roas: 1.47,
        startDate: '2024-01-10',
        endDate: '2024-02-10'
      },
      {
        id: '3',
        name: 'TikTok Video Ads - Young Audience',
        platform: 'tiktok',
        status: 'active',
        budget: 3000,
        spent: 2100,
        impressions: 180000,
        clicks: 4500,
        conversions: 89,
        revenue: 4450,
        ctr: 2.50,
        cpc: 0.47,
        roas: 2.12,
        startDate: '2024-01-20',
        endDate: '2024-02-20'
      },
      {
        id: '4',
        name: 'Facebook Retargeting Campaign',
        platform: 'facebook',
        status: 'paused',
        budget: 2000,
        spent: 1850,
        impressions: 45000,
        clicks: 1200,
        conversions: 78,
        revenue: 3900,
        ctr: 2.67,
        cpc: 1.54,
        roas: 2.11,
        startDate: '2024-01-05',
        endDate: '2024-01-25'
      },
      {
        id: '5',
        name: 'Google Display Network',
        platform: 'google',
        status: 'completed',
        budget: 4000,
        spent: 4000,
        impressions: 320000,
        clicks: 5600,
        conversions: 234,
        revenue: 11700,
        ctr: 1.75,
        cpc: 0.71,
        roas: 2.93,
        startDate: '2023-12-15',
        endDate: '2024-01-15'
      }
    ]

    setTimeout(() => {
      setCampaigns(mockCampaigns)
      setLoading(false)
    }, 1000)
  }, [])

  const filteredCampaigns = campaigns.filter(campaign => 
    selectedPlatform === 'all' || campaign.platform === selectedPlatform
  )

  const totalStats = filteredCampaigns.reduce((acc, campaign) => ({
    budget: acc.budget + campaign.budget,
    spent: acc.spent + campaign.spent,
    impressions: acc.impressions + campaign.impressions,
    clicks: acc.clicks + campaign.clicks,
    conversions: acc.conversions + campaign.conversions,
    revenue: acc.revenue + campaign.revenue
  }), { budget: 0, spent: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0 })

  const avgCTR = filteredCampaigns.length > 0 
    ? (totalStats.clicks / totalStats.impressions * 100) 
    : 0

  const avgCPC = filteredCampaigns.length > 0 
    ? (totalStats.spent / totalStats.clicks) 
    : 0

  const totalROAS = totalStats.spent > 0 
    ? (totalStats.revenue / totalStats.spent) 
    : 0

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'facebook': return 'bg-blue-100 text-blue-800'
      case 'google': return 'bg-green-100 text-green-800'
      case 'tiktok': return 'bg-pink-100 text-pink-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  const handleDateRangeChange = (value: string) => {
    setDateRange(value)
    if (value === 'custom') {
      setShowCustomDatePicker(true)
      // Set default dates for demo
      const today = new Date()
      const lastWeek = new Date(today)
      lastWeek.setDate(today.getDate() - 7)
      
      setCustomEndDate(today.toISOString().split('T')[0])
      setCustomStartDate(lastWeek.toISOString().split('T')[0])
    } else {
      setShowCustomDatePicker(false)
    }
  }

  const applyCustomDateRange = () => {
    // Demo function - in real implementation, this would filter data
    setShowCustomDatePicker(false)
    // Show a demo message
    alert(`Custom date range applied: ${customStartDate} to ${customEndDate}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-6 h-6 animate-spin text-gray-600" />
          <span className="text-gray-600">Loading campaign data...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Campaign Tracking</h2>
            <p className="text-gray-600">Monitor advertising campaign performance and metrics</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Platform:</span>
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Platforms</option>
                <option value="facebook">Facebook</option>
                <option value="google">Google</option>
                <option value="tiktok">TikTok</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Period:</span>
              <select
                value={dateRange}
                onChange={(e) => handleDateRangeChange(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {filteredCampaigns.length} campaigns found
          </div>
        </div>
      </div>

      {/* Custom Date Range Picker */}
      {showCustomDatePicker && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Custom Date Range</h3>
            <button
              onClick={() => setShowCustomDatePicker(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                max={customEndDate || undefined}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min={customStartDate || undefined}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
          
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {customStartDate && customEndDate && (
                <span>
                  Selected range: {new Date(customStartDate).toLocaleDateString()} - {new Date(customEndDate).toLocaleDateString()}
                  ({Math.ceil((new Date(customEndDate).getTime() - new Date(customStartDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} days)
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  setDateRange('7d')
                  setShowCustomDatePicker(false)
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={applyCustomDateRange}
                disabled={!customStartDate || !customEndDate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Apply Range
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow border-l-4 border-blue-500 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalStats.spent)}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-sm font-medium text-gray-600">
              Budget: {formatCurrency(totalStats.budget)}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border-l-4 border-green-500 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalStats.revenue)}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-sm font-medium text-green-600">
              ROAS: {totalROAS.toFixed(2)}x
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border-l-4 border-purple-500 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Clicks</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(totalStats.clicks)}</p>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <MousePointer className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-sm font-medium text-gray-600">
              Avg CPC: {formatCurrency(avgCPC)}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border-l-4 border-orange-500 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Conversions</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(totalStats.conversions)}</p>
            </div>
            <div className="p-3 rounded-full bg-orange-100">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-sm font-medium text-gray-600">
              CTR: {avgCTR.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Campaign Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Campaign
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Platform
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Spent / Budget
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Impressions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Clicks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CTR
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CPC
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conversions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ROAS
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCampaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                    <div className="text-sm text-gray-500">
                      {campaign.startDate} - {campaign.endDate}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getPlatformColor(campaign.platform)}`}>
                      {campaign.platform}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(campaign.status)}`}>
                      {campaign.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>{formatCurrency(campaign.spent)}</div>
                    <div className="text-xs text-gray-500">/ {formatCurrency(campaign.budget)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNumber(campaign.impressions)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNumber(campaign.clicks)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {campaign.ctr.toFixed(2)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(campaign.cpc)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNumber(campaign.conversions)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(campaign.revenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`text-sm font-medium ${campaign.roas >= 2 ? 'text-green-600' : campaign.roas >= 1 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {campaign.roas.toFixed(2)}x
                      </span>
                      {campaign.roas >= 2 ? (
                        <TrendingUp className="w-4 h-4 text-green-500 ml-1" />
                      ) : campaign.roas < 1 ? (
                        <TrendingDown className="w-4 h-4 text-red-500 ml-1" />
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
