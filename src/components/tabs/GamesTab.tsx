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
      className="relative rounded-lg cursor-pointer transform transition-all group hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20"
      onClick={onClick}
    >
      <div className="aspect-[2/3] md:aspect-[3/4] relative">
        <img
          src={`/pgsoft/${game.id}.webp`}
          alt={game.name}
          className="w-full h-full object-cover"
          onError={e => {
            const target = e.target as HTMLImageElement
            if (target.src.includes('.webp')) {
              // Fallback to png if webp doesn't exist
              target.src = `/pgsoft/${game.id}.png`
            } else if (target.src.includes('.png')) {
              // Fallback to API thumbnail_url if png doesn't exist
              target.src = game.thumbnail_url || `/pgsoft/${game.id}.png`
            }
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#00a6ff]/40 via-transparent to-transparent" />
        {game?.featured && (
          <>
            <img
              src="/fire.gif"
              className="w-7 h-7 lg:w-12 lg:h-12 absolute absolute -top-3 -right-2"
            />
          </>
        )}{' '}
        {/* RTP Badge */}
        <div
          className="overflow-hidden absolute top-0 left-0 text-white text-xs font-bold rounded-tl-lg rounded-br-lg"
          style={{
            background:
              'linear-gradient(300deg, #00a6ff, #0088cc, #006699, #004d73)',
          }}
        >
          <div className="relative px-2 py-0.5 md:px-2 md:py-1 ">
            <span className="inline">RTP {game.rtp}</span>
            <span className="absolute inset-0 shine"></span>
          </div>
        </div>
        {/* Game Title */}
        <div className="absolute bottom-0 w-full h-6 flex items-center justify-center bg-gradient-to-t from-[#00a6ff]/90 to-[#00a6ff]/70">
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
          <img src="fun88-hot-games.png" className="h-8 w-auto" />
          <img src="hot-gif.webp" className="w-auto h-5 md:h-6" />
        </div>

        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 md:gap-6">
          {loading
            ? // Loading skeleton
              Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-[2/3] md:aspect-[3/4] bg-blue-200 rounded-2xl animate-pulse"
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
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          {/* <div className="text-xl md:text-2xl font-bold text-gray-100">PG</div>
          <div className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            NEW GAMES
          </div> */}
          <img src="fun88-new-games.png" className="h-8 w-auto" />
        </div>

        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 md:gap-6">
          {loading
            ? // Loading skeleton
              Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-[2/3] md:aspect-[3/4] bg-blue-200 rounded-2xl animate-pulse"
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
