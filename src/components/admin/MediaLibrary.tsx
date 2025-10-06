'use client'

import { useState, useEffect, useRef } from 'react'
import { API_CONFIG } from '@/utils/config'
import {
  Image as ImageIcon,
  Upload,
  Search,
  Filter,
  Grid3X3,
  List,
  Folder,
  FolderPlus,
  Trash2,
  Download,
  Eye,
  Edit,
  Copy,
  X,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  MoreHorizontal,
  FileText,
  Video,
  Music,
  File,
  Calendar,
  User,
  HardDrive,
  ChevronDown,
  Plus,
  FolderOpen,
} from 'lucide-react'

interface MediaFile {
  id: number
  name: string
  original_name: string
  type: 'image' | 'video' | 'audio' | 'document'
  mime_type: string
  size: number
  url: string
  thumbnail_url?: string
  folder_id?: number
  uploaded_by: string
  created_at: string
  updated_at: string
  alt_text?: string
  description?: string
  dimensions?: {
    width: number
    height: number
  }
}

interface MediaFolder {
  id: number
  name: string
  parent_id?: number
  created_at: string
  file_count: number
}

interface MediaFilter {
  type: 'all' | 'image' | 'video' | 'audio' | 'document'
  folder_id?: number
  date_range: 'all' | 'today' | 'week' | 'month'
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function MediaLibrary() {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [folders, setFolders] = useState<MediaFolder[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedFolder, setSelectedFolder] = useState<number | undefined>(
    undefined
  )

  const [filters, setFilters] = useState<MediaFilter>({
    type: 'all',
    folder_id: undefined,
    date_range: 'all',
  })

  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 24,
    total: 0,
    totalPages: 0,
  })

  // Modal states
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showFolderModal, setShowFolderModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<number[]>([])

  // Form states
  const [newFolderName, setNewFolderName] = useState('')
  const [dragActive, setDragActive] = useState(false)

  // Message state
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null)

  // No mock data - using real API only

  useEffect(() => {
    loadMediaFiles()
    loadFolders()
  }, [pagination.page, searchTerm, filters, selectedFolder])

  const loadMediaFiles = async () => {
    try {
      setLoading(true)

      // Build query parameters
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        type: filters.type,
        date_range: filters.date_range,
      })

      if (searchTerm) {
        queryParams.set('search', searchTerm)
      }

      if (selectedFolder) {
        queryParams.set('folder_id', selectedFolder.toString())
      }

      const response = await fetch(`/api/admin/media?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      })

      if (!response.ok) {
        if (response.status === 403) {
          showMessage('error', 'Please login to access media library')
          setMediaFiles([])
          setPagination(prev => ({
            ...prev,
            total: 0,
            totalPages: 0,
          }))
          return
        }
        throw new Error('Failed to load media files')
      }

      const data = await response.json()

      setMediaFiles(data.files || [])
      setPagination(prev => ({
        ...prev,
        ...data.pagination,
      }))
    } catch (error) {
      console.error('Error loading media files:', error)
      showMessage('error', 'Failed to load media files')
      setMediaFiles([])
      setPagination(prev => ({
        ...prev,
        total: 0,
        totalPages: 0,
      }))
    } finally {
      setLoading(false)
    }
  }

  const loadFolders = async () => {
    try {
      const response = await fetch('/api/admin/media/folders', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      })

      if (!response.ok) {
        if (response.status === 403) {
          showMessage('error', 'Please login to access media library')
          setFolders([])
          return
        }
        throw new Error('Failed to load folders')
      }

      const data = await response.json()
      setFolders(data)
    } catch (error) {
      console.error('Error loading folders:', error)
      showMessage('error', 'Failed to load folders')
      setFolders([])
    }
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const handleFileUpload = async (files: FileList) => {
    try {
      setUploading(true)

      const formData = new FormData()

      // Add files to form data
      Array.from(files).forEach(file => {
        formData.append('files', file)
      })

      // Add folder_id if selected
      if (selectedFolder) {
        formData.append('folder_id', selectedFolder.toString())
      }

      const response = await fetch('/api/admin/media/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      const data = await response.json()

      showMessage('success', data.message)
      setShowUploadModal(false)
      loadMediaFiles()
    } catch (error: any) {
      showMessage('error', error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }

  const deleteFile = async (fileId: number) => {
    try {
      const response = await fetch(`/api/admin/media/${fileId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete file')
      }

      const data = await response.json()
      showMessage('success', data.message)
      loadMediaFiles()
    } catch (error: any) {
      showMessage('error', error.message)
    }
  }

  const createFolder = async () => {
    if (!newFolderName.trim()) {
      showMessage('error', 'Folder name is required')
      return
    }

    try {
      const response = await fetch('/api/admin/media/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify({
          name: newFolderName.trim(),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create folder')
      }

      const data = await response.json()
      showMessage('success', data.message)
      setNewFolderName('')
      setShowFolderModal(false)
      loadFolders()
    } catch (error: any) {
      showMessage('error', error.message)
    }
  }

  const deleteFolder = async (folderId: number, folderName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete the folder "${folderName}"? This action cannot be undone.`
      )
    ) {
      return
    }

    try {
      // Direct call to backend API to bypass NextJS API route issues
      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3006'

      const response = await fetch(
        `${API_BASE_URL}/api/admin/media/folders/${folderId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete folder')
      }

      const data = await response.json()
      showMessage('success', data.message)

      // If the deleted folder was currently selected, reset to "All Files"
      if (selectedFolder === folderId) {
        setSelectedFolder(undefined)
      }

      loadFolders()
      loadMediaFiles()
    } catch (error: any) {
      showMessage('error', error.message)
    }
  }

  const getFileIcon = (type: string, mimeType: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="w-5 h-5" />
      case 'video':
        return <Video className="w-5 h-5" />
      case 'audio':
        return <Music className="w-5 h-5" />
      default:
        if (mimeType === 'application/pdf') {
          return <FileText className="w-5 h-5" />
        }
        return <File className="w-5 h-5" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url)
    showMessage('success', 'URL copied to clipboard')
  }

  const resetFilters = () => {
    setFilters({
      type: 'all',
      folder_id: undefined,
      date_range: 'all',
    })
    setSelectedFolder(undefined)
    setSearchTerm('')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-6 h-6 animate-spin text-gray-600" />
          <span className="text-gray-600">Loading media library...</span>
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
            <ImageIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Media Library</h2>
            <p className="text-gray-600">
              Manage your images, videos, and documents
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              loadMediaFiles()
              loadFolders()
              showMessage('success', 'Data refreshed')
            }}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            title="Refresh data"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowFolderModal(true)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FolderPlus className="w-4 h-4" />
            <span>New Folder</span>
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Files</span>
          </button>
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

      {/* Storage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Files</p>
              <p className="text-2xl font-bold text-gray-900">
                {pagination.total}
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <File className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-sm font-medium text-gray-500">Real-time</span>
            <span className="text-sm text-gray-600 ml-2">data</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Images</p>
              <p className="text-2xl font-bold text-gray-900">
                {mediaFiles.filter(f => f.type === 'image').length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <ImageIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-sm font-medium text-green-600">Current</span>
            <span className="text-sm text-gray-600 ml-2">page</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Videos</p>
              <p className="text-2xl font-bold text-gray-900">
                {mediaFiles.filter(f => f.type === 'video').length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <Video className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-sm font-medium text-purple-600">Current</span>
            <span className="text-sm text-gray-600 ml-2">page</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Folders</p>
              <p className="text-2xl font-bold text-gray-900">
                {folders.length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-orange-100">
              <Folder className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-sm font-medium text-orange-600">
              Organized
            </span>
            <span className="text-sm text-gray-600 ml-2">storage</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar - Folders */}
        <div className="lg:w-64 bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Folders</h3>
            <button
              onClick={() => setShowFolderModal(true)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <Plus className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => setSelectedFolder(undefined)}
              className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-left transition-colors ${
                selectedFolder === undefined
                  ? 'bg-gray-900 text-white'
                  : 'hover:bg-gray-100'
              }`}
            >
              <FolderOpen className="w-4 h-4" />
              <span>All Files</span>
              <span className="ml-auto text-xs">({pagination.total})</span>
            </button>

            {folders.map(folder => (
              <div
                key={folder.id}
                className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors group ${
                  selectedFolder === folder.id
                    ? 'bg-gray-900 text-white'
                    : 'hover:bg-gray-100'
                }`}
              >
                <button
                  onClick={() => setSelectedFolder(folder.id)}
                  className="flex items-center space-x-2 flex-1 text-left"
                >
                  <Folder className="w-4 h-4" />
                  <span>{folder.name}</span>
                  <span className="ml-auto text-xs">({folder.file_count})</span>
                </button>
                <button
                  onClick={e => {
                    e.stopPropagation()
                    deleteFolder(folder.id, folder.name)
                  }}
                  className={`opacity-0 group-hover:opacity-100 p-1 rounded transition-all ${
                    selectedFolder === folder.id
                      ? 'hover:bg-red-600 text-white'
                      : 'hover:bg-red-50 text-red-600'
                  }`}
                  title="Delete folder"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Search and Controls */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex flex-col space-y-4 lg:flex-row lg:space-y-0 lg:space-x-4 lg:items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search files..."
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

                <div className="flex border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-gray-900 text-white' : 'hover:bg-gray-100'} rounded-l-lg transition-colors`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-gray-900 text-white' : 'hover:bg-gray-100'} rounded-r-lg transition-colors`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      File Type
                    </label>
                    <select
                      value={filters.type}
                      onChange={e =>
                        setFilters(prev => ({
                          ...prev,
                          type: e.target.value as any,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    >
                      <option value="all">All Types</option>
                      <option value="image">Images</option>
                      <option value="video">Videos</option>
                      <option value="audio">Audio</option>
                      <option value="document">Documents</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date Range
                    </label>
                    <select
                      value={filters.date_range}
                      onChange={e =>
                        setFilters(prev => ({
                          ...prev,
                          date_range: e.target.value as any,
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

                  <div className="flex items-end">
                    <button
                      onClick={resetFilters}
                      className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Reset Filters
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Media Grid/List */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {mediaFiles.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No media files found</p>
                </div>
              ) : (
                mediaFiles.map(file => (
                  <div
                    key={file.id}
                    className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => {
                      setSelectedFile(file)
                      setShowDetailsModal(true)
                    }}
                  >
                    <div className="aspect-square bg-gray-100 flex items-center justify-center">
                      {file.type === 'image' ? (
                        <img
                          src={(() => {
                            const imageUrl = file.thumbnail_url || file.url
                            if (!imageUrl) return ''

                            // Handle external URLs
                            if (
                              imageUrl.startsWith('http') &&
                              !imageUrl.includes('localhost')
                            ) {
                              return imageUrl
                            }

                            // For local files, use backend server directly
                            let cleanUrl = imageUrl
                              .replace('http://localhost:3006', '')
                              .replace('http://localhost:3001', '')
                              .replace(API_CONFIG.BASE_URL, '')
                              .replace(
                                API_CONFIG.BASE_URL.replace(
                                  'https://',
                                  'https://api.'
                                ),
                                ''
                              )

                            // Ensure URL starts with /uploads
                            if (!cleanUrl.startsWith('/uploads')) {
                              cleanUrl = `/uploads/${cleanUrl.replace(/^\/+/, '')}`
                            }

                            // Return appropriate backend URL based on environment
                            const apiUrl =
                              typeof window !== 'undefined' &&
                              window.location.hostname === 'localhost'
                                ? 'http://localhost:3006'
                                : API_CONFIG.BASE_URL
                            return `${apiUrl}${cleanUrl}`
                          })()}
                          alt={file.alt_text || file.name}
                          className="w-full h-full object-cover"
                          onError={e => {
                            e.currentTarget.style.display = 'none'
                            const parent = e.currentTarget.parentElement!
                            parent.innerHTML =
                              '<div class="w-full h-full bg-gray-200 flex items-center justify-center"><svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2v12a2 2 0 002 2z"></path></svg></div>'
                          }}
                        />
                      ) : (
                        <div className="flex flex-col items-center space-y-2 text-gray-400">
                          {getFileIcon(file.type, file.mime_type)}
                          <span className="text-xs font-medium">
                            {file.type.toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-3">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatFileSize(file.size)}
                      </p>
                    </div>

                    {/* Hover Actions */}
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          setSelectedFile(file)
                          setShowDetailsModal(true)
                        }}
                        className="p-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          copyToClipboard(file.url)
                        }}
                        className="p-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                        title="Copy URL"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          deleteFile(file.id)
                        }}
                        className="p-2 bg-white text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        File
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Size
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Modified
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {mediaFiles.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-12 text-center text-gray-500"
                        >
                          No media files found
                        </td>
                      </tr>
                    ) : (
                      mediaFiles.map(file => (
                        <tr key={file.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0 w-10 h-10">
                                {file.type === 'image' ? (
                                  <img
                                    src={(() => {
                                      const imageUrl =
                                        file.thumbnail_url || file.url
                                      if (!imageUrl) return ''

                                      // Handle external URLs
                                      if (
                                        imageUrl.startsWith('http') &&
                                        !imageUrl.includes('localhost')
                                      ) {
                                        return imageUrl
                                      }

                                      // For local files, use backend server directly
                                      let cleanUrl = imageUrl
                                        .replace('http://localhost:3006', '')
                                        .replace('http://localhost:3001', '')
                                        .replace('https://99group.games', '')
                                        .replace(
                                          'https://api.99group.games',
                                          ''
                                        )

                                      // Ensure URL starts with /uploads
                                      if (!cleanUrl.startsWith('/uploads')) {
                                        cleanUrl = `/uploads/${cleanUrl.replace(/^\/+/, '')}`
                                      }

                                      // Return appropriate backend URL based on environment
                                      const apiUrl =
                                        typeof window !== 'undefined' &&
                                        window.location.hostname === 'localhost'
                                          ? 'http://localhost:3006'
                                          : API_CONFIG.BASE_URL
                                      return `${apiUrl}${cleanUrl}`
                                    })()}
                                    alt={file.alt_text || file.name}
                                    className="w-10 h-10 rounded object-cover"
                                    onError={e => {
                                      e.currentTarget.style.display = 'none'
                                      const parent =
                                        e.currentTarget.parentElement!
                                      parent.innerHTML =
                                        '<div class="w-10 h-10 rounded bg-gray-200 flex items-center justify-center"><svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2v12a2 2 0 002 2z"></path></svg></div>'
                                    }}
                                  />
                                ) : (
                                  <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                                    {getFileIcon(file.type, file.mime_type)}
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-sm font-medium text-gray-900 truncate">
                                  {file.name}
                                </div>
                                <div className="text-sm text-gray-500 truncate">
                                  {file.description || 'No description'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 capitalize">
                            {file.type}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {formatFileSize(file.size)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {formatDate(file.updated_at)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => {
                                  setSelectedFile(file)
                                  setShowDetailsModal(true)
                                }}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => copyToClipboard(file.url)}
                                className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                                title="Copy URL"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteFile(file.id)}
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

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.total
                    )}{' '}
                    of {pagination.total} results
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() =>
                        setPagination(prev => ({
                          ...prev,
                          page: prev.page - 1,
                        }))
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
                        setPagination(prev => ({
                          ...prev,
                          page: prev.page + 1,
                        }))
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
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Upload Files
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive ? 'border-gray-900 bg-gray-50' : 'border-gray-300'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-600 mb-2">
                Drop your files here, or click to browse
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*,.pdf,.doc,.docx"
                className="hidden"
                onChange={e => {
                  if (e.target.files) {
                    handleFileUpload(e.target.files)
                  }
                }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
              >
                {uploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                    Uploading...
                  </>
                ) : (
                  'Choose Files'
                )}
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-4 text-center">
              Supported formats: JPG, PNG, GIF, MP4, PDF, DOC, DOCX (Max: 10MB)
            </p>
          </div>
        </div>
      )}

      {/* File Details Modal */}
      {showDetailsModal && selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                File Details
              </h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Preview */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Preview
                </h4>
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                  {selectedFile.type === 'image' ? (
                    <img
                      src={(() => {
                        const imageUrl = selectedFile.url
                        if (!imageUrl) return ''

                        // Handle external URLs
                        if (
                          imageUrl.startsWith('http') &&
                          !imageUrl.includes('localhost')
                        ) {
                          return imageUrl
                        }

                        // For local files, use backend server directly
                        let cleanUrl = imageUrl
                          .replace('http://localhost:3006', '')
                          .replace('http://localhost:3001', '')
                          .replace(API_CONFIG.BASE_URL, '')
                          .replace(
                            API_CONFIG.BASE_URL.replace(
                              'https://',
                              'https://api.'
                            ),
                            ''
                          )

                        // Ensure URL starts with /uploads
                        if (!cleanUrl.startsWith('/uploads')) {
                          cleanUrl = `/uploads/${cleanUrl.replace(/^\/+/, '')}`
                        }

                        // Return appropriate backend URL based on environment
                        const apiUrl =
                          typeof window !== 'undefined' &&
                          window.location.hostname === 'localhost'
                            ? 'http://localhost:3006'
                            : API_CONFIG.BASE_URL
                        return `${apiUrl}${cleanUrl}`
                      })()}
                      alt={selectedFile.alt_text || selectedFile.name}
                      className="max-w-full max-h-full object-contain rounded-lg"
                    />
                  ) : (
                    <div className="flex flex-col items-center space-y-3 text-gray-400">
                      <div className="p-4 bg-gray-200 rounded-lg">
                        {getFileIcon(selectedFile.type, selectedFile.mime_type)}
                      </div>
                      <span className="text-sm font-medium">
                        {selectedFile.type.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Details */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Information
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      File Name
                    </label>
                    <p className="text-sm text-gray-900">{selectedFile.name}</p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Original Name
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedFile.original_name}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      File Size
                    </label>
                    <p className="text-sm text-gray-900">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Type
                    </label>
                    <p className="text-sm text-gray-900 capitalize">
                      {selectedFile.type}
                    </p>
                  </div>

                  {selectedFile.dimensions && (
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Dimensions
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedFile.dimensions.width} ×{' '}
                        {selectedFile.dimensions.height}
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Uploaded By
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedFile.uploaded_by}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Upload Date
                    </label>
                    <p className="text-sm text-gray-900">
                      {formatDate(selectedFile.created_at)}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      URL
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={selectedFile.url}
                        readOnly
                        className="flex-1 text-sm bg-gray-50 border border-gray-300 rounded px-3 py-1"
                      />
                      <button
                        onClick={() => copyToClipboard(selectedFile.url)}
                        className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                        title="Copy URL"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => window.open(selectedFile.url, '_blank')}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={() => deleteFile(selectedFile.id)}
                    className="flex items-center space-x-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Folder Modal */}
      {showFolderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Create New Folder
              </h3>
              <button
                onClick={() => setShowFolderModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Folder Name
                </label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={e => setNewFolderName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="Enter folder name..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowFolderModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={createFolder}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <FolderPlus className="w-4 h-4" />
                <span>Create Folder</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
