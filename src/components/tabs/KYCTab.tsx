'use client'

import { useState } from 'react'
import { User } from '@/types'
import {
  Shield,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from 'lucide-react'

interface KYCTabProps {
  user: User | null
  onKYCUpload: (formData: FormData) => Promise<boolean>
}

export default function KYCTab({ user, onKYCUpload }: KYCTabProps) {
  const [idFront, setIdFront] = useState<File | null>(null)
  const [idBack, setIdBack] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const getStatusInfo = () => {
    if (!user)
      return {
        status: 'pending',
        message: 'Loading...',
        className: 'bg-gray-800/50 border-gray-600/30 text-gray-300',
      }

    switch (user.kyc_status) {
      case 'approved':
        return {
          status: 'Approved',
          message: 'Your identity has been verified successfully!',
          className: 'bg-green-900/20 border-green-600/30 text-green-300',
        }
      case 'rejected':
        return {
          status: 'Rejected',
          message: 'Your documents were rejected. Please upload new documents.',
          className: 'bg-red-900/20 border-red-600/30 text-red-300',
        }
      case 'submitted':
        return {
          status: 'Under Review',
          message:
            'Your documents are being reviewed. Please wait for approval.',
          className: 'bg-blue-900/20 border-blue-600/30 text-blue-300',
        }
      default:
        return {
          status: 'Pending',
          message: 'Please upload your identity documents for verification.',
          className: 'bg-gray-800/50 border-gray-600/30 text-gray-300',
        }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!idFront || !idBack) {
      alert(
        'Please upload both ID documents:\n\n• ID Front Side\n• ID Back Side'
      )
      return
    }

    // Validate file types
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/pdf',
    ]
    if (
      !allowedTypes.includes(idFront.type) ||
      !allowedTypes.includes(idBack.type)
    ) {
      alert(
        'Invalid file type!\n\nPlease upload files in JPEG, PNG, or PDF format only.'
      )
      return
    }

    // Validate file sizes (max 5MB each)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (idFront.size > maxSize || idBack.size > maxSize) {
      alert('File too large!\n\nPlease ensure each file is under 5MB.')
      return
    }

    setIsUploading(true)

    const formData = new FormData()
    formData.append('id_front', idFront)
    formData.append('id_back', idBack)

    const success = await onKYCUpload(formData)

    if (success) {
      setIdFront(null)
      setIdBack(null)
      // Reset file inputs
      const frontInput = document.getElementById('idFront') as HTMLInputElement
      const backInput = document.getElementById('idBack') as HTMLInputElement
      if (frontInput) frontInput.value = ''
      if (backInput) backInput.value = ''
    }

    setIsUploading(false)
  }

  const statusInfo = getStatusInfo()
  const showForm =
    user?.kyc_status === 'pending' || user?.kyc_status === 'rejected'

  return (
    <div className="max-w-3xl mx-auto p-3 space-y-4">
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold text-[#00a6ff] mb-1">
          KYC Verification
        </h1>
        <p className="text-gray-600 text-sm">
          Verify your identity to enable withdrawals
        </p>
      </div>

      {/* Status Card */}
      <div
        className={`rounded-xl p-4 border ${
          statusInfo.status === 'Approved'
            ? 'bg-green-50 border-green-200'
            : statusInfo.status === 'Rejected'
              ? 'bg-red-50 border-red-200'
              : statusInfo.status === 'Under Review'
                ? 'bg-blue-50 border-blue-200'
                : 'bg-gray-50 border-gray-200'
        }`}
      >
        <div className="flex items-start space-x-3">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center ${
              statusInfo.status === 'Approved'
                ? 'bg-green-100'
                : statusInfo.status === 'Rejected'
                  ? 'bg-red-100'
                  : statusInfo.status === 'Under Review'
                    ? 'bg-blue-100'
                    : 'bg-gray-100'
            }`}
          >
            {statusInfo.status === 'Approved' ? (
              <CheckCircle className="w-3 h-3 text-green-600" />
            ) : statusInfo.status === 'Rejected' ? (
              <XCircle className="w-3 h-3 text-red-600" />
            ) : statusInfo.status === 'Under Review' ? (
              <Clock className="w-3 h-3 text-blue-600" />
            ) : (
              <AlertCircle className="w-3 h-3 text-gray-600" />
            )}
          </div>
          <div className="flex-1">
            <h3
              className={`font-medium text-sm mb-1 ${
                statusInfo.status === 'Approved'
                  ? 'text-green-800'
                  : statusInfo.status === 'Rejected'
                    ? 'text-red-800'
                    : statusInfo.status === 'Under Review'
                      ? 'text-blue-800'
                      : 'text-gray-800'
              }`}
            >
              KYC Status: {statusInfo.status}
            </h3>
            <p className="text-gray-700 text-sm">{statusInfo.message}</p>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl p-5 border border-[#00a6ff]/20 shadow-lg">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-[#00a6ff] rounded-full flex items-center justify-center">
              <Upload className="w-3 h-3 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#00a6ff]">
                Upload Identity Documents
              </h2>
              <p className="text-gray-600 text-xs">
                Please upload your ID document (both sides) for verification
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="flex items-center space-x-1 text-xs font-medium text-gray-700">
                  <Shield className="w-3 h-3" />
                  <span>ID Front Side (JPEG, PNG, PDF)</span>
                </label>
                <input
                  type="file"
                  id="idFront"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={e => setIdFront(e.target.files?.[0] || null)}
                  required
                  className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg focus:border-[#00a6ff] focus:ring-1 focus:ring-[#00a6ff] focus:outline-none transition-all placeholder-gray-500 text-sm file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-[#00a6ff] file:text-white hover:file:opacity-90"
                />
                <p className="text-xs text-gray-600">
                  Clear photo of the front of your government-issued ID
                </p>
              </div>

              <div className="space-y-1">
                <label className="flex items-center space-x-1 text-xs font-medium text-gray-700">
                  <Shield className="w-3 h-3" />
                  <span>ID Back Side (JPEG, PNG, PDF)</span>
                </label>
                <input
                  type="file"
                  id="idBack"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={e => setIdBack(e.target.files?.[0] || null)}
                  required
                  className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg focus:border-[#00a6ff] focus:ring-1 focus:ring-[#00a6ff] focus:outline-none transition-all placeholder-gray-500 text-sm file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-[#00a6ff] file:text-white hover:file:opacity-90"
                />
                <p className="text-xs text-gray-600">
                  Clear photo of the back of your government-issued ID
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-blue-800 text-sm">
                <strong className="text-[#00a6ff]">Note:</strong> Withdrawal
                destination will be verified separately by our back office team
                during the withdrawal process.
              </p>
            </div>

            <button
              type="submit"
              disabled={isUploading}
              className={`w-full py-2.5 rounded-lg font-medium text-sm transition-all duration-300 ${
                isUploading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#00a6ff] text-white hover:bg-[#0088cc] hover:shadow-lg'
              }`}
            >
              {isUploading ? 'Uploading Documents...' : 'Submit KYC Documents'}
            </button>
          </form>
        </div>
      )}

      {!showForm && user?.kyc_status === 'approved' && (
        <div className="bg-white rounded-xl p-5 border border-green-200 shadow-lg text-center">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            {/* <h3 className="text-xl font-semibold text-green-800">
              Verification Complete!
            </h3> */}
          </div>
          <p className="text-green-800 text-sm">
            Your identity has been successfully verified. You can now make
            withdrawals once you reach the required balance.
          </p>
        </div>
      )}

      {!showForm && user?.kyc_status === 'submitted' && (
        <div className="bg-white rounded-xl p-5 border border-blue-200 shadow-lg text-center">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-blue-800">
              Under Review
            </h3>
          </div>
          <p className="text-blue-800 text-sm">
            Your documents have been submitted and are currently being reviewed.
            We&apos;ll notify you once the verification is complete.
          </p>
        </div>
      )}
    </div>
  )
}
