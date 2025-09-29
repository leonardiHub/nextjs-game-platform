'use client'

import { useState, useEffect } from 'react'
import { X, Save, Image as ImageIcon } from 'lucide-react'

interface ImageEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: { src: string; alt: string; title?: string }) => void
  initialData: {
    src: string
    alt: string
    title?: string
  }
}

export default function ImageEditModal({ isOpen, onClose, onSave, initialData }: ImageEditModalProps) {
  const [formData, setFormData] = useState({
    src: '',
    alt: '',
    title: ''
  })

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        src: initialData.src || '',
        alt: initialData.alt || '',
        title: initialData.title || ''
      })
    }
  }, [isOpen, initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      src: formData.src,
      alt: formData.alt,
      title: formData.title || undefined
    })
    onClose()
  }

  const extractFileName = (url: string) => {
    try {
      const urlObj = new URL(url)
      const pathname = urlObj.pathname
      const fileName = pathname.split('/').pop() || ''
      return fileName.split('.')[0] // Remove extension for display
    } catch {
      return url.split('/').pop()?.split('.')[0] || 'image'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <ImageIcon className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Edit Image Properties</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Image Preview */}
          <div className="flex justify-center">
            <div className="w-32 h-32 border border-gray-300 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
              {formData.src ? (
                <img
                  src={formData.src}
                  alt={formData.alt || 'Preview'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    target.parentElement!.innerHTML = '<div class="text-gray-400 text-sm">Failed to load image</div>'
                  }}
                />
              ) : (
                <div className="text-gray-400 text-sm">No image</div>
              )}
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image URL
            </label>
            <input
              type="url"
              value={formData.src}
              onChange={(e) => setFormData(prev => ({ ...prev, src: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://example.com/image.jpg"
              required
            />
          </div>

          {/* Alt Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alt Text *
            </label>
            <input
              type="text"
              value={formData.alt}
              onChange={(e) => setFormData(prev => ({ ...prev, alt: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe the image content..."
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Used for screen readers and SEO optimization
            </p>
          </div>

          {/* Title/Caption */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image Title (Optional)
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Image title or caption..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Tooltip text shown on hover
            </p>
          </div>

          {/* File Name Display */}
          {formData.src && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                File Name
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-600">
                {extractFileName(formData.src)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Automatically extracted from image URL
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
