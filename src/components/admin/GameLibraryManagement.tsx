'use client'

import { useState, useEffect } from 'react'
import {
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Plus,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Gamepad2,
  Filter,
  Search,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react'

interface Game {
  id: string
  name: string
  code: number
  game_uid: string
  type: 'Slot Game' | 'Fish Game' | 'Table Game' | 'Arcade Game'
  provider_id: string
  provider_name: string
  rtp: number
  status: 'active' | 'inactive'
  featured: boolean
  displaySequence?: number
  min_bet: number
  max_bet: number
  currency: string
  language: string
  demo_url?: string
  thumbnail_url?: string
  created_at: string
  updated_at: string
}

interface GameProvider {
  id: string
  name: string
  code: string
  status: string
  game_count: number
}

interface GameLibraryData {
  games: Game[]
  providers: GameProvider[]
}

export default function GameLibraryManagement() {
  const [data, setData] = useState<GameLibraryData>({
    games: [],
    providers: [],
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingGame, setEditingGame] = useState<Game | null>(null)
  const [filters, setFilters] = useState({
    search: '',
    provider: '',
    type: '',
    status: '',
  })

  const [newGame, setNewGame] = useState<Partial<Game>>({
    name: '',
    code: 0,
    game_uid: '',
    type: 'Slot Game',
    provider_id: '',
    rtp: 96.5,
    status: 'active',
    featured: false,
    displaySequence: undefined,
    min_bet: 0.1,
    max_bet: 100,
    currency: 'USD',
    language: 'en',
    demo_url: '',
    thumbnail_url: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('adminToken')

      // Load games and providers
      const [gamesResponse, providersResponse] = await Promise.all([
        fetch('/api/admin/games', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/admin/game-library-providers', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      if (gamesResponse.ok && providersResponse.ok) {
        const [gamesData, providersData] = await Promise.all([
          gamesResponse.json(),
          providersResponse.json(),
        ])

        setData({
          games: gamesData.games || [],
          providers: providersData.providers || [],
        })
      } else {
        // Load demo data if API not implemented
        setData({
          games: [
            {
              id: '1',
              name: 'Mahjong Ways 2',
              code: 74,
              game_uid: 'ba2adf72179e1ead9e3dae8f0a7d4c07',
              type: 'Slot Game',
              provider_id: '1',
              provider_name: 'JILI Gaming',
              rtp: 96.95,
              status: 'active',
              featured: true,
              min_bet: 0.1,
              max_bet: 100,
              currency: 'USD',
              language: 'en',
              demo_url: 'https://demo.example.com/mahjong-ways-2',
              thumbnail_url: '/images/games/mahjong-ways-2.jpg',
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z',
            },
            {
              id: '2',
              name: 'Royal Fishing',
              code: 1,
              game_uid: 'e794bf5717aca371152df192341fe68b',
              type: 'Fish Game',
              provider_id: '1',
              provider_name: 'JILI Gaming',
              rtp: 95.8,
              status: 'active',
              featured: false,
              min_bet: 0.1,
              max_bet: 50,
              currency: 'USD',
              language: 'en',
              demo_url: 'https://demo.example.com/royal-fishing',
              thumbnail_url: '/images/games/royal-fishing.jpg',
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z',
            },
            {
              id: '3',
              name: 'Fortune Ox',
              code: 98,
              game_uid: '8db4eb6d781f915eebab2a26133db0e9',
              type: 'Slot Game',
              provider_id: '1',
              provider_name: 'JILI Gaming',
              rtp: 96.75,
              status: 'inactive',
              featured: false,
              min_bet: 0.1,
              max_bet: 200,
              currency: 'USD',
              language: 'en',
              demo_url: 'https://demo.example.com/fortune-ox',
              thumbnail_url: '/images/games/fortune-ox.jpg',
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z',
            },
          ],
          providers: [
            {
              id: '1',
              name: 'JILI Gaming',
              code: 'JILI',
              status: 'inactive',
              game_count: 5,
            },
            {
              id: '2',
              name: 'PG Soft',
              code: 'PG',
              status: 'active',
              game_count: 28,
            },
            {
              id: '3',
              name: 'Pragmatic Play',
              code: 'PP',
              status: 'active',
              game_count: 0,
            },
          ],
        })
      }
    } catch (error) {
      console.error('Error loading data:', error)
      setMessage({ type: 'error', text: 'Failed to load game library data' })
    } finally {
      setLoading(false)
    }
  }

  const saveGame = async (game: Partial<Game>) => {
    try {
      setSaving(true)
      const token = localStorage.getItem('adminToken')

      const url = game.id ? `/api/admin/games/${game.id}` : '/api/admin/games'
      const method = game.id ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(game),
      })

      if (response.ok) {
        setMessage({
          type: 'success',
          text: `Game ${game.id ? 'updated' : 'created'} successfully`,
        })
        await loadData()
        setShowAddForm(false)
        setEditingGame(null)
        resetNewGame()
      } else {
        throw new Error('Failed to save game')
      }
    } catch (error) {
      console.error('Error saving game:', error)
      setMessage({ type: 'error', text: 'Failed to save game' })
    } finally {
      setSaving(false)
    }
  }

  const deleteGame = async (gameId: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this game? This action cannot be undone.'
      )
    ) {
      return
    }

    try {
      setSaving(true)
      const token = localStorage.getItem('adminToken')

      const response = await fetch(`/api/admin/games/${gameId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Game deleted successfully' })
        await loadData()
      } else {
        throw new Error('Failed to delete game')
      }
    } catch (error) {
      console.error('Error deleting game:', error)
      setMessage({ type: 'error', text: 'Failed to delete game' })
    } finally {
      setSaving(false)
    }
  }

  const toggleGameStatus = async (gameId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    const game = data.games.find(g => g.id === gameId)
    if (game) {
      await saveGame({ ...game, status: newStatus as 'active' | 'inactive' })
    }
  }

  const resetNewGame = () => {
    setNewGame({
      name: '',
      code: 0,
      game_uid: '',
      type: 'Slot Game',
      provider_id: '',
      rtp: 96.5,
      status: 'active',
      featured: false,
      displaySequence: undefined,
      min_bet: 0.1,
      max_bet: 100,
      currency: 'USD',
      language: 'en',
      demo_url: '',
      thumbnail_url: '',
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const gameData = editingGame ? { ...editingGame } : newGame
    saveGame(gameData)
  }

  const filteredGames = data.games.filter(game => {
    return (
      (filters.search === '' ||
        game.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        game.game_uid.toLowerCase().includes(filters.search.toLowerCase())) &&
      (filters.provider === '' ||
        game.provider_id.toString() === filters.provider) &&
      (filters.type === '' || game.type === filters.type) &&
      (filters.status === '' || game.status === filters.status)
    )
  })

  const gameTypes = ['Slot Game', 'Fish Game', 'Table Game', 'Arcade Game']

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-6 h-6 animate-spin text-gray-600" />
          <span className="text-gray-600">Loading game library...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Gamepad2 className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Game Library Management
              </h2>
              <p className="text-gray-600">
                Manage your game collection, settings, and availability
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Plus className="w-4 h-4" />
              <span>Add Game</span>
            </button>
          </div>
        </div>

        {message && (
          <div
            className={`mt-4 p-4 rounded-lg flex items-center space-x-2 ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{message.text}</span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Games
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={filters.search}
                onChange={e =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Search by name or UID..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Provider
            </label>
            <select
              value={filters.provider}
              onChange={e =>
                setFilters({ ...filters, provider: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Providers</option>
              {data.providers.map(provider => (
                <option key={provider.id} value={provider.id}>
                  {provider.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Game Type
            </label>
            <select
              value={filters.type}
              onChange={e => setFilters({ ...filters, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              {gameTypes.map(type => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={e => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Add/Edit Game Form */}
      {(showAddForm || editingGame) && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {editingGame ? 'Edit Game' : 'Add New Game'}
            </h3>
            <button
              onClick={() => {
                setShowAddForm(false)
                setEditingGame(null)
                resetNewGame()
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Game Name *
                </label>
                <input
                  type="text"
                  value={editingGame ? editingGame.name : newGame.name}
                  onChange={e => {
                    if (editingGame) {
                      setEditingGame({ ...editingGame, name: e.target.value })
                    } else {
                      setNewGame({ ...newGame, name: e.target.value })
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Mahjong Ways 2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Game Code *
                </label>
                <input
                  type="number"
                  value={editingGame ? editingGame.code : newGame.code}
                  onChange={e => {
                    const code = parseInt(e.target.value) || 0
                    if (editingGame) {
                      setEditingGame({ ...editingGame, code })
                    } else {
                      setNewGame({ ...newGame, code })
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="74"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Game UID *
                </label>
                <input
                  type="text"
                  value={editingGame ? editingGame.game_uid : newGame.game_uid}
                  onChange={e => {
                    if (editingGame) {
                      setEditingGame({
                        ...editingGame,
                        game_uid: e.target.value,
                      })
                    } else {
                      setNewGame({ ...newGame, game_uid: e.target.value })
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="ba2adf72179e1ead9e3dae8f0a7d4c07"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Game Type *
                </label>
                <select
                  value={editingGame ? editingGame.type : newGame.type}
                  onChange={e => {
                    const type = e.target.value as Game['type']
                    if (editingGame) {
                      setEditingGame({ ...editingGame, type })
                    } else {
                      setNewGame({ ...newGame, type })
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  {gameTypes.map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provider *
                </label>
                <select
                  value={
                    editingGame ? editingGame.provider_id : newGame.provider_id
                  }
                  onChange={e => {
                    if (editingGame) {
                      setEditingGame({
                        ...editingGame,
                        provider_id: e.target.value,
                      })
                    } else {
                      setNewGame({ ...newGame, provider_id: e.target.value })
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Provider</option>
                  {data.providers.map(provider => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  RTP (%) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={editingGame ? editingGame.rtp : newGame.rtp}
                  onChange={e => {
                    const rtp = parseFloat(e.target.value) || 0
                    if (editingGame) {
                      setEditingGame({ ...editingGame, rtp })
                    } else {
                      setNewGame({ ...newGame, rtp })
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="96.5"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Sequence
                </label>
                <input
                  type="number"
                  min="1"
                  value={
                    editingGame
                      ? editingGame.displaySequence || ''
                      : newGame.displaySequence || ''
                  }
                  onChange={e => {
                    const displaySequence =
                      parseInt(e.target.value) || undefined
                    if (editingGame) {
                      setEditingGame({ ...editingGame, displaySequence })
                    } else {
                      setNewGame({ ...newGame, displaySequence })
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Auto-assigned if empty"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Order in which games appear (1-30). Leave empty for
                  auto-assignment.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Bet ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editingGame ? editingGame.min_bet : newGame.min_bet}
                  onChange={e => {
                    const min_bet = parseFloat(e.target.value) || 0
                    if (editingGame) {
                      setEditingGame({ ...editingGame, min_bet })
                    } else {
                      setNewGame({ ...newGame, min_bet })
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Bet ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editingGame ? editingGame.max_bet : newGame.max_bet}
                  onChange={e => {
                    const max_bet = parseFloat(e.target.value) || 0
                    if (editingGame) {
                      setEditingGame({ ...editingGame, max_bet })
                    } else {
                      setNewGame({ ...newGame, max_bet })
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={editingGame ? editingGame.status : newGame.status}
                  onChange={e => {
                    const status = e.target.value as 'active' | 'inactive'
                    if (editingGame) {
                      setEditingGame({ ...editingGame, status })
                    } else {
                      setNewGame({ ...newGame, status })
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Demo URL
                </label>
                <input
                  type="url"
                  value={
                    editingGame
                      ? editingGame.demo_url || ''
                      : newGame.demo_url || ''
                  }
                  onChange={e => {
                    if (editingGame) {
                      setEditingGame({
                        ...editingGame,
                        demo_url: e.target.value,
                      })
                    } else {
                      setNewGame({ ...newGame, demo_url: e.target.value })
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="https://demo.example.com/game"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thumbnail URL
                </label>
                <input
                  type="url"
                  value={
                    editingGame
                      ? editingGame.thumbnail_url || ''
                      : newGame.thumbnail_url || ''
                  }
                  onChange={e => {
                    if (editingGame) {
                      setEditingGame({
                        ...editingGame,
                        thumbnail_url: e.target.value,
                      })
                    } else {
                      setNewGame({ ...newGame, thumbnail_url: e.target.value })
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="/images/games/game-name.jpg"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="featured"
                checked={editingGame ? editingGame.featured : newGame.featured}
                onChange={e => {
                  if (editingGame) {
                    setEditingGame({
                      ...editingGame,
                      featured: e.target.checked,
                    })
                  } else {
                    setNewGame({ ...newGame, featured: e.target.checked })
                  }
                }}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <label htmlFor="featured" className="ml-2 text-sm text-gray-700">
                Featured Game (display prominently on homepage)
              </label>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false)
                  setEditingGame(null)
                  resetNewGame()
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving && <RefreshCw className="w-4 h-4 animate-spin" />}
                <span>{editingGame ? 'Update Game' : 'Add Game'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Games List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Game Library
              </h3>
              <p className="text-sm text-gray-600">
                {filteredGames.length} of {data.games.length} games
              </p>
            </div>
            <div className="text-sm text-gray-500">
              Active: {data.games.filter(g => g.status === 'active').length} |
              Inactive: {data.games.filter(g => g.status === 'inactive').length}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Game
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Provider
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  RTP
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bet Range
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sequence
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredGames.map(game => (
                <tr key={game.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {game.thumbnail_url ? (
                          <img
                            className="h-10 w-10 rounded-lg object-cover"
                            src={game.thumbnail_url}
                            alt={game.name}
                            onError={e => {
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                              target.nextElementSibling?.classList.remove(
                                'hidden'
                              )
                            }}
                          />
                        ) : null}
                        <div
                          className={`h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center ${game.thumbnail_url ? 'hidden' : ''}`}
                        >
                          <Gamepad2 className="w-5 h-5 text-purple-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">
                            {game.name}
                          </div>
                          {game.featured && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                              Featured
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          Code: {game.code}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {game.provider_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        game.type === 'Slot Game'
                          ? 'bg-blue-100 text-blue-800'
                          : game.type === 'Fish Game'
                            ? 'bg-green-100 text-green-800'
                            : game.type === 'Table Game'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {game.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{game.rtp}%</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      ${game.min_bet} - ${game.max_bet}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleGameStatus(game.id, game.status)}
                      className={`flex items-center space-x-1 ${
                        game.status === 'active'
                          ? 'text-green-600 hover:text-green-800'
                          : 'text-red-600 hover:text-red-800'
                      }`}
                    >
                      {game.status === 'active' ? (
                        <ToggleRight className="w-5 h-5" />
                      ) : (
                        <ToggleLeft className="w-5 h-5" />
                      )}
                      <span className="text-sm capitalize">{game.status}</span>
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {game.displaySequence || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => setEditingGame(game)}
                        className="text-purple-600 hover:text-purple-900"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteGame(game.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredGames.length === 0 && (
          <div className="text-center py-12">
            <Gamepad2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No games found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {data.games.length === 0
                ? 'Get started by adding your first game.'
                : 'Try adjusting your search filters.'}
            </p>
            {data.games.length === 0 && (
              <div className="mt-6">
                <button
                  onClick={() => setShowAddForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Game
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
