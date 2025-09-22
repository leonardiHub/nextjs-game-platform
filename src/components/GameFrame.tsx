'use client'

import { useEffect, useState } from 'react'

interface GameFrameProps {
  gameUrl: string
  onClose: () => void
  isClosing?: boolean
}

export default function GameFrame({
  gameUrl,
  onClose,
  isClosing = false,
}: GameFrameProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [onClose])

  const handleIframeLoad = () => {
    setIsLoading(false)
    setLoadError(false)
  }

  const handleIframeError = () => {
    setIsLoading(false)
    setLoadError(true)
  }

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
      {/* Close Button */}
      <button
        onClick={onClose}
        disabled={isClosing}
        className="absolute top-5 right-5 z-50 bg-red-500 hover:bg-red-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
      >
        {isClosing ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Closing...
          </div>
        ) : (
          'Close Game'
        )}
      </button>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-40">
          <div className="bg-white rounded-xl p-8 flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-700 font-medium">Loading game...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {loadError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-40">
          <div className="bg-white rounded-xl p-8 text-center max-w-md mx-4">
            <div className="text-4xl mb-4">❌</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Game Failed to Load
            </h3>
            <p className="text-gray-600 mb-6">
              There was an error loading the game. Please try again.
            </p>
            <button
              onClick={onClose}
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Game Iframe */}
      <iframe
        src={gameUrl}
        className="w-full h-full border-none"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-modals"
        allow="fullscreen; autoplay; encrypted-media; payment; microphone; camera"
        allowFullScreen
        loading="lazy"
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        style={{ display: loadError ? 'none' : 'block' }}
      />

      {/* Instructions */}
      <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 text-white text-sm opacity-75 text-center">
        <p>Press ESC or click &quot;Close Game&quot; to exit</p>
      </div>
    </div>
  )
}
