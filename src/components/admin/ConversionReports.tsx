'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, Users, DollarSign, Target, Calendar, Filter, Download, RefreshCw, ArrowUp, ArrowDown, Minus } from 'lucide-react'

interface ConversionData {
  date: string
  visitors: number
  registrations: number
  deposits: number
  firstDeposit: number
  revenue: number
  platform: string
}


export default function ConversionReports() {
  const [conversionData, setConversionData] = useState<ConversionData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all')
  const [dateRange, setDateRange] = useState<string>('7d')
  const [activeTab, setActiveTab] = useState<string>('overview')
  const [showCustomDatePicker, setShowCustomDatePicker] = useState<boolean>(false)
  const [customStartDate, setCustomStartDate] = useState<string>('')
  const [customEndDate, setCustomEndDate] = useState<string>('')

  // Mock data for demonstration
  useEffect(() => {
    const mockData: ConversionData[] = [
      {
        date: '2024-01-28',
        visitors: 2450,
        registrations: 189,
        deposits: 67,
        firstDeposit: 45,
        revenue: 3350,
        platform: 'facebook'
      },
      {
        date: '2024-01-27',
        visitors: 2180,
        registrations: 156,
        deposits: 58,
        firstDeposit: 41,
        revenue: 2890,
        platform: 'google'
      },
      {
        date: '2024-01-26',
        visitors: 1890,
        registrations: 142,
        deposits: 52,
        firstDeposit: 38,
        revenue: 2650,
        platform: 'tiktok'
      },
      {
        date: '2024-01-25',
        visitors: 2320,
        registrations: 178,
        deposits: 63,
        firstDeposit: 42,
        revenue: 3120,
        platform: 'facebook'
      },
      {
        date: '2024-01-24',
        visitors: 2650,
        registrations: 201,
        deposits: 71,
        firstDeposit: 48,
        revenue: 3580,
        platform: 'google'
      },
      {
        date: '2024-01-23',
        visitors: 1750,
        registrations: 134,
        deposits: 49,
        firstDeposit: 35,
        revenue: 2450,
        platform: 'tiktok'
      },
      {
        date: '2024-01-22',
        visitors: 2100,
        registrations: 167,
        deposits: 61,
        firstDeposit: 43,
        revenue: 3050,
        platform: 'facebook'
      }
    ]

    setTimeout(() => {
      setConversionData(mockData)
      setLoading(false)
    }, 1000)
  }, [])

  const filteredData = conversionData.filter(item => 
    selectedPlatform === 'all' || item.platform === selectedPlatform
  )

  const totalStats = filteredData.reduce((acc, item) => ({
    visitors: acc.visitors + item.visitors,
    registrations: acc.registrations + item.registrations,
    deposits: acc.deposits + item.deposits,
    firstDeposit: acc.firstDeposit + item.firstDeposit,
    revenue: acc.revenue + item.revenue
  }), { visitors: 0, registrations: 0, deposits: 0, firstDeposit: 0, revenue: 0 })

  const conversionRates = {
    visitorToRegistration: totalStats.visitors > 0 ? (totalStats.registrations / totalStats.visitors * 100) : 0,
    registrationToDeposit: totalStats.registrations > 0 ? (totalStats.deposits / totalStats.registrations * 100) : 0,
    depositToFirstDeposit: totalStats.deposits > 0 ? (totalStats.firstDeposit / totalStats.deposits * 100) : 0,
    overallConversion: totalStats.visitors > 0 ? (totalStats.firstDeposit / totalStats.visitors * 100) : 0
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

  const getChangeIndicator = (current: number, previous: number) => {
    if (previous === 0) return { icon: Minus, color: 'text-gray-500', text: 'N/A' }
    
    const change = ((current - previous) / previous) * 100
    if (change > 0) {
      return { icon: ArrowUp, color: 'text-green-600', text: `+${change.toFixed(1)}%` }
    } else if (change < 0) {
      return { icon: ArrowDown, color: 'text-red-600', text: `${change.toFixed(1)}%` }
    } else {
      return { icon: Minus, color: 'text-gray-500', text: '0%' }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-6 h-6 animate-spin text-gray-600" />
          <span className="text-gray-600">Loading conversion data...</span>
        </div>
      </div>
    )
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

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'trends', label: 'Trends' },
    { id: 'platforms', label: 'Platform Comparison' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-600 rounded-lg">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Conversion Reports</h2>
            <p className="text-gray-600">Analyze conversion data and advertising ROI</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
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
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Apply Range
              </button>
            </div>
          </div>
          
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg border border-gray-200 p-1">
        <div className="flex space-x-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg border border-gray-200">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="p-6 space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100">Total Visitors</p>
                    <p className="text-2xl font-bold">{formatNumber(totalStats.visitors)}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-200" />
                </div>
                <div className="mt-4 flex items-center">
                  <ArrowUp className="w-4 h-4 text-blue-200" />
                  <span className="text-sm text-blue-100 ml-1">+12.5% vs last period</span>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100">Registrations</p>
                    <p className="text-2xl font-bold">{formatNumber(totalStats.registrations)}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-200" />
                </div>
                <div className="mt-4 flex items-center">
                  <ArrowUp className="w-4 h-4 text-green-200" />
                  <span className="text-sm text-green-100 ml-1">+8.3% vs last period</span>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100">First Deposits</p>
                    <p className="text-2xl font-bold">{formatNumber(totalStats.firstDeposit)}</p>
                  </div>
                  <Target className="w-8 h-8 text-purple-200" />
                </div>
                <div className="mt-4 flex items-center">
                  <ArrowUp className="w-4 h-4 text-purple-200" />
                  <span className="text-sm text-purple-100 ml-1">+15.7% vs last period</span>
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100">Total Revenue</p>
                    <p className="text-2xl font-bold">{formatCurrency(totalStats.revenue)}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-orange-200" />
                </div>
                <div className="mt-4 flex items-center">
                  <ArrowUp className="w-4 h-4 text-orange-200" />
                  <span className="text-sm text-orange-100 ml-1">+22.1% vs last period</span>
                </div>
              </div>
            </div>

            {/* Conversion Rates */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Visitor → Registration</h4>
                <p className="text-2xl font-bold text-gray-900">{conversionRates.visitorToRegistration.toFixed(2)}%</p>
                <p className="text-sm text-gray-500">Industry avg: 5-8%</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Registration → Deposit</h4>
                <p className="text-2xl font-bold text-gray-900">{conversionRates.registrationToDeposit.toFixed(2)}%</p>
                <p className="text-sm text-gray-500">Industry avg: 15-25%</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Deposit → Active Player</h4>
                <p className="text-2xl font-bold text-gray-900">{conversionRates.depositToFirstDeposit.toFixed(2)}%</p>
                <p className="text-sm text-gray-500">Industry avg: 60-80%</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Overall Conversion</h4>
                <p className="text-2xl font-bold text-gray-900">{conversionRates.overallConversion.toFixed(2)}%</p>
                <p className="text-sm text-gray-500">Visitor to active player</p>
              </div>
            </div>
          </div>
        )}

        {/* Trends Tab */}
        {activeTab === 'trends' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Conversion Trends</h3>
            
            {/* Daily Performance Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Platform
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Visitors
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registrations
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reg. Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      First Deposits
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deposit Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.map((item, index) => {
                    const regRate = (item.registrations / item.visitors * 100)
                    const depositRate = (item.firstDeposit / item.registrations * 100)
                    
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(item.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                            item.platform === 'facebook' ? 'bg-blue-100 text-blue-800' :
                            item.platform === 'google' ? 'bg-green-100 text-green-800' :
                            'bg-pink-100 text-pink-800'
                          }`}>
                            {item.platform}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatNumber(item.visitors)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatNumber(item.registrations)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {regRate.toFixed(1)}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatNumber(item.firstDeposit)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {depositRate.toFixed(1)}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(item.revenue)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Platform Comparison Tab */}
        {activeTab === 'platforms' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Platform Performance Comparison</h3>
            
            {/* Platform Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {['facebook', 'google', 'tiktok'].map((platform) => {
                const platformData = conversionData.filter(item => item.platform === platform)
                const platformStats = platformData.reduce((acc, item) => ({
                  visitors: acc.visitors + item.visitors,
                  registrations: acc.registrations + item.registrations,
                  firstDeposit: acc.firstDeposit + item.firstDeposit,
                  revenue: acc.revenue + item.revenue
                }), { visitors: 0, registrations: 0, firstDeposit: 0, revenue: 0 })

                const regRate = platformStats.visitors > 0 ? (platformStats.registrations / platformStats.visitors * 100) : 0
                const overallConversion = platformStats.visitors > 0 ? (platformStats.firstDeposit / platformStats.visitors * 100) : 0

                return (
                  <div key={platform} className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-900 capitalize">{platform}</h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        platform === 'facebook' ? 'bg-blue-100 text-blue-800' :
                        platform === 'google' ? 'bg-green-100 text-green-800' :
                        'bg-pink-100 text-pink-800'
                      }`}>
                        {platform}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Visitors:</span>
                        <span className="text-sm font-medium text-gray-900">{formatNumber(platformStats.visitors)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Registrations:</span>
                        <span className="text-sm font-medium text-gray-900">{formatNumber(platformStats.registrations)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Registration Rate:</span>
                        <span className="text-sm font-medium text-gray-900">{regRate.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">First Deposits:</span>
                        <span className="text-sm font-medium text-gray-900">{formatNumber(platformStats.firstDeposit)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Overall Conversion:</span>
                        <span className="text-sm font-medium text-gray-900">{overallConversion.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between border-t pt-3">
                        <span className="text-sm text-gray-600">Revenue:</span>
                        <span className="text-sm font-bold text-gray-900">{formatCurrency(platformStats.revenue)}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
