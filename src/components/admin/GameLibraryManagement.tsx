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
import { adminGet, adminPost, adminPut, adminDelete } from '@/utils/adminApi'
import MediaSelectModal from './MediaSelectModal'

interface Game {
  id: number
  name: string
  code: number
  game_uid: string
  type: 'Slot Game' | 'Fish Game' | 'Table Game' | 'Arcade Game'
  provider_id: number
  provider_name: string
  provider_code: string
  rtp: number
  status: 'active' | 'inactive'
  featured: boolean
  displaySequence?: number | null
  min_bet: number
  max_bet: number
  demo_url?: string | null
  thumbnail_url?: string | null
  created_at: string
  updated_at: string
}

interface GameProvider {
  id: number
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
  const [showMediaModal, setShowMediaModal] = useState(false)
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
    provider_id: 0,
    rtp: 96.5,
    status: 'active',
    featured: false,
    displaySequence: undefined,
    min_bet: 0.1,
    max_bet: 100,
    demo_url: '',
    thumbnail_url: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)

      // Load games and providers
      const [gamesData, providersData] = await Promise.all([
        adminGet('/games').catch(() => ({ games: [] })),
        adminGet('/game-library-providers').catch(() => ({ providers: [] })),
      ])

      setData({
        games: gamesData.games || [],
        providers: providersData.providers || [],
      })
    } catch (error) {
      console.error('Error loading data:', error)
      setMessage({ type: 'error', text: 'Failed to load game library data' })

      // Load fallback data on error
      setData({
        games: [],
        providers: [
          {
            id: 1,
            name: 'JILI Gaming',
            code: 'JILI',
            status: 'active',
            game_count: 0,
          },
        ],
      })
    } finally {
      setLoading(false)
    }
  }

  const saveGame = async (game: Partial<Game>) => {
    try {
      setSaving(true)

      if (game.id) {
        await adminPut(`/games/${game.id}`, game)
      } else {
        await adminPost('/games', game)
      }

      setMessage({
        type: 'success',
        text: `Game ${game.id ? 'updated' : 'created'} successfully`,
      })
      await loadData()
      setShowAddForm(false)
      setEditingGame(null)
      resetNewGame()
    } catch (error) {
      console.error('Error saving game:', error)
      setMessage({ type: 'error', text: 'Failed to save game' })
    } finally {
      setSaving(false)
    }
  }

  const deleteGame = async (gameId: number) => {
    if (
      !confirm(
        'Are you sure you want to delete this game? This action cannot be undone.'
      )
    ) {
      return
    }

    try {
      setSaving(true)
      await adminDelete(`/games/${gameId}`)
      setMessage({ type: 'success', text: 'Game deleted successfully' })
      await loadData()
    } catch (error) {
      console.error('Error deleting game:', error)
      setMessage({ type: 'error', text: 'Failed to delete game' })
    } finally {
      setSaving(false)
    }
  }

  const toggleGameStatus = async (gameId: number, currentStatus: string) => {
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
      provider_id: 0,
      rtp: 96.5,
      status: 'active',
      featured: false,
      displaySequence: undefined,
      min_bet: 0.1,
      max_bet: 100,
      demo_url: '',
      thumbnail_url: '',
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const gameData = editingGame ? { ...editingGame } : newGame
    saveGame(gameData)
  }

  const handleMediaSelect = (media: any) => {
    if (editingGame) {
      setEditingGame({ ...editingGame, thumbnail_url: media.url })
    } else {
      setNewGame({ ...newGame, thumbnail_url: media.url })
    }
    setShowMediaModal(false)
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
                  value={
                    editingGame ? editingGame.code || '' : newGame.code || ''
                  }
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
                    const providerId = parseInt(e.target.value) || 0
                    if (editingGame) {
                      setEditingGame({
                        ...editingGame,
                        provider_id: providerId,
                      })
                    } else {
                      setNewGame({ ...newGame, provider_id: providerId })
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

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Game Thumbnail
                </label>
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowMediaModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Select from Media Library</span>
                  </button>
                  {((editingGame && editingGame.thumbnail_url) ||
                    newGame.thumbnail_url) && (
                    <div className="flex items-center space-x-2">
                      <img
                        src={
                          editingGame
                            ? editingGame.thumbnail_url || ''
                            : newGame.thumbnail_url || ''
                        }
                        alt="Game thumbnail"
                        className="w-12 h-12 rounded-lg object-cover"
                        onError={e => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (editingGame) {
                            setEditingGame({
                              ...editingGame,
                              thumbnail_url: '',
                            })
                          } else {
                            setNewGame({ ...newGame, thumbnail_url: '' })
                          }
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Select an image from your media library or upload a new one
                </p>
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

      {/* Media Select Modal */}
      <MediaSelectModal
        isOpen={showMediaModal}
        onClose={() => setShowMediaModal(false)}
        onSelect={handleMediaSelect}
        selectedId={null}
      />
    </div>
  )
}
