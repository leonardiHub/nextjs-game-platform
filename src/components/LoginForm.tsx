'use client'

import { useState } from 'react'
import { User } from '@/types'

interface LoginFormProps {
  onLogin: (user: User, token: string) => void
  onShowRegister: () => void
}

export default function LoginForm({ onLogin, onShowRegister }: LoginFormProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (response.ok) {
        onLogin(data.user, data.token)
      } else {
        setError(data.error || 'Login failed')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 pt-0 h-full">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-[#00a6ff] mb-2">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            className="w-full px-4 py-3 bg-gray-50 border-2 border-blue-200 rounded-lg focus:border-[#00a6ff] focus:outline-none transition-all text-gray-900 placeholder-gray-400"
            placeholder="Enter your username"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#00a6ff] mb-2">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 bg-gray-50 border-2 border-blue-200 rounded-lg focus:border-[#00a6ff] focus:outline-none transition-all text-gray-900 placeholder-gray-400"
            placeholder="Enter your password"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            background: 'linear-gradient(180deg, #00a6ff, #0088cc)',
          }}
          className="w-full py-3 px-4 rounded-xl cursor-pointer font-bold text-white hover:from-blue-500 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-[#00a6ff] focus:ring-offset-2 focus:ring-offset-white transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg hover:shadow-blue-500/25"
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div className="mt-6 text-center text-gray-600">
        <span className="">Don&apos;t have an account? </span>
        <button
          onClick={onShowRegister}
          className="text-[#00a6ff] hover:text-blue-600 font-medium underline decoration-[#00a6ff]/50 hover:decoration-blue-600"
        >
          Register here
        </button>
      </div>
    </div>
  )
}
