'use client'

import { useState, useEffect } from 'react'
import { X, Upload, Search, Image as ImageIcon, Trash2 } from 'lucide-react'

interface MediaFile {
  id: number
  name: string
  filename: string
  original_name: string
  url: string
  type: string
  mime_type: string
  file_type: string
  size: number
  file_size: number
  alt_text: string
  description: string
  created_at: string
}

interface MediaSelectModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (media: MediaFile) => void
  selectedId?: number | null
}

export default function MediaSelectModal({
  isOpen,
  onClose,
  onSelect,
  selectedId,
}: MediaSelectModalProps) {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadMediaFiles()
    }
  }, [isOpen])

  const loadMediaFiles = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('adminToken')
      console.log(
        'Loading media files with token:',
        token ? 'Token exists' : 'No token'
      )

      // Use Next.js API route instead of calling backend directly
      const response = await fetch('/api/admin/media', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      console.log('Media API response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('Media files loaded:', data)
        console.log(
          'Type of data:',
          typeof data,
          'Is array:',
          Array.isArray(data)
        )

        // Handle different response formats
        let files = []
        if (Array.isArray(data)) {
          // API returns array directly
          files = data
        } else if (data.files && Array.isArray(data.files)) {
          // API returns { files: [...] }
          files = data.files
        } else if (data.data && Array.isArray(data.data)) {
          // API returns { data: [...] }
          files = data.data
        }

        console.log('Parsed files count:', files.length)
        setMediaFiles(files)
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Failed to load media files:', response.status, errorData)
      }
    } catch (error) {
      console.error('Error loading media files:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    try {
      setUploading(true)
      const token = localStorage.getItem('adminToken')

      const formData = new FormData()
      Array.from(files).forEach(file => {
        formData.append('files', file)
      })
      formData.append('alt_text', 'Featured image')
      formData.append('description', 'Uploaded for blog featured image')

      // Use Next.js API route instead of calling backend directly
      const response = await fetch('/api/admin/media/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        if (result.files && result.files.length > 0) {
          // Reload media files to show the new upload
          await loadMediaFiles()
          // Auto-select the first uploaded file
          onSelect(result.files[0])
        }
      }
    } catch (error) {
      console.error('Error uploading files:', error)
    } finally {
      setUploading(false)
      // Reset the input
      event.target.value = ''
    }
  }

  const filteredMedia = mediaFiles.filter(
    media =>
      media.original_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      media.alt_text.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <ImageIcon className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Select Featured Image
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search images..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Upload Button */}
            <label className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
              <Upload className="w-4 h-4" />
              <span>{uploading ? 'Uploading...' : 'Upload New'}</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>
        </div>

        <div className="p-4 overflow-y-auto max-h-96">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Loading images...</div>
            </div>
          ) : filteredMedia.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <ImageIcon className="w-12 h-12 mb-4" />
              <p>No images found</p>
              <p className="text-sm">Upload some images to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredMedia.map(media => (
                <div
                  key={media.id}
                  className={`relative group cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${
                    selectedId === media.id
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => onSelect(media)}
                >
                  <div className="aspect-square bg-gray-100 flex items-center justify-center">
                    {(media.mime_type &&
                      media.mime_type.startsWith('image/')) ||
                    (media.file_type && media.file_type.startsWith('image/')) ||
                    (media.original_name &&
                      /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(
                        media.original_name
                      )) ? (
                      <img
                        src={(() => {
                          if (!media.url)
                            return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzlDQTNBRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='

                          // Handle external URLs
                          if (
                            media.url.startsWith('http') &&
                            !media.url.includes('localhost')
                          ) {
                            return media.url
                          }

                          // For local files, use backend server directly
                          let cleanUrl = media.url
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
                        alt={media.alt_text || media.original_name}
                        className="w-full h-full object-cover"
                        onError={e => {
                          console.error(
                            'Media image failed to load:',
                            media.url
                          )
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          target.parentElement!.innerHTML =
                            '<div class="text-gray-400 text-sm">Failed to load</div>'
                        }}
                        onLoad={() => {
                          console.log('Media image loaded:', media.url)
                        }}
                      />
                    ) : (
                      <div className="text-gray-400 text-sm">Not an image</div>
                    )}
                  </div>

                  {/* Overlay with info */}
                  <div className="absolute inset-0 bg-transparent hover:bg-black hover:bg-opacity-50 transition-all flex items-end pointer-events-none">
                    <div className="w-full p-2 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-xs font-medium truncate">
                        {media.original_name}
                      </p>
                      <p className="text-xs opacity-75">
                        {formatFileSize(media.size)}
                      </p>
                    </div>
                  </div>

                  {/* Selected indicator */}
                  {selectedId === media.id && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center p-4 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            {filteredMedia.length} image{filteredMedia.length !== 1 ? 's' : ''}{' '}
            available
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                const selected = mediaFiles.find(m => m.id === selectedId)
                if (selected) {
                  onSelect(selected)
                }
              }}
              disabled={!selectedId}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Select Image
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
