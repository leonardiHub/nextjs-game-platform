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
    <div className="bg-[#212121] p-6 pt-0 h-full">
      {error && (
        <div className="mb-6 p-4 bg-red-900/50 border border-red-500/50 text-red-300 rounded-lg text-center backdrop-blur-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-yellow-200 mb-2">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            className="w-full px-4 py-3 bg-gray-800/50 border-2 border-yellow-600/30 rounded-lg focus:border-yellow-400 focus:outline-none transition-all text-white placeholder-gray-400 backdrop-blur-sm"
            placeholder="Enter your username"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-yellow-200 mb-2">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 bg-gray-800/50 border-2 border-yellow-600/30 rounded-lg focus:border-yellow-400 focus:outline-none transition-all text-white placeholder-gray-400 backdrop-blur-sm"
            placeholder="Enter your password"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            background: 'linear-gradient(180deg, #af8135, #f0e07c, #c69b3a)',
          }}
          className="w-full py-3 px-4 rounded-xl cursor-pointer font-bold hover:from-yellow-400 hover:to-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg hover:shadow-yellow-400/25"
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div className="mt-6 text-center text-[#d9d9d9]">
        <span className="">Don&apos;t have an account? </span>
        <button
          onClick={onShowRegister}
          className="text-yellow-400 hover:text-yellow-300 font-medium underline decoration-yellow-400/50 hover:decoration-yellow-300"
        >
          Register here
        </button>
      </div>
    </div>
  )
}
