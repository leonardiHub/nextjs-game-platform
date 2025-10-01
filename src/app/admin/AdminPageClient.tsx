'use client'

import { useState, useEffect } from 'react'
import { Shield, Loader2 } from 'lucide-react'
import AdminLogin from '@/components/admin/AdminLogin'
import AdminDashboard from '@/components/admin/AdminDashboard'

export default function AdminPageClient() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if already logged in
    const token = localStorage.getItem('adminToken')
    if (token) {
      // Verify if token is valid
      verifyToken(token)
    } else {
      setIsLoading(false)
    }
  }, [])

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch('/api/admin/verify', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setIsAuthenticated(true)
      } else {
        localStorage.removeItem('adminToken')
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error('Token verification failed:', error)
      localStorage.removeItem('adminToken')
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoginSuccess = () => {
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    setIsAuthenticated(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 w-full max-w-md">
          {/* Loading Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 rounded-lg mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Admin Panel
            </h1>
            <p className="text-sm text-gray-600">Verifying your session...</p>
          </div>

          {/* Loading Animation */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Loader2 className="w-8 h-8 text-gray-900 animate-spin" />
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gray-900 h-2 rounded-full animate-pulse"
                style={{ width: '60%' }}
              ></div>
            </div>
            <p className="text-sm text-gray-500">
              Please wait while we authenticate you...
            </p>
          </div>

          {/* Loading Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-xs text-gray-500">
                99Group Platform Admin Console
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Secure access verification in progress
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {!isAuthenticated ? (
        <AdminLogin onLoginSuccess={handleLoginSuccess} />
      ) : (
        <AdminDashboard onLogout={handleLogout} />
      )}
    </div>
  )
}
