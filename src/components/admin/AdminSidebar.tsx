'use client'

import { useState } from 'react'
import {
  LayoutDashboard,
  Users,
  CreditCard,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Shield,
  Bell,
  Gamepad2,
  DollarSign,
  MessageCircle,
  UserCheck,
  Edit3,
  BookOpen,
  Image,
  Tags,
  Globe,
  Target,
} from 'lucide-react'

interface AdminSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  onLogout: () => void
}

interface MenuItem {
  id: string
  label: string
  icon: any
  children?: MenuItem[]
}

export default function AdminSidebar({
  activeTab,
  onTabChange,
  onLogout,
}: AdminSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['users']) // Default expand User Management

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'users',
      label: 'User Management',
      icon: Users,
      children: [
        { id: 'user-accounts', label: 'User Accounts', icon: Users },
        { id: 'kyc', label: 'KYC Verification', icon: UserCheck },
        { id: 'user-analytics', label: 'User Analytics', icon: BarChart3 },
      ],
    },
    {
      id: 'financial',
      label: 'Financial Management',
      icon: DollarSign,
      children: [
        { id: 'withdrawals', label: 'Withdrawal Requests', icon: CreditCard },
        { id: 'transactions', label: 'Transaction History', icon: FileText },
        { id: 'payment-settings', label: 'Payment Settings', icon: Settings },
      ],
    },
    {
      id: 'games',
      label: 'Game Management',
      icon: Gamepad2,
      children: [
        { id: 'game-library', label: 'Game Library', icon: Gamepad2 },
        { id: 'game-providers', label: 'Game Providers', icon: Tags },
        { id: 'game-analytics', label: 'Game Analytics', icon: BarChart3 },
        { id: 'game-settings', label: 'Platform Settings', icon: Settings },
      ],
    },
    {
      id: 'reports',
      label: 'Reports & Analytics',
      icon: BarChart3,
      children: [
        { id: 'business-reports', label: 'Business Reports', icon: FileText },
        {
          id: 'financial-reports',
          label: 'Financial Reports',
          icon: DollarSign,
        },
        { id: 'user-behavior', label: 'User Behavior', icon: Users },
      ],
    },
    {
      id: 'cms',
      label: 'Content Management',
      icon: Edit3,
      children: [
        { id: 'blog-management', label: 'Blog Management', icon: BookOpen },
        // { id: 'blog-editor', label: 'Create/Edit Blog', icon: Edit3 },
        { id: 'hero-carousel', label: 'Hero Carousel', icon: Image },
        { id: 'media-library', label: 'Media Library', icon: Image },
        { id: 'categories-tags', label: 'Categories & Tags', icon: Tags },
        { id: 'seo-settings', label: 'SEO Settings', icon: Globe },
      ],
    },
    {
      id: 'security',
      label: 'Security & Settings',
      icon: Shield,
      children: [
        { id: 'security-logs', label: 'Security Logs', icon: Shield },
        { id: 'system-settings', label: 'System Settings', icon: Settings },
        { id: 'admin-accounts', label: 'Admin Accounts', icon: Users },
      ],
    },
    {
      id: 'marketing',
      label: 'Marketing & Advertising',
      icon: Target,
      children: [
        {
          id: 'advertising-settings',
          label: 'Advertising Settings',
          icon: Target,
        },
        {
          id: 'campaign-tracking',
          label: 'Campaign Tracking',
          icon: BarChart3,
        },
        {
          id: 'conversion-reports',
          label: 'Conversion Reports',
          icon: FileText,
        },
      ],
    },
    {
      id: 'communications',
      label: 'Communications',
      icon: MessageCircle,
      children: [
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'email-templates', label: 'Email Templates', icon: FileText },
        { id: 'announcements', label: 'Announcements', icon: MessageCircle },
      ],
    },
  ]

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev =>
      prev.includes(menuId)
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    )
  }

  const isMenuExpanded = (menuId: string) => expandedMenus.includes(menuId)

  return (
    <div
      className={`bg-white border-r border-gray-200 h-screen flex flex-col transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-72'
      } min-w-0`}
    >
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">99</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Admin Panel
              </h1>
              <p className="text-xs text-gray-500">Management Console</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        {menuItems.map(item => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          const hasChildren = item.children && item.children.length > 0
          const isExpanded = hasChildren && isMenuExpanded(item.id)

          return (
            <div key={item.id} className="mb-1">
              {/* Main Menu Item */}
              <button
                onClick={() => {
                  if (hasChildren && !isCollapsed) {
                    toggleMenu(item.id)
                  } else {
                    onTabChange(item.id)
                  }
                }}
                className={`w-full flex items-center rounded-lg text-sm font-medium transition-all duration-200 min-h-[44px] ${
                  isCollapsed ? 'justify-center px-3 py-3' : 'px-3 py-2.5'
                } ${
                  isActive && !hasChildren
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon
                  className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'} flex-shrink-0`}
                />
                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-left pr-2">{item.label}</span>
                    {hasChildren && (
                      <div
                        className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    )}
                  </>
                )}
              </button>

              {/* Sub Menu Items with smooth animation */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  hasChildren && isExpanded && !isCollapsed
                    ? 'max-h-96 opacity-100 mt-1'
                    : 'max-h-0 opacity-0'
                }`}
              >
                {hasChildren && (
                  <div className="ml-6 space-y-1 pb-2 min-w-0">
                    {item.children!.map(child => {
                      const ChildIcon = child.icon
                      const isChildActive = activeTab === child.id

                      return (
                        <button
                          key={child.id}
                          onClick={() => onTabChange(child.id)}
                          className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors min-h-[40px] ${
                            isChildActive
                              ? 'bg-gray-900 text-white'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                          title={child.label}
                        >
                          <ChildIcon className="w-4 h-4 mr-3 flex-shrink-0" />
                          <span>{child.label}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200">
        <button
          onClick={onLogout}
          className={`w-full flex items-center rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors ${
            isCollapsed ? 'justify-center px-3 py-3' : 'px-3 py-2.5'
          }`}
          title={isCollapsed ? 'Logout' : undefined}
        >
          <LogOut
            className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'} flex-shrink-0`}
          />
          {!isCollapsed && <span>Logout</span>}
        </button>

        {!isCollapsed && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              v1.0.0 • 99Group Platform
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
