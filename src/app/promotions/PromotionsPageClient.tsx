'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import MobileNavigation from '@/components/MobileNavigation'
import AuthModal from '@/components/AuthModal'
import { useState, useEffect } from 'react'
import { User, Transaction, Withdrawal } from '@/types'
import { ChevronLeft, X } from 'lucide-react'

const PromotionsPage = () => {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>(
    'login'
  )
  const [user, setUser] = useState<User | null>(null)
  const [balance, setBalance] = useState(0)
  const [canWithdraw, setCanWithdraw] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [jackpotAmount, setJackpotAmount] = useState(33243300)
  const [showPromotionModal, setShowPromotionModal] = useState(false)
  const [selectedPromotion, setSelectedPromotion] = useState<number | null>(
    null
  )

  // Authentication helper functions
  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken')
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  }

  const loadUserProfile = async () => {
    try {
      const response = await fetch('/api/user/profile', {
        headers: getAuthHeaders(),
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setBalance(data.user.balance || 0)
        setCanWithdraw(data.user.balance >= 1000)
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
    }
  }

  const loadTransactionHistory = async () => {
    try {
      const response = await fetch('/api/transactions', {
        headers: getAuthHeaders(),
      })

      if (response.ok) {
        const data = await response.json()
        setTransactions(data.transactions || [])
      }
    } catch (error) {
      console.error('Error loading transactions:', error)
    }
  }

  const loadWithdrawalHistory = async () => {
    try {
      const response = await fetch('/api/withdrawal/history', {
        headers: getAuthHeaders(),
      })

      if (response.ok) {
        const data = await response.json()
        setWithdrawals(data.withdrawals || [])
      }
    } catch (error) {
      console.error('Error loading withdrawals:', error)
    }
  }

  const handleRefreshBalance = async () => {
    setIsRefreshing(true)
    try {
      await loadUserProfile()
    } catch (error) {
      console.error('Error refreshing balance:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    setUser(null)
    setBalance(0)
    setCanWithdraw(false)
    setTransactions([])
    setWithdrawals([])
    setIsAuthenticated(false)
  }

  const handleLogin = async (user: User, token: string) => {
    localStorage.setItem('authToken', token)
    setUser(user)
    setIsAuthenticated(true)
    await Promise.all([
      loadUserProfile(),
      loadTransactionHistory(),
      loadWithdrawalHistory(),
    ])
  }

  const handleWithdrawalSubmit = async (bankDetails: {
    bank_name: string
    account_number: string
    account_holder: string
    bank_branch: string
  }) => {
    try {
      const response = await fetch('/api/withdrawal/request', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ bank_details: bankDetails }),
      })

      const data = await response.json()

      if (response.ok) {
        alert('✅ Withdrawal request submitted successfully!')
        loadWithdrawalHistory()
        return true
      } else {
        alert(`❌ Withdrawal request failed: ${data.error}`)
        return false
      }
    } catch (error) {
      console.error('Error submitting withdrawal:', error)
      alert('❌ Network error occurred. Please try again.')
      return false
    }
  }

  const handleKYCUpload = async (formData: FormData) => {
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch('/api/kyc/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        alert('✅ KYC documents uploaded successfully!')
        return true
      } else {
        alert(`❌ Upload failed: ${data.error}`)
        return false
      }
    } catch (error) {
      console.error('Error uploading KYC:', error)
      alert('❌ Network error occurred. Please try again.')
      return false
    }
  }

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (token) {
      setIsAuthenticated(true)
      loadUserProfile()
      loadTransactionHistory()
      loadWithdrawalHistory()
    } else {
      setIsLoading(false)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Jackpot countdown effect
  useEffect(() => {
    const interval = setInterval(() => {
      setJackpotAmount(prevAmount => prevAmount + 3)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Handle promotion click
  const handlePromotionClick = (promotionNumber: number) => {
    setSelectedPromotion(promotionNumber)
    setShowPromotionModal(true)
  }

  // Close promotion modal
  const closePromotionModal = () => {
    setShowPromotionModal(false)
    setSelectedPromotion(null)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <>
        <div className="lg:mt-0 mt-2 min-h-[70vh] w-full bg-white flex items-center justify-center relative">
          {/* Black fading overlay at the bottom */}
          <div className="lg:block hidden absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#fff] via-[#fff]/70 to-transparent z-10 pointer-events-none"></div>

          <div className="w-full max-w-[1200px] h-full flex lg:flex-row flex-col-reverse lg:gap-0 gap-8 items-center justify-between px-6 lg:px-8">
            <div className="w-full lg:max-w-[40%] flex flex-col items-center lg:items-start justify-center gap-2 lg:gap-4">
              <p className="text-[16px] lg:w-auto w-[70%] lg: lg:-text-lg text-sm text-gray-500 lg:text-left text-center">
                เครดิตฟรี มากมายไม่ติดเทิร์น แจกฟรีไม่อั้นผ่านระบบออโต้
              </p>

              <h1 className="text-[20px] lg:text-[27px] text-primary font-bold leading-tight lg:text-left text-center">
                รับ เครดิตฟรี ได้ทุกคนไม่จำกัดยูส โปรโมชั่นดีๆ มีอีกเพียบ
                ไม่มีเงื่อนไข
              </h1>

              <button className="font-bold px-6 py-1 lg:py-2 rounded-3xl w-max lg:mt-0 mt-4 text-white bg-primary">
                สมัครสมาชิก
              </button>
            </div>

            <div className="relative transition-all duration-1000 ease-in-out transform hover:scale-105">
              <img
                src="promotion-hero-sub-1.webp"
                className="absolute top-0 left-0 w-[80px] h-auto lg:w-[120px] lg:h-auto transition-all duration-1000 ease-in-out transform"
                style={{
                  animation:
                    'float-up-down 3s ease-in-out infinite, hero-fade-in 1s ease-in-out',
                }}
              />
              <img
                src="promotion-hero.webp"
                alt="hero"
                className="w-full h-full object-cover transition-all duration-1000 ease-in-out transform"
                style={{
                  animation: 'hero-scale-fade 1s ease-in-out',
                }}
              />
              <img
                src="promotion-hero-sub-2.webp"
                className="absolute bottom-0 right-0 w-[80px] h-auto lg:w-[120px] lg:h-auto transition-all duration-1000 ease-in-out transform"
                style={{
                  animation:
                    'float-up-down 2.5s ease-in-out infinite reverse, hero-fade-in 1s ease-in-out',
                }}
              />
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

            .marquee-text {
              animation: marquee-scroll 12s linear infinite;
              display: inline-block;
            }

            .animate-shine {
              animation: shine 3s ease-in-out infinite;
            }
          `}</style>
        </div>

        <div className="w-full flex items-center justify-center mt-4">
          <div className="w-full max-w-[1200px] flex flex-col items-center justify-center lg:px-0 px-4">
            <button
              className="w-full overflow-hidden relative lg:hidden flex items-center justify-center py-1 px-8 rounded-lg gap-4 text-[#00a6ff] border border-blue-300 hover:border-blue-400 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
              style={{
                background: 'linear-gradient(0deg, #ffffff, #e6f3ff)',
              }}
            >
              <img
                src="money.webp"
                alt="slot"
                className="h-auto w-1/3 absolute bottom-0 right-0"
              />
              <div className="flex flex-col items-center justify-center">
                <span className="text-primary text-sm lg:text-[17px]">
                  แจ็คพอตรางวัลใหญ่
                </span>
                <span className="text-primary font-bold text-[40px] z-50">
                  ${jackpotAmount.toLocaleString()}
                </span>
              </div>
            </button>

            <div className="flex py-4 gap-2 w-full">
              <button
                className="w-1/4 lg:w-1/6 flex lg:flex-row flex-col items-center justify-around lg:justify-center py-1 lg:py-3 px-4 lg:px-8 rounded-lg lg:gap-4 text-[#00a6ff] border border-blue-300 hover:border-blue-400 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
                style={{
                  background: 'linear-gradient(0deg, #ffffff, #e6f3ff)',
                }}
              >
                <img
                  src="game.webp"
                  alt="slot"
                  className="w-7 h-7 lg:w-14 lg:h-14"
                />
                <span className="text-primary text-sm lg:text-[20px]">
                  สล็อต
                </span>
              </button>
              <button
                className="w-1/4 lg:w-1/6 flex lg:flex-row flex-col items-center justify-around lg:justify-center py-1 lg:py-3 px-4 lg:px-8 rounded-lg lg:gap-4 text-[#00a6ff] border border-blue-300 hover:border-blue-400 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
                style={{
                  background: 'linear-gradient(0deg, #ffffff, #e6f3ff)',
                }}
              >
                <img
                  src="poker-icon.webp"
                  alt="slot"
                  className="w-7 h-7 lg:w-14 lg:h-14"
                />
                <span className="text-primary text-sm lg:text-[20px]">
                  คาสิโนสด
                </span>
              </button>
              <button
                className="w-1/4 lg:w-1/6 flex lg:flex-row flex-col items-center justify-around lg:justify-center py-1 lg:py-3 px-4 lg:px-8 rounded-lg lg:gap-4 text-[#00a6ff] border border-blue-300 hover:border-blue-400 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
                style={{
                  background: 'linear-gradient(0deg, #ffffff, #e6f3ff)',
                }}
              >
                <img
                  src="football-icon.webp"
                  alt="slot"
                  className="w-7 h-7 lg:w-14 lg:h-14"
                />
                <span className="text-primary text-sm lg:text-[20px]">
                  สปอร์ต
                </span>
              </button>
              <button
                className="relative w-1/4 lg:w-1/6 flex lg:flex-row flex-col items-center justify-around lg:justify-center py-1 lg:py-3 px-4 lg:px-8 rounded-lg lg:gap-4 text-[#00a6ff] border border-blue-300 hover:border-blue-400 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
                style={{
                  background: 'linear-gradient(0deg, #ffffff, #e6f3ff)',
                }}
              >
                <div className="text-white bg-red-500 absolute rounded-r-lg left-0 bottom-6 lg:bottom-2 text-xs px-1 lg:px-2">
                  New
                </div>
                <img
                  src="pool-icon.webp"
                  alt="slot"
                  className="w-7 h-7 lg:w-14 lg:h-14"
                />
                <span className="text-primary text-sm lg:text-[20px]">หวย</span>
              </button>
              <button
                className="w-2/6 overflow-hidden relative hidden lg:flex items-center justify-center py-1 px-8 rounded-lg gap-4 text-[#00a6ff] border border-blue-300 hover:border-blue-400 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
                style={{
                  background: 'linear-gradient(0deg, #ffffff, #e6f3ff)',
                }}
              >
                <img
                  src="money.webp"
                  alt="slot"
                  className="h-auto w-1/3 absolute bottom-0 right-0"
                />
                <div className="flex flex-col items-center justify-center">
                  <span className="text-primary text-sm lg:text-[17px]">
                    แจ็คพอตรางวัลใหญ่
                  </span>
                  <span className="gradient-gold font-bold text-[35px] z-50">
                    ${jackpotAmount.toLocaleString()}
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Promotions Section */}
        <div className="w-full flex items-center justify-center mt-8">
          <div className="w-full max-w-[1200px] flex flex-col items-center justify-center lg:px-0 px-4">
            {/* Promotion Images Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 w-full">
              <div
                className="relative group cursor-pointer overflow-hidden rounded-xl flex flex-col items-center justify-center"
                onClick={() => handlePromotionClick(1)}
              >
                <img
                  src="promotion-1.webp"
                  alt="Promotion 1"
                  className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="text-primary lg:text-lg text-sm mt-2 z-50">
                  คืนยอดเสียต่อสัปดาห์สูงสุด 10 %
                </span>
              </div>

              <div
                className="relative group cursor-pointer overflow-hidden rounded-xl flex flex-col items-center justify-center"
                onClick={() => handlePromotionClick(2)}
              >
                <img
                  src="promotion-2.webp"
                  alt="Promotion 2"
                  className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="text-primary lg:text-lg text-sm mt-2 z-50">
                  คืนยอดเสียต่อสัปดาห์สูงสุด 10 %
                </span>
              </div>

              <div
                className="relative group cursor-pointer overflow-hidden rounded-xl flex flex-col items-center justify-center"
                onClick={() => handlePromotionClick(3)}
              >
                <img
                  src="promotion-3.webp"
                  alt="Promotion 3"
                  className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="text-primary lg:text-lg text-sm mt-2 z-50">
                  คืนยอดเสียต่อสัปดาห์สูงสุด 10 %
                </span>
              </div>

              <div
                className="relative group cursor-pointer overflow-hidden rounded-xl flex flex-col items-center justify-center"
                onClick={() => handlePromotionClick(4)}
              >
                <img
                  src="promotion-4.webp"
                  alt="Promotion 4"
                  className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="text-primary lg:text-lg text-sm mt-2 z-50">
                  คืนยอดเสียต่อสัปดาห์สูงสุด 10 %
                </span>
              </div>
            </div>
          </div>
        </div>
      </>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={(user, token) => {
          handleLogin(user, token)
          setShowAuthModal(false)
        }}
        initialTab={authModalTab}
      />

      {/* Promotion Modal */}
      {showPromotionModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={closePromotionModal}
          ></div>

          {/* Modal Content */}
          <div className="relative z-10 w-full h-full lg:w-[900px] lg:h-[80vh] bg-white lg:rounded-xl border border-[#00a6ff]/20 overflow-hidden pb-10 shadow-2xl">
            <div className="w-full h-10 bg-gradient-to-r from-[#00a6ff] to-[#0088cc] sticky top-0 flex items-center justify-start lg:justify-end px-4 py-6 lg:py-8">
              <button
                onClick={closePromotionModal}
                className="lg:hidden block z-20 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center"
              >
                <span className="text-white text-xl">
                  <ChevronLeft />
                </span>
              </button>

              <button
                onClick={closePromotionModal}
                className="lg:block hidden z-20 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center"
              >
                <span className="text-white text-xl">
                  <X />
                </span>
              </button>
            </div>
            {/* Close Button */}

            {/* Modal Body - Scrollable */}
            <div className="w-full h-full overflow-y-auto">
              <div className="flex flex-col">
                {/* 1. Promotion Banner */}
                <div className="p-4 rounded-xl relative">
                  <img
                    src={`promotion-${selectedPromotion}.webp`}
                    alt={`Promotion ${selectedPromotion}`}
                    className="w-full h-auto object-cover rounded-xl"
                  />
                </div>

                {/* Content Section */}
                <div className="px-4">
                  {/* 2. Promotion Title */}
                  <h2 className="text-[16px] lg:text-[20px] text-[#00a6ff] font-bold">
                    คืนยอดเสียต่อสัปดาห์สูงสุด 10 %
                  </h2>
                  <h2 className="text-[12px] lg:text-[20px] text-gray-600 mb-4">
                    พิเศษคืนให้ทุกวัน 100% ใบเสร็จแรกเท่านั้น!
                  </h2>

                  {/* 3. Promotion Details Image */}
                  <div className="mb-6">
                    <img
                      src="promotions-details.png"
                      alt="Promotion Details"
                      className="w-full h-auto object-cover rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PromotionsPage
