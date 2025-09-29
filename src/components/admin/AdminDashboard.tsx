'use client'

import { useState, useEffect } from 'react'
import AdminSidebar from './AdminSidebar'
import AdminHeader from './AdminHeader'
import UserManagement from './UserManagement'
import WithdrawalManagement from './WithdrawalManagement'
import KYCManagement from './KYCManagement'
import SystemSettings from './SystemSettings'
import AdminAccountManagement from './AdminAccountManagement'
import BlogManagement from './BlogManagement'
import BlogEditor from './BlogEditor'
import MediaLibrary from './MediaLibrary'
import CategoriesAndTags from './CategoriesAndTags'
import SEOSettings from './SEOSettings'
import AdvertisingSettings from './AdvertisingSettings'
import CampaignTracking from './CampaignTracking'
import ConversionReports from './ConversionReports'
import PlatformProviderSettings from './PlatformProviderSettings'
import GameProviderManagement from './GameProviderManagement'
import GameLibraryManagement from './GameLibraryManagement'

interface AdminDashboardProps {
  onLogout: () => void
}

interface Stats {
  totalUsers: number
  pendingWithdrawals: number
  pendingKYC: number
  totalRevenue: number
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('dashboard')
  
  // Handle tab changes with CMS logic
  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    
    // Handle CMS navigation
    if (tab === 'blog-editor') {
      setShowBlogEditor(true)
      setEditingBlogId(undefined) // Create new blog
    } else if (tab === 'blog-management') {
      setShowBlogEditor(false)
      setEditingBlogId(undefined)
    }
  }
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    pendingWithdrawals: 0,
    pendingKYC: 0,
    totalRevenue: 0
  })
  const [adminInfo, setAdminInfo] = useState({ username: 'Admin', role: 'super_admin' })
  
  // CMS related states
  const [showBlogEditor, setShowBlogEditor] = useState(false)
  const [editingBlogId, setEditingBlogId] = useState<number | undefined>(undefined)

  useEffect(() => {
    loadStats()
    loadAdminInfo()
  }, [])

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }

      // Load user statistics
      const usersResponse = await fetch('/api/admin/users', { headers })
      const usersData = await usersResponse.json()
      
      // Load withdrawal statistics
      const withdrawalsResponse = await fetch('/api/admin/withdrawals', { headers })
      const withdrawalsData = await withdrawalsResponse.json()
      
      // Load KYC statistics
      const kycResponse = await fetch('/api/admin/kyc', { headers })
      const kycData = await kycResponse.json()

      setStats({
        totalUsers: usersData.users?.length || 0,
        pendingWithdrawals: withdrawalsData.withdrawals?.filter((w: any) => w.status === 'pending').length || 0,
        pendingKYC: kycData.kyc_documents?.filter((k: any) => k.status === 'submitted').length || 0,
        totalRevenue: 0 // Can be calculated as needed
      })
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const loadAdminInfo = () => {
    const token = localStorage.getItem('adminToken')
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        setAdminInfo({
          username: payload.username || 'Admin',
          role: payload.role || 'admin'
        })
      } catch (error) {
        console.error('Failed to parse admin token:', error)
      }
    }
  }

  // CMS navigation functions
  const handleNewBlog = () => {
    setEditingBlogId(undefined)
    setShowBlogEditor(true)
    setActiveTab('blog-editor')
  }

  const handleEditBlog = (blogId: number) => {
    setEditingBlogId(blogId)
    setShowBlogEditor(true)
    setActiveTab('blog-editor')
  }

  const handleBackToBlogList = () => {
    setShowBlogEditor(false)
    setEditingBlogId(undefined)
    setActiveTab('blog-management')
  }

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard'
      case 'user-accounts': return 'User Accounts'
      case 'kyc': return 'KYC Verification'
      case 'user-analytics': return 'User Analytics'
      case 'withdrawals': return 'Withdrawal Requests'
      case 'transactions': return 'Transaction History'
      case 'payment-settings': return 'Payment Settings'
      case 'game-library': return 'Game Library'
      case 'game-providers': return 'Game Providers'
      case 'game-analytics': return 'Game Analytics'
      case 'game-settings': return 'Platform Provider Settings'
      case 'business-reports': return 'Business Reports'
      case 'financial-reports': return 'Financial Reports'
      case 'user-behavior': return 'User Behavior'
      case 'security-logs': return 'Security Logs'
      case 'system-settings': return 'System Settings'
      case 'admin-accounts': return 'Admin Accounts'
      case 'blog-management': return 'Blog Management'
      case 'blog-editor': return 'Blog Editor'
      case 'media-library': return 'Media Library'
      case 'categories-tags': return 'Categories & Tags'
      case 'seo-settings': return 'SEO Settings'
      case 'advertising-settings': return 'Advertising Settings'
      case 'campaign-tracking': return 'Campaign Tracking'
      case 'conversion-reports': return 'Conversion Reports'
      case 'notifications': return 'Notifications'
      case 'email-templates': return 'Email Templates'
      case 'announcements': return 'Announcements'
      default: return 'Management Console'
    }
  }

  const getPageSubtitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'System overview and key metrics'
      case 'user-accounts': return 'Manage user accounts and permissions'
      case 'kyc': return 'Review and approve identity verification documents'
      case 'user-analytics': return 'Analyze user behavior and engagement'
      case 'withdrawals': return 'Process withdrawal requests and reviews'
      case 'transactions': return 'View all transaction records'
      case 'payment-settings': return 'Configure payment methods and settings'
      case 'game-library': return 'Manage available games and content'
      case 'game-providers': return 'Manage game providers (JILI, Pragmatic Play, etc.)'
      case 'game-analytics': return 'Analyze game performance and user engagement'
      case 'game-settings': return 'Configure merchant platform connection and API settings'
      case 'business-reports': return 'Business performance and analytics'
      case 'financial-reports': return 'Financial statements and revenue analysis'
      case 'user-behavior': return 'User activity patterns and insights'
      case 'security-logs': return 'Security events and access logs'
      case 'system-settings': return 'System parameters and configuration'
      case 'admin-accounts': return 'Manage administrator accounts and roles'
      case 'blog-management': return 'Manage blog posts and content'
      case 'blog-editor': return 'Create and edit blog posts'
      case 'media-library': return 'Manage images and media files'
      case 'categories-tags': return 'Organize content with categories and tags'
      case 'seo-settings': return 'Search engine optimization settings'
      case 'advertising-settings': return 'Configure tracking pixels, conversion APIs, and advertising integrations'
      case 'campaign-tracking': return 'Monitor advertising campaign performance and metrics'
      case 'conversion-reports': return 'Analyze conversion data and advertising ROI'
      case 'notifications': return 'System notifications and message management'
      case 'email-templates': return 'Manage email templates and communications'
      case 'announcements': return 'System announcements and updates'
      default: return ''
    }
  }

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar 
        activeTab={activeTab} 
        onTabChange={handleTabChange}
        onLogout={onLogout}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <AdminHeader 
          title={getPageTitle()}
          subtitle={getPageSubtitle()}
        />

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow border-l-4 border-blue-500 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                    </div>
                    <div className="p-3 rounded-full bg-blue-100">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    <span className="text-sm font-medium text-green-600">+12%</span>
                    <span className="text-sm text-gray-600 ml-2">vs last month</span>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow border-l-4 border-orange-500 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending Withdrawals</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.pendingWithdrawals}</p>
                    </div>
                    <div className="p-3 rounded-full bg-orange-100">
                      <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    <span className="text-sm font-medium text-red-600">-5%</span>
                    <span className="text-sm text-gray-600 ml-2">vs last week</span>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow border-l-4 border-yellow-500 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending KYC</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.pendingKYC}</p>
                    </div>
                    <div className="p-3 rounded-full bg-yellow-100">
                      <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    <span className="text-sm font-medium text-green-600">+8%</span>
                    <span className="text-sm text-gray-600 ml-2">vs yesterday</span>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow border-l-4 border-green-500 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                      <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue}</p>
                    </div>
                    <div className="p-3 rounded-full bg-green-100">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    <span className="text-sm font-medium text-green-600">+23%</span>
                    <span className="text-sm text-gray-600 ml-2">vs last month</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                  <p className="text-sm text-gray-600">Frequently used management functions</p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button 
                      onClick={() => setActiveTab('user-accounts')}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                      <svg className="w-6 h-6 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                      <p className="text-sm font-medium text-gray-900">User Accounts</p>
                      <p className="text-xs text-gray-600">Manage user accounts</p>
                    </button>
                    <button 
                      onClick={() => setActiveTab('withdrawals')}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                      <svg className="w-6 h-6 text-orange-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <p className="text-sm font-medium text-gray-900">Withdrawal Review</p>
                      <p className="text-xs text-gray-600">Process withdrawal requests</p>
                    </button>
                    <button 
                      onClick={() => setActiveTab('kyc')}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                      <svg className="w-6 h-6 text-yellow-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-sm font-medium text-gray-900">KYC Verification</p>
                      <p className="text-xs text-gray-600">Identity verification review</p>
                    </button>
                    <button 
                      onClick={() => setActiveTab('business-reports')}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                      <svg className="w-6 h-6 text-green-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <p className="text-sm font-medium text-gray-900">Business Reports</p>
                      <p className="text-xs text-gray-600">View business analytics</p>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'user-accounts' && (
            <div className="bg-white rounded-lg shadow p-6">
              <UserManagement onStatsUpdate={loadStats} />
            </div>
          )}
          {activeTab === 'withdrawals' && (
            <div className="bg-white rounded-lg shadow p-6">
              <WithdrawalManagement onStatsUpdate={loadStats} />
            </div>
          )}
          {activeTab === 'kyc' && (
            <div className="bg-white rounded-lg shadow p-6">
              <KYCManagement onStatsUpdate={loadStats} />
            </div>
          )}
          {activeTab === 'user-analytics' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">User Analytics</h2>
              <p className="text-gray-600">User analytics feature is under development...</p>
            </div>
          )}
          {activeTab === 'transactions' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Transaction History</h2>
              <p className="text-gray-600">Transaction history feature is under development...</p>
            </div>
          )}
          {activeTab === 'payment-settings' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Settings</h2>
              <p className="text-gray-600">Payment settings feature is under development...</p>
            </div>
          )}
          {activeTab === 'game-library' && (
            <GameLibraryManagement />
          )}
          {activeTab === 'game-providers' && (
            <GameProviderManagement />
          )}
          {activeTab === 'game-analytics' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Game Analytics</h2>
              <p className="text-gray-600">Game analytics feature is under development...</p>
            </div>
          )}
          {activeTab === 'game-settings' && (
            <PlatformProviderSettings />
          )}
          {activeTab === 'business-reports' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Reports</h2>
              <p className="text-gray-600">Business reports feature is under development...</p>
            </div>
          )}
          {activeTab === 'financial-reports' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Financial Reports</h2>
              <p className="text-gray-600">Financial reports feature is under development...</p>
            </div>
          )}
          {activeTab === 'user-behavior' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">User Behavior Analysis</h2>
              <p className="text-gray-600">User behavior analysis feature is under development...</p>
            </div>
          )}
          {activeTab === 'security-logs' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Security Logs</h2>
              <p className="text-gray-600">Security logs feature is under development...</p>
            </div>
          )}
          {activeTab === 'admin-accounts' && (
            <AdminAccountManagement />
          )}
          {activeTab === 'blog-management' && (
            <BlogManagement />
          )}
          {activeTab === 'blog-editor' && (
            <BlogEditor 
              blogId={editingBlogId}
              onBack={handleBackToBlogList}
            />
          )}
          {activeTab === 'media-library' && (
            <MediaLibrary />
          )}
          {activeTab === 'categories-tags' && (
            <CategoriesAndTags />
          )}
          {activeTab === 'seo-settings' && (
            <SEOSettings />
          )}
          {activeTab === 'advertising-settings' && (
            <AdvertisingSettings />
          )}
          {activeTab === 'campaign-tracking' && (
            <CampaignTracking />
          )}
          {activeTab === 'conversion-reports' && (
            <ConversionReports />
          )}
          {activeTab === 'email-templates' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Email Templates</h2>
              <p className="text-gray-600">Email templates feature is under development...</p>
            </div>
          )}
          {activeTab === 'announcements' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Announcements</h2>
              <p className="text-gray-600">Announcements feature is under development...</p>
            </div>
          )}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Management</h2>
              <p className="text-gray-600">Notification management feature is under development...</p>
            </div>
          )}
          {activeTab === 'system-settings' && (
            <SystemSettings />
          )}
        </main>
      </div>
    </div>
  )
}
