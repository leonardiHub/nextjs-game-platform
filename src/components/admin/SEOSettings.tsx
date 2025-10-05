'use client'

import { useState, useEffect } from 'react'
import {
  Globe,
  Code,
  Search,
  Eye,
  Plus,
  Edit,
  Trash2,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  X,
  Copy,
  ExternalLink,
  FileText,
  Settings,
  Zap,
  Target,
  BarChart3,
  Monitor,
  Smartphone,
  Tag,
  Link,
  Hash,
  Brackets,
  ChevronDown,
  ChevronRight,
  Info,
  Wand2,
  Sparkles,
  Brain,
} from 'lucide-react'

interface PageSEO {
  id: number
  page_path: string
  page_title: string
  meta_title: string
  meta_description: string
  canonical_url?: string
  schema_markup?: string
  og_title?: string
  og_description?: string
  og_image?: string
  twitter_title?: string
  twitter_description?: string
  twitter_image?: string
  robots_meta?: string
  keywords?: string
  created_at: string
  updated_at: string
}

interface GlobalSEOSettings {
  site_name: string
  default_meta_title: string
  default_meta_description: string
  default_og_image: string
  favicon_url: string
  robots_txt: string
  sitemap_url: string
  google_analytics_id?: string
  google_search_console_id?: string
  twitter_site?: string
  header_code: string
  body_code: string
  footer_code: string
  default_canonical_url?: string
  default_robots_meta?: string
  default_keywords?: string
  default_schema_markup?: string
}

export default function SEOSettings() {
  const [activeTab, setActiveTab] = useState<
    'pages' | 'global' | 'code-injection'
  >('pages')
  const [pagesSEO, setPagesSEO] = useState<PageSEO[]>([])
  const [globalSettings, setGlobalSettings] = useState<GlobalSEOSettings>({
    site_name: '99Group Gaming Platform',
    default_meta_title: '99Group - Premium Gaming Platform',
    default_meta_description:
      'Experience the best online gaming platform with 99Group. Get $50 free credits, premium games, and secure gaming environment.',
    default_og_image: '/images/og-default.jpg',
    favicon_url: '/favicon.ico',
    robots_txt: '',
    sitemap_url: '/sitemap.xml',
    google_analytics_id: '',
    google_search_console_id: '',
    twitter_site: '@99group',
    header_code: '',
    body_code: '',
    footer_code: '',
    default_canonical_url: '',
    default_robots_meta: 'index, follow',
    default_keywords: '',
    default_schema_markup: '',
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Modal states
  const [showPageModal, setShowPageModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [editingPage, setEditingPage] = useState<PageSEO | null>(null)
  const [deletingPage, setDeletingPage] = useState<PageSEO | null>(null)
  const [previewPage, setPreviewPage] = useState<PageSEO | null>(null)

  // Sync states
  const [showSyncModal, setShowSyncModal] = useState(false)
  const [syncData, setSyncData] = useState<any>(null)
  const [syncing, setSyncing] = useState(false)
  const [selectedNewPages, setSelectedNewPages] = useState<string[]>([])

  // Form states
  const [pageForm, setPageForm] = useState<Partial<PageSEO>>({
    page_path: '',
    page_title: '',
    meta_title: '',
    meta_description: '',
    canonical_url: '',
    schema_markup: '',
    og_title: '',
    og_description: '',
    og_image: '',
    twitter_title: '',
    twitter_description: '',
    twitter_image: '',
    robots_meta: 'index, follow',
    keywords: '',
  })

  const [expandedSections, setExpandedSections] = useState<string[]>(['basic'])

  // Message state
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  // Auto-suggest states
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)

      const token = localStorage.getItem('adminToken')

      // 并行加载页面SEO和全局设置
      const [pagesResponse, globalResponse] = await Promise.all([
        fetch('/api/admin/seo/pages', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch('/api/admin/seo/global', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
      ])

      if (!pagesResponse.ok) {
        throw new Error('Failed to fetch SEO pages')
      }

      if (!globalResponse.ok) {
        throw new Error('Failed to fetch global SEO settings')
      }

      const pagesData = await pagesResponse.json()
      const globalData = await globalResponse.json()

      setPagesSEO(pagesData.pages || [])
      setGlobalSettings(prev => ({ ...prev, ...globalData }))
    } catch (error) {
      console.error('Error loading SEO data:', error)
      showMessage('error', 'Failed to load SEO settings')
    } finally {
      setLoading(false)
    }
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  // Auto-suggest functionality
  const generateSEOSuggestions = async () => {
    if (!pageForm.page_path) {
      showMessage('error', 'Please enter a page path first')
      return
    }

    try {
      setLoadingSuggestions(true)

      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/admin/seo/suggestions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page_path: pageForm.page_path,
          page_title: pageForm.page_title,
          page_type: inferPageType(pageForm.page_path),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate suggestions')
      }

      const data = await response.json()
      const suggestions = data.suggestions

      // 只填充空字段，不覆盖已有内容
      setPageForm(prev => ({
        ...prev,
        meta_title: prev.meta_title || suggestions.meta_title,
        meta_description: prev.meta_description || suggestions.meta_description,
        og_title: prev.og_title || suggestions.og_title,
        og_description: prev.og_description || suggestions.og_description,
        og_image: prev.og_image || suggestions.og_image,
        twitter_title: prev.twitter_title || suggestions.twitter_title,
        twitter_description:
          prev.twitter_description || suggestions.twitter_description,
        twitter_image: prev.twitter_image || suggestions.twitter_image,
        canonical_url: prev.canonical_url || suggestions.canonical_url,
        robots_meta: prev.robots_meta || suggestions.robots_meta,
        keywords: prev.keywords || suggestions.keywords,
        schema_markup: prev.schema_markup || suggestions.schema_markup,
      }))

      showMessage('success', 'SEO suggestions applied successfully!')
    } catch (error: any) {
      showMessage(
        'error',
        error.message || 'Failed to generate SEO suggestions'
      )
    } finally {
      setLoadingSuggestions(false)
    }
  }

  // 智能填充所有字段（覆盖模式）
  const smartFillAllFields = async () => {
    if (!pageForm.page_path) {
      showMessage('error', 'Please enter a page path first')
      return
    }

    try {
      setLoadingSuggestions(true)

      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/admin/seo/suggestions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page_path: pageForm.page_path,
          page_title: pageForm.page_title,
          page_type: inferPageType(pageForm.page_path),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate suggestions')
      }

      const data = await response.json()
      const suggestions = data.suggestions

      // 覆盖所有字段
      setPageForm(prev => ({
        ...prev,
        ...suggestions,
      }))

      showMessage('success', 'All fields filled with smart suggestions!')
    } catch (error: any) {
      showMessage(
        'error',
        error.message || 'Failed to generate SEO suggestions'
      )
    } finally {
      setLoadingSuggestions(false)
    }
  }

  // 推断页面类型的辅助函数
  const inferPageType = (pagePath: string): string => {
    if (pagePath === '/') return 'home'
    if (pagePath.startsWith('/blog')) return 'blog'
    if (pagePath.startsWith('/games') || pagePath.includes('game'))
      return 'game'
    if (pagePath.includes('about')) return 'about'
    if (pagePath.includes('contact')) return 'contact'
    return 'generic'
  }

  const openPageModal = (page?: PageSEO) => {
    if (page) {
      setEditingPage(page)
      setPageForm({
        page_path: page.page_path,
        page_title: page.page_title,
        meta_title: page.meta_title,
        meta_description: page.meta_description,
        canonical_url: page.canonical_url,
        schema_markup: page.schema_markup,
        og_title: page.og_title,
        og_description: page.og_description,
        og_image: page.og_image,
        twitter_title: page.twitter_title,
        twitter_description: page.twitter_description,
        twitter_image: page.twitter_image,
        robots_meta: page.robots_meta,
        keywords: page.keywords,
      })
    } else {
      setEditingPage(null)
      setPageForm({
        page_path: '',
        page_title: '',
        meta_title: '',
        meta_description: '',
        canonical_url: '',
        schema_markup: '',
        og_title: '',
        og_description: '',
        og_image: '',
        twitter_title: '',
        twitter_description: '',
        twitter_image: '',
        robots_meta: 'index, follow',
        keywords: '',
      })
    }
    setShowPageModal(true)
  }

  const handleSavePage = async () => {
    // 只验证页面路径是必需的，其他字段都是可选的
    if (!pageForm.page_path) {
      showMessage('error', 'Page path is required')
      return
    }

    try {
      setSaving(true)

      console.log('Saving page form data:', pageForm)

      // Validate JSON schema if provided
      if (pageForm.schema_markup) {
        try {
          JSON.parse(pageForm.schema_markup)
        } catch (error) {
          showMessage('error', 'Invalid JSON in schema markup')
          return
        }
      }

      const token = localStorage.getItem('adminToken')
      const method = editingPage ? 'PUT' : 'POST'
      const url = editingPage
        ? `/api/admin/seo/pages/${editingPage.id}`
        : '/api/admin/seo/pages'

      console.log('Sending request to:', url)
      console.log('Request body:', JSON.stringify(pageForm, null, 2))

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pageForm),
      })

      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Error response:', errorText)
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch (e) {
          errorData = { error: errorText }
        }
        throw new Error(errorData.error || 'Failed to save SEO page')
      }

      const action = editingPage ? 'updated' : 'created'
      showMessage('success', `Page SEO ${action} successfully`)
      setShowPageModal(false)
      loadData()
    } catch (error: any) {
      showMessage('error', error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveGlobal = async () => {
    try {
      setSaving(true)

      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/admin/seo/global', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(globalSettings),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save global SEO settings')
      }

      showMessage('success', 'Global SEO settings saved successfully')
    } catch (error: any) {
      showMessage('error', error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeletePage = async () => {
    if (!deletingPage) return

    try {
      setSaving(true)

      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/seo/pages/${deletingPage.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete SEO page')
      }

      showMessage('success', 'Page SEO settings deleted successfully')
      setShowDeleteModal(false)
      setDeletingPage(null)
      loadData()
    } catch (error: any) {
      showMessage('error', error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleSyncPages = async () => {
    try {
      setSyncing(true)

      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/admin/seo/sync', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to sync pages')
      }

      const data = await response.json()
      setSyncData(data)
      setSelectedNewPages(data.new_pages?.map((p: any) => p.page_path) || [])
      setShowSyncModal(true)
    } catch (error: any) {
      showMessage('error', error.message)
    } finally {
      setSyncing(false)
    }
  }

  const handleCreateSelectedPages = async () => {
    if (!syncData || selectedNewPages.length === 0) return

    try {
      setSyncing(true)

      const pagesToCreate = syncData.new_pages.filter((p: any) =>
        selectedNewPages.includes(p.page_path)
      )

      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/admin/seo/sync', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pages_to_create: pagesToCreate }),
      })

      if (!response.ok) {
        throw new Error('Failed to create SEO pages')
      }

      const result = await response.json()
      showMessage(
        'success',
        `Created ${result.created_count} SEO configurations successfully`
      )
      setShowSyncModal(false)
      setSyncData(null)
      setSelectedNewPages([])
      loadData()
    } catch (error: any) {
      showMessage('error', error.message)
    } finally {
      setSyncing(false)
    }
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    showMessage('success', 'Copied to clipboard')
  }

  const generateSchemaTemplate = (type: string) => {
    const templates = {
      website: {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: '{{site_name}}',
        url: '{{site_url}}',
        description: '{{site_description}}',
        publisher: {
          '@type': 'Organization',
          name: '{{site_name}}',
          logo: {
            '@type': 'ImageObject',
            url: '{{site_logo}}',
          },
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: '{{site_url}}/search?q={search_term_string}',
          },
          'query-input': 'required name=search_term_string',
        },
        inLanguage: 'en-US',
      },
      article: {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: '{{page_title}}',
        description: '{{page_description}}',
        author: {
          '@type': 'Person',
          name: '{{author}}',
        },
        publisher: {
          '@type': 'Organization',
          name: '{{site_name}}',
          logo: {
            '@type': 'ImageObject',
            url: '{{site_logo}}',
          },
        },
        datePublished: '{{current_date}}',
        dateModified: '{{current_date}}',
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': '{{canonical_url}}',
        },
        url: '{{canonical_url}}',
        inLanguage: 'en-US',
      },
      blogpost: {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: '{{title}}',
        description: '{{excerpt}}',
        image: '{{featured_image}}',
        author: {
          '@type': 'Person',
          name: '{{author}}',
        },
        publisher: {
          '@type': 'Organization',
          name: '99Group Gaming Platform',
          logo: {
            '@type': 'ImageObject',
            url: 'https://99group.games/logo.png',
          },
        },
        datePublished: '{{published_date}}',
        dateModified: '{{modified_date}}',
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': '{{canonical_url}}',
        },
        url: '{{canonical_url}}',
        keywords: '{{tags}}',
        articleSection: '{{category}}',
        wordCount: '{{word_count}}',
        inLanguage: 'en-US',
      },
      organization: {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: '{{site_name}}',
        url: '{{site_url}}',
        logo: '{{site_logo}}',
        description: '{{site_description}}',
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+1-000-000-0000',
          contactType: 'customer service',
          availableLanguage: 'English',
        },
        sameAs: [
          '{{social_facebook}}',
          '{{social_twitter}}',
          '{{social_instagram}}',
        ],
      },
    }

    return JSON.stringify(
      templates[type as keyof typeof templates] || templates.website,
      null,
      2
    )
  }

  const filteredPages = pagesSEO.filter(
    page =>
      !searchTerm ||
      page.page_path.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.page_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.meta_title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-6 h-6 animate-spin text-gray-600" />
          <span className="text-gray-600">Loading SEO settings...</span>
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
            <Globe className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">SEO Settings</h2>
            <p className="text-gray-600">
              Manage meta tags, schema markup, and code injection
            </p>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`flex items-center space-x-3 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600" />
          )}
          <span
            className={
              message.type === 'success' ? 'text-green-800' : 'text-red-800'
            }
          >
            {message.text}
          </span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Pages Configured
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {pagesSEO.length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-sm font-medium text-gray-600">
              Total configured
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Schema Markup</p>
              <p className="text-2xl font-bold text-gray-900">
                {pagesSEO.filter(p => p.schema_markup).length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <Brackets className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-sm font-medium text-blue-600">
              Structured
            </span>
            <span className="text-sm text-gray-600 ml-2">data ready</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Social Media</p>
              <p className="text-2xl font-bold text-gray-900">
                {pagesSEO.filter(p => p.og_title || p.twitter_title).length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-sm font-medium text-purple-600">
              Optimized
            </span>
            <span className="text-sm text-gray-600 ml-2">for sharing</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Code Injection
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {(globalSettings.header_code ? 1 : 0) +
                  (globalSettings.body_code ? 1 : 0) +
                  (globalSettings.footer_code ? 1 : 0)}
              </p>
            </div>
            <div className="p-3 rounded-full bg-orange-100">
              <Code className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-sm font-medium text-orange-600">Active</span>
            <span className="text-sm text-gray-600 ml-2">injections</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('pages')}
              className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'pages'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Page SEO</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('global')}
              className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'global'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Global Settings</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('code-injection')}
              className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'code-injection'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Code className="w-4 h-4" />
                <span>Code Injection</span>
              </div>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'pages' && (
            <div className="space-y-6">
              {/* Page SEO Header */}
              <div className="flex flex-col space-y-4 lg:flex-row lg:space-y-0 lg:items-center lg:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Page-Specific SEO
                  </h3>
                  <p className="text-sm text-gray-600">
                    Configure meta tags, schema markup, and social media
                    settings for individual pages
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search pages..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={handleSyncPages}
                    disabled={syncing}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {syncing ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    <span>Sync Pages</span>
                  </button>
                  <button
                    onClick={() => openPageModal()}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Page</span>
                  </button>
                </div>
              </div>

              {/* Pages Table */}
              <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Page
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Meta Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Features
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Updated
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {filteredPages.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-6 py-12 text-center text-gray-500"
                          >
                            No pages found
                          </td>
                        </tr>
                      ) : (
                        filteredPages.map(page => (
                          <tr key={page.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {page.page_title}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {page.page_path}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 max-w-xs truncate">
                                {page.meta_title}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {page.meta_title.length}/60 chars
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-2">
                                {page.schema_markup && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <Brackets className="w-3 h-3 mr-1" />
                                    Schema
                                  </span>
                                )}
                                {page.og_title && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    <Target className="w-3 h-3 mr-1" />
                                    Social
                                  </span>
                                )}
                                {page.canonical_url && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                    <Link className="w-3 h-3 mr-1" />
                                    Canonical
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {formatDate(page.updated_at)}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => {
                                    setPreviewPage(page)
                                    setShowPreviewModal(true)
                                  }}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Preview"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => openPageModal(page)}
                                  className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setDeletingPage(page)
                                    setShowDeleteModal(true)
                                  }}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'global' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Global SEO Settings
                  </h3>
                  <p className="text-sm text-gray-600">
                    Default settings that apply to all pages unless overridden
                  </p>
                </div>
                <button
                  onClick={handleSaveGlobal}
                  disabled={saving}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>Save Settings</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Settings */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-900">
                    Basic Settings
                  </h4>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Site Name
                    </label>
                    <input
                      type="text"
                      value={globalSettings.site_name}
                      onChange={e =>
                        setGlobalSettings(prev => ({
                          ...prev,
                          site_name: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      placeholder="Your site name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Default Meta Title
                    </label>
                    <input
                      type="text"
                      value={globalSettings.default_meta_title}
                      onChange={e =>
                        setGlobalSettings(prev => ({
                          ...prev,
                          default_meta_title: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      placeholder="Default meta title"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {globalSettings.default_meta_title.length}/60 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Default Meta Description
                    </label>
                    <textarea
                      value={globalSettings.default_meta_description}
                      onChange={e =>
                        setGlobalSettings(prev => ({
                          ...prev,
                          default_meta_description: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      rows={3}
                      placeholder="Default meta description"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {globalSettings.default_meta_description.length}/160
                      characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Default OG Image URL
                    </label>
                    <input
                      type="text"
                      value={globalSettings.default_og_image}
                      onChange={e =>
                        setGlobalSettings(prev => ({
                          ...prev,
                          default_og_image: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      placeholder="https://yoursite.com/og-image.jpg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Favicon URL
                    </label>
                    <input
                      type="text"
                      value={globalSettings.favicon_url}
                      onChange={e =>
                        setGlobalSettings(prev => ({
                          ...prev,
                          favicon_url: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      placeholder="/favicon.ico"
                    />
                  </div>
                </div>

                {/* Analytics & Social */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-900">
                    Analytics & Social
                  </h4>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Google Analytics ID
                    </label>
                    <input
                      type="text"
                      value={globalSettings.google_analytics_id}
                      onChange={e =>
                        setGlobalSettings(prev => ({
                          ...prev,
                          google_analytics_id: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      placeholder="G-XXXXXXXXXX"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Google Search Console ID
                    </label>
                    <input
                      type="text"
                      value={globalSettings.google_search_console_id}
                      onChange={e =>
                        setGlobalSettings(prev => ({
                          ...prev,
                          google_search_console_id: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      placeholder="google-site-verification=..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Twitter Site Handle
                    </label>
                    <input
                      type="text"
                      value={globalSettings.twitter_site}
                      onChange={e =>
                        setGlobalSettings(prev => ({
                          ...prev,
                          twitter_site: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      placeholder="@yoursite"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sitemap URL
                    </label>
                    <input
                      type="text"
                      value={globalSettings.sitemap_url}
                      onChange={e =>
                        setGlobalSettings(prev => ({
                          ...prev,
                          sitemap_url: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      placeholder="/sitemap.xml"
                    />
                  </div>
                </div>
              </div>

              {/* Global SEO Defaults */}
              <div className="space-y-6 mt-8">
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">
                    Global SEO Defaults
                  </h4>
                  <p className="text-sm text-gray-600 mb-6">
                    These settings will be used as defaults for all pages unless
                    overridden by page-specific settings.
                  </p>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Default Canonical URL Base
                        </label>
                        <input
                          type="text"
                          value={globalSettings.default_canonical_url || ''}
                          onChange={e =>
                            setGlobalSettings(prev => ({
                              ...prev,
                              default_canonical_url: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                          placeholder="https://99group.games"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Leave empty to use relative URLs
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Default Robots Meta
                        </label>
                        <select
                          value={
                            globalSettings.default_robots_meta ||
                            'index, follow'
                          }
                          onChange={e =>
                            setGlobalSettings(prev => ({
                              ...prev,
                              default_robots_meta: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        >
                          <option value="index, follow">Index, Follow</option>
                          <option value="noindex, follow">
                            No Index, Follow
                          </option>
                          <option value="index, nofollow">
                            Index, No Follow
                          </option>
                          <option value="noindex, nofollow">
                            No Index, No Follow
                          </option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Default Keywords
                        </label>
                        <input
                          type="text"
                          value={globalSettings.default_keywords || ''}
                          onChange={e =>
                            setGlobalSettings(prev => ({
                              ...prev,
                              default_keywords: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                          placeholder="gaming, casino, online games, 99group"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Separate keywords with commas
                        </p>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Default Schema Markup (JSON-LD)
                        </label>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-xs text-gray-600">
                            Quick templates:
                          </span>
                          <button
                            onClick={() =>
                              setGlobalSettings(prev => ({
                                ...prev,
                                default_schema_markup:
                                  generateSchemaTemplate('website'),
                              }))
                            }
                            className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                          >
                            Website
                          </button>
                          <button
                            onClick={() =>
                              setGlobalSettings(prev => ({
                                ...prev,
                                default_schema_markup:
                                  generateSchemaTemplate('blogpost'),
                              }))
                            }
                            className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors"
                          >
                            Blog Post
                          </button>
                          <button
                            onClick={() =>
                              setGlobalSettings(prev => ({
                                ...prev,
                                default_schema_markup:
                                  generateSchemaTemplate('organization'),
                              }))
                            }
                            className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
                          >
                            Organization
                          </button>
                        </div>
                        <textarea
                          value={globalSettings.default_schema_markup || ''}
                          onChange={e =>
                            setGlobalSettings(prev => ({
                              ...prev,
                              default_schema_markup: e.target.value,
                            }))
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent font-mono text-sm"
                          rows={8}
                          placeholder={`{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "99Group Gaming Platform",
  "url": "https://99group.games",
  "description": "Premium gaming platform"
}`}
                        />
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            {globalSettings.default_schema_markup?.length || 0}{' '}
                            characters
                          </span>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                try {
                                  if (globalSettings.default_schema_markup) {
                                    JSON.parse(
                                      globalSettings.default_schema_markup
                                    )
                                    showMessage('success', 'Valid JSON schema')
                                  }
                                } catch (error) {
                                  showMessage('error', 'Invalid JSON format')
                                }
                              }}
                              className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              Validate JSON
                            </button>
                            {globalSettings.default_schema_markup && (
                              <button
                                onClick={() =>
                                  copyToClipboard(
                                    globalSettings.default_schema_markup || ''
                                  )
                                }
                                className="text-xs text-gray-600 hover:text-gray-800 transition-colors"
                              >
                                Copy
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                    <div className="flex items-start space-x-3">
                      <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-blue-800">
                          Priority Override System
                        </h4>
                        <p className="text-sm text-blue-700 mt-1">
                          These global defaults will be used when page-specific
                          SEO settings are not configured. Page-level settings
                          always take priority over global settings.
                        </p>
                        <ul className="text-sm text-blue-700 mt-2 space-y-1">
                          <li>
                            • <strong>Priority 1:</strong> Page-specific SEO
                            settings
                          </li>
                          <li>
                            • <strong>Priority 2:</strong> Global default
                            settings
                          </li>
                          <li>
                            • <strong>Priority 3:</strong> System fallback
                            values
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'code-injection' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Code Injection
                  </h3>
                  <p className="text-sm text-gray-600">
                    Add custom HTML, CSS, JavaScript, or tracking codes to all
                    pages
                  </p>
                </div>
                <button
                  onClick={handleSaveGlobal}
                  disabled={saving}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>Save Code</span>
                </button>
              </div>

              <div className="space-y-6">
                {/* Header Code */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Monitor className="w-5 h-5 text-gray-600" />
                    <h4 className="text-md font-medium text-gray-900">
                      Header Code
                    </h4>
                    <div className="flex items-center space-x-1 text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                      <Info className="w-3 h-3" />
                      <span>Injected in &lt;head&gt;</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Code added here will be injected into the &lt;head&gt;
                    section of all pages. Perfect for meta tags, CSS, analytics,
                    or tracking scripts.
                  </p>
                  <textarea
                    value={globalSettings.header_code}
                    onChange={e =>
                      setGlobalSettings(prev => ({
                        ...prev,
                        header_code: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent font-mono text-sm"
                    rows={8}
                    placeholder={`<!-- Example: Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>

<!-- Example: Custom CSS -->
<style>
  .custom-style { color: #333; }
</style>`}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">
                      {globalSettings.header_code.length} characters
                    </span>
                    {globalSettings.header_code && (
                      <button
                        onClick={() =>
                          copyToClipboard(globalSettings.header_code)
                        }
                        className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        Copy Code
                      </button>
                    )}
                  </div>
                </div>

                {/* Body Code */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Zap className="w-5 h-5 text-gray-600" />
                    <h4 className="text-md font-medium text-gray-900">
                      Body Code
                    </h4>
                    <div className="flex items-center space-x-1 text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                      <Info className="w-3 h-3" />
                      <span>Injected after &lt;body&gt;</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Code added here will be injected right after the opening
                    &lt;body&gt; tag. Ideal for tracking pixels, chat widgets,
                    or JavaScript that needs to load early.
                  </p>
                  <textarea
                    value={globalSettings.body_code}
                    onChange={e =>
                      setGlobalSettings(prev => ({
                        ...prev,
                        body_code: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent font-mono text-sm"
                    rows={8}
                    placeholder={`<!-- Example: Facebook Pixel -->
<script>
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', 'YOUR_PIXEL_ID');
  fbq('track', 'PageView');
</script>

<!-- Example: Chat Widget -->
<div id="chat-widget"></div>`}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">
                      {globalSettings.body_code.length} characters
                    </span>
                    {globalSettings.body_code && (
                      <button
                        onClick={() =>
                          copyToClipboard(globalSettings.body_code)
                        }
                        className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        Copy Code
                      </button>
                    )}
                  </div>
                </div>

                {/* Footer Code */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Hash className="w-5 h-5 text-gray-600" />
                    <h4 className="text-md font-medium text-gray-900">
                      Footer Code
                    </h4>
                    <div className="flex items-center space-x-1 text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                      <Info className="w-3 h-3" />
                      <span>Injected before &lt;/body&gt;</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Code added here will be injected right before the closing
                    &lt;/body&gt; tag. Best for JavaScript that should load
                    after page content, like analytics or performance scripts.
                  </p>
                  <textarea
                    value={globalSettings.footer_code}
                    onChange={e =>
                      setGlobalSettings(prev => ({
                        ...prev,
                        footer_code: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent font-mono text-sm"
                    rows={8}
                    placeholder={`<!-- Example: Performance Monitoring -->
<script>
  // Custom performance tracking
  window.addEventListener('load', function() {
    const perfData = performance.getEntriesByType('navigation')[0];
    console.log('Page load time:', perfData.loadEventEnd - perfData.fetchStart);
  });
</script>

<!-- Example: Custom JavaScript -->
<script>
  // Your custom JavaScript code
  document.addEventListener('DOMContentLoaded', function() {
    // Initialize your app
  });
</script>`}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">
                      {globalSettings.footer_code.length} characters
                    </span>
                    {globalSettings.footer_code && (
                      <button
                        onClick={() =>
                          copyToClipboard(globalSettings.footer_code)
                        }
                        className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        Copy Code
                      </button>
                    )}
                  </div>
                </div>

                {/* Warning Notice */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800">
                        Important Notes
                      </h4>
                      <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                        <li>
                          • Test all injected code thoroughly before deploying
                          to production
                        </li>
                        <li>
                          • Malformed HTML/JavaScript can break your entire site
                        </li>
                        <li>
                          • Use proper script tags and ensure all tags are
                          properly closed
                        </li>
                        <li>
                          • Consider page load performance when adding tracking
                          scripts
                        </li>
                        <li>
                          • Backup your settings before making major changes
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Page SEO Modal */}
      {showPageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingPage ? 'Edit Page SEO' : 'Add Page SEO'}
                </h3>

                {/* Smart Suggestions Buttons */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={generateSEOSuggestions}
                    disabled={loadingSuggestions || !pageForm.page_path}
                    className="flex items-center space-x-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                    title="Fill empty fields with smart suggestions"
                  >
                    {loadingSuggestions ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Wand2 className="w-4 h-4" />
                    )}
                    <span>Smart Fill</span>
                  </button>

                  <button
                    onClick={smartFillAllFields}
                    disabled={loadingSuggestions || !pageForm.page_path}
                    className="flex items-center space-x-2 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                    title="Replace all fields with smart suggestions"
                  >
                    {loadingSuggestions ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Brain className="w-4 h-4" />
                    )}
                    <span>Auto Fill All</span>
                  </button>
                </div>
              </div>

              <button
                onClick={() => setShowPageModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <button
                  onClick={() => toggleSection('basic')}
                  className="flex items-center space-x-2 text-left w-full"
                >
                  {expandedSections.includes('basic') ? (
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  )}
                  <h4 className="text-md font-medium text-gray-900">
                    Basic Information
                  </h4>
                </button>

                {expandedSections.includes('basic') && (
                  <div className="ml-6 space-y-4">
                    {/* Smart Suggestions Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-medium text-blue-800">
                            Smart SEO Suggestions
                          </h4>
                          <p className="text-sm text-blue-700 mt-1">
                            After entering the page path, use the "Smart Fill"
                            button above to auto-fill empty fields, or use "Auto
                            Fill All" to replace all fields. Suggestions are
                            intelligently generated based on your global SEO
                            settings and page type.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Page Path *
                        </label>
                        <input
                          type="text"
                          value={pageForm.page_path || ''}
                          onChange={e =>
                            setPageForm(prev => ({
                              ...prev,
                              page_path: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                          placeholder="/about"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Page Title
                        </label>
                        <input
                          type="text"
                          value={pageForm.page_title || ''}
                          onChange={e =>
                            setPageForm(prev => ({
                              ...prev,
                              page_title: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                          placeholder="About Us"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-sm font-medium text-gray-700">
                          Meta Title
                        </label>
                        <button
                          onClick={async () => {
                            if (!pageForm.page_path) return
                            try {
                              setLoadingSuggestions(true)
                              const token = localStorage.getItem('adminToken')
                              const response = await fetch(
                                '/api/admin/seo/suggestions',
                                {
                                  method: 'POST',
                                  headers: {
                                    Authorization: `Bearer ${token}`,
                                    'Content-Type': 'application/json',
                                  },
                                  body: JSON.stringify({
                                    page_path: pageForm.page_path,
                                    page_title: pageForm.page_title,
                                    page_type: inferPageType(
                                      pageForm.page_path
                                    ),
                                  }),
                                }
                              )
                              if (response.ok) {
                                const data = await response.json()
                                setPageForm(prev => ({
                                  ...prev,
                                  meta_title: data.suggestions.meta_title,
                                }))
                              }
                            } catch (error) {
                              console.error(
                                'Error generating suggestion:',
                                error
                              )
                            } finally {
                              setLoadingSuggestions(false)
                            }
                          }}
                          disabled={loadingSuggestions || !pageForm.page_path}
                          className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                          title="Generate suggestion for this field"
                        >
                          <Wand2 className="w-3 h-3" />
                          <span>Suggest</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        value={pageForm.meta_title || ''}
                        onChange={e =>
                          setPageForm(prev => ({
                            ...prev,
                            meta_title: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        placeholder="About Us - Your Site Name"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {pageForm.meta_title?.length || 0}/60 characters
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-sm font-medium text-gray-700">
                          Meta Description
                        </label>
                        <button
                          onClick={async () => {
                            if (!pageForm.page_path) return
                            try {
                              setLoadingSuggestions(true)
                              const token = localStorage.getItem('adminToken')
                              const response = await fetch(
                                '/api/admin/seo/suggestions',
                                {
                                  method: 'POST',
                                  headers: {
                                    Authorization: `Bearer ${token}`,
                                    'Content-Type': 'application/json',
                                  },
                                  body: JSON.stringify({
                                    page_path: pageForm.page_path,
                                    page_title: pageForm.page_title,
                                    page_type: inferPageType(
                                      pageForm.page_path
                                    ),
                                  }),
                                }
                              )
                              if (response.ok) {
                                const data = await response.json()
                                setPageForm(prev => ({
                                  ...prev,
                                  meta_description:
                                    data.suggestions.meta_description,
                                }))
                              }
                            } catch (error) {
                              console.error(
                                'Error generating suggestion:',
                                error
                              )
                            } finally {
                              setLoadingSuggestions(false)
                            }
                          }}
                          disabled={loadingSuggestions || !pageForm.page_path}
                          className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                          title="Generate suggestion for this field"
                        >
                          <Wand2 className="w-3 h-3" />
                          <span>Suggest</span>
                        </button>
                      </div>
                      <textarea
                        value={pageForm.meta_description || ''}
                        onChange={e =>
                          setPageForm(prev => ({
                            ...prev,
                            meta_description: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        rows={3}
                        placeholder="Learn more about our company and mission..."
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {pageForm.meta_description?.length || 0}/160 characters
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Canonical URL
                        </label>
                        <input
                          type="text"
                          value={pageForm.canonical_url || ''}
                          onChange={e =>
                            setPageForm(prev => ({
                              ...prev,
                              canonical_url: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                          placeholder="https://yoursite.com/about"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Robots Meta
                        </label>
                        <select
                          value={pageForm.robots_meta || 'index, follow'}
                          onChange={e =>
                            setPageForm(prev => ({
                              ...prev,
                              robots_meta: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        >
                          <option value="index, follow">Index, Follow</option>
                          <option value="noindex, follow">
                            No Index, Follow
                          </option>
                          <option value="index, nofollow">
                            Index, No Follow
                          </option>
                          <option value="noindex, nofollow">
                            No Index, No Follow
                          </option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-sm font-medium text-gray-700">
                          Keywords
                        </label>
                        <button
                          onClick={async () => {
                            if (!pageForm.page_path) return
                            try {
                              setLoadingSuggestions(true)
                              const token = localStorage.getItem('adminToken')
                              const response = await fetch(
                                '/api/admin/seo/suggestions',
                                {
                                  method: 'POST',
                                  headers: {
                                    Authorization: `Bearer ${token}`,
                                    'Content-Type': 'application/json',
                                  },
                                  body: JSON.stringify({
                                    page_path: pageForm.page_path,
                                    page_title: pageForm.page_title,
                                    page_type: inferPageType(
                                      pageForm.page_path
                                    ),
                                  }),
                                }
                              )
                              if (response.ok) {
                                const data = await response.json()
                                setPageForm(prev => ({
                                  ...prev,
                                  keywords: data.suggestions.keywords,
                                }))
                              }
                            } catch (error) {
                              console.error(
                                'Error generating suggestion:',
                                error
                              )
                            } finally {
                              setLoadingSuggestions(false)
                            }
                          }}
                          disabled={loadingSuggestions || !pageForm.page_path}
                          className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                          title="Generate suggestion for this field"
                        >
                          <Wand2 className="w-3 h-3" />
                          <span>Suggest</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        value={pageForm.keywords || ''}
                        onChange={e =>
                          setPageForm(prev => ({
                            ...prev,
                            keywords: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        placeholder="keyword1, keyword2, keyword3"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Social Media */}
              <div className="space-y-4">
                <button
                  onClick={() => toggleSection('social')}
                  className="flex items-center space-x-2 text-left w-full"
                >
                  {expandedSections.includes('social') ? (
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  )}
                  <h4 className="text-md font-medium text-gray-900">
                    Social Media (Open Graph & Twitter)
                  </h4>
                </button>

                {expandedSections.includes('social') && (
                  <div className="ml-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Open Graph */}
                      <div className="space-y-4">
                        <h5 className="text-sm font-medium text-gray-900">
                          Open Graph (Facebook)
                        </h5>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            OG Title
                          </label>
                          <input
                            type="text"
                            value={pageForm.og_title || ''}
                            onChange={e =>
                              setPageForm(prev => ({
                                ...prev,
                                og_title: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                            placeholder="About Us"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            OG Description
                          </label>
                          <textarea
                            value={pageForm.og_description || ''}
                            onChange={e =>
                              setPageForm(prev => ({
                                ...prev,
                                og_description: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                            rows={3}
                            placeholder="Learn more about our company..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            OG Image URL
                          </label>
                          <input
                            type="text"
                            value={pageForm.og_image || ''}
                            onChange={e =>
                              setPageForm(prev => ({
                                ...prev,
                                og_image: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                            placeholder="https://yoursite.com/og-about.jpg"
                          />
                        </div>
                      </div>

                      {/* Twitter */}
                      <div className="space-y-4">
                        <h5 className="text-sm font-medium text-gray-900">
                          Twitter Card
                        </h5>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Twitter Title
                          </label>
                          <input
                            type="text"
                            value={pageForm.twitter_title || ''}
                            onChange={e =>
                              setPageForm(prev => ({
                                ...prev,
                                twitter_title: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                            placeholder="About Us"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Twitter Description
                          </label>
                          <textarea
                            value={pageForm.twitter_description || ''}
                            onChange={e =>
                              setPageForm(prev => ({
                                ...prev,
                                twitter_description: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                            rows={3}
                            placeholder="Learn more about our company..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Twitter Image URL
                          </label>
                          <input
                            type="text"
                            value={pageForm.twitter_image || ''}
                            onChange={e =>
                              setPageForm(prev => ({
                                ...prev,
                                twitter_image: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                            placeholder="https://yoursite.com/twitter-about.jpg"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Schema Markup */}
              <div className="space-y-4">
                <button
                  onClick={() => toggleSection('schema')}
                  className="flex items-center space-x-2 text-left w-full"
                >
                  {expandedSections.includes('schema') ? (
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  )}
                  <h4 className="text-md font-medium text-gray-900">
                    Schema Markup (JSON-LD)
                  </h4>
                </button>

                {expandedSections.includes('schema') && (
                  <div className="ml-6 space-y-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <span className="text-sm text-gray-600">
                        Quick templates:
                      </span>
                      <button
                        onClick={() =>
                          setPageForm(prev => ({
                            ...prev,
                            schema_markup: generateSchemaTemplate('website'),
                          }))
                        }
                        className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                      >
                        Website
                      </button>
                      <button
                        onClick={() =>
                          setPageForm(prev => ({
                            ...prev,
                            schema_markup: generateSchemaTemplate('article'),
                          }))
                        }
                        className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                      >
                        Article
                      </button>
                      <button
                        onClick={() =>
                          setPageForm(prev => ({
                            ...prev,
                            schema_markup: generateSchemaTemplate('blogpost'),
                          }))
                        }
                        className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors"
                      >
                        Blog Post
                      </button>
                      <button
                        onClick={() =>
                          setPageForm(prev => ({
                            ...prev,
                            schema_markup:
                              generateSchemaTemplate('organization'),
                          }))
                        }
                        className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
                      >
                        Organization
                      </button>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-sm font-medium text-gray-700">
                          JSON-LD Schema Markup
                        </label>
                        <button
                          onClick={async () => {
                            if (!pageForm.page_path) return
                            try {
                              setLoadingSuggestions(true)
                              const token = localStorage.getItem('adminToken')
                              const response = await fetch(
                                '/api/admin/seo/suggestions',
                                {
                                  method: 'POST',
                                  headers: {
                                    Authorization: `Bearer ${token}`,
                                    'Content-Type': 'application/json',
                                  },
                                  body: JSON.stringify({
                                    page_path: pageForm.page_path,
                                    page_title: pageForm.page_title,
                                    page_type: inferPageType(
                                      pageForm.page_path
                                    ),
                                  }),
                                }
                              )
                              if (response.ok) {
                                const data = await response.json()
                                setPageForm(prev => ({
                                  ...prev,
                                  schema_markup: data.suggestions.schema_markup,
                                }))
                              }
                            } catch (error) {
                              console.error(
                                'Error generating suggestion:',
                                error
                              )
                            } finally {
                              setLoadingSuggestions(false)
                            }
                          }}
                          disabled={loadingSuggestions || !pageForm.page_path}
                          className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                          title="Generate schema markup for this page type"
                        >
                          <Brain className="w-3 h-3" />
                          <span>Generate Schema</span>
                        </button>
                      </div>
                      <textarea
                        value={pageForm.schema_markup || ''}
                        onChange={e =>
                          setPageForm(prev => ({
                            ...prev,
                            schema_markup: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent font-mono text-sm"
                        rows={12}
                        placeholder={`{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Page Name",
  "description": "Page description",
  "url": "https://yoursite.com/page"
}`}
                      />
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {pageForm.schema_markup?.length || 0} characters
                        </span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              try {
                                if (pageForm.schema_markup) {
                                  JSON.parse(pageForm.schema_markup)
                                  showMessage('success', 'Valid JSON schema')
                                }
                              } catch (error) {
                                showMessage('error', 'Invalid JSON format')
                              }
                            }}
                            className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            Validate JSON
                          </button>
                          {pageForm.schema_markup && (
                            <button
                              onClick={() =>
                                copyToClipboard(pageForm.schema_markup || '')
                              }
                              className="text-xs text-gray-600 hover:text-gray-800 transition-colors"
                            >
                              Copy
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => setShowPageModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePage}
                disabled={saving}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving && <RefreshCw className="w-4 h-4 animate-spin" />}
                <span>{editingPage ? 'Update' : 'Create'} Page SEO</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && previewPage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                SEO Preview - {previewPage.page_title}
              </h3>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Google Search Preview */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                  <Search className="w-4 h-4 mr-2" />
                  Google Search Preview
                </h4>
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="text-blue-600 text-lg hover:underline cursor-pointer">
                    {previewPage.meta_title}
                  </div>
                  <div className="text-green-600 text-sm mt-1">
                    {previewPage.canonical_url ||
                      `https://yoursite.com${previewPage.page_path}`}
                  </div>
                  <div className="text-gray-700 text-sm mt-2">
                    {previewPage.meta_description}
                  </div>
                </div>
              </div>

              {/* Facebook Preview */}
              {previewPage.og_title && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                    <Target className="w-4 h-4 mr-2" />
                    Facebook Preview
                  </h4>
                  <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                    {previewPage.og_image && (
                      <div className="h-48 bg-gray-200 flex items-center justify-center">
                        <img
                          src={previewPage.og_image}
                          alt="OG Preview"
                          className="max-h-full max-w-full object-cover"
                          onError={e => {
                            e.currentTarget.style.display = 'none'
                            const parent = e.currentTarget.parentElement!
                            parent.innerHTML =
                              '<div class="w-full h-full bg-gray-200 flex items-center justify-center"><span class="text-gray-400 text-sm">No Preview</span></div>'
                          }}
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="text-sm text-gray-500 uppercase tracking-wide">
                        yoursite.com
                      </div>
                      <div className="text-lg font-medium text-gray-900 mt-1">
                        {previewPage.og_title}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {previewPage.og_description}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Twitter Preview */}
              {previewPage.twitter_title && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                    <Smartphone className="w-4 h-4 mr-2" />
                    Twitter Preview
                  </h4>
                  <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                    {previewPage.twitter_image && (
                      <div className="h-40 bg-gray-200 flex items-center justify-center">
                        <img
                          src={previewPage.twitter_image}
                          alt="Twitter Preview"
                          className="max-h-full max-w-full object-cover"
                          onError={e => {
                            e.currentTarget.style.display = 'none'
                            const parent = e.currentTarget.parentElement!
                            parent.innerHTML =
                              '<div class="w-full h-full bg-gray-200 flex items-center justify-center"><span class="text-gray-400 text-sm">No Preview</span></div>'
                          }}
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="text-sm font-medium text-gray-900">
                        {previewPage.twitter_title}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {previewPage.twitter_description}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        yoursite.com
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Schema Markup */}
              {previewPage.schema_markup && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                    <Brackets className="w-4 h-4 mr-2" />
                    Schema Markup
                  </h4>
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                      {previewPage.schema_markup}
                    </pre>
                    <button
                      onClick={() =>
                        copyToClipboard(previewPage.schema_markup || '')
                      }
                      className="mt-2 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      Copy Schema
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && deletingPage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Delete Page SEO
              </h3>
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
                    Are you sure you want to delete SEO settings for{' '}
                    <strong>"{deletingPage.page_title}"</strong>?
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
                onClick={handleDeletePage}
                disabled={saving}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving && <RefreshCw className="w-4 h-4 animate-spin" />}
                <span>Delete SEO Settings</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sync Pages Modal */}
      {showSyncModal && syncData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Sync Pages with SEO Settings
              </h3>
              <button
                onClick={() => setShowSyncModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sync Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center">
                  <FileText className="w-5 h-5 text-blue-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Total Pages
                    </p>
                    <p className="text-xl font-bold text-blue-600">
                      {syncData.summary.total_discovered}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-green-900">
                      Has SEO Config
                    </p>
                    <p className="text-xl font-bold text-green-600">
                      {syncData.summary.existing_seo_configs}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <div className="flex items-center">
                  <Plus className="w-5 h-5 text-orange-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-orange-900">
                      New Pages
                    </p>
                    <p className="text-xl font-bold text-orange-600">
                      {syncData.summary.new_pages}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-red-900">Orphaned</p>
                    <p className="text-xl font-bold text-red-600">
                      {syncData.summary.orphaned_configs}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* New Pages Section */}
            {syncData.new_pages && syncData.new_pages.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-md font-medium text-gray-900 flex items-center">
                    <Plus className="w-4 h-4 mr-2 text-orange-600" />
                    New Pages Found ({syncData.new_pages.length})
                  </h4>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() =>
                        setSelectedNewPages(
                          syncData.new_pages.map((p: any) => p.page_path)
                        )
                      }
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Select All
                    </button>
                    <button
                      onClick={() => setSelectedNewPages([])}
                      className="text-sm text-gray-600 hover:text-gray-800"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
                <div className="bg-orange-50 rounded-lg border border-orange-200 p-4">
                  <p className="text-sm text-orange-800 mb-4">
                    These pages exist in your application but don't have SEO
                    configurations yet. Select which ones you'd like to create
                    SEO settings for:
                  </p>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {syncData.new_pages.map((page: any) => (
                      <label
                        key={page.page_path}
                        className="flex items-center space-x-3 p-2 hover:bg-orange-100 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={selectedNewPages.includes(page.page_path)}
                          onChange={e => {
                            if (e.target.checked) {
                              setSelectedNewPages(prev => [
                                ...prev,
                                page.page_path,
                              ])
                            } else {
                              setSelectedNewPages(prev =>
                                prev.filter(p => p !== page.page_path)
                              )
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {page.page_title}
                          </div>
                          <div className="text-xs text-gray-600">
                            {page.page_path}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                          {page.file_path
                            .replace(/^.*\/fun88-v1/, '')
                            .replace(/\\/g, '/')}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Orphaned Configs Section */}
            {syncData.orphaned_configs &&
              syncData.orphaned_configs.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2 text-red-600" />
                    Orphaned SEO Configurations (
                    {syncData.orphaned_configs.length})
                  </h4>
                  <div className="bg-red-50 rounded-lg border border-red-200 p-4">
                    <p className="text-sm text-red-800 mb-4">
                      These SEO configurations exist but their corresponding
                      pages were not found. You may want to review and clean
                      them up:
                    </p>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {syncData.orphaned_configs.map((config: any) => (
                        <div
                          key={config.id}
                          className="flex items-center justify-between p-2 bg-white rounded border border-red-200"
                        >
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {config.page_title}
                            </div>
                            <div className="text-xs text-gray-600">
                              {config.page_path}
                            </div>
                          </div>
                          <button
                            onClick={() => openPageModal(config)}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            Edit
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            {/* All Discovered Pages */}
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                <FileText className="w-4 h-4 mr-2 text-blue-600" />
                All Discovered Pages ({syncData.discovered_pages.length})
              </h4>
              <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                <div className="max-h-60 overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b border-gray-200 sticky top-0">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Page
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Path
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {syncData.discovered_pages.map((page: any) => (
                        <tr key={page.page_path}>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {page.page_title}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600">
                            {page.page_path}
                          </td>
                          <td className="px-4 py-2">
                            {page.exists_in_seo ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Has SEO
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                <Plus className="w-3 h-3 mr-1" />
                                New
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                onClick={() => setShowSyncModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              {selectedNewPages.length > 0 && (
                <button
                  onClick={handleCreateSelectedPages}
                  disabled={syncing}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {syncing && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <span>
                    Create SEO for {selectedNewPages.length} Page
                    {selectedNewPages.length > 1 ? 's' : ''}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
