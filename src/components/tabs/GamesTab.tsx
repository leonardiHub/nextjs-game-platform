'use client'

import { useState, useEffect } from 'react'
import { GameData, User } from '@/types'
import AuthModal from '@/components/AuthModal'

interface GamesTabProps {
  games: any
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
  rtp?: number // Make RTP optional since it's not always provided
}

export default function GamesTab({
  games,
  onPlayGame,
  user,
  onLogin,
  onShowAuthModal,
}: GamesTabProps) {
  const [activeCategory, setActiveCategory] = useState<GameCategory>('สล็อต')
  const [loading, setLoading] = useState(false)

  // Use games from props instead of fetching separately
  const apiGames = games

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
      color: 'from-blue-400 to-blue-500',
    },
    {
      id: 'คาสิโนสด' as GameCategory,
      name: 'คาสิโนสด',
      icon: '🃏',
      color: 'from-blue-500 to-blue-600',
    },
    {
      id: 'แทงบอล' as GameCategory,
      name: 'แทงบอล',
      icon: '⚽',
      color: 'from-blue-600 to-blue-700',
    },
    {
      id: 'หวย' as GameCategory,
      name: 'หวย',
      icon: '🎱',
      color: 'from-blue-700 to-blue-800',
      badge: 'NEW',
    },
    {
      id: 'โปรโมชั่น' as GameCategory,
      name: 'โปรโมชั่น',
      icon: '🎁',
      color: 'from-blue-800 to-blue-900',
    },
    {
      id: 'สิทธิพิเศษ' as GameCategory,
      name: 'สิทธิพิเศษ',
      icon: '⭐',
      color: 'from-blue-300 to-blue-400',
    },
  ]

  // Only use slotGames, exclude fishGames
  const allGames = apiGames || []

  // Get hot games (first 6 games from combined list)
  const hotGames = allGames?.slice(0, 6).map((game: any) => ({
    id: game.code,
    name: game.name,
    rtp: game.rtp ? `${game.rtp}%` : '96.5%', // Default RTP if not provided
    image: `/pgsoft/${game.code}.png`,
    game_uid: game.game_uid,
    featured: game?.featured,
    thumbnail_url: game.thumbnail_url,
  }))

  // Get new games (remaining games after the first 6)
  const newGames = allGames?.slice(6).map((game: any) => ({
    id: game.code,
    name: game.name,
    rtp: game.rtp ? `${game.rtp}%` : '96.5%', // Default RTP if not provided
    image: `/pgsoft/${game.code}.png`,
    game_uid: game.game_uid,
    featured: game?.featured,
    thumbnail_url: game.thumbnail_url,
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
      featured: any
      thumbnail_url?: string
    }
    onClick: () => void
  }) => (
    <div
      className="relative rounded-xl cursor-pointer transform transition-all duration-300 group hover:scale-105 hover:shadow-2xl hover:shadow-[#00a6ff]/30"
      onClick={onClick}
    >
      <div className="aspect-[2/3] md:aspect-[3/4] relative overflow-hidden rounded-xl">
        <img
          src={game.thumbnail_url || `/pgsoft/${game.id}.webp`}
          alt={game.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          onError={e => {
            const target = e.target as HTMLImageElement
            if (target.src.includes('.webp')) {
              // Fallback to png if webp doesn't exist
              target.src = `/pgsoft/${game.id}.png`
            } else if (target.src.includes('.png')) {
              // Final fallback to placeholder
              target.src = '/placeholder-game.png'
            }
          }}
        />

        {/* Enhanced gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />

        {/* Featured badge with enhanced styling */}
        {game?.featured && (
          <div className="absolute -top-2 -right-2 z-10">
            <div className="relative">
              <img
                src="/fire.gif"
                className="w-8 h-8 lg:w-12 lg:h-12 drop-shadow-lg"
              />
              <div className="absolute inset-0 animate-pulse">
                <div className="w-full h-full bg-red-500/30 rounded-full blur-sm"></div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced RTP Badge */}
        <div className="absolute top-3 left-3 z-10">
          <div className="relative">
            <div
              className="px-3 py-1.5 rounded-full text-white text-xs font-bold shadow-lg backdrop-blur-sm border border-white/20"
              style={{
                background:
                  'linear-gradient(135deg, #00a6ff, #0088cc, #006699)',
                boxShadow: '0 4px 15px rgba(0, 166, 255, 0.4)',
              }}
            >
              <span className="relative z-10">RTP {game.rtp}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="bg-[#00a6ff] hover:bg-[#0088cc] text-white px-6 py-3 rounded-full font-bold text-sm shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
            เล่นเลย
          </div>
        </div>

        {/* Enhanced Game Title */}
        <div className="absolute bottom-0 w-full p-3">
          <div className="bg-gradient-to-t from-[#00a6ff]/95 to-[#00a6ff]/80 backdrop-blur-sm rounded-lg p-2 border border-white/20">
            <span className="text-white text-sm md:text-base font-semibold leading-tight drop-shadow-lg text-center block line-clamp-2">
              {game.name}
            </span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="w-full space-y-16">
      {/* PG HOT GAMES Section */}
      <div className="relative">
        {/* Section Header with enhanced styling */}
        <div className="flex items-center gap-4 mb-8">
          <div className="relative">
            <img
              src="fun88-hot-games.png"
              className="h-10 w-auto drop-shadow-lg"
            />
            <div className="absolute -inset-2 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-lg blur-sm -z-10"></div>
          </div>
          <div className="relative">
            <img
              src="hot-gif.webp"
              className="w-auto h-6 md:h-8 drop-shadow-lg"
            />
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/30 to-red-500/30 rounded-full blur-sm -z-10 animate-pulse"></div>
          </div>
          <div className="hidden md:block h-8 w-px bg-gradient-to-b from-transparent via-[#00a6ff] to-transparent"></div>
          <div className="hidden md:block text-sm text-gray-300 font-medium">
            เกมยอดนิยมที่ผู้เล่นชื่นชอบ
          </div>
        </div>

        {/* Enhanced grid with better spacing */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {loading
            ? // Enhanced loading skeleton
              Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-[2/3] md:aspect-[3/4] bg-gradient-to-br from-blue-200/50 to-blue-300/50 rounded-xl animate-pulse border border-blue-200/30"
                />
              ))
            : hotGames.map((game: any) => (
                <GameCard
                  key={game.id}
                  game={game}
                  onClick={() => handleGameClick(game.game_uid)}
                />
              ))}
        </div>
      </div>

      {/* PG NEW GAMES Section */}
      <div className="relative">
        {/* Section Header with enhanced styling */}
        <div className="flex items-center gap-4 mb-8">
          <div className="relative">
            <img
              src="fun88-new-games.png"
              className="h-10 w-auto drop-shadow-lg"
            />
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg blur-sm -z-10"></div>
          </div>
          <div className="hidden md:block h-8 w-px bg-gradient-to-b from-transparent via-[#00a6ff] to-transparent"></div>
          <div className="hidden md:block text-sm text-gray-300 font-medium">
            เกมใหม่ล่าสุดที่เพิ่งเปิดตัว
          </div>
        </div>

        {/* Enhanced grid with better spacing */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {loading
            ? // Enhanced loading skeleton
              Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-[2/3] md:aspect-[3/4] bg-gradient-to-br from-blue-200/50 to-blue-300/50 rounded-xl animate-pulse border border-blue-200/30"
                />
              ))
            : newGames.map((game: any) => (
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
