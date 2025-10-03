'use client'

import { useState, useEffect, useRef } from 'react'
import { User } from '@/types'
import { Eye, EyeOff, Loader2, RefreshCw } from 'lucide-react'
import { useClientOnly, useTimestamp } from '@/hooks/useClientOnly'
import { API_CONFIG } from '@/utils/config'

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
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [captcha, setCaptcha] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [sessionId, setSessionId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [sessionInitialized, setSessionInitialized] = useState(false)
  const [captchaLoaded, setCaptchaLoaded] = useState(false)
  const [captchaTimestamp, setCaptchaTimestamp] = useState(0)
  const isClient = useClientOnly()
  const currentTimestamp = useTimestamp()
  const latestSessionIdRef = useRef('')

  useEffect(() => {
    if (!sessionInitialized && isClient) {
      generateSessionId()
      setSessionInitialized(true)
    }
  }, [sessionInitialized, isClient])

  const generateSessionId = () => {
    if (!isClient) return // Don't generate on server side

    const newSessionId =
      Date.now().toString(36) + Math.random().toString(36).substr(2)
    const timestamp = Date.now()
    console.log('Generated NEW session ID:', newSessionId)
    console.log('Previous session ID was:', sessionId)
    setSessionId(newSessionId)
    latestSessionIdRef.current = newSessionId
    setCaptchaTimestamp(timestamp)
    setCaptchaLoaded(true)
  }

  const refreshCaptcha = () => {
    console.log('Refreshing captcha, current session ID:', sessionId)
    setCaptchaLoaded(false)
    setCaptcha('')
    // Generate new session ID immediately
    const newSessionId =
      Date.now().toString(36) + Math.random().toString(36).substr(2)
    const timestamp = Date.now()
    console.log('Generated NEW session ID immediately:', newSessionId)
    console.log('Previous session ID was:', sessionId)
    setSessionId(newSessionId)
    latestSessionIdRef.current = newSessionId
    setCaptchaTimestamp(timestamp)
    setCaptchaLoaded(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    if (
      !fullName.trim() ||
      !username.trim() ||
      !password.trim() ||
      !confirmPassword.trim() ||
      !captcha.trim() ||
      !sessionId
    ) {
      setError('Please fill in all fields and complete the captcha.')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      setIsLoading(false)
      return
    }

    try {
      const currentSessionId = latestSessionIdRef.current || sessionId
      console.log('Submitting registration with session ID:', currentSessionId)
      console.log('State session ID:', sessionId)
      console.log('Ref session ID:', latestSessionIdRef.current)
      console.log('Captcha code:', captcha)
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: fullName,
          username: username,
          password: password,
          captcha: captcha,
          session_id: currentSessionId,
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
    <div className="pt-0 p-6 bg-white">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-center whitespace-pre-line">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-600 rounded-lg text-center whitespace-pre-line">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-[#00a6ff] mb-2">
            Full Name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            required
            minLength={2}
            maxLength={50}
            className="w-full px-4 py-3 bg-gray-50 border-2 border-blue-200 rounded-lg focus:border-[#00a6ff] focus:outline-none transition-all text-gray-900 placeholder-gray-400"
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#00a6ff] mb-2">
            Username (3-20 characters)
          </label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            minLength={3}
            maxLength={20}
            className="w-full px-4 py-3 bg-gray-50 border-2 border-blue-200 rounded-lg focus:border-[#00a6ff] focus:outline-none transition-all text-gray-900 placeholder-gray-400"
            placeholder="Choose a username"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#00a6ff] mb-2">
            Password (6+ characters)
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 pr-12 bg-gray-50 border-2 border-blue-200 rounded-lg focus:border-[#00a6ff] focus:outline-none transition-all text-gray-900 placeholder-gray-400"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#00a6ff] transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#00a6ff] mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 pr-12 bg-gray-50 border-2 border-blue-200 rounded-lg focus:border-[#00a6ff] focus:outline-none transition-all text-gray-900 placeholder-gray-400"
              placeholder="Confirm your password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#00a6ff] transition-colors"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#00a6ff] mb-2">
            Verification Code
          </label>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={captcha}
              onChange={e => setCaptcha(e.target.value)}
              required
              maxLength={4}
              className="flex-1 px-4 py-3 bg-gray-50 border-2 border-blue-200 rounded-lg focus:border-[#00a6ff] focus:outline-none transition-all text-gray-900 placeholder-gray-400"
              placeholder="Enter code"
            />
            {sessionId && captchaLoaded ? (
              <img
                key={`${sessionId}-${captchaTimestamp}`}
                src={`${API_CONFIG.BASE_URL}/api/captcha/${sessionId}?t=${captchaTimestamp}`}
                alt="Captcha"
                width={120}
                height={40}
                className="border-2 border-blue-200 rounded cursor-pointer hover:opacity-80 transition-opacity bg-white"
                onClick={refreshCaptcha}
                title="Click to refresh"
              />
            ) : (
              <div className="w-[120px] h-[40px] border-2 border-blue-200 rounded bg-gray-100 flex items-center justify-center">
                <span className="text-[#00a6ff] text-xs">Loading...</span>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Click the image to refresh if unclear
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            background: 'linear-gradient(180deg, #00a6ff, #0088cc)',
          }}
          className="w-full text-white py-3 px-4 rounded-xl cursor-pointer font-bold hover:from-blue-500 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-[#00a6ff] focus:ring-offset-2 focus:ring-offset-white transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg hover:shadow-blue-500/25"
        >
          {isLoading ? 'Creating Account...' : 'Register & Login'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <span className="text-gray-600">Already have an account? </span>
        <button
          onClick={onShowLogin}
          className="text-[#00a6ff] hover:text-blue-600 font-medium underline decoration-[#00a6ff]/50 hover:decoration-blue-600"
        >
          Login here
        </button>
      </div>
    </div>
  )
}
