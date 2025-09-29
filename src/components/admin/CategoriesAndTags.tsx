'use client'

import { useState, useEffect } from 'react'
import { 
  Tags as TagsIcon, 
  Folder,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  MoreHorizontal,
  X,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Hash,
  FolderTree,
  Palette,
  BarChart3,
  Eye,
  ChevronDown,
  ChevronRight,
  Move,
  Copy,
  Archive,
  Star,
  TrendingUp,
  Calendar,
  FileText
} from 'lucide-react'

interface Category {
  id: number
  name: string
  slug: string
  description?: string
  parent_id?: number
  color?: string
  post_count: number
  created_at: string
  updated_at: string
  children?: Category[]
}

interface Tag {
  id: number
  name: string
  slug: string
  description?: string
  color: string
  post_count: number
  created_at: string
  updated_at: string
  is_featured: boolean
}

interface CategoryFormData {
  name: string
  slug: string
  description: string
  parent_id?: number
  color: string
}

interface TagFormData {
  name: string
  slug: string
  description: string
  color: string
  is_featured: boolean
}

export default function CategoriesAndTags() {
  const [activeTab, setActiveTab] = useState<'categories' | 'tags'>('categories')
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [stats, setStats] = useState({
    totalCategories: 0,
    totalTags: 0,
    featuredTags: 0,
    totalPosts: 0,
    categoriesThisMonth: 0,
    tagsThisMonth: 0,
    postsThisMonth: 0
  })
  
  // Modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [showTagModal, setShowTagModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [deletingItem, setDeletingItem] = useState<{ type: 'category' | 'tag', item: Category | Tag } | null>(null)
  
  // Form states
  const [categoryForm, setCategoryForm] = useState<CategoryFormData>({
    name: '',
    slug: '',
    description: '',
    parent_id: undefined,
    color: '#3B82F6'
  })
  
  const [tagForm, setTagForm] = useState<TagFormData>({
    name: '',
    slug: '',
    description: '',
    color: '#10B981',
    is_featured: false
  })
  
  const [formLoading, setFormLoading] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<number[]>([])
  
  // Message state
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Predefined colors for categories and tags
  const colorOptions = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
    '#F97316', '#6366F1', '#14B8A6', '#EAB308'
  ]

  // Mock data for development
  const mockCategories: Category[] = [
    {
      id: 1,
      name: "Company News",
      slug: "company-news",
      description: "Official company announcements and updates",
      color: "#3B82F6",
      post_count: 12,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-15T10:00:00Z",
      children: [
        {
          id: 2,
          name: "Product Updates",
          slug: "product-updates",
          description: "New features and product improvements",
          parent_id: 1,
          color: "#06B6D4",
          post_count: 8,
          created_at: "2024-01-05T00:00:00Z",
          updated_at: "2024-01-15T10:00:00Z"
        },
        {
          id: 3,
          name: "Team News",
          slug: "team-news",
          description: "Team updates and announcements",
          parent_id: 1,
          color: "#8B5CF6",
          post_count: 4,
          created_at: "2024-01-05T00:00:00Z",
          updated_at: "2024-01-15T10:00:00Z"
        }
      ]
    },
    {
      id: 4,
      name: "User Guide",
      slug: "user-guide",
      description: "Help articles and tutorials for users",
      color: "#10B981",
      post_count: 18,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-15T10:00:00Z",
      children: [
        {
          id: 5,
          name: "Getting Started",
          slug: "getting-started",
          description: "Beginner guides and setup instructions",
          parent_id: 4,
          color: "#84CC16",
          post_count: 6,
          created_at: "2024-01-05T00:00:00Z",
          updated_at: "2024-01-15T10:00:00Z"
        }
      ]
    },
    {
      id: 6,
      name: "System Announcement",
      slug: "system-announcement",
      description: "System maintenance and technical updates",
      color: "#F59E0B",
      post_count: 5,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-15T10:00:00Z"
    },
    {
      id: 7,
      name: "Game Strategy",
      slug: "game-strategy",
      description: "Tips and strategies for games",
      color: "#EC4899",
      post_count: 15,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-15T10:00:00Z"
    }
  ]

  const mockTags: Tag[] = [
    {
      id: 1,
      name: "platform",
      slug: "platform",
      description: "Related to platform features",
      color: "#3B82F6",
      post_count: 25,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-15T10:00:00Z",
      is_featured: true
    },
    {
      id: 2,
      name: "launch",
      slug: "launch",
      description: "Product or feature launches",
      color: "#10B981",
      post_count: 8,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-15T10:00:00Z",
      is_featured: true
    },
    {
      id: 3,
      name: "gaming",
      slug: "gaming",
      description: "Gaming related content",
      color: "#EC4899",
      post_count: 32,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-15T10:00:00Z",
      is_featured: true
    },
    {
      id: 4,
      name: "benefits",
      slug: "benefits",
      description: "User benefits and rewards",
      color: "#F59E0B",
      post_count: 12,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-15T10:00:00Z",
      is_featured: false
    },
    {
      id: 5,
      name: "security",
      slug: "security",
      description: "Security and safety topics",
      color: "#EF4444",
      post_count: 6,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-15T10:00:00Z",
      is_featured: false
    },
    {
      id: 6,
      name: "tutorial",
      slug: "tutorial",
      description: "Step-by-step guides",
      color: "#8B5CF6",
      post_count: 19,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-15T10:00:00Z",
      is_featured: true
    },
    {
      id: 7,
      name: "update",
      slug: "update",
      description: "Updates and changes",
      color: "#06B6D4",
      post_count: 14,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-15T10:00:00Z",
      is_featured: false
    },
    {
      id: 8,
      name: "tips",
      slug: "tips",
      description: "Helpful tips and tricks",
      color: "#84CC16",
      post_count: 21,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-15T10:00:00Z",
      is_featured: true
    }
  ]

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    // Auto-generate slug from name
    if (categoryForm.name && !editingCategory) {
      const slug = categoryForm.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      setCategoryForm(prev => ({ ...prev, slug }))
    }
  }, [categoryForm.name, editingCategory])

  useEffect(() => {
    // Auto-generate slug from name for tags
    if (tagForm.name && !editingTag) {
      const slug = tagForm.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      setTagForm(prev => ({ ...prev, slug }))
    }
  }, [tagForm.name, editingTag])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load categories and tags from API
      const [categoriesResponse, tagsResponse] = await Promise.all([
        fetch('/api/admin/categories', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        }),
        fetch('/api/admin/tags', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        })
      ])

      if (!categoriesResponse.ok || !tagsResponse.ok) {
        throw new Error('Failed to load data')
      }

      const categoriesData = await categoriesResponse.json()
      const tagsData = await tagsResponse.json()
      
      setCategories(categoriesData)
      setTags(tagsData)
      
      // Calculate statistics
      calculateStats(categoriesData, tagsData)
    } catch (error) {
      console.error('Error loading data:', error)
      showMessage('error', 'Failed to load categories and tags')
      // Fallback to mock data for development
      setCategories(mockCategories)
      setTags(mockTags)
      calculateStats(mockCategories, mockTags)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (categoriesData: Category[], tagsData: Tag[]) => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    // Flatten categories (including children)
    const flatCategories = getAllCategories(categoriesData)
    
    // Count categories created this month
    const categoriesThisMonth = flatCategories.filter(cat => {
      const createdDate = new Date(cat.created_at)
      return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear
    }).length
    
    // Count tags created this month
    const tagsThisMonth = tagsData.filter(tag => {
      const createdDate = new Date(tag.created_at)
      return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear
    }).length
    
    // Calculate total posts from categories
    const totalPosts = flatCategories.reduce((sum, cat) => sum + cat.post_count, 0)
    
    // Count featured tags
    const featuredTags = tagsData.filter(tag => tag.is_featured).length
    
    setStats({
      totalCategories: flatCategories.length,
      totalTags: tagsData.length,
      featuredTags,
      totalPosts,
      categoriesThisMonth,
      tagsThisMonth,
      postsThisMonth: 0 // This would need additional API call to get posts created this month
    })
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const openCategoryModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category)
      setCategoryForm({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        parent_id: category.parent_id,
        color: category.color || '#3B82F6'
      })
    } else {
      setEditingCategory(null)
      setCategoryForm({
        name: '',
        slug: '',
        description: '',
        parent_id: undefined,
        color: '#3B82F6'
      })
    }
    setShowCategoryModal(true)
  }

  const openTagModal = (tag?: Tag) => {
    if (tag) {
      setEditingTag(tag)
      setTagForm({
        name: tag.name,
        slug: tag.slug,
        description: tag.description || '',
        color: tag.color,
        is_featured: tag.is_featured
      })
    } else {
      setEditingTag(null)
      setTagForm({
        name: '',
        slug: '',
        description: '',
        color: '#10B981',
        is_featured: false
      })
    }
    setShowTagModal(true)
  }

  const handleSaveCategory = async () => {
    if (!categoryForm.name) {
      showMessage('error', 'Category name is required')
      return
    }

    try {
      setFormLoading(true)
      
      const url = editingCategory 
        ? `/api/admin/categories/${editingCategory.id}`
        : '/api/admin/categories'
      
      const method = editingCategory ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(categoryForm)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save category')
      }
      
      const action = editingCategory ? 'updated' : 'created'
      showMessage('success', `Category ${action} successfully`)
      setShowCategoryModal(false)
      loadData()
    } catch (error: any) {
      showMessage('error', error.message)
    } finally {
      setFormLoading(false)
    }
  }

  const handleSaveTag = async () => {
    if (!tagForm.name) {
      showMessage('error', 'Tag name is required')
      return
    }

    try {
      setFormLoading(true)
      
      const url = editingTag 
        ? `/api/admin/tags/${editingTag.id}`
        : '/api/admin/tags'
      
      const method = editingTag ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(tagForm)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save tag')
      }
      
      const action = editingTag ? 'updated' : 'created'
      showMessage('success', `Tag ${action} successfully`)
      setShowTagModal(false)
      loadData()
    } catch (error: any) {
      showMessage('error', error.message)
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingItem) return

    try {
      setFormLoading(true)
      
      const url = deletingItem.type === 'category' 
        ? `/api/admin/categories/${deletingItem.item.id}`
        : `/api/admin/tags/${deletingItem.item.id}`
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || `Failed to delete ${deletingItem.type}`)
      }
      
      showMessage('success', `${deletingItem.type} deleted successfully`)
      setShowDeleteModal(false)
      setDeletingItem(null)
      loadData()
    } catch (error: any) {
      showMessage('error', error.message)
    } finally {
      setFormLoading(false)
    }
  }

  const toggleCategoryExpanded = (categoryId: number) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const renderCategoryTree = (categories: Category[], level = 0) => {
    return categories.map((category) => (
      <div key={category.id}>
        <div className={`flex items-center justify-between py-3 px-4 hover:bg-gray-50 ${level > 0 ? 'ml-8' : ''}`}>
          <div className="flex items-center space-x-3 flex-1">
            {category.children && category.children.length > 0 ? (
              <button
                onClick={() => toggleCategoryExpanded(category.id)}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
              >
                {expandedCategories.includes(category.id) ? (
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                )}
              </button>
            ) : (
              <div className="w-6" />
            )}
            
            <div className="flex items-center space-x-3">
              <div 
                className="w-4 h-4 rounded"
                style={{ backgroundColor: category.color }}
              />
              <Folder className="w-4 h-4 text-gray-400" />
              <div>
                <div className="font-medium text-gray-900">{category.name}</div>
                <div className="text-sm text-gray-500">{category.slug}</div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">{category.post_count} posts</span>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => openCategoryModal(category)}
                className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="Edit"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setDeletingItem({ type: 'category', item: category })
                  setShowDeleteModal(true)
                }}
                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        {category.children && category.children.length > 0 && expandedCategories.includes(category.id) && (
          <div className="border-l-2 border-gray-200 ml-4">
            {renderCategoryTree(category.children, level + 1)}
          </div>
        )}
      </div>
    ))
  }

  const getParentCategories = (categories: Category[]): Category[] => {
    return categories.filter(cat => !cat.parent_id)
  }

  const getAllCategories = (categories: Category[]): Category[] => {
    const result: Category[] = []
    
    const flatten = (cats: Category[]) => {
      cats.forEach(cat => {
        result.push(cat)
        if (cat.children) {
          flatten(cat.children)
        }
      })
    }
    
    flatten(categories)
    return result
  }

  const filteredTags = tags.filter(tag => 
    !searchTerm || 
    tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tag.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-6 h-6 animate-spin text-gray-600" />
          <span className="text-gray-600">Loading categories and tags...</span>
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
            <TagsIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Categories & Tags</h2>
            <p className="text-gray-600">Organize your content with categories and tags</p>
          </div>
        </div>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Categories</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCategories}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <Folder className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className={`text-sm font-medium ${stats.categoriesThisMonth > 0 ? 'text-green-600' : 'text-gray-500'}`}>
              {stats.categoriesThisMonth > 0 ? `+${stats.categoriesThisMonth}` : '0'}
            </span>
            <span className="text-sm text-gray-600 ml-2">this month</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tags</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTags}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <TagsIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className={`text-sm font-medium ${stats.tagsThisMonth > 0 ? 'text-green-600' : 'text-gray-500'}`}>
              {stats.tagsThisMonth > 0 ? `+${stats.tagsThisMonth}` : '0'}
            </span>
            <span className="text-sm text-gray-600 ml-2">this month</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Featured Tags</p>
              <p className="text-2xl font-bold text-gray-900">{stats.featuredTags}</p>
            </div>
            <div className="p-3 rounded-full bg-yellow-100">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-sm font-medium text-blue-600">Featured</span>
            <span className="text-sm text-gray-600 ml-2">most used</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Posts</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPosts}</p>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className={`text-sm font-medium ${stats.postsThisMonth > 0 ? 'text-green-600' : 'text-gray-500'}`}>
              {stats.postsThisMonth > 0 ? `+${stats.postsThisMonth}` : 'N/A'}
            </span>
            <span className="text-sm text-gray-600 ml-2">this month</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('categories')}
              className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'categories'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Folder className="w-4 h-4" />
                <span>Categories</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('tags')}
              className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'tags'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <TagsIcon className="w-4 h-4" />
                <span>Tags</span>
              </div>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'categories' && (
            <div className="space-y-6">
              {/* Categories Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
                  <p className="text-sm text-gray-600">Organize your content in hierarchical categories</p>
                </div>
                <button
                  onClick={() => openCategoryModal()}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Category</span>
                </button>
              </div>

              {/* Categories Tree */}
              <div className="bg-gray-50 rounded-lg border border-gray-200">
                {categories.length === 0 ? (
                  <div className="p-12 text-center">
                    <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No categories found</p>
                    <button
                      onClick={() => openCategoryModal()}
                      className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Create your first category
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {renderCategoryTree(getParentCategories(categories))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'tags' && (
            <div className="space-y-6">
              {/* Tags Header */}
              <div className="flex flex-col space-y-4 lg:flex-row lg:space-y-0 lg:items-center lg:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Tags</h3>
                  <p className="text-sm text-gray-600">Add flexible labels to categorize your content</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search tags..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={() => openTagModal()}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Tag</span>
                  </button>
                </div>
              </div>

              {/* Featured Tags */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Featured Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {tags.filter(tag => tag.is_featured).map(tag => (
                    <div
                      key={tag.id}
                      className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium text-white cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: tag.color }}
                      onClick={() => openTagModal(tag)}
                    >
                      <Hash className="w-3 h-3" />
                      <span>{tag.name}</span>
                      <Star className="w-3 h-3" />
                      <span className="text-xs opacity-75">({tag.post_count})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* All Tags */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTags.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <TagsIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No tags found</p>
                    <button
                      onClick={() => openTagModal()}
                      className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Create your first tag
                    </button>
                  </div>
                ) : (
                  filteredTags.map(tag => (
                    <div
                      key={tag.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => openTagModal(tag)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: tag.color }}
                          />
                          <Hash className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{tag.name}</span>
                          {tag.is_featured && (
                            <Star className="w-4 h-4 text-yellow-500" />
                          )}
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              openTagModal(tag)
                            }}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setDeletingItem({ type: 'tag', item: tag })
                              setShowDeleteModal(true)
                            }}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{tag.description || 'No description'}</p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{tag.post_count} posts</span>
                        <span>{formatDate(tag.created_at)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </h3>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="Category name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="category-slug"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  rows={3}
                  placeholder="Category description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parent Category
                </label>
                <select
                  value={categoryForm.parent_id || ''}
                  onChange={(e) => setCategoryForm(prev => ({ 
                    ...prev, 
                    parent_id: e.target.value ? parseInt(e.target.value) : undefined 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                >
                  <option value="">No parent (Top level)</option>
                  {getAllCategories(categories)
                    .filter(cat => !editingCategory || cat.id !== editingCategory.id)
                    .map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map(color => (
                    <button
                      key={color}
                      onClick={() => setCategoryForm(prev => ({ ...prev, color }))}
                      className={`w-8 h-8 rounded-lg border-2 transition-all ${
                        categoryForm.color === color 
                          ? 'border-gray-900 scale-110' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCategoryModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCategory}
                disabled={formLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {formLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                <span>{editingCategory ? 'Update' : 'Create'} Category</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tag Modal */}
      {showTagModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingTag ? 'Edit Tag' : 'Create Tag'}
              </h3>
              <button
                onClick={() => setShowTagModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={tagForm.name}
                  onChange={(e) => setTagForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="Tag name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  value={tagForm.slug}
                  onChange={(e) => setTagForm(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="tag-slug"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={tagForm.description}
                  onChange={(e) => setTagForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  rows={3}
                  placeholder="Tag description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map(color => (
                    <button
                      key={color}
                      onClick={() => setTagForm(prev => ({ ...prev, color }))}
                      className={`w-8 h-8 rounded-lg border-2 transition-all ${
                        tagForm.color === color 
                          ? 'border-gray-900 scale-110' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_featured"
                  checked={tagForm.is_featured}
                  onChange={(e) => setTagForm(prev => ({ ...prev, is_featured: e.target.checked }))}
                  className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                />
                <label htmlFor="is_featured" className="text-sm font-medium text-gray-700">
                  Featured tag
                </label>
                <Star className="w-4 h-4 text-yellow-500" />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowTagModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTag}
                disabled={formLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {formLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                <span>{editingTag ? 'Update' : 'Create'} Tag</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && deletingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Delete {deletingItem.type === 'category' ? 'Category' : 'Tag'}
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
                    Are you sure you want to delete <strong>"{deletingItem.item.name}"</strong>?
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    This action cannot be undone. {deletingItem.item.post_count > 0 && 
                    `This will affect ${deletingItem.item.post_count} post(s).`}
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
                onClick={handleDelete}
                disabled={formLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {formLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                <span>Delete {deletingItem.type === 'category' ? 'Category' : 'Tag'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
