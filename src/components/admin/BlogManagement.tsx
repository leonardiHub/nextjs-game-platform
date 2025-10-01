'use client'

import { useState, useEffect } from 'react'
import BlogEditor from './BlogEditor'
import { adminGet, adminDelete, adminPost } from '@/utils/adminApi'
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Search,
  RefreshCw,
  Eye,
  EyeOff,
  Calendar,
  User,
  AlertCircle,
  CheckCircle2,
  X,
  Filter,
  ChevronDown,
  Globe,
  Clock,
  TrendingUp,
} from 'lucide-react'

interface BlogPost {
  id: number
  title: string
  slug: string
  excerpt: string
  content: string
  featured_image_id: number | null
  featured_image_url: string | null
  author: string
  status: 'draft' | 'published' | 'scheduled'
  category_id: number | null
  category_name: string | null
  tags: string[]
  views: number
  created_at: string
  updated_at: string
  published_at: string | null
  scheduled_at: string | null
  seo_title: string
  seo_description: string
  category_path?: string
  full_url?: string
}

interface BlogFilter {
  status: 'all' | 'draft' | 'published' | 'scheduled'
  category: string
  author: string
  dateRange: 'all' | 'today' | 'week' | 'month'
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface BlogStats {
  total: number
  published: number
  draft: number
  scheduled: number
  totalViews: number
}

export default function BlogManagement() {
  const [blogs, setBlogs] = useState<BlogPost[]>([])
  const [allBlogs, setAllBlogs] = useState<BlogPost[]>([]) // Store all blogs for stats calculation
  const [stats, setStats] = useState<BlogStats>({
    total: 0,
    published: 0,
    draft: 0,
    scheduled: 0,
    totalViews: 0,
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [showEditor, setShowEditor] = useState(false)
  const [editingBlogId, setEditingBlogId] = useState<number | undefined>()
  const [filters, setFilters] = useState<BlogFilter>({
    status: 'all',
    category: '',
    author: '',
    dateRange: 'all',
  })
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null)
  const [formLoading, setFormLoading] = useState(false)

  // Message state
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  // API functions
  const fetchBlogs = async () => {
    const params = {
      page: pagination.page.toString(),
      limit: pagination.limit.toString(),
      search: searchTerm,
      status: filters.status,
      category: filters.category,
      author: filters.author,
    }

    return adminGet('/blogs', params)
  }

  const fetchAllBlogs = async () => {
    // Fetch all blogs without pagination for statistics
    return adminGet('/blogs', { limit: '1000' })
  }

  const deleteBlog = async (blogId: number) => {
    return adminDelete(`/blogs/${blogId}`)
  }

  const toggleBlogStatus = async (blogId: number) => {
    return adminPost(`/blogs/${blogId}/toggle-status`)
  }

  const calculateStats = (blogs: BlogPost[]): BlogStats => {
    return {
      total: blogs.length,
      published: blogs.filter(blog => blog.status === 'published').length,
      draft: blogs.filter(blog => blog.status === 'draft').length,
      scheduled: blogs.filter(blog => blog.status === 'scheduled').length,
      totalViews: blogs.reduce((sum, blog) => sum + blog.views, 0),
    }
  }

  useEffect(() => {
    loadBlogs()
    loadAllBlogsForStats()
  }, [pagination.page, searchTerm, filters])

  useEffect(() => {
    // Update stats when allBlogs changes
    if (allBlogs.length > 0) {
      setStats(calculateStats(allBlogs))
    }
  }, [allBlogs])

  const loadBlogs = async () => {
    try {
      setLoading(true)

      const data = await fetchBlogs()

      setBlogs(data.blogs || [])
      setPagination(prev => ({
        ...prev,
        total: data.pagination?.total || 0,
        totalPages: data.pagination?.totalPages || 0,
      }))
    } catch (error: any) {
      console.error('Error loading blogs:', error)
      showMessage('error', error.message || 'Failed to load blog posts')
    } finally {
      setLoading(false)
    }
  }

  const loadAllBlogsForStats = async () => {
    try {
      const data = await fetchAllBlogs()
      setAllBlogs(data.blogs || [])
    } catch (error: any) {
      console.error('Error loading blogs for stats:', error)
      // Don't show error message for stats loading failure
    }
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const handleDeleteBlog = async () => {
    if (!selectedBlog) return

    try {
      setFormLoading(true)

      await deleteBlog(selectedBlog.id)

      showMessage(
        'success',
        `Blog "${selectedBlog.title}" deleted successfully`
      )
      setShowDeleteModal(false)
      setSelectedBlog(null)
      loadBlogs()
      loadAllBlogsForStats()
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to delete blog')
    } finally {
      setFormLoading(false)
    }
  }

  const handleToggleBlogStatus = async (blog: BlogPost) => {
    try {
      const result = await toggleBlogStatus(blog.id)

      showMessage(
        'success',
        result.message || 'Blog status updated successfully'
      )
      loadBlogs()
      loadAllBlogsForStats()
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to update blog status')
    }
  }

  const openDeleteModal = (blog: BlogPost) => {
    setSelectedBlog(blog)
    setShowDeleteModal(true)
  }

  const openEditor = (blogId?: number) => {
    setEditingBlogId(blogId)
    setShowEditor(true)
  }

  const closeEditor = () => {
    setShowEditor(false)
    setEditingBlogId(undefined)
  }

  const handleEditorSave = () => {
    closeEditor()
    loadBlogs()
    loadAllBlogsForStats()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <Globe className="w-3 h-3" />
      case 'draft':
        return <Edit className="w-3 h-3" />
      case 'scheduled':
        return <Clock className="w-3 h-3" />
      default:
        return <Eye className="w-3 h-3" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const resetFilters = () => {
    setFilters({
      status: 'all',
      category: '',
      author: '',
      dateRange: 'all',
    })
    setSearchTerm('')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-6 h-6 animate-spin text-gray-600" />
          <span className="text-gray-600">Loading blog posts...</span>
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
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Blog Management
            </h2>
            <p className="text-gray-600">Manage your blog posts and content</p>
          </div>
        </div>
        <button
          onClick={() => openEditor()}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Blog Post</span>
        </button>
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
              <p className="text-sm font-medium text-gray-600">Total Posts</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-sm text-gray-600">All blog posts</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Published</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.published}
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <Globe className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-sm text-gray-600">
              {stats.total > 0
                ? Math.round((stats.published / stats.total) * 100)
                : 0}
              % of total
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Drafts</p>
              <p className="text-2xl font-bold text-gray-900">{stats.draft}</p>
            </div>
            <div className="p-3 rounded-full bg-yellow-100">
              <Edit className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-sm text-gray-600">
              {stats.total > 0
                ? Math.round((stats.draft / stats.total) * 100)
                : 0}
              % of total
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Views</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalViews >= 1000
                  ? `${(stats.totalViews / 1000).toFixed(1)}K`
                  : stats.totalViews.toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-sm text-gray-600">
              Avg:{' '}
              {stats.published > 0
                ? Math.round(stats.totalViews / stats.published)
                : 0}{' '}
              per post
            </span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col space-y-4 lg:flex-row lg:space-y-0 lg:space-x-4 lg:items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search blog posts..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors ${
                showFilters
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`}
              />
            </button>

            <button
              onClick={loadBlogs}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={e =>
                    setFilters(prev => ({
                      ...prev,
                      status: e.target.value as any,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={e =>
                    setFilters(prev => ({ ...prev, category: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  <option value="Company News">Company News</option>
                  <option value="User Guide">User Guide</option>
                  <option value="System Announcement">
                    System Announcement
                  </option>
                  <option value="Game Strategy">Game Strategy</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Author
                </label>
                <select
                  value={filters.author}
                  onChange={e =>
                    setFilters(prev => ({ ...prev, author: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                >
                  <option value="">All Authors</option>
                  <option value="Admin">Admin</option>
                  <option value="Support Team">Support Team</option>
                  <option value="Tech Team">Tech Team</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Range
                </label>
                <select
                  value={filters.dateRange}
                  onChange={e =>
                    setFilters(prev => ({
                      ...prev,
                      dateRange: e.target.value as any,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end">
              <button
                onClick={resetFilters}
                className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Blog Posts Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Post
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Views
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {blogs.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No blog posts found
                  </td>
                </tr>
              ) : (
                blogs.map(blog => (
                  <tr key={blog.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-start space-x-3">
                        {blog.featured_image_url ? (
                          <img
                            src={(() => {
                              if (!blog.featured_image_url) return ''

                              // Handle external URLs
                              if (
                                blog.featured_image_url.startsWith('http') &&
                                !blog.featured_image_url.includes('localhost')
                              ) {
                                return blog.featured_image_url
                              }

                              // For local files, use backend server directly
                              let cleanUrl = blog.featured_image_url
                                .replace('http://localhost:3002', '')
                                .replace('http://localhost:3001', '')
                                .replace('https://api.99group.games', '')

                              // Ensure URL starts with /uploads
                              if (!cleanUrl.startsWith('/uploads')) {
                                cleanUrl = `/uploads/${cleanUrl.replace(/^\/+/, '')}`
                              }

                              // Return appropriate backend URL based on environment
                              const apiUrl =
                                typeof window !== 'undefined' &&
                                window.location.hostname === 'localhost'
                                  ? 'http://localhost:3002'
                                  : 'https://api.99group.games'
                              return `${apiUrl}${cleanUrl}`
                            })()}
                            alt={blog.title}
                            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                            onError={e => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                            <svg
                              className="w-6 h-6 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {blog.title}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {blog.excerpt && blog.excerpt.length > 100
                              ? blog.excerpt.substring(0, 100) + '...'
                              : blog.excerpt || ''}
                          </div>
                          {blog.full_url && (
                            <div className="text-xs text-blue-600 mt-1 font-mono">
                              {blog.full_url}
                            </div>
                          )}
                          <div className="flex items-center space-x-2 mt-2">
                            {Array.isArray(blog.tags) &&
                              blog.tags.slice(0, 3).map((tag, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                                >
                                  {tag}
                                </span>
                              ))}
                            {Array.isArray(blog.tags) &&
                              blog.tags.length > 3 && (
                                <span className="text-xs text-gray-500">
                                  +{blog.tags.length - 3}
                                </span>
                              )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(blog.status)}`}
                      >
                        {getStatusIcon(blog.status)}
                        <span>{blog.status.toUpperCase()}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {blog.author}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {blog.category_name || 'No category'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1">
                        <Eye className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {blog.views.toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {formatDate(blog.created_at)}
                      </div>
                      {blog.published_at &&
                        blog.published_at !== blog.created_at && (
                          <div className="text-xs text-gray-500 mt-1">
                            Published: {formatDate(blog.published_at)}
                          </div>
                        )}
                      {blog.status === 'scheduled' && blog.scheduled_at && (
                        <div className="text-xs text-blue-600 mt-1 flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>
                            Scheduled: {formatDate(blog.scheduled_at)}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleToggleBlogStatus(blog)}
                          className={`p-2 rounded-lg transition-colors ${
                            blog.status === 'published'
                              ? 'text-yellow-600 hover:bg-yellow-50'
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={
                            blog.status === 'published'
                              ? 'Unpublish'
                              : 'Publish'
                          }
                        >
                          {blog.status === 'published' ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => openEditor(blog.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit blog"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(blog)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete blog"
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

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{' '}
              of {pagination.total} results
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() =>
                  setPagination(prev => ({ ...prev, page: prev.page - 1 }))
                }
                disabled={pagination.page === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() =>
                  setPagination(prev => ({ ...prev, page: prev.page + 1 }))
                }
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Blog Modal */}
      {showDeleteModal && selectedBlog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Delete Blog Post
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
                    Are you sure you want to delete{' '}
                    <strong>"{selectedBlog.title}"</strong>?
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    This action cannot be undone. All associated data will be
                    permanently deleted.
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
                onClick={handleDeleteBlog}
                disabled={formLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {formLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                <span>Delete Blog</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Blog Editor Modal */}
      {showEditor && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={e => {
            // Close modal when clicking on backdrop
            if (e.target === e.currentTarget) {
              closeEditor()
            }
          }}
        >
          <div className="bg-white rounded-lg w-full max-w-7xl h-[90vh] overflow-hidden shadow-2xl">
            <BlogEditor
              blogId={editingBlogId}
              onClose={closeEditor}
              onSave={handleEditorSave}
            />
          </div>
        </div>
      )}
    </div>
  )
}
