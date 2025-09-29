'use client'

import { useState, useEffect } from 'react'
import {
  Play,
  Users,
  Clock,
  Star,
  Crown,
  Zap,
  Shield,
  Trophy,
} from 'lucide-react'

interface LiveGame {
  id: number
  name: string
  provider: string
  image: string
  players: number
  minBet: number
  maxBet: number
  rating: number
  isHot: boolean
  isNew: boolean
  isVip: boolean
}

interface LiveCasinoStats {
  totalGames: number
  activePlayers: number
  totalWinnings: number
  averageRating: number
}

const LiveCasinoPageClient = () => {
  const [games, setGames] = useState<LiveGame[]>([])
  const [stats, setStats] = useState<LiveCasinoStats>({
    totalGames: 0,
    activePlayers: 0,
    totalWinnings: 0,
    averageRating: 0,
  })
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Mock data for demonstration
  const mockGames: LiveGame[] = [
    {
      id: 1,
      name: 'Live Blackjack',
      provider: 'Evolution Gaming',
      image: '/images/live-blackjack.jpg',
      players: 1247,
      minBet: 10,
      maxBet: 5000,
      rating: 4.8,
      isHot: true,
      isNew: false,
      isVip: false,
    },
    {
      id: 2,
      name: 'Live Roulette',
      provider: 'Evolution Gaming',
      image: '/images/live-roulette.jpg',
      players: 892,
      minBet: 5,
      maxBet: 10000,
      rating: 4.9,
      isHot: false,
      isNew: true,
      isVip: false,
    },
    {
      id: 3,
      name: 'Live Baccarat',
      provider: 'Pragmatic Play',
      image: '/images/live-baccarat.jpg',
      players: 1563,
      minBet: 20,
      maxBet: 25000,
      rating: 4.7,
      isHot: true,
      isNew: false,
      isVip: true,
    },
    {
      id: 4,
      name: 'Live Poker',
      provider: 'NetEnt Live',
      image: '/images/live-poker.jpg',
      players: 743,
      minBet: 50,
      maxBet: 50000,
      rating: 4.6,
      isHot: false,
      isNew: false,
      isVip: true,
    },
    {
      id: 5,
      name: 'Live Dragon Tiger',
      provider: 'Evolution Gaming',
      image: '/images/live-dragon-tiger.jpg',
      players: 634,
      minBet: 10,
      maxBet: 10000,
      rating: 4.5,
      isHot: false,
      isNew: true,
      isVip: false,
    },
    {
      id: 6,
      name: 'Live Sic Bo',
      provider: 'Pragmatic Play',
      image: '/images/live-sic-bo.jpg',
      players: 421,
      minBet: 15,
      maxBet: 15000,
      rating: 4.4,
      isHot: false,
      isNew: false,
      isVip: false,
    },
  ]

  const categories = [
    { id: 'all', name: 'All Games', count: mockGames.length },
    { id: 'blackjack', name: 'Blackjack', count: 2 },
    { id: 'roulette', name: 'Roulette', count: 3 },
    { id: 'baccarat', name: 'Baccarat', count: 2 },
    { id: 'poker', name: 'Poker', count: 1 },
    { id: 'vip', name: 'VIP Tables', count: 2 },
  ]

  useEffect(() => {
    // Simulate API call
    const loadGames = async () => {
      setLoading(true)
      try {
        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        setGames(mockGames)
        setStats({
          totalGames: mockGames.length,
          activePlayers: mockGames.reduce((sum, game) => sum + game.players, 0),
          totalWinnings: 1250000,
          averageRating:
            mockGames.reduce((sum, game) => sum + game.rating, 0) /
            mockGames.length,
        })
      } catch (error) {
        console.error('Error loading live casino games:', error)
      } finally {
        setLoading(false)
      }
    }

    loadGames()
  }, [])

  const filteredGames = games.filter(game => {
    const matchesCategory =
      selectedCategory === 'all' ||
      game.name.toLowerCase().includes(selectedCategory) ||
      (selectedCategory === 'vip' && game.isVip)
    const matchesSearch =
      game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.provider.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusBadge = (game: LiveGame) => {
    if (game.isHot) return { text: 'HOT', className: 'bg-red-500 text-white' }
    if (game.isNew) return { text: 'NEW', className: 'bg-green-500 text-white' }
    if (game.isVip)
      return { text: 'VIP', className: 'bg-yellow-500 text-black' }
    return null
  }

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center min-h-screen bg-dark">
        <div className="text-xl text-yellow-500 font-semibold">
          Loading live casino games...
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-dark text-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a] py-16 lg:py-24">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              <span className="gradient-gold">Live Casino</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Experience the thrill of real-time casino games with professional
              dealers. Play live blackjack, roulette, baccarat, and more in HD
              quality.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
                <div className="flex items-center justify-center mb-2">
                  <Trophy className="w-8 h-8 text-yellow-500" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {stats.totalGames}
                </div>
                <div className="text-sm text-gray-400">Live Games</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
                <div className="flex items-center justify-center mb-2">
                  <Users className="w-8 h-8 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {stats.activePlayers.toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">Active Players</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
                <div className="flex items-center justify-center mb-2">
                  <Zap className="w-8 h-8 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {formatCurrency(stats.totalWinnings)}
                </div>
                <div className="text-sm text-gray-400">Total Winnings</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
                <div className="flex items-center justify-center mb-2">
                  <Star className="w-8 h-8 text-yellow-500" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {stats.averageRating.toFixed(1)}
                </div>
                <div className="text-sm text-gray-400">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search live casino games..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-yellow-500 text-black'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {category.name} ({category.count})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.map(game => {
            const statusBadge = getStatusBadge(game)
            return (
              <div
                key={game.id}
                className="bg-gray-800/50 rounded-lg overflow-hidden border border-gray-700/50 hover:border-yellow-500/50 transition-all duration-300 hover:transform hover:scale-105"
              >
                {/* Game Image */}
                <div className="relative">
                  <div className="aspect-video bg-gray-700 flex items-center justify-center">
                    <Play className="w-16 h-16 text-gray-500" />
                  </div>

                  {/* Status Badge */}
                  {statusBadge && (
                    <div
                      className={`absolute top-3 left-3 px-2 py-1 rounded text-xs font-bold ${statusBadge.className}`}
                    >
                      {statusBadge.text}
                    </div>
                  )}

                  {/* VIP Badge */}
                  {game.isVip && (
                    <div className="absolute top-3 right-3">
                      <Crown className="w-6 h-6 text-yellow-500" />
                    </div>
                  )}
                </div>

                {/* Game Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">
                        {game.name}
                      </h3>
                      <p className="text-gray-400 text-sm">{game.provider}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm text-gray-300">
                        {game.rating}
                      </span>
                    </div>
                  </div>

                  {/* Game Stats */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Players Online</span>
                      <span className="text-white font-medium">
                        {game.players.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Min Bet</span>
                      <span className="text-white font-medium">
                        {formatCurrency(game.minBet)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Max Bet</span>
                      <span className="text-white font-medium">
                        {formatCurrency(game.maxBet)}
                      </span>
                    </div>
                  </div>

                  {/* Play Button */}
                  <button className="w-full bg-gradient-to-r from-yellow-500 to-yellow-400 text-black font-bold py-3 rounded-lg hover:from-yellow-400 hover:to-yellow-300 transition-all duration-200 flex items-center justify-center space-x-2">
                    <Play className="w-5 h-5" />
                    <span>Play Now</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* No Games Found */}
        {filteredGames.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-4">
              No games found matching your criteria
            </div>
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('all')
              }}
              className="text-yellow-500 hover:text-yellow-400 font-medium"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="bg-gray-900/50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Why Choose Our Live Casino?
            </h2>
            <p className="text-gray-300 text-lg">
              Experience the best in live casino gaming with cutting-edge
              technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-yellow-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Secure & Fair
              </h3>
              <p className="text-gray-400">
                All games are certified fair and secure with advanced encryption
                technology
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                24/7 Live Action
              </h3>
              <p className="text-gray-400">
                Play anytime with professional dealers available around the
                clock
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-yellow-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">HD Quality</h3>
              <p className="text-gray-400">
                Crystal clear HD video streams for the ultimate gaming
                experience
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LiveCasinoPageClient
