'use client'

import { useState, useEffect } from 'react'
import { GameData, User } from '@/types'
import AuthModal from '@/components/AuthModal'

interface GamesTabProps {
  games: GameData[]
  onPlayGame: (gameUid: string) => void
  user: User | null
  onLogin?: (user: User, token: string) => void
  onShowAuthModal?: () => void
}

type GameCategory =
  | 'สล็อต'
  | 'คาสิโนสด'
  | 'แทงบอล'
  | 'หวย'
  | 'โปรโมชั่น'
  | 'สิทธิพิเศษ'

interface ApiGame {
  code: number
  name: string
  game_uid: string
  type: string
  rtp: number
}

export default function GamesTab({
  games,
  onPlayGame,
  user,
  onLogin,
  onShowAuthModal,
}: GamesTabProps) {
  const [activeCategory, setActiveCategory] = useState<GameCategory>('สล็อต')
  const [apiGames, setApiGames] = useState<ApiGame[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch games from API
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch('/api/games')
        const data = await response.json()
        if (data.success && data.games) {
          setApiGames(data.games)
        }
      } catch (error) {
        console.error('Failed to fetch games:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchGames()
  }, [])

  const handleGameClick = (gameUid: string) => {
    if (!user) {
      if (onShowAuthModal) {
        onShowAuthModal()
      }
    } else {
      onPlayGame(gameUid)
    }
  }

  const categories = [
    {
      id: 'สล็อต' as GameCategory,
      name: 'สล็อต',
      icon: '🎰',
      color: 'from-pink-400 to-pink-500',
    },
    {
      id: 'คาสิโนสด' as GameCategory,
      name: 'คาสิโนสด',
      icon: '🃏',
      color: 'from-red-400 to-red-500',
    },
    {
      id: 'แทงบอล' as GameCategory,
      name: 'แทงบอล',
      icon: '⚽',
      color: 'from-green-400 to-green-500',
    },
    {
      id: 'หวย' as GameCategory,
      name: 'หวย',
      icon: '🎱',
      color: 'from-purple-400 to-purple-500',
      badge: 'NEW',
    },
    {
      id: 'โปรโมชั่น' as GameCategory,
      name: 'โปรโมชั่น',
      icon: '🎁',
      color: 'from-orange-400 to-orange-500',
    },
    {
      id: 'สิทธิพิเศษ' as GameCategory,
      name: 'สิทธิพิเศษ',
      icon: '⭐',
      color: 'from-yellow-400 to-yellow-500',
    },
  ]

  // Get hot games (first 6 games from API response)
  const hotGames = apiGames.slice(0, 6).map(game => ({
    id: game.code,
    name: game.name,
    rtp: `${game.rtp}%`,
    image: `/pgsoft/${game.code}.png`,
    game_uid: game.game_uid,
  }))

  // Get new games (remaining games after the first 6)
  const newGames = apiGames.slice(6).map(game => ({
    id: game.code,
    name: game.name,
    rtp: `${game.rtp}%`,
    image: `/pgsoft/${game.code}.png`,
    game_uid: game.game_uid,
  }))

  const GameCard = ({
    game,
    onClick,
  }: {
    game: {
      id: number
      name: string
      rtp: string
      image: string
      game_uid: string
    }
    onClick: () => void
  }) => (
    <div
      className="relative rounded-lg overflow-hidden cursor-pointer transform transition-all group"
      onClick={onClick}
    >
      <div className="aspect-[2/3] md:aspect-[3/4] relative">
        <img
          src={`/pgsoft/${game.id}.webp`}
          alt={game.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* RTP Badge */}
        <div
          className="overflow-hidden absolute top-0 left-0 text-black text-xs font-bold rounded-tl-lg rounded-br-lg"
          style={{
            background:
              'linear-gradient(300deg, #ecc440, #fffa8a, #ddac17, #ffff95)',
          }}
        >
          <div className="relative px-2 py-0.5 md:px-2 md:py-1 ">
            <span className="inline">RTP {game.rtp}</span>
            <span className="absolute inset-0 shine"></span>
          </div>
        </div>

        {/* Game Title */}
        <div className="absolute bottom-0 w-full h-6 flex items-center justify-center bg-[#000]/70">
          <span className="text-white text-xs md:text-[16px] leading-tight drop-shadow-lg px-1 text-center line-clamp-1">
            {game.name}
          </span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="w-full">
      {/* PG HOT GAMES Section */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          {/* <div className="text-xl md:text-2xl font-bold text-gray-100">PG</div>
          <div className="text-xl md:text-2xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
            HOT GAMES
          </div> */}
          <img src="pg-hot-games.png" className="h-8 w-auto" />
          <img src="hot-gif.webp" className="w-auto h-5 md:h-6" />
        </div>

        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 md:gap-6">
          {loading
            ? // Loading skeleton
              Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-[2/3] md:aspect-[3/4] bg-gray-200 rounded-2xl animate-pulse"
                />
              ))
            : hotGames.map(game => (
                <GameCard
                  key={game.id}
                  game={game}
                  onClick={() => handleGameClick(game.game_uid)}
                />
              ))}
        </div>
      </div>

      {/* PG NEW GAMES Section */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          {/* <div className="text-xl md:text-2xl font-bold text-gray-100">PG</div>
          <div className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            NEW GAMES
          </div> */}
          <img src="pg-new-games.png" className="h-8 w-auto" />
        </div>

        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 md:gap-6">
          {loading
            ? // Loading skeleton
              Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-[2/3] md:aspect-[3/4] bg-gray-200 rounded-2xl animate-pulse"
                />
              ))
            : newGames.map(game => (
                <GameCard
                  key={game.id}
                  game={game}
                  onClick={() => handleGameClick(game.game_uid)}
                />
              ))}
        </div>
      </div>
    </div>
  )
}
