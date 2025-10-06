'use client'

import { useState, useEffect } from 'react'
import { adminApiCall } from '@/utils/adminApi'
import { AlertCircle, Info, CheckCircle } from 'lucide-react'
import { API_CONFIG } from '@/utils/config'

interface HeroCarouselItem {
  id: number
  title: string
  subtitle?: string
  description?: string
  button_text?: string
  button_url?: string
  media_id: number
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
  filename?: string
  url?: string
  alt_text?: string
  media_title?: string
}

interface MediaItem {
  id: number
  name: string
  original_name: string
  url: string
  alt_text?: string
  description?: string
  type: string
  mime_type: string
  size: number
  created_at: string
  updated_at: string
}

export default function HeroCarouselManagement() {
  const [carouselItems, setCarouselItems] = useState<HeroCarouselItem[]>([])
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<HeroCarouselItem | null>(null)
  const [newItem, setNewItem] = useState({
    media_id: 0,
    display_order: 0,
    is_active: true,
  })
  const [selectedImageDimensions, setSelectedImageDimensions] = useState<{
    width: number
    height: number
    ratio: number
  } | null>(null)

  // Helper function to format media URLs properly
  const formatMediaUrl = (url: string) => {
    if (!url) return ''

    // Handle external URLs
    if (url.startsWith('http') && !url.includes('localhost')) {
      return url
    }

    // For local files, use backend server directly
    let cleanUrl = url
      .replace('http://localhost:3006', '')
      .replace('http://localhost:3001', '')
      .replace('https://99group.games', '')
      .replace('https://api.99group.games', '')

    // Ensure URL starts with /uploads
    if (!cleanUrl.startsWith('/uploads')) {
      cleanUrl = `/uploads/${cleanUrl.replace(/^\/+/, '')}`
    }

    // Return appropriate backend URL based on environment
    const apiUrl =
      typeof window !== 'undefined' && window.location.hostname === 'localhost'
        ? 'http://localhost:3006'
        : API_CONFIG.BASE_URL
    return `${apiUrl}${cleanUrl}`
  }

  useEffect(() => {
    fetchCarouselItems()
    fetchMediaItems()
  }, [])

  const fetchCarouselItems = async () => {
    try {
      const response = await adminApiCall('/hero-carousel', { method: 'GET' })
      setCarouselItems(response.carouselItems || [])
    } catch (error) {
      console.error('Error fetching carousel items:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMediaItems = async () => {
    try {
      const response = await adminApiCall(
        '/media?page=1&limit=100&type=all&date_range=all',
        { method: 'GET' }
      )
      setMediaItems(response.files || [])
    } catch (error) {
      console.error('Error fetching media items:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingItem) {
        await adminApiCall(`/hero-carousel/${editingItem.id}`, {
          method: 'PUT',
          body: newItem,
        })
      } else {
        await adminApiCall('/hero-carousel', { method: 'POST', body: newItem })
      }
      await fetchCarouselItems()
      setShowForm(false)
      setEditingItem(null)
      setNewItem({
        media_id: 0,
        display_order: 0,
        is_active: true,
      })
    } catch (error) {
      console.error('Error saving carousel item:', error)
    }
  }

  const handleEdit = (item: HeroCarouselItem) => {
    setEditingItem(item)
    setNewItem({
      media_id: item.media_id,
      display_order: item.display_order,
      is_active: item.is_active,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this carousel item?')) return

    try {
      await adminApiCall(`/hero-carousel/${id}`, { method: 'DELETE' })
      await fetchCarouselItems()
    } catch (error) {
      console.error('Error deleting carousel item:', error)
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingItem(null)
    setNewItem({
      media_id: 0,
      display_order: 0,
      is_active: true,
    })
    setSelectedImageDimensions(null)
  }

  const checkImageDimensions = (imageUrl: string) => {
    const img = new Image()
    img.onload = () => {
      const ratio = img.width / img.height
      setSelectedImageDimensions({
        width: img.width,
        height: img.height,
        ratio: ratio,
      })
    }
    img.src = imageUrl
  }

  const isRecommendedRatio = (ratio: number) => {
    // Check if ratio is close to 3:1 (between 2.8 and 3.2)
    return ratio >= 2.8 && ratio <= 3.2
  }

  const getImageRecommendation = () => {
    if (!selectedImageDimensions) return null

    const { width, height, ratio } = selectedImageDimensions
    const isRecommended = isRecommendedRatio(ratio)

    if (isRecommended) {
      return (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <div>
              <div className="text-sm font-medium text-green-800">
                ✅ Perfect! This image has the recommended 3:1 aspect ratio
              </div>
              <div className="text-xs text-green-600 mt-1">
                Dimensions: {width}×{height}px (Ratio: {ratio.toFixed(2)}:1)
              </div>
            </div>
          </div>
        </div>
      )
    } else {
      return (
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
            <div>
              <div className="text-sm font-medium text-yellow-800">
                ⚠️ Warning: This image doesn't have the recommended 3:1 aspect
                ratio
              </div>
              <div className="text-xs text-yellow-600 mt-1">
                Current: {width}×{height}px (Ratio: {ratio.toFixed(2)}:1) |
                Recommended: 3:1 ratio
              </div>
            </div>
          </div>
        </div>
      )
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Hero Carousel Management
        </h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          Add New Carousel Item
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingItem ? 'Edit Carousel Item' : 'Add New Carousel Item'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Image *
                  </label>

                  {/* Image Requirements Info Box */}
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start">
                      <Info className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-blue-800 mb-2">
                          📐 Recommended Image Specifications
                        </div>
                        <div className="text-xs text-blue-700 space-y-1">
                          <div>
                            <strong>Aspect Ratio:</strong> 3:1 (3 times wider
                            than tall)
                          </div>
                          <div>
                            <strong>Recommended Resolutions:</strong>
                          </div>
                          <div className="ml-2">
                            • Desktop: 2400×800px or 3000×1000px
                          </div>
                          <div className="ml-2">
                            • Mobile: 1800×600px or 1500×500px
                          </div>
                          <div className="ml-2">
                            • Universal: 2400×800px (works for all devices)
                          </div>
                          <div>
                            <strong>File Format:</strong> WebP (preferred) or
                            JPEG
                          </div>
                          <div>
                            <strong>File Size:</strong> 200-500KB per image
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Image Grid Selection */}
                  <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto border border-gray-300 rounded-lg p-3">
                    {mediaItems.map(media => (
                      <div
                        key={media.id}
                        onClick={() => {
                          setNewItem({ ...newItem, media_id: media.id })
                          checkImageDimensions(formatMediaUrl(media.url))
                        }}
                        className={`cursor-pointer border-2 rounded-lg p-2 transition-all ${
                          newItem.media_id === media.id
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={formatMediaUrl(media.url)}
                          alt={media.original_name || media.name}
                          className="w-full h-20 object-cover rounded"
                          onError={e => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                          }}
                        />
                        <div className="mt-2 text-xs text-gray-600 truncate">
                          {media.original_name || media.name}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Show selected image preview */}
                  {newItem.media_id > 0 && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium text-gray-700 mb-2">
                        Selected Image:
                      </div>
                      <img
                        src={formatMediaUrl(
                          mediaItems.find(m => m.id === newItem.media_id)
                            ?.url || ''
                        )}
                        alt="Preview"
                        className="w-32 h-20 object-cover rounded border"
                        onError={e => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                        }}
                      />
                      <div className="mt-2 text-sm text-gray-600">
                        {mediaItems.find(m => m.id === newItem.media_id)
                          ?.original_name ||
                          mediaItems.find(m => m.id === newItem.media_id)?.name}
                      </div>
                    </div>
                  )}

                  {/* Image Recommendation Box */}
                  {getImageRecommendation()}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={newItem.display_order}
                    onChange={e =>
                      setNewItem({
                        ...newItem,
                        display_order: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={newItem.is_active}
                  onChange={e =>
                    setNewItem({ ...newItem, is_active: e.target.checked })
                  }
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="is_active"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Active
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  {editingItem ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Image Preview
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Image Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {carouselItems.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.url ? (
                      <img
                        src={formatMediaUrl(item.url)}
                        alt={item.alt_text || item.title}
                        className="w-16 h-12 object-cover rounded"
                        onError={e => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                        No Image
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {item.media_title || item.filename || 'No name'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {item.display_order}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {item.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-purple-600 hover:text-purple-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
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
