import { useState, useEffect } from 'react'
import { Volume2 } from 'lucide-react'

const Hero = () => {
  const [currentHero, setCurrentHero] = useState(1)

  const heroData = [
    {
      id: 1,
      main: 'hero-1-main.webp',
      sub1: 'hero-1-sub-1.webp',
      sub2: 'hero-1-sub-2.webp',
    },
    {
      id: 2,
      main: 'hero-2-main.webp',
      sub1: 'hero-2-sub-1.webp',
      sub2: 'hero-2-sub-2.webp',
    },
    {
      id: 3,
      main: 'hero-3-main.webp',
      sub1: 'hero-3-sub-1.webp',
      sub2: 'hero-3-sub-2.webp',
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHero(prev => (prev >= 3 ? 1 : prev + 1))
    }, 5000) // Change every 5 seconds

    return () => clearInterval(interval)
  }, [])

  const currentHeroData =
    heroData.find(hero => hero.id === currentHero) || heroData[0]

  return (
    <div className="lg:mt-0 mt-2 min-h-[70vh] w-full bg-white flex items-center justify-center relative">
      {/* Blue fading overlay at the bottom */}
      <div className="lg:block hidden absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#fff] via-[#fff]/70 to-transparent z-10 pointer-events-none"></div>

      <div className="w-full max-w-[1200px] h-full flex lg:flex-row flex-col items-center justify-between px-6 lg:px-8">
        <div className="relative transition-all duration-1000 ease-in-out transform hover:scale-105">
          <img
            key={`sub1-${currentHero}`}
            src={currentHeroData.sub1}
            className="absolute top-0 left-0 w-[80px] h-auto lg:w-[120px] lg:h-auto transition-all duration-1000 ease-in-out transform"
            style={{
              animation:
                'float-up-down 3s ease-in-out infinite, hero-fade-in 1s ease-in-out',
            }}
          />
          <img
            key={`main-${currentHero}`}
            src={currentHeroData.main}
            alt={`hero-${currentHero}`}
            className="w-full h-full object-cover transition-all duration-1000 ease-in-out transform"
            style={{
              animation: 'hero-scale-fade 1s ease-in-out',
            }}
          />
          <img
            key={`sub2-${currentHero}`}
            src={currentHeroData.sub2}
            className="absolute bottom-0 right-0 w-[80px] h-auto lg:w-[120px] lg:h-auto transition-all duration-1000 ease-in-out transform"
            style={{
              animation:
                'float-up-down 2.5s ease-in-out infinite reverse, hero-fade-in 1s ease-in-out',
            }}
          />
        </div>
        <div className="w-full lg:max-w-[40%] flex flex-col items-center lg:items-start justify-center gap-4">
          <h1 className="text-[27px] text-primary font-bold text-left leading-tight">
            FUN88 เว็บไซต์ทางการ - มั่นคง ปลอดภัย ฝากถอนสะดวก อันดับ 1 ในไทย
          </h1>
          <p className="text-lg text-white/90">ฝากถอนสะดวก อันดับ 1 ในไทย</p>

          {/* Marquee Banner */}
          <div className="w-full max-w-md mx-auto lg:mx-0 mb-4">
            <div className="bg-gradient-to-r from-[#00a6ff] via-[#0088cc] to-[#00a6ff] rounded-lg shadow-lg overflow-hidden relative border border-[#00a6ff]/50 max-h-[50px] pl-2">
              <div className="flex items-center gap-2">
                {/* Speaker Icon */}
                <div className="flex-shrink-0 relative">
                  <img src="speaker-pg.png" alt="speaker" className="w-8 h-8" />
                </div>

                {/* Scrolling Text Container */}
                <div className="flex-1 overflow-hidden relative">
                  <div className="marquee-container whitespace-nowrap text-white font-bold text-sm drop-shadow-sm">
                    <span className="marquee-text">
                      โลดภัย ความไว้วางใจอันดับ 1 โลดภัย ความไว้วางใจอันดับ 1
                      โลดภัย ความไว้วางใจอันดับ 1 โลดภัย ความไว้วางใจอันดับ 1
                    </span>
                  </div>
                </div>
              </div>

              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine"></div>
            </div>
          </div>

          <button
            className="font-bold px-10 py-2.5 rounded-3xl w-max lg:block hidden text-white"
            style={{
              background:
                'linear-gradient(180deg, #00a6ff, #0088cc,rgb(85, 151, 184)',
            }}
          >
            Get Started
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes float-up-down {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes hero-fade-in {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.9);
          }
          100% {
            opacity: 1;
            transform: translateY(0px) scale(1);
          }
        }

        @keyframes hero-scale-fade {
          0% {
            opacity: 0;
            transform: scale(0.95);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes marquee-scroll {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }

        @keyframes shine {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .marquee-container {
          display: flex;
          width: 100%;
          overflow: hidden;
        }

        .marquee-text {
          animation: marquee-scroll 15s linear infinite;
          display: inline-block;
          white-space: nowrap;
          will-change: transform;
        }

        .animate-shine {
          animation: shine 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
export default Hero
