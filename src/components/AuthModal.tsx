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
    <div className="bg-white fixed inset-0 backdrop-blur-sm z-[99999] flex items-start justify-center min-h-screen max-w-screen overflow-y-auto px-0">
      <div className="relative bg-white w-full max-w-md mx-auto min-h-fit max-h-full overflow-y-auto flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-[#00a6ff] z-10 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header Section */}
        <div className="text-center p-6 pb-4 bg-white flex flex-col items-center justify-center">
          {/* Logo */}
          <div className="mb-8">
            <img
              src="fun88-logo-blue.png"
              alt="FUN88"
              className="h-10 w-auto mx-auto"
            />
          </div>

          <button className="relative bg-gradient-to-r from-[#00a6ff] via-[#0088cc] to-[#00a6ff] rounded-2xl p-3 mb-4 flex items-center justify-center gap-3 py-3 px-10 overflow-hidden group hover:scale-110 transition-all duration-500 shadow-2xl hover:shadow-blue-500/50 border-2 border-white/20 hover:border-white/40">
            {/* Animated background effects */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#00a6ff] via-[#0088cc] to-[#00a6ff] animate-pulse opacity-60"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

            {/* Glowing border effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#00a6ff] via-[#0088cc] to-[#00a6ff] opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>

            {/* Sparkle effects */}
            <div className="absolute top-2 left-4 w-1 h-1 bg-white rounded-full animate-ping opacity-70"></div>
            <div className="absolute top-3 right-6 w-1 h-1 bg-white rounded-full animate-ping opacity-70 animation-delay-300"></div>
            <div className="absolute bottom-2 left-8 w-1 h-1 bg-white rounded-full animate-ping opacity-70 animation-delay-700"></div>
            <div className="absolute bottom-3 right-4 w-1 h-1 bg-white rounded-full animate-ping opacity-70 animation-delay-1000"></div>

            {/* Content */}
            <div className="relative z-10 flex items-center gap-3">
              <div className="relative">
                <img
                  src="money-icon-2.png"
                  className="w-12 h-12 animate-bounce drop-shadow-lg"
                />
                {/* Money icon glow */}
                <div className="absolute inset-0 w-12 h-12 bg-yellow-400/30 rounded-full blur-md animate-pulse"></div>
              </div>
              <div className="flex flex-col items-start">
                <span className="text-white text-2xl font-black drop-shadow-lg tracking-wide">
                  Get Bonus
                </span>
                <span className="text-white/90 text-sm font-medium -mt-1">
                  🎁 Free Credits Available
                </span>
              </div>
            </div>

            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>

            {/* Ripple effect on click */}
            <div className="absolute inset-0 rounded-2xl bg-white/20 scale-0 group-active:scale-100 transition-transform duration-200"></div>
          </button>

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-primary mb-2">
              Welcome to FUN88
            </h2>
            <p className="text-primary text-sm">
              Join thousands of players and start your gaming journey today
            </p>
          </div>

          {/* Tabs */}
          <div className="flex bg-[#00a6ff] rounded-lg p-1 mb-4">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'login'
                  ? 'bg-white text-[#00a6ff] shadow-md'
                  : 'text-white hover:text-white hover:bg-white/20'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'register'
                  ? 'bg-white text-[#00a6ff] shadow-md'
                  : 'text-white hover:text-white hover:bg-white/20'
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

      <style jsx>{`
        .animation-delay-300 {
          animation-delay: 300ms;
        }
        .animation-delay-700 {
          animation-delay: 700ms;
        }
        .animation-delay-1000 {
          animation-delay: 1000ms;
        }
      `}</style>
    </div>
  )
}
