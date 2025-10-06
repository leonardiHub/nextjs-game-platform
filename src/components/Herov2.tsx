'use client'

import { useState, useEffect, useCallback } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Image from 'next/image'
import { API_CONFIG } from '@/utils/config'

interface CarouselItem {
  id: number
  display_order: number
  is_active: number
  created_at: string
  updated_at: string
  media_id: number
  filename: string
  url: string
  alt_text?: string
  media_title?: string
}

interface CarouselResponse {
  success: boolean
  carouselItems: CarouselItem[]
}

export default function Herov2() {
  const [carouselItems, setCarouselItems] = useState<CarouselItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })

  // Helper function to format media URLs properly
  const formatMediaUrl = (url: string) => {
    if (!url) return ''

    // Handle external URLs
    if (url.startsWith('http') && !url.includes('localhost')) {
      return url
    }

    // For local files, use backend server directly
    let cleanUrl = url
      .replace('http://localhost:5002', '')
      .replace('http://localhost:3001', '')
      .replace('https://99group.games', '')
      .replace('https://api.99group.games', '')

    // Ensure URL starts with /uploads
    if (!cleanUrl.startsWith('/uploads')) {
      cleanUrl = `/uploads/${cleanUrl.replace(/^\/+/, '')}`
    }

    // Return appropriate backend URL based on environment
    const apiUrl =
      typeof window !== 'undefined' && window.location.hostname === 'localhost'
        ? 'http://localhost:5002'
        : API_CONFIG.BASE_URL
    const formattedUrl = `${apiUrl}${cleanUrl}`

    // Debug logging
    console.log('Original URL:', url, 'Formatted URL:', formattedUrl)

    return formattedUrl
  }

  useEffect(() => {
    fetchCarouselItems()
  }, [])

  const fetchCarouselItems = async () => {
    try {
      const response = await fetch('/api/hero-carousel')
      const data: CarouselResponse = await response.json()

      console.log('Carousel API Response:', data)

      if (data.success) {
        setCarouselItems(data.carouselItems)
        console.log('Set carousel items:', data.carouselItems)
      } else {
        setError('Failed to load carousel items')
      }
    } catch (err) {
      console.error('Error fetching carousel items:', err)
      setError('Failed to load carousel items')
    } finally {
      setLoading(false)
    }
  }

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index)
    },
    [emblaApi]
  )

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
  }, [emblaApi, onSelect])

  // Auto-play functionality
  useEffect(() => {
    if (carouselItems.length <= 1 || !emblaApi) return

    const interval = setInterval(() => {
      emblaApi.scrollNext()
    }, 5000)

    return () => clearInterval(interval)
  }, [carouselItems.length, emblaApi])

  if (loading) {
    return (
      <div className="relative w-full aspect-[3/1] bg-gray-100 animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-gray-500">Loading carousel...</div>
        </div>
      </div>
    )
  }

  if (error || carouselItems.length === 0) {
    return (
      <div className="relative w-full aspect-[3/1] bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-primary">
              Welcome to Fun88
            </h1>
            <p className="text-sm md:text-base">
              Your Ultimate Gaming Experience
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="w-full flex items-center justify-center"
      style={{ marginTop: '70px' }}
    >
      <div className="relative w-full aspect-[3/1] overflow-hidden rounded-2xl max-w-[1500px]">
        {/* Embla Carousel Container */}
        <div className="embla overflow-hidden h-full" ref={emblaRef}>
          <div className="embla__container flex h-full">
            {carouselItems.map((item, index) => (
              <div
                key={item.id}
                className="embla__slide flex-[0_0_100%] min-w-0"
              >
                <div className="relative w-full h-full rounded-lg overflow-hidden shadow-2xl">
                  {item.url && (
                    <Image
                      src={formatMediaUrl(item.url)}
                      alt={
                        item.alt_text || item.media_title || 'Carousel image'
                      }
                      fill
                      className="object-cover"
                      priority={index === 0}
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 80vw, (max-width: 1024px) 70vw, 60vw"
                      onError={e => {
                        console.error('Image load error:', e)
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                      }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        {carouselItems.length > 1 && (
          <>
            <button
              onClick={scrollPrev}
              className="absolute left-1 md:left-2 top-1/2 transform -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 text-white rounded-full w-8 h-8 md:w-10 md:h-10 flex items-center justify-center transition-all duration-300 backdrop-blur-sm"
              aria-label="Previous slide"
            >
              <svg
                className="w-4 h-4 md:w-5 md:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <button
              onClick={scrollNext}
              className="absolute right-1 md:right-2 top-1/2 transform -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 text-white rounded-full w-8 h-8 md:w-10 md:h-10 flex items-center justify-center transition-all duration-300 backdrop-blur-sm"
              aria-label="Next slide"
            >
              <svg
                className="w-4 h-4 md:w-5 md:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </>
        )}

        {/* Pagination Dots */}
        {carouselItems.length > 1 && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-10 flex space-x-2">
            {carouselItems.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  selectedIndex === index
                    ? 'bg-white'
                    : 'bg-white/50 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
