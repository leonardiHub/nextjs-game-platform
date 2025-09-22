'use client'

import { useState, useEffect } from 'react'
import { User } from '@/types'

interface RegisterFormProps {
  onLogin: (user: User, token: string) => void
  onShowLogin: () => void
}

export default function RegisterForm({
  onLogin,
  onShowLogin,
}: RegisterFormProps) {
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [captcha, setCaptcha] = useState('')
  const [sessionId, setSessionId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [sessionInitialized, setSessionInitialized] = useState(false)
  const [captchaLoaded, setCaptchaLoaded] = useState(false)
  const [captchaTimestamp, setCaptchaTimestamp] = useState(Date.now())

  useEffect(() => {
    if (!sessionInitialized) {
      generateSessionId()
      setSessionInitialized(true)
    }
  }, [sessionInitialized])

  const generateSessionId = () => {
    const newSessionId =
      Date.now().toString(36) + Math.random().toString(36).substr(2)
    const timestamp = Date.now()
    console.log('Generated session ID:', newSessionId)
    setSessionId(newSessionId)
    setCaptchaTimestamp(timestamp)
    setCaptchaLoaded(true)
  }

  const refreshCaptcha = () => {
    setCaptchaLoaded(false)
    setCaptcha('')
    generateSessionId()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    if (!fullName.trim() || !username.trim() || !captcha.trim() || !sessionId) {
      setError('Please fill in all fields and complete the captcha.')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: fullName,
          username: username,
          captcha: captcha,
          session_id: sessionId,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(
          `🎉 Registration successful! You are now logged in.\n\n` +
            `📝 Your temporary password is: ${data.temporaryPassword}\n` +
            `⚠️ Please save this password - you can change it later in your profile.`
        )

        setTimeout(() => {
          onLogin(data.user, data.token)
        }, 3000)
      } else {
        setError(data.error || 'Registration failed')
        refreshCaptcha()
      }
    } catch {
      setError('Network error. Please try again.')
      refreshCaptcha()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="pt-0 p-6">
      {error && (
        <div className="mb-6 p-4 bg-red-900/50 border border-red-500/50 text-red-300 rounded-lg text-center whitespace-pre-line backdrop-blur-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-900/50 border border-green-500/50 text-green-300 rounded-lg text-center whitespace-pre-line backdrop-blur-sm">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-yellow-200 mb-2">
            Full Name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            required
            minLength={2}
            maxLength={50}
            className="w-full px-4 py-3 bg-gray-800/50 border-2 border-yellow-600/30 rounded-lg focus:border-yellow-400 focus:outline-none transition-all text-white placeholder-gray-400 backdrop-blur-sm"
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-yellow-200 mb-2">
            Username (3-20 characters)
          </label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            minLength={3}
            maxLength={20}
            className="w-full px-4 py-3 bg-gray-800/50 border-2 border-yellow-600/30 rounded-lg focus:border-yellow-400 focus:outline-none transition-all text-white placeholder-gray-400 backdrop-blur-sm"
            placeholder="Choose a username"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-yellow-200 mb-2">
            Verification Code
          </label>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={captcha}
              onChange={e => setCaptcha(e.target.value)}
              required
              maxLength={4}
              className="flex-1 px-4 py-3 bg-gray-800/50 border-2 border-yellow-600/30 rounded-lg focus:border-yellow-400 focus:outline-none transition-all text-white placeholder-gray-400 backdrop-blur-sm"
              placeholder="Enter code"
            />
            {sessionId && captchaLoaded ? (
              <img
                key={`${sessionId}-${captchaTimestamp}`}
                src={`/api/captcha/${sessionId}?t=${captchaTimestamp}`}
                alt="Captcha"
                width={120}
                height={40}
                className="border-2 border-yellow-600/30 rounded cursor-pointer hover:opacity-80 transition-opacity bg-white"
                onClick={refreshCaptcha}
                title="Click to refresh"
              />
            ) : (
              <div className="w-[120px] h-[40px] border-2 border-yellow-600/30 rounded bg-gray-700 flex items-center justify-center">
                <span className="text-yellow-400 text-xs">Loading...</span>
              </div>
            )}
          </div>
          <p className="text-xs text-yellow-300/70 mt-1">
            Click the image to refresh if unclear
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full primary-gradient-to-b text-black py-3 px-4 rounded-xl cursor-pointer font-bold hover:from-yellow-400 hover:to-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg hover:shadow-yellow-400/25"
        >
          {isLoading ? 'Creating Account...' : 'Register & Login'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <span className="text-yellow-200/80">Already have an account? </span>
        <button
          onClick={onShowLogin}
          className="text-yellow-400 hover:text-yellow-300 font-medium underline decoration-yellow-400/50 hover:decoration-yellow-300"
        >
          Login here
        </button>
      </div>
    </div>
  )
}
