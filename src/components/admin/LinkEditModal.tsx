'use client'

import { useState, useEffect } from 'react'
import { X, Save, Link as LinkIcon, ExternalLink } from 'lucide-react'

interface LinkEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: { href: string; text?: string; target?: string }) => void
  onRemove: () => void
  initialData: {
    href: string
    text: string
    target?: string
  }
}

export default function LinkEditModal({ isOpen, onClose, onSave, onRemove, initialData }: LinkEditModalProps) {
  const [formData, setFormData] = useState({
    href: '',
    text: '',
    target: '_blank'
  })

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        href: initialData.href || '',
        text: initialData.text || '',
        target: initialData.target || '_blank'
      })
    }
  }, [isOpen, initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      href: formData.href,
      text: formData.text || undefined,
      target: formData.target
    })
    onClose()
  }

  const handleRemoveLink = () => {
    onRemove()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <LinkIcon className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Edit Link</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Link URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Link URL *
            </label>
            <input
              type="url"
              value={formData.href}
              onChange={(e) => setFormData(prev => ({ ...prev, href: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://example.com"
              required
            />
          </div>

          {/* Link Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Link Text
            </label>
            <input
              type="text"
              value={formData.text}
              onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Link display text..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty to keep current selected text
            </p>
          </div>

          {/* Target */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Open Link
            </label>
            <select
              value={formData.target}
              onChange={(e) => setFormData(prev => ({ ...prev, target: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="_blank">In new tab</option>
              <option value="_self">In same tab</option>
            </select>
          </div>

          {/* Preview */}
          {formData.href && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Preview:</h4>
              <div className="flex items-center space-x-2">
                <a
                  href={formData.href}
                  target={formData.target}
                  className="text-blue-600 hover:text-blue-800 underline text-sm"
                  onClick={(e) => e.preventDefault()}
                >
                  {formData.text || initialData.text || formData.href}
                </a>
                {formData.target === '_blank' && (
                  <ExternalLink className="w-3 h-3 text-gray-400" />
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleRemoveLink}
              className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
            >
              Remove Link
            </button>
            
            <div className="flex space-x-3">
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
          </div>
        </form>
      </div>
    </div>
  )
}
