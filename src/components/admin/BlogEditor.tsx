'use client'

import { useState, useEffect } from 'react'
import {
  Save,
  X,
  Eye,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Image as ImageIcon,
  Link,
  Bold,
  Italic,
  List,
  Hash,
  Quote,
  Plus,
  Settings,
  Search,
  FileText,
  Monitor,
} from 'lucide-react'
import RichTextEditor from './RichTextEditor'
import MediaSelectModal from './MediaSelectModal'
import { getApiUrl, API_CONFIG } from '../../utils/config'

interface BlogPost {
  id?: number
  title: string
  slug: string
  excerpt: string
  content: string
  featured_image_id: number | null
  author: string
  status: 'draft' | 'published' | 'scheduled'
  category_id: number | null
  tags: number[]
  seo_title: string
  seo_description: string
  scheduled_at: string | null
}

interface Category {
  id: number
  name: string
  slug: string
  color: string
}

interface Tag {
  id: number
  name: string
  slug: string
  color: string
  is_featured: boolean
}

interface BlogEditorProps {
  blogId?: number
  onClose: () => void
  onSave: () => void
}

export default function BlogEditor({
  blogId,
  onClose,
  onSave,
}: BlogEditorProps) {
  const [blog, setBlog] = useState<BlogPost>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image_id: null,
    author: 'Admin',
    status: 'draft',
    category_id: null,
    tags: [],
    seo_title: '',
    seo_description: '',
    scheduled_at: null,
  })

  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)
  const [mediaSelectModal, setMediaSelectModal] = useState(false)
  const [featuredImage, setFeaturedImage] = useState<{
    id: number
    url: string
    alt_text: string
  } | null>(null)
  const [newTagInput, setNewTagInput] = useState('')
  const [creatingTag, setCreatingTag] = useState(false)
  const [activeTab, setActiveTab] = useState<
    'content' | 'settings' | 'seo' | 'preview'
  >('content')

  useEffect(() => {
    loadCategories()
    loadTags()
    if (blogId) {
      loadBlog()
    }
  }, [blogId])

  useEffect(() => {
    // Auto-generate slug from title
    if (blog.title && !blogId) {
      const slug = blog.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      setBlog(prev => ({ ...prev, slug }))
    }
  }, [blog.title, blogId])

  // Note: SEO auto-fill is now handled directly in input change handlers

  // Helper function to suggest SEO values
  const suggestSEOTitle = () => {
    setBlog(prev => ({ ...prev, seo_title: blog.title }))
  }

  const suggestSEODescription = () => {
    setBlog(prev => ({ ...prev, seo_description: blog.excerpt }))
  }

  // Handle title change with SEO auto-fill
  const handleTitleChange = (value: string) => {
    setBlog(prev => {
      const updates: any = { title: value }
      // Auto-fill SEO title if it matches the previous title (meaning it was auto-filled) or is empty
      const shouldAutoFill =
        !blogId && (prev.seo_title === '' || prev.seo_title === prev.title)
      if (shouldAutoFill && value) {
        updates.seo_title = value
      }
      return { ...prev, ...updates }
    })
  }

  // Handle excerpt change with SEO auto-fill
  const handleExcerptChange = (value: string) => {
    setBlog(prev => {
      const updates: any = { excerpt: value }
      // Auto-fill SEO description if it matches the previous excerpt (meaning it was auto-filled) or is empty
      const shouldAutoFill =
        !blogId &&
        (prev.seo_description === '' || prev.seo_description === prev.excerpt)
      if (shouldAutoFill && value) {
        updates.seo_description = value
      }
      return { ...prev, ...updates }
    })
  }

  const loadBlog = async () => {
    if (!blogId) return

    try {
      setLoading(true)
      const token = localStorage.getItem('adminToken')

      if (!token) {
        throw new Error('No admin token found. Please login first.')
      }

      const response = await fetch(getApiUrl(`/api/admin/blogs/${blogId}`), {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const error = await response.json()
        if (response.status === 401 || response.status === 403) {
          throw new Error('Authentication failed. Please login again.')
        }
        throw new Error(error.error || 'Failed to load blog')
      }

      const data = await response.json()
      setBlog({
        id: data.id,
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        featured_image_id: data.featured_image_id,
        author: data.author,
        status: data.status,
        category_id: data.category_id,
        tags: data.tags?.map((tag: any) => tag.id) || [],
        seo_title: data.seo_title,
        seo_description: data.seo_description,
        scheduled_at: data.scheduled_at,
      })

      // Load featured image if exists
      if (data.featured_image_id) {
        loadFeaturedImage(data.featured_image_id)
      }
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to load blog')
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(getApiUrl('/api/admin/categories'), {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        // Flatten hierarchical categories for simple selection
        const flatCategories: Category[] = []
        const flatten = (cats: any[]) => {
          cats.forEach(cat => {
            flatCategories.push(cat)
            if (cat.children) {
              flatten(cat.children)
            }
          })
        }
        flatten(data)
        setCategories(flatCategories)
      }
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const loadTags = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(getApiUrl('/api/admin/tags'), {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setTags(data)
      } else {
        console.error('Failed to load tags:', response.status)
      }
    } catch (error) {
      console.error('Error loading tags:', error)
    }
  }

  const loadFeaturedImage = async (imageId: number) => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(getApiUrl(`/api/admin/media/${imageId}`), {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Loaded featured image data:', data)

        // Ensure URL is properly formatted
        let imageUrl = data.url || ''
        if (imageUrl) {
          if (
            imageUrl.startsWith('http://localhost:3002') ||
            imageUrl.startsWith('https://99group.games')
          ) {
            // Already correct
          } else if (imageUrl.startsWith('http')) {
            // Other http URL, keep as is
          } else {
            // Remove any existing localhost references and rebuild
            let cleanUrl = imageUrl
              .replace('http://localhost:3001', '')
              .replace('http://localhost:3002', '')
              .replace('https://99group.games', '')
              .replace('https://api.99group.games', '')

            // If URL doesn't start with /uploads, add the full media path
            if (!cleanUrl.startsWith('/uploads')) {
              // Assume it's a filename that should be in /uploads/media/images/
              cleanUrl = `/uploads/media/images/${cleanUrl.replace(/^\/+/, '')}`
            }

            // Use environment-based URL
            const apiUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost' 
              ? 'http://localhost:3002' 
              : 'https://api.99group.games'
            imageUrl = `${apiUrl}${cleanUrl}`
          }
        }

        const featuredImageData = {
          id: data.id,
          url: imageUrl,
          alt_text: data.alt_text || data.original_name,
        }

        console.log('Setting loaded featured image:', featuredImageData)
        setFeaturedImage(featuredImageData)
      }
    } catch (error) {
      console.error('Error loading featured image:', error)
    }
  }

  const handleFeaturedImageSelect = (media: any) => {
    console.log('Selected media:', media)

    // Ensure URL is properly formatted
    let imageUrl = media.url || ''
    if (imageUrl) {
      if (imageUrl.startsWith('http')) {
        // Remove any existing localhost references and rebuild
        let cleanUrl = imageUrl
          .replace('http://localhost:3002', '')
          .replace('http://localhost:3001', '')
          .replace('https://99group.games', '')
          .replace('https://api.99group.games', '')

        // If URL doesn't start with /uploads, add the full media path
        if (!cleanUrl.startsWith('/uploads')) {
          // Assume it's a filename that should be in /uploads/media/images/
          cleanUrl = `/uploads/media/images/${cleanUrl.replace(/^\/+/, '')}`
        }

        // Use environment-based URL
        const apiUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost' 
          ? 'http://localhost:3002' 
          : 'https://api.99group.games'
        imageUrl = `${apiUrl}${cleanUrl}`
      } else {
        // Relative path - add full media path if needed
        if (!imageUrl.startsWith('/uploads')) {
          imageUrl = `/uploads/media/images/${imageUrl.replace(/^\/+/, '')}`
        }
        // Use environment-based URL
        const apiUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost' 
          ? 'http://localhost:3002' 
          : 'https://api.99group.games'
        imageUrl = `${apiUrl}${imageUrl}`
      }
    }

    const featuredImageData = {
      id: media.id,
      url: imageUrl,
      alt_text: media.alt_text || media.original_name,
    }

    console.log('Setting featured image:', featuredImageData)
    console.log('Image URL being set:', imageUrl)

    // Test if image can be loaded
    const testImg = new Image()
    testImg.crossOrigin = 'anonymous'
    testImg.onload = () => {
      console.log('✅ Test image loaded successfully:', imageUrl)
    }
    testImg.onerror = e => {
      console.error('❌ Test image failed to load:', imageUrl, e)
    }
    testImg.src = imageUrl

    setFeaturedImage(featuredImageData)
    setBlog(prev => ({ ...prev, featured_image_id: media.id }))
    setMediaSelectModal(false)
  }

  const removeFeaturedImage = () => {
    setFeaturedImage(null)
    setBlog(prev => ({ ...prev, featured_image_id: null }))
  }

  // Function to convert base64 to blob
  const base64ToBlob = (base64: string, mimeType: string): Blob => {
    const byteCharacters = atob(base64.split(',')[1])
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    return new Blob([byteArray], { type: mimeType })
  }

  // Function to upload base64 image to media library
  const uploadBase64Image = async (
    base64Src: string,
    token: string
  ): Promise<string> => {
    try {
      // Extract mime type and base64 data
      const matches = base64Src.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
      if (!matches || matches.length !== 3) {
        throw new Error('Invalid base64 image format')
      }

      const mimeType = matches[1]
      const base64Data = matches[2]

      // Convert to blob
      const blob = base64ToBlob(base64Src, mimeType)

      // Create form data
      const formData = new FormData()
      const filename = `pasted-image-${Date.now()}.${mimeType.split('/')[1]}`
      formData.append('files', blob, filename)
      formData.append('alt_text', 'Pasted image from Google Docs')
      formData.append('description', 'Auto-uploaded from pasted content')

      // Upload to media API
      const response = await fetch('/api/admin/media/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to upload image')
      }

      const result = await response.json()
      if (result.files && result.files.length > 0) {
        return result.files[0].url // Return the uploaded image URL
      } else {
        throw new Error('No file URL returned from upload')
      }
    } catch (error) {
      console.error('Error uploading base64 image:', error)
      throw error
    }
  }

  // Function to process content and upload base64 images
  const processAndUploadImages = async (
    content: string,
    token: string
  ): Promise<string> => {
    // Find all base64 images in the content
    const base64ImageRegex =
      /<img[^>]+src="data:image\/[^;]+;base64,[^"]*"[^>]*>/gi
    const matches = content.match(base64ImageRegex)

    if (!matches || matches.length === 0) {
      return content // No base64 images found
    }

    let processedContent = content

    // Process each base64 image
    for (const match of matches) {
      try {
        // Extract the src attribute
        const srcMatch = match.match(/src="(data:image\/[^;]+;base64,[^"]*)"/)
        if (srcMatch && srcMatch[1]) {
          const base64Src = srcMatch[1]

          // Upload the image
          const uploadedUrl = await uploadBase64Image(base64Src, token)

          // Replace the base64 src with the uploaded URL
          processedContent = processedContent.replace(base64Src, uploadedUrl)

          console.log(
            `Successfully uploaded and replaced base64 image with: ${uploadedUrl}`
          )
        }
      } catch (error) {
        console.error('Failed to upload base64 image:', error)
        // Continue with other images even if one fails
      }
    }

    return processedContent
  }

  const handleSave = async (status?: 'draft' | 'published') => {
    if (!blog.title || !blog.content) {
      showMessage('error', 'Title and content are required')
      return
    }

    // Validate scheduled posts
    const finalStatus = status || blog.status
    if (finalStatus === 'scheduled') {
      if (!blog.scheduled_at) {
        showMessage('error', 'Scheduled date is required for scheduled posts')
        return
      }
      const scheduledDate = new Date(blog.scheduled_at)
      if (scheduledDate <= new Date()) {
        showMessage('error', 'Scheduled date must be in the future')
        return
      }
    }

    try {
      setSaving(true)

      const token = localStorage.getItem('adminToken')
      if (!token) {
        throw new Error('No admin token found. Please login first.')
      }

      // Process content and upload any base64 images
      let processedContent = blog.content

      // Check if content contains base64 images
      if (blog.content.includes('data:image/')) {
        showMessage('success', 'Processing and uploading images...')
        try {
          processedContent = await processAndUploadImages(blog.content, token)
          showMessage('success', 'Images uploaded successfully!')
        } catch (error) {
          console.error('Error processing images:', error)
          showMessage(
            'error',
            'Some images failed to upload, but continuing with save...'
          )
        }
      }

      const blogData = {
        ...blog,
        content: processedContent,
        status: finalStatus,
        // Ensure required fields are present
        author: blog.author || 'Admin',
        // Convert empty strings to null for optional fields
        slug: blog.slug || null,
        excerpt: blog.excerpt || null,
        seo_title: blog.seo_title || null,
        seo_description: blog.seo_description || null,
      }

      const url = blogId
        ? getApiUrl(`/api/admin/blogs/${blogId}`)
        : getApiUrl('/api/admin/blogs')
      const method = blogId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(blogData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save blog')
      }

      const result = await response.json()
      showMessage('success', result.message || 'Blog saved successfully')

      // Update the blog content with processed content
      if (processedContent !== blog.content) {
        setBlog(prev => ({ ...prev, content: processedContent }))
      }

      onSave()
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to save blog')
    } finally {
      setSaving(false)
    }
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const toggleTag = (tagId: number) => {
    setBlog(prev => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter(id => id !== tagId)
        : [...prev.tags, tagId],
    }))
  }

  const createNewTag = async () => {
    if (!newTagInput.trim()) return

    try {
      setCreatingTag(true)

      const token = localStorage.getItem('adminToken')
      const response = await fetch(getApiUrl('/api/admin/tags'), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newTagInput.trim(),
          slug: newTagInput
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-'),
          color: '#' + Math.floor(Math.random() * 16777215).toString(16), // 随机颜色
          is_featured: false,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create tag')
      }

      const newTag = await response.json()

      // 更新标签列表
      setTags(prev => [...prev, newTag])

      // 自动选择新创建的标签
      setBlog(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.id],
      }))

      // 清空输入框
      setNewTagInput('')

      showMessage('success', `Tag "${newTag.name}" created successfully`)
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to create tag')
    } finally {
      setCreatingTag(false)
    }
  }

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      createNewTag()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-6 h-6 animate-spin text-gray-600" />
          <span className="text-gray-600">Loading blog...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col max-h-screen">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-bold text-gray-900">
            {blogId ? 'Edit Blog Post' : 'Create New Blog Post'}
          </h2>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleSave('draft')}
            disabled={saving}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            {saving && <RefreshCw className="w-4 h-4 animate-spin" />}
            <Save className="w-4 h-4" />
            <span>Save Draft</span>
          </button>

          <button
            onClick={() => handleSave('published')}
            disabled={saving}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
          >
            {saving && <RefreshCw className="w-4 h-4 animate-spin" />}
            <Eye className="w-4 h-4" />
            <span>Publish</span>
          </button>

          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mx-6 mt-4 flex items-center space-x-3 p-4 rounded-lg ${
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

      {/* Tab Navigation */}
      <div className="flex-shrink-0 border-b border-gray-200 bg-white">
        <div className="px-6">
          <nav className="flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('content')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'content'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Content</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('seo')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'seo'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4" />
                <span>SEO</span>
                {(!blog.seo_title || !blog.seo_description) && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Incomplete
                  </span>
                )}
              </div>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'preview'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Monitor className="w-4 h-4" />
                <span>Preview</span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="p-6">
          {activeTab === 'content' && (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={blog.title}
                  onChange={e => handleTitleChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-lg"
                  placeholder="Enter blog title..."
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug
                </label>
                <input
                  type="text"
                  value={blog.slug}
                  onChange={e =>
                    setBlog(prev => ({ ...prev, slug: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="blog-url-slug"
                />
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Excerpt
                </label>
                <textarea
                  value={blog.excerpt}
                  onChange={e => handleExcerptChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  rows={3}
                  placeholder="Brief description of the blog post..."
                />
              </div>

              {/* Content */}
              <div className="flex flex-col min-h-0">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content *
                </label>
                <div className="flex-1 min-h-0">
                  <RichTextEditor
                    content={blog.content}
                    onChange={content =>
                      setBlog(prev => ({ ...prev, content }))
                    }
                    placeholder="Write your blog content here... You can paste from Google Docs, Word, or any rich text source."
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  SEO Optimization
                </h3>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        SEO Title
                      </label>
                      {blog.title && blog.title !== blog.seo_title && (
                        <button
                          type="button"
                          onClick={suggestSEOTitle}
                          className="text-xs text-blue-600 hover:text-blue-800 underline"
                        >
                          Use main title
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={blog.seo_title}
                      onChange={e =>
                        setBlog(prev => ({
                          ...prev,
                          seo_title: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      placeholder="SEO optimized title"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {blog.seo_title.length}/60 characters (recommended: 50-60)
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        SEO Description
                      </label>
                      {blog.excerpt &&
                        blog.excerpt !== blog.seo_description && (
                          <button
                            type="button"
                            onClick={suggestSEODescription}
                            className="text-xs text-blue-600 hover:text-blue-800 underline"
                          >
                            Use excerpt
                          </button>
                        )}
                    </div>
                    <textarea
                      value={blog.seo_description}
                      onChange={e =>
                        setBlog(prev => ({
                          ...prev,
                          seo_description: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      rows={3}
                      placeholder="SEO meta description"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {blog.seo_description.length}/160 characters (recommended:
                      150-160)
                    </p>
                  </div>

                  {/* SEO Preview */}
                  {(blog.seo_title || blog.seo_description) && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        SEO Preview:
                      </h4>
                      <div className="space-y-1">
                        <div className="text-blue-600 text-lg font-medium hover:underline cursor-pointer">
                          {blog.seo_title ||
                            blog.title ||
                            'Your blog title here'}
                        </div>
                        <div className="text-green-700 text-sm">
                          yoursite.com/blog/{blog.slug || 'your-blog-slug'}
                        </div>
                        <div className="text-gray-600 text-sm">
                          {blog.seo_description ||
                            blog.excerpt ||
                            'Your blog description will appear here...'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Status & Author */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Publishing
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={blog.status}
                      onChange={e =>
                        setBlog(prev => ({
                          ...prev,
                          status: e.target.value as any,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="scheduled">Scheduled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Author
                    </label>
                    <input
                      type="text"
                      value={blog.author}
                      onChange={e =>
                        setBlog(prev => ({ ...prev, author: e.target.value }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                  </div>

                  {blog.status === 'scheduled' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Scheduled Date & Time *
                      </label>
                      <input
                        type="datetime-local"
                        value={
                          blog.scheduled_at
                            ? new Date(blog.scheduled_at)
                                .toISOString()
                                .slice(0, 16)
                            : ''
                        }
                        onChange={e =>
                          setBlog(prev => ({
                            ...prev,
                            scheduled_at: e.target.value
                              ? new Date(e.target.value).toISOString()
                              : null,
                          }))
                        }
                        min={new Date().toISOString()?.slice(0, 16)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        The blog will be automatically published at this date
                        and time
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Featured Image */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Featured Image
                </h3>

                {featuredImage ? (
                  <div className="space-y-3">
                    <div className="relative group">
                      <img
                        src={(() => {
                          if (!featuredImage.url) return ''

                          // Handle external URLs
                          if (
                            featuredImage.url.startsWith('http') &&
                            !featuredImage.url.includes('localhost')
                          ) {
                            return featuredImage.url
                          }

                          // For local files, use backend server directly
                          let cleanUrl = featuredImage.url
                            .replace('http://localhost:3002', '')
                            .replace('http://localhost:3001', '')
                            .replace('https://99group.games', '')
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
                        alt={featuredImage.alt_text}
                        className="w-full h-32 object-cover rounded-lg block"
                        onError={e => {
                          console.error(
                            'Featured image failed to load:',
                            featuredImage.url
                          )
                          console.error('Error event:', e)
                          const target = e.target as HTMLImageElement

                          // Try fallback URL if original fails
                          if (featuredImage.url.includes(API_CONFIG.BASE_URL)) {
                            const fallbackUrl = featuredImage.url.replace(
                              API_CONFIG.BASE_URL,
                              ''
                            )
                            console.log('Trying fallback URL:', fallbackUrl)
                            target.src = fallbackUrl
                            return
                          }

                          target.style.display = 'none'
                          const parent = target.parentElement!
                          parent.innerHTML =
                            '<div class="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center"><div class="text-gray-500 text-sm">Image failed to load</div></div>'
                        }}
                        onLoad={e => {
                          console.log(
                            'Featured image loaded successfully:',
                            featuredImage.url
                          )
                          const target = e.target as HTMLImageElement
                          console.log(
                            'Image dimensions:',
                            target.naturalWidth,
                            'x',
                            target.naturalHeight
                          )
                          console.log(
                            'Image display size:',
                            target.width,
                            'x',
                            target.height
                          )
                        }}
                      />
                      <div className="absolute inset-0 bg-transparent hover:bg-black hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center pointer-events-none">
                        <button
                          onClick={removeFeaturedImage}
                          className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 text-white p-2 rounded-full hover:bg-red-700 pointer-events-auto"
                          title="Remove featured image"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p className="font-medium">{featuredImage.alt_text}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        ID: {featuredImage.id}
                      </p>
                      <p className="text-xs text-gray-400 break-all">
                        URL: {featuredImage.url}
                      </p>
                    </div>
                    <button
                      onClick={() => setMediaSelectModal(true)}
                      className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Change Image
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">
                      No featured image selected
                    </p>
                    <button
                      onClick={() => setMediaSelectModal(true)}
                      className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      Select Image
                    </button>
                  </div>
                )}
              </div>

              {/* Category */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Category
                </h3>

                <select
                  value={blog.category_id || ''}
                  onChange={e =>
                    setBlog(prev => ({
                      ...prev,
                      category_id: e.target.value
                        ? parseInt(e.target.value)
                        : null,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                >
                  <option value="">No category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Tags
                </h3>

                {/* Add New Tag */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add New Tag
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={newTagInput}
                      onChange={e => setNewTagInput(e.target.value)}
                      onKeyPress={handleTagInputKeyPress}
                      placeholder="Enter tag name..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                    />
                    <button
                      onClick={createNewTag}
                      disabled={!newTagInput.trim() || creatingTag}
                      className="flex items-center space-x-2 px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                    >
                      {creatingTag ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                      <span>Add</span>
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Press Enter or click Add to create a new tag. It will be
                    automatically selected.
                  </p>
                </div>

                {/* Existing Tags */}
                <div className="space-y-2">
                  {tags.length === 0 ? (
                    <p className="text-gray-500 text-sm italic">
                      No tags available. Create your first tag above.
                    </p>
                  ) : (
                    tags.map(tag => (
                      <label
                        key={tag.id}
                        className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={blog.tags.includes(tag.id)}
                          onChange={() => toggleTag(tag.id)}
                          className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                        />
                        <span
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                          style={{ backgroundColor: tag.color }}
                        >
                          {tag.name}
                        </span>
                        {tag.is_featured && (
                          <span className="text-xs text-yellow-600 font-medium">
                            ★ Featured
                          </span>
                        )}
                      </label>
                    ))
                  )}
                </div>

                {/* Selected Tags Summary */}
                {blog.tags.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 mb-2">
                      Selected Tags ({blog.tags.length}):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {blog.tags.map(tagId => {
                        const tag = tags.find(t => t.id === tagId)
                        return tag ? (
                          <span
                            key={tag.id}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                            style={{ backgroundColor: tag.color }}
                          >
                            {tag.name}
                          </span>
                        ) : null
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Blog Preview
                </h3>

                <div className="prose prose-lg max-w-none">
                  {/* Blog Header */}
                  <div className="border-b border-gray-200 pb-6 mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {blog.title || 'Your Blog Title'}
                    </h1>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>By {blog.author}</span>
                      <span>•</span>
                      <span>{new Date().toLocaleDateString()}</span>
                      {blog.category_id && (
                        <>
                          <span>•</span>
                          <span className="text-blue-600">
                            {categories.find(c => c.id === blog.category_id)
                              ?.name || 'Category'}
                          </span>
                        </>
                      )}
                    </div>
                    {blog.excerpt && (
                      <p className="text-lg text-gray-600 mt-4 italic">
                        {blog.excerpt}
                      </p>
                    )}
                  </div>

                  {/* Featured Image */}
                  {featuredImage && (
                    <div className="mb-6">
                      <img
                        src={(() => {
                          if (!featuredImage.url) return ''

                          // Handle external URLs
                          if (
                            featuredImage.url.startsWith('http') &&
                            !featuredImage.url.includes('localhost')
                          ) {
                            return featuredImage.url
                          }

                          // For local files, use backend server directly
                          let cleanUrl = featuredImage.url
                            .replace('http://localhost:3002', '')
                            .replace('http://localhost:3001', '')
                            .replace('https://99group.games', '')
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
                        alt={featuredImage.alt_text}
                        className="w-full h-64 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  {/* Blog Content */}
                  <div
                    className="prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{
                      __html:
                        blog.content ||
                        '<p>Start writing your blog content...</p>',
                    }}
                  />

                  {/* Tags */}
                  {blog.tags.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                        Tags:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {blog.tags.map(tagId => {
                          const tag = tags.find(t => t.id === tagId)
                          return tag ? (
                            <span
                              key={tag.id}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white"
                              style={{ backgroundColor: tag.color }}
                            >
                              {tag.name}
                            </span>
                          ) : null
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Media Select Modal */}
      <MediaSelectModal
        isOpen={mediaSelectModal}
        onClose={() => setMediaSelectModal(false)}
        onSelect={handleFeaturedImageSelect}
        selectedId={featuredImage?.id}
      />
    </div>
  )
}
