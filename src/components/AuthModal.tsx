'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import LoginForm from '@/components/LoginForm'
import RegisterForm from '@/components/RegisterForm'
import { User } from '@/types'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onLogin: (user: User, token: string) => void
  initialTab?: 'login' | 'register'
}

export default function AuthModal({
  isOpen,
  onClose,
  onLogin,
  initialTab = 'login',
}: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab)

  // Update activeTab when initialTab changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab)
    }
  }, [isOpen, initialTab])

  if (!isOpen) return null

  const handleLogin = (user: User, token: string) => {
    onLogin(user, token)
    onClose()
  }

  return (
    <div className="bg-[#212121] fixed inset-0 backdrop-blur-sm z-[99999] flex items-start justify-center min-h-screen max-w-screen overflow-y-auto px-0">
      <div className="relative bg-[#212121] w-full max-w-md mx-auto min-h-fit max-h-full overflow-y-auto flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header Section */}
        <div className="text-center p-6 pb-4 bg-[#212121]">
          {/* Logo */}
          <div className="mb-4">
            <img
              src="pg-slot-logo.webp"
              alt="99Group"
              className="h-16 w-auto mx-auto"
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2 gradient-gold">
              Welcome to PGSlot
            </h2>
            <p className="text-gray-300 text-sm">
              Join thousands of players and start your gaming journey today
            </p>
          </div>

          {/* Tabs */}
          <div className="flex bg-gradient-to-r from-[#212121] to-[#403f3f] rounded-lg p-1 mb-4">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'login'
                  ? 'bg-[#C29331] text-[#212121] shadow-md'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'register'
                  ? 'bg-[#C29331] text-[#212121] shadow-md'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              Register
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'login' ? (
            <LoginForm
              onLogin={handleLogin}
              onShowRegister={() => setActiveTab('register')}
            />
          ) : (
            <RegisterForm
              onLogin={handleLogin}
              onShowLogin={() => setActiveTab('login')}
            />
          )}
        </div>
      </div>
    </div>
  )
}
