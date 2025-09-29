'use client'

import { useState, useEffect } from 'react'

interface KYCDocument {
  id: number
  user_id: number
  username: string
  document_type: string
  document_url: string
  status: string
  submitted_at: string
  processed_at: string
  admin_notes: string
}

interface KYCManagementProps {
  onStatsUpdate: () => void
}

export default function KYCManagement({ onStatsUpdate }: KYCManagementProps) {
  const [kycDocuments, setKYCDocuments] = useState<KYCDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedKYC, setSelectedKYC] = useState<KYCDocument | null>(null)
  const [showProcessModal, setShowProcessModal] = useState(false)
  const [processForm, setProcessForm] = useState({
    action: 'approve',
    admin_notes: ''
  })

  useEffect(() => {
    loadKYCDocuments()
  }, [])

  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  const loadKYCDocuments = async () => {
    try {
      const response = await fetch('/api/admin/kyc', {
        headers: getAuthHeaders()
      })
      const data = await response.json()
      
      if (response.ok) {
        setKYCDocuments(data.kyc_documents || [])
      } else {
        console.error('Failed to load KYC documents:', data.error)
      }
    } catch (error) {
      console.error('Error loading KYC documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProcessKYC = (kyc: KYCDocument) => {
    setSelectedKYC(kyc)
    setProcessForm({
      action: 'approve',
      admin_notes: ''
    })
    setShowProcessModal(true)
  }

  const handleSaveProcess = async () => {
    if (!selectedKYC) return

    try {
      const response = await fetch(`/api/admin/kyc/${selectedKYC.user_id}/process`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(processForm)
      })

      if (response.ok) {
        await loadKYCDocuments()
        onStatsUpdate()
        setShowProcessModal(false)
        setSelectedKYC(null)
      } else {
        const data = await response.json()
        alert(`Failed to process KYC: ${data.error}`)
      }
    } catch (error) {
      console.error('Error processing KYC:', error)
      alert('Failed to process KYC')
    }
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-block px-3 py-1 rounded-full text-xs font-medium uppercase"
    
    switch (status) {
      case 'submitted':
        return `${baseClasses} bg-blue-100 text-blue-800`
      case 'approved':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleViewDocument = (documentUrl: string) => {
    if (documentUrl) {
      // Open new window to view document
      window.open(documentUrl, '_blank')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">KYC Management</h2>
        <div className="text-sm text-gray-600">
          Total: {kycDocuments.length} | Pending: {kycDocuments.filter(k => k.status === 'submitted').length}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="border-b border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">ID</th>
              <th className="border-b border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">User</th>
              <th className="border-b border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">Document Type</th>
              <th className="border-b border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">Status</th>
              <th className="border-b border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">Submitted</th>
              <th className="border-b border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">Processed</th>
              <th className="border-b border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">Notes</th>
              <th className="border-b border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {kycDocuments.map((kyc) => (
              <tr key={kyc.id} className="hover:bg-gray-50">
                <td className="border-b border-gray-200 px-4 py-3">{kyc.id}</td>
                <td className="border-b border-gray-200 px-4 py-3 font-medium">{kyc.username}</td>
                <td className="border-b border-gray-200 px-4 py-3">
                  <span className="capitalize">{kyc.document_type}</span>
                </td>
                <td className="border-b border-gray-200 px-4 py-3">
                  <span className={getStatusBadge(kyc.status)}>
                    {kyc.status}
                  </span>
                </td>
                <td className="border-b border-gray-200 px-4 py-3 text-sm text-gray-600">
                  {formatDate(kyc.submitted_at)}
                </td>
                <td className="border-b border-gray-200 px-4 py-3 text-sm text-gray-600">
                  {formatDate(kyc.processed_at)}
                </td>
                <td className="border-b border-gray-200 px-4 py-3 text-sm">
                  {kyc.admin_notes ? (
                    <div className="max-w-xs truncate" title={kyc.admin_notes}>
                      {kyc.admin_notes}
                    </div>
                  ) : (
                    <span className="text-gray-400">No notes</span>
                  )}
                </td>
                <td className="border-b border-gray-200 px-4 py-3">
                  <div className="flex space-x-2">
                    {kyc.document_url && (
                      <button
                        onClick={() => handleViewDocument(kyc.document_url)}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors"
                      >
                        View
                      </button>
                    )}
                    {kyc.status === 'submitted' && (
                      <button
                        onClick={() => handleProcessKYC(kyc)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
                      >
                        Process
                      </button>
                    )}
                    {kyc.status !== 'submitted' && (
                      <span className="text-gray-400 text-sm">Processed</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {kycDocuments.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No KYC documents found
        </div>
      )}

      {/* Process KYC Modal */}
      {showProcessModal && selectedKYC && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              Process KYC for {selectedKYC.username}
            </h3>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><strong>User:</strong> {selectedKYC.username}</div>
                <div><strong>Document:</strong> {selectedKYC.document_type}</div>
                <div><strong>Submitted:</strong> {formatDate(selectedKYC.submitted_at)}</div>
                <div><strong>Status:</strong> 
                  <span className={`ml-1 ${getStatusBadge(selectedKYC.status)}`}>
                    {selectedKYC.status}
                  </span>
                </div>
              </div>
              
              {selectedKYC.document_url && (
                <div className="mt-3">
                  <button
                    onClick={() => handleViewDocument(selectedKYC.document_url)}
                    className="text-blue-600 hover:text-blue-800 text-sm underline"
                  >
                    View Document
                  </button>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="action"
                      value="approve"
                      checked={processForm.action === 'approve'}
                      onChange={(e) => setProcessForm({ ...processForm, action: e.target.value })}
                      className="mr-2"
                    />
                    <span className="text-green-600">Approve</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="action"
                      value="reject"
                      checked={processForm.action === 'reject'}
                      onChange={(e) => setProcessForm({ ...processForm, action: e.target.value })}
                      className="mr-2"
                    />
                    <span className="text-red-600">Reject</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notes</label>
                <textarea
                  value={processForm.admin_notes}
                  onChange={(e) => setProcessForm({ ...processForm, admin_notes: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter admin notes..."
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowProcessModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProcess}
                className={`px-4 py-2 text-white rounded-lg ${
                  processForm.action === 'approve' 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {processForm.action === 'approve' ? 'Approve' : 'Reject'} KYC
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
