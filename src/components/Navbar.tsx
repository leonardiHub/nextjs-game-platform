'use client'

import { User } from '@/types'
import {
  Navbar,
  NavBody,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from '@/components/ui/resizable-navbar'
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import {
  User as UserIcon,
  DollarSign,
  ArrowDownToLine,
  LogOut,
  RefreshCw,
  ChevronUpIcon,
  ChevronDown,
  HamburgerIcon,
  Hamburger,
  MenuIcon,
  X,
  Wallet,
  FileText,
  History,
  Menu,
  Home,
  Spade,
  Gamepad2,
  Trophy,
  Ticket,
  Gift,
  CreditCard,
  Users,
  BookOpen,
} from 'lucide-react'
import AuthModal from '@/components/AuthModal'
import WalletTab from '@/components/tabs/WalletTab'
import KYCTab from '@/components/tabs/KYCTab'
import HistoryTab from '@/components/tabs/HistoryTab'
import { Withdrawal, Transaction } from '@/types'
import { useRouter, usePathname } from 'next/navigation'
import { useHydration } from '@/hooks/useHydration'

interface NavbarProps {
  user: User | null
  balance: number
  canWithdraw: boolean
  onLogout: () => void
  onRefreshBalance: () => void
  isRefreshing: boolean
  onLogin?: (user: User, token: string) => void
  withdrawals: Withdrawal[]
  onWithdrawalSubmit: (bankDetails: {
    bank_name: string
    account_number: string
    account_holder: string
    bank_branch: string
  }) => Promise<boolean>
  transactions: Transaction[]
  onKYCUpload: (formData: FormData) => Promise<boolean>
}

export default function GameNavbar({
  user,
  balance,
  canWithdraw,
  onLogout,
  onRefreshBalance,
  isRefreshing,
  onLogin,
  withdrawals,
  onWithdrawalSubmit,
  transactions,
  onKYCUpload,
}: NavbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>(
    'login'
  )
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [showKYCModal, setShowKYCModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const isHydrated = useHydration()
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsUserDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Handle scroll detection with RAF optimization
  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollTop = window.scrollY
          // Only update state if the scroll state actually changed
          const shouldBeScrolled = scrollTop > 50
          if (shouldBeScrolled !== isScrolled) {
            setIsScrolled(shouldBeScrolled)
          }
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [isScrolled])

  // Disable background scrolling when any modal is open
  useEffect(() => {
    const isAnyModalOpen =
      showAuthModal ||
      showWalletModal ||
      showKYCModal ||
      showHistoryModal ||
      showMobileMenu

    if (isAnyModalOpen) {
      // Save current scroll position
      const scrollY = window.scrollY

      // Disable scrolling
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
      document.body.style.overflow = 'hidden'
    } else {
      // Re-enable scrolling and restore scroll position
      const scrollY = document.body.style.top
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      document.body.style.overflow = ''

      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1)
      }
    }

    // Cleanup function
    return () => {
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      document.body.style.overflow = ''
    }
  }, [
    showAuthModal,
    showWalletModal,
    showKYCModal,
    showHistoryModal,
    showMobileMenu,
  ])

  const handleWithdrawalClick = useCallback(() => {
    // Scroll to wallet section
    const walletSection = document.querySelector('[data-tab="wallet"]')
    if (walletSection) {
      walletSection.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  // Memoized dropdown handlers to prevent unnecessary re-renders
  const handleUserDropdownToggle = useCallback(() => {
    setIsUserDropdownOpen(prev => !prev)
  }, [])

  const handleWalletModalOpen = useCallback(() => {
    setShowWalletModal(true)
    setIsUserDropdownOpen(false)
  }, [])

  const handleKYCModalOpen = useCallback(() => {
    setShowKYCModal(true)
    setIsUserDropdownOpen(false)
  }, [])

  const handleHistoryModalOpen = useCallback(() => {
    setShowHistoryModal(true)
    setIsUserDropdownOpen(false)
  }, [])

  const handleLogout = useCallback(() => {
    onLogout()
    setIsUserDropdownOpen(false)
  }, [onLogout])

  // Show loading state during hydration
  // if (!isHydrated) {
  //   return (
  //     <div className="fixed top-0 z-[100] w-full bg-[#212121] px-2 lg:px-8 py-3 lg:py-1">
  //       <div className="w-full flex items-center justify-between">
  //         <img
  //           src="pg-slot-logo.webp"
  //           alt="logo"
  //           className="h-auto w-[70px] lg:w-[100px]"
  //         />
  //         <div className="flex items-center space-x-3">
  //           <div className="w-20 h-8 bg-gray-700 rounded animate-pulse"></div>
  //           <div className="w-20 h-8 bg-gray-700 rounded animate-pulse"></div>
  //         </div>
  //       </div>
  //     </div>
  //   )
  // }

  return (
    <>
      <div
        className={`fixed top-0 z-[100] w-full will-change-transform transition-all duration-300 ease-in-out hydration-safe ${
          isScrolled
            ? 'w-[200px] lg:w-[1200px] mx-auto rounded-xl shadow-lg backdrop-blur-md bg-[#212121]/95 px-4 lg:px-8 py-3 lg:py-1 border border-gray-700'
            : 'w-full bg-[#212121] px-2 lg:px-8 py-3 lg:py-1'
        }`}
        style={{
          backfaceVisibility: 'hidden',
          perspective: '1000px',
        }}
        suppressHydrationWarning={true}
      >
        <div
          className={`w-full flex items-center transition-all duration-300 ease-in-out ${
            isScrolled ? 'justify-between' : 'justify-between'
          }`}
        >
          <img
            src="/pg-slot-logo.webp"
            alt="logo"
            onClick={() => router.push('/')}
            className="h-auto w-[70px] lg:w-[100px] transition-all duration-300 ease-in-out will-change-transform"
            style={{
              backfaceVisibility: 'hidden',
            }}
          />

          <div className="lg:flex hidden text-white items-center justify-center gap-8">
            <span
              onClick={() => router.push('/')}
              className={`relative cursor-pointer transition-colors duration-300 group ${
                pathname === '/' ? 'text-[#c29331]' : 'hover:text-[#c29331]'
              }`}
            >
              หน้าหลัก
              <span
                className={`absolute bottom-0 left-0 h-0.5 bg-[#c29331] transition-all duration-300 ${
                  pathname === '/' ? 'w-full' : 'w-0 group-hover:w-full'
                }`}
              ></span>
            </span>
            <span className="relative cursor-pointer transition-colors duration-300 hover:text-[#c29331] group">
              สล็อต
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#c29331] transition-all duration-300 group-hover:w-full"></span>
            </span>
            <span className="relative cursor-pointer transition-colors duration-300 hover:text-[#c29331] group">
              หน้าหลัก
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#c29331] transition-all duration-300 group-hover:w-full"></span>
            </span>
            <span className="relative cursor-pointer transition-colors duration-300 hover:text-[#c29331] group">
              คาสิโน
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#c29331] transition-all duration-300 group-hover:w-full"></span>
            </span>
            <span className="relative cursor-pointer transition-colors duration-300 hover:text-[#c29331] group">
              แทงบอล
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#c29331] transition-all duration-300 group-hover:w-full"></span>
            </span>
            <span
              onClick={() => router.push('/blog')}
              className={`relative cursor-pointer transition-colors duration-300 group ${
                pathname === '/blog' ? 'text-[#c29331]' : 'hover:text-[#c29331]'
              }`}
            >
              แทงหวย
              <span
                className={`absolute bottom-0 left-0 h-0.5 bg-[#c29331] transition-all duration-300 ${
                  pathname === '/blog' ? 'w-full' : 'w-0 group-hover:w-full'
                }`}
              ></span>
            </span>
            <span
              onClick={() => router.push('/promotions')}
              className={`relative cursor-pointer transition-colors duration-300 group ${
                pathname === '/promotions'
                  ? 'text-[#c29331]'
                  : 'hover:text-[#c29331]'
              }`}
            >
              โปรโมชั่น
              <span
                className={`absolute bottom-0 left-0 h-0.5 bg-[#c29331] transition-all duration-300 ${
                  pathname === '/promotions'
                    ? 'w-full'
                    : 'w-0 group-hover:w-full'
                }`}
              ></span>
            </span>
            <span className="relative cursor-pointer transition-colors duration-300 hover:text-[#c29331] group">
              สิทธิพิเศษ บทความ
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#c29331] transition-all duration-300 group-hover:w-full"></span>
            </span>
          </div>

          {user && isHydrated && (
            <div
              className={`flex items-stretch transition-all duration-300 ease-in-out ${
                isScrolled ? 'gap-4' : 'justify-center gap-4 w-max w-1/2'
              }`}
            >
              {/* Credit Display - Hide when scrolled on mobile, compact on desktop */}
              <div
                className={`lg:flex items-center space-x-3 transition-all duration-300 ease-in-out ${
                  isScrolled ? 'hidden lg:flex' : 'hidden lg:flex'
                }`}
              >
                <div className="flex items-center">
                  <span
                    className="gradient-gold font-bold tracking-wide transition-all duration-300 ease-in-out will-change-transform"
                    style={{
                      fontSize: isScrolled ? '1.125rem' : '1.25rem',
                      backfaceVisibility: 'hidden',
                    }}
                  >
                    ${balance.toFixed(2)}
                  </span>
                  <button
                    onClick={onRefreshBalance}
                    disabled={isRefreshing}
                    className={`p-2 rounded-full transition-all duration-300 will-change-transform ${
                      isRefreshing
                        ? 'animate-spin text-gray-500'
                        : 'hover:bg-gray-700/50 text-white hover:text-gray-200'
                    }`}
                    title="Refresh balance"
                    style={{
                      backfaceVisibility: 'hidden',
                    }}
                  >
                    <RefreshCw
                      className="transition-all duration-300 ease-in-out will-change-transform"
                      style={{
                        width: isScrolled ? '0.75rem' : '1rem',
                        height: isScrolled ? '0.75rem' : '1rem',
                        backfaceVisibility: 'hidden',
                      }}
                    />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 lg:hidden">
                <div className="rounded-lg flex flex-col border-r-0 rounded-r-none text-gray-300 leading-tight">
                  <span className="text-xs text-left">Balance:</span>

                  <div className="flex">
                    <span
                      className="gradient-gold text-left transition-all duration-300 ease-in-out will-change-transform"
                      style={{
                        backfaceVisibility: 'hidden',
                      }}
                    >
                      {' '}
                      ${balance.toFixed(2)}
                    </span>
                    <button
                      onClick={e => {
                        e.stopPropagation()
                        onRefreshBalance()
                      }}
                      disabled={isRefreshing}
                      className={`p-1 rounded-full transition-all duration-300 will-change-transform ${
                        isRefreshing
                          ? 'animate-spin text-gray-500'
                          : 'hover:bg-gray-700/50 text-gray-400 hover:text-[#C29331]'
                      }`}
                      title="Refresh balance"
                      style={{
                        backfaceVisibility: 'hidden',
                      }}
                    >
                      <RefreshCw
                        className="w-3 h-3 will-change-transform"
                        style={{
                          backfaceVisibility: 'hidden',
                        }}
                      />
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setShowWalletModal(true)}
                  disabled={!canWithdraw || user?.kyc_status !== 'approved'}
                  className={`h-max border border-primary flex items-center justify-center px-2 rounded-md transition-all duration-200 ${
                    canWithdraw && user?.kyc_status === 'approved'
                      ? 'hover:opacity-90 cursor-pointer'
                      : 'opacity-50 cursor-not-allowed'
                  }`}
                  style={{
                    background:
                      'linear-gradient(180deg, #af8135, #f0e07c, #c69b3a)',
                  }}
                  title={
                    canWithdraw && user?.kyc_status === 'approved'
                      ? 'Open withdrawal options'
                      : canWithdraw
                        ? 'Complete KYC verification first'
                        : 'Reach minimum balance to withdraw'
                  }
                >
                  <span className="text-sm">Withdraw</span>
                </button>
              </div>

              {/* Desktop Withdraw Button */}
              <button
                onClick={() => setShowWalletModal(true)}
                disabled={!canWithdraw || user?.kyc_status !== 'approved'}
                className={`lg:flex hidden items-center lg:space-x-1 px-3 py-1.5 rounded-lg font-semibold transition-all duration-300 text-sm`}
                title={
                  canWithdraw && user?.kyc_status === 'approved'
                    ? 'Open withdrawal options'
                    : canWithdraw
                      ? 'Complete KYC verification first'
                      : 'Reach minimum balance to withdraw'
                }
                style={{
                  background:
                    'linear-gradient(180deg, #af8135, #f0e07c, #c69b3a)',
                }}
              >
                <DollarSign className="w-4 h-4" />
                <span className={`transition-all duration-300`}>Withdraw</span>
              </button>

              <button
                onClick={() => onLogout()}
                className={`lg:flex hidden items-center lg:space-x-1 px-3 py-1.5 rounded-lg font-semibold transition-all duration-300 text-sm bg-red-500 text-white`}
                title={'Logout'}
              >
                <span className={`transition-all duration-300`}>Logout</span>
              </button>

              {/* User Dropdown */}
              {/* <div className="relative flex" ref={dropdownRef}>
                <button
                  onClick={handleUserDropdownToggle}
                  className="flex items-center space-x-2 rounded-lg hover:bg-gray-700/50 transition-all duration-200"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-[#D4B145] to-[#C29331] rounded-full flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-[#212121]" />
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                      isUserDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

             
                {isUserDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-[#2a2a2a] rounded-lg shadow-xl border border-gray-600 z-50">
                    <div className="p-4 border-b border-gray-600">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-[#D4B145] to-[#C29331] rounded-full flex items-center justify-center">
                          <UserIcon className="w-5 h-5 text-[#212121]" />
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {user?.username}
                          </p>
                          <p className="text-gray-400 text-sm">
                            {user?.full_name}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="py-2">
                      <button
                        onClick={handleWalletModalOpen}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors"
                      >
                        <Wallet className="w-4 h-4" />
                        <span>Wallet</span>
                      </button>

                      <button
                        onClick={handleKYCModalOpen}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                        <span>KYC Verification</span>
                        {user?.kyc_status === 'approved' && (
                          <span className="ml-auto text-green-400 text-xs">
                            ✓
                          </span>
                        )}
                        {user?.kyc_status === 'pending' && (
                          <span className="ml-auto text-yellow-400 text-xs">
                            ⏳
                          </span>
                        )}
                        {user?.kyc_status === 'rejected' && (
                          <span className="ml-auto text-red-400 text-xs">
                            ✗
                          </span>
                        )}
                      </button>

                      <button
                        onClick={handleHistoryModalOpen}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors"
                      >
                        <History className="w-4 h-4" />
                        <span>Transaction History</span>
                      </button>
                    </div>

                    <div className="border-t border-gray-600 py-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-red-400 hover:bg-red-600/20 hover:text-red-300 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div> */}

              <button
                className="lg:hidden block text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                onClick={() => setShowMobileMenu(true)}
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* <button
    onClick={() => {
      handleWithdrawalClick()
      setIsMobileMenuOpen(false)
    }}
    disabled={!canWithdraw || user?.kyc_status !== 'approved'}
    className={`lg:flex hidden px-4 cursor-pointer text-lg w-full flex items-center justify-center space-x-2 py-3 rounded-xl font-semibold transition-all duration-300 ${
      canWithdraw && user?.kyc_status === 'approved'
        ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-700 hover:to-green-700'
        : 'bg-gray-700 text-gray-500 cursor-not-allowed border border-gray-600'
    }`}
    title={
      canWithdraw && user?.kyc_status === 'approved'
        ? 'Ready to withdraw $50'
        : canWithdraw
          ? 'Complete KYC verification first'
          : 'Reach $1000 balance to withdraw'
    }
  >
    <ArrowDownToLine className="w-4 h-4" />
    <span>Withdrawal</span>
  </button> */}

              {/* <button
    onClick={() => {
      onLogout()
      setIsMobileMenuOpen(false)
    }}
    className="lg:flex hidden w-full flex px-4 items-center justify-center space-x-2 py-3 rounded-xl font-semibold bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 transition-all duration-300"
  >
    <LogOut className="w-4 h-4" />
    <span>Logout</span>
  </button> */}
            </div>
          )}

          {!user && isHydrated && (
            <div
              className={`flex items-center transition-all duration-300 ease-in-out ${
                isScrolled ? 'space-x-2' : 'space-x-3'
              }`}
            >
              <button
                onClick={() => {
                  setAuthModalTab('login')
                  setShowAuthModal(true)
                }}
                className={`text-white border border-[#C29331] rounded-lg hover:bg-[#C29331] hover:text-[#212121] transition-all duration-300 font-medium ${
                  isScrolled ? 'px-3 py-1.5 text-sm' : 'px-4 py-2'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => {
                  setAuthModalTab('register')
                  setShowAuthModal(true)
                }}
                className={`bg-gradient-to-r from-[#D4B145] to-[#C29331] text-[#212121] rounded-lg hover:from-[#C29331] hover:to-[#B08428] transition-all duration-300 font-medium ${
                  isScrolled ? 'px-3 py-1.5 text-sm' : 'px-4 py-2'
                }`}
              >
                Register
              </button>

              <button
                className="lg:hidden block text-white ml-0 mr-2 p-0 hover:bg-gray-700/50 rounded-lg transition-colors"
                onClick={() => setShowMobileMenu(true)}
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={(user, token) => {
          if (onLogin) {
            onLogin(user, token)
          }
        }}
        initialTab={authModalTab}
      />

      {/* Wallet Modal */}
      {showWalletModal && (
        <div className="bg-[#212121] px-4 pt-8 pb-22 fixed inset-0 backdrop-blur-sm z-[99999] flex items-start justify-center min-h-screen max-w-screen overflow-y-auto lg:px-0 lg:pb-20 lg:pt-8 ">
          <div className="relative bg-[#212121] w-full max-w-md mx-auto min-h-fit max-h-full overflow-y-auto flex flex-col">
            <button
              onClick={() => setShowWalletModal(false)}
              className="absolute top-0 right-0 text-gray-500 hover:text-gray-700 z-10 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <WalletTab
              user={user}
              balance={balance}
              canWithdraw={canWithdraw}
              withdrawals={withdrawals}
              onWithdrawalSubmit={onWithdrawalSubmit}
            />
          </div>
        </div>
      )}

      {/* KYC Modal */}
      {showKYCModal && (
        <div className="bg-[#212121] px-4 pt-8 pb-22 fixed inset-0 backdrop-blur-sm z-[99999] flex items-start justify-center min-h-screen max-w-screen overflow-y-auto lg:px-0 lg:pb-20 lg:pt-8 ">
          <div className="relative bg-[#212121] w-full max-w-md mx-auto min-h-fit max-h-full overflow-y-auto flex flex-col">
            <button
              onClick={() => setShowKYCModal(false)}
              className="absolute top-0 right-0 text-gray-500 hover:text-gray-700 z-10 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <KYCTab user={user} onKYCUpload={onKYCUpload} />
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div className="bg-[#212121] px-4 pt-8 pb-22 fixed inset-0 backdrop-blur-sm z-[99999] flex items-start justify-center min-h-screen max-w-screen overflow-y-auto lg:px-0 lg:pb-20 lg:pt-8 ">
          <div className="relative bg-[#212121] w-full max-w-md mx-auto min-h-fit max-h-full overflow-y-auto flex flex-col">
            <button
              onClick={() => setShowHistoryModal(false)}
              className="absolute top-0 right-0 text-gray-500 hover:text-gray-700 z-10 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <HistoryTab transactions={transactions} />
          </div>
        </div>
      )}

      {/* Mobile Menu Slide-out */}
      {showMobileMenu && (
        <>
          {/* Backdrop */}
          <div
            className={`pb-20 fixed inset-0 bg-black/50 lg:hidden will-change-auto z-[99998] ${
              showMobileMenu ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              transition: 'opacity 200ms ease-out',
              backdropFilter: showMobileMenu ? 'blur(4px)' : 'none',
              WebkitBackdropFilter: showMobileMenu ? 'blur(4px)' : 'none',
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100vw',
              height: '100vh',
            }}
            onClick={() => setShowMobileMenu(false)}
          />

          {/* Slide-out Menu */}
          <div
            className={`fixed top-0 right-0 h-full w-80 bg-[#212121] shadow-2xl z-[99999] lg:hidden overflow-hidden will-change-transform mobile-menu-optimized ${
              showMobileMenu ? 'translate-x-0' : 'translate-x-full'
            }`}
            suppressHydrationWarning={true}
            style={{
              transition: 'transform 250ms cubic-bezier(0.4, 0.0, 0.2, 1)',
              backfaceVisibility: 'hidden',
              perspective: '1000px',
              transform: showMobileMenu ? 'translateX(0)' : 'translateX(100%)',
              maxHeight: '100vh',
              minHeight: '100vh',
              WebkitTransform: showMobileMenu
                ? 'translateX(0)'
                : 'translateX(100%)',
              position: 'fixed',
              top: 0,
              right: 0,
              width: '320px',
              height: '100vh',
              paddingBottom: '40px',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
              <img
                src="/pg-slot-logo.webp"
                alt="99Group"
                className="h-10 w-auto"
              />
              <button
                onClick={() => setShowMobileMenu(false)}
                className="text-gray-400 hover:text-white p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu Items */}
            <div
              className="flex flex-col p-4 space-y-2 pb-32 overflow-y-auto"
              style={{
                height: 'calc(100vh - 100px)',
                maxHeight: 'calc(100vh - 100px)',
                minHeight: '200px',
                overscrollBehavior: 'contain',
                WebkitOverflowScrolling: 'touch',
                overflowY: 'auto',
                overflowX: 'hidden',
                position: 'relative',
                zIndex: 1,
                paddingBottom: '120px',
              }}
            >
              {/* User Profile Section */}
              {user && (
                <div className="mb-4 p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-[#D4B145] to-[#C29331] rounded-full flex items-center justify-center">
                      <UserIcon className="w-5 h-5 text-[#212121]" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{user?.username}</p>
                      <p className="text-gray-400 text-sm">{user?.full_name}</p>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => {
                        setShowWalletModal(true)
                        setShowMobileMenu(false)
                      }}
                      className="flex items-center space-x-2 p-2 text-gray-300 hover:bg-gray-700/50 hover:text-white rounded-lg transition-colors text-sm"
                    >
                      <Wallet className="w-4 h-4" />
                      <span>Wallet</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowKYCModal(true)
                        setShowMobileMenu(false)
                      }}
                      className="flex items-center space-x-2 p-2 text-gray-300 hover:bg-gray-700/50 hover:text-white rounded-lg transition-colors text-sm"
                    >
                      <FileText className="w-4 h-4" />
                      <span>KYC Verification</span>
                      {user?.kyc_status === 'approved' && (
                        <span className="ml-auto text-green-400 text-xs">
                          ✓
                        </span>
                      )}
                      {user?.kyc_status === 'pending' && (
                        <span className="ml-auto text-yellow-400 text-xs">
                          ⏳
                        </span>
                      )}
                      {user?.kyc_status === 'rejected' && (
                        <span className="ml-auto text-red-400 text-xs">✗</span>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setShowHistoryModal(true)
                        setShowMobileMenu(false)
                      }}
                      className="flex items-center space-x-2 p-2 text-gray-300 hover:bg-gray-700/50 hover:text-white rounded-lg transition-colors text-sm"
                    >
                      <History className="w-4 h-4" />
                      <span>Transaction History</span>
                    </button>

                    <button
                      onClick={() => {
                        onLogout()
                        setShowMobileMenu(false)
                      }}
                      className="flex items-center space-x-2 p-2 text-red-400 hover:bg-red-600/20 hover:text-red-300 rounded-lg transition-colors text-sm"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Menu Items as Buttons */}
              <button className="flex items-center space-x-3 p-3 text-white bg-gray-800/50 hover:bg-[#C29331]/20 hover:border-[#C29331] border border-transparent rounded-lg transition-all duration-200 text-left">
                <Home className="w-5 h-5 text-[#C29331]" />
                <span className="font-medium">PG SLOT</span>
              </button>

              <button className="flex items-center space-x-3 p-3 text-white bg-gray-800/50 hover:bg-[#C29331]/20 hover:border-[#C29331] border border-transparent rounded-lg transition-all duration-200 text-left">
                <Spade className="w-5 h-5 text-[#C29331]" />
                <span className="font-medium">Casino</span>
              </button>

              <button className="flex items-center space-x-3 p-3 text-white bg-gray-800/50 hover:bg-[#C29331]/20 hover:border-[#C29331] border border-transparent rounded-lg transition-all duration-200 text-left">
                <Gamepad2 className="w-5 h-5 text-[#C29331]" />
                <span className="font-medium">Slots</span>
              </button>

              <button className="flex items-center space-x-3 p-3 text-white bg-gray-800/50 hover:bg-[#C29331]/20 hover:border-[#C29331] border border-transparent rounded-lg transition-all duration-200 text-left">
                <Trophy className="w-5 h-5 text-[#C29331]" />
                <span className="font-medium">Sports</span>
              </button>

              <button
                className="flex items-center space-x-3 p-3 text-white bg-gray-800/50 hover:bg-[#C29331]/20 hover:border-[#C29331] border border-transparent rounded-lg transition-all duration-200 text-left"
                onClick={() => {
                  router.push('/blog')
                  setShowMobileMenu(false)
                }}
              >
                <Ticket className="w-5 h-5 text-[#C29331]" />
                <span className="font-medium">Lottery</span>
              </button>

              <button
                className="flex items-center space-x-3 p-3 text-white bg-gray-800/50 hover:bg-[#C29331]/20 hover:border-[#C29331] border border-transparent rounded-lg transition-all duration-200 text-left"
                onClick={() => {
                  router.push('/promotions')
                  setShowMobileMenu(false)
                }}
              >
                <Gift className="w-5 h-5 text-[#C29331]" />
                <span className="font-medium">Promotions</span>
              </button>

              <button className="flex items-center space-x-3 p-3 text-white bg-gray-800/50 hover:bg-[#C29331]/20 hover:border-[#C29331] border border-transparent rounded-lg transition-all duration-200 text-left">
                <CreditCard className="w-5 h-5 text-[#C29331]" />
                <span className="font-medium">Payments</span>
              </button>

              <button className="flex items-center space-x-3 p-3 text-white bg-gray-800/50 hover:bg-[#C29331]/20 hover:border-[#C29331] border border-transparent rounded-lg transition-all duration-200 text-left">
                <Users className="w-5 h-5 text-[#C29331]" />
                <span className="font-medium">Affiliate</span>
              </button>

              <button className="flex items-center space-x-3 p-3 text-white bg-gray-800/50 hover:bg-[#C29331]/20 hover:border-[#C29331] border border-transparent rounded-lg transition-all duration-200 text-left">
                <BookOpen className="w-5 h-5 text-[#C29331]" />
                <span className="font-medium">Blog</span>
              </button>
            </div>
          </div>
        </>
      )}
    </>
    // <div className="sticky top-0 w-full z-50 bg-gray-900/95 backdrop-blur-sm shadow-xl border-b border-gray-800/50">
    //   <Navbar>
    //     {/* Desktop Navigation */}
    //     <NavBody className="border-2 border-red-500 w-[100vw]">
    //       {/* Logo Section */}
    //       <div className="flex items-center">
    //         <img
    //           src="/pg-slot-logo.webp"
    //           alt="99Group"
    //           className="h-auto w-[90px]"
    //         />
    //       </div>

    //       {/* Desktop Header Content */}
    //       <div className="flex items-center space-x-6 border-2 border-red-500">
    //         {/* User Greeting */}
    //         <div className="flex items-center space-x-2 text-gray-100">
    //           <UserIcon className="w-5 h-5 text-blue-400" />
    //           <span className="text-lg font-medium">
    //             Hi, <span className="text-blue-400 font-semibold">{user?.username || 'demo'}</span>
    //           </span>
    //         </div>

    //         {/* Divider */}
    //         <div className="text-gray-600 text-xl">|</div>

    //         {/* Credit Display */}
    //         <div className="flex items-center space-x-3 bg-gray-800/80 backdrop-blur-sm rounded-xl px-5 py-3 border border-gray-700/50 shadow-lg">
    //           <DollarSign className="w-5 h-5 text-emerald-400" />
    //           <span className="text-gray-300 font-medium">Credit:</span>
    //           <div className="flex items-center space-x-3">
    //             <span className="text-emerald-400 font-bold text-xl tracking-wide">
    //               ${balance.toFixed(2)}
    //             </span>
    //             <button
    //               onClick={onRefreshBalance}
    //               disabled={isRefreshing}
    //               className={`p-2 rounded-full transition-all duration-300 ${
    //                 isRefreshing
    //                   ? 'animate-spin text-gray-500'
    //                   : 'hover:bg-gray-700/50 text-gray-400 hover:text-gray-200'
    //               }`}
    //               title="Refresh balance"
    //             >
    //               <RefreshCw className="w-4 h-4" />
    //             </button>
    //           </div>
    //         </div>

    //         {/* Divider */}
    //         <div className="text-gray-600 text-xl">|</div>

    //         {/* Action Buttons */}
    //         <div className="flex items-center gap-3">
    //           <NavbarButton
    //             onClick={handleWithdrawalClick}
    //             disabled={!canWithdraw || user?.kyc_status !== 'approved'}
    //             variant="primary"
    //             className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
    //               canWithdraw && user?.kyc_status === 'approved'
    //                 ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-700 hover:to-green-700 hover:shadow-xl hover:shadow-emerald-500/25 transform hover:-translate-y-0.5'
    //                 : 'bg-gray-700 text-gray-500 cursor-not-allowed border border-gray-600'
    //             }`}
    //             title={
    //               canWithdraw && user?.kyc_status === 'approved'
    //                 ? 'Ready to withdraw $50'
    //                 : canWithdraw
    //                 ? 'Complete KYC verification first'
    //                 : 'Reach $1000 balance to withdraw'
    //             }
    //           >
    //             <ArrowDownToLine className="w-4 h-4" />
    //             <span>Withdrawal</span>
    //           </NavbarButton>

    //           <NavbarButton
    //             onClick={onLogout}
    //             variant="secondary"
    //             className="flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 transition-all duration-300 hover:shadow-xl hover:shadow-red-500/25 transform hover:-translate-y-0.5"
    //           >
    //             <LogOut className="w-4 h-4" />
    //             <span>Logout</span>
    //           </NavbarButton>
    //         </div>
    //       </div>
    //     </NavBody>

    //     {/* Mobile Navigation */}
    //     <MobileNav>
    //       <MobileNavHeader>
    //         <div className="flex items-center">
    //           <img
    //             src="/pg-slot-logo.webp"
    //             alt="99Group"
    //             className="h-auto w-[70px]"
    //           />
    //         </div>
    //         <MobileNavToggle
    //           isOpen={isMobileMenuOpen}
    //           onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
    //         />
    //       </MobileNavHeader>

    //       <MobileNavMenu
    //         isOpen={isMobileMenuOpen}
    //         onClose={() => setIsMobileMenuOpen(false)}
    //       >
    //         {/* Mobile User Info */}
    //         <div className="mb-6 space-y-4">
    //           {/* User Greeting */}
    //           <div className="flex items-center justify-center space-x-2">
    //             <UserIcon className="w-5 h-5 text-blue-400" />
    //             <span className="text-lg font-medium text-gray-100">
    //               Hi, <span className="text-blue-400 font-semibold">{user?.username || 'demo'}</span>
    //             </span>
    //           </div>

    //           {/* Credit Display */}
    //           <div className="flex items-center justify-center space-x-3 bg-gray-800/80 rounded-xl px-5 py-3 border border-gray-700/50 shadow-lg">
    //             <DollarSign className="w-5 h-5 text-emerald-400" />
    //             <span className="text-gray-300 font-medium">Credit:</span>
    //             <div className="flex items-center space-x-3">
    //               <span className="text-emerald-400 font-bold text-xl tracking-wide">
    //                 ${balance.toFixed(2)}
    //               </span>
    //               <button
    //                 onClick={onRefreshBalance}
    //                 disabled={isRefreshing}
    //                 className={`p-2 rounded-full transition-all duration-300 ${
    //                   isRefreshing
    //                     ? 'animate-spin text-gray-500'
    //                     : 'hover:bg-gray-700/50 text-gray-400 hover:text-gray-200'
    //                 }`}
    //                 title="Refresh balance"
    //               >
    //                 <RefreshCw className="w-4 h-4" />
    //               </button>
    //             </div>
    //           </div>
    //         </div>

    //         {/* Mobile Action Buttons */}
    //         <div className="flex w-full flex-col gap-4">
    //           <NavbarButton
    //             onClick={() => {
    //               handleWithdrawalClick()
    //               setIsMobileMenuOpen(false)
    //             }}
    //             disabled={!canWithdraw || user?.kyc_status !== 'approved'}
    //             variant="primary"
    //             className={`w-full flex items-center justify-center space-x-2 py-3 rounded-xl font-semibold transition-all duration-300 ${
    //               canWithdraw && user?.kyc_status === 'approved'
    //                 ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-700 hover:to-green-700'
    //                 : 'bg-gray-700 text-gray-500 cursor-not-allowed border border-gray-600'
    //             }`}
    //             title={
    //               canWithdraw && user?.kyc_status === 'approved'
    //                 ? 'Ready to withdraw $50'
    //                 : canWithdraw
    //                 ? 'Complete KYC verification first'
    //                 : 'Reach $1000 balance to withdraw'
    //             }
    //           >
    //             <ArrowDownToLine className="w-4 h-4" />
    //             <span>Withdrawal</span>
    //           </NavbarButton>

    //           <NavbarButton
    //             onClick={() => {
    //               onLogout()
    //               setIsMobileMenuOpen(false)
    //             }}
    //             variant="secondary"
    //             className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl font-semibold bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 transition-all duration-300"
    //           >
    //             <LogOut className="w-4 h-4" />
    //             <span>Logout</span>
    //           </NavbarButton>
    //         </div>
    //       </MobileNavMenu>
    //     </MobileNav>
    //   </Navbar>
    // </div>
  )
}
