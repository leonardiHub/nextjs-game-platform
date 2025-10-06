'use client'

import GameFrame from '@/components/GameFrame'
import Header from '@/components/Header'
import ProgressSection from '@/components/ProgressSection'
import GamesTab from '@/components/tabs/GamesTab'
import Footer from '@/components/Footer'
import MobileNavigation from '@/components/MobileNavigation'
import { GameData, Transaction, User, Withdrawal } from '@/types'
import { useEffect, useState } from 'react'

// Define ApiGame interface for the actual API response
interface ApiGame {
  code: number
  name: string
  game_uid: string
  type: string
  rtp?: number
}
import Hero from './Hero'
import AuthModal from '@/components/AuthModal'
import { useRouter } from 'next/navigation'
import { useGameContext } from '@/components/ClientLayoutProvider'
import Herov2 from './Herov2'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface DashboardProps {
  user: User | null
  balance: number
  canWithdraw: boolean
  onLogout: () => void
  onBalanceUpdate: () => void
  onLogin?: (user: User, token: string) => void
}

export default function Dashboard({
  user,
  balance,
  canWithdraw,
  onLogout,
  onBalanceUpdate,
  onLogin,
}: DashboardProps) {
  const router = useRouter()
  const gameContext = useGameContext()
  const [activeTab, setActiveTab] = useState('games')
  const [games, setGames] = useState<{
    fishGames?: ApiGame[]
    slotGames?: ApiGame[]
  } | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>(
    'login'
  )
  const [isContentExpanded, setIsContentExpanded] = useState(false)

  useEffect(() => {
    loadGames()
    // Only load user-specific data if user is authenticated
    if (user) {
      loadTransactionHistory()
      loadWithdrawalHistory()
    }
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  const getAuthHeaders = () => {
    // Only access localStorage on client side
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  }

  const loadGames = async () => {
    try {
      const response = await fetch('/api/games')
      const data = await response.json()

      if (data.success) {
        // Keep the original structure with fishGames and slotGames
        setGames(data.games)
      }
    } catch (error) {
      console.error('Error loading games:', error)
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
      await onBalanceUpdate()
    } catch (error) {
      console.error('Error refreshing balance:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handlePlayGame = async (gameUid: string) => {
    // Check if user is authenticated
    if (!user) {
      setAuthModalTab('login')
      setShowAuthModal(true)
      return
    }

    try {
      const response = await fetch('/api/game/launch', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ game_uid: gameUid }),
      })

      const data = await response.json()

      if (response.ok && data.success && data.game_url) {
        gameContext.setGameUrl(data.game_url)
        gameContext.setShowGame(true)
      } else {
        alert(`Failed to launch game: ${data.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Game launch error:', error)
      alert('Failed to launch game. Please try again.')
    }
  }

  const handleCloseGame = async () => {
    gameContext.setIsClosingGame(true)
    setIsRefreshing(true)
    try {
      // Refresh balance and transaction history immediately after closing game
      await Promise.all([onBalanceUpdate(), loadTransactionHistory()])
    } catch (error) {
      console.error('Error refreshing data after game close:', error)
    } finally {
      gameContext.setIsClosingGame(false)
      setIsRefreshing(false)
      gameContext.setShowGame(false)
      gameContext.setGameUrl('')
    }
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
      const token =
        typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
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
    // Only run on client side to avoid hydration mismatch
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken')
      if (token) {
        setIsAuthenticated(true)
        // loadUserProfile()
      } else {
        setIsLoading(false)
      }
    } else {
      setIsLoading(false)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-white">
      {/* Only show header when not in game mode */}
      {/* {!showGame && (
        <Header
          user={user}
          balance={balance}
          canWithdraw={canWithdraw}
          onLogout={onLogout}
          onRefreshBalance={handleRefreshBalance}
          isRefreshing={isRefreshing}
          onLogin={onLogin}
          withdrawals={withdrawals}
          onWithdrawalSubmit={handleWithdrawalSubmit}
          transactions={transactions}
          onKYCUpload={handleKYCUpload}
        />
      )} */}

      {/* Only show main content when not in game mode */}
      {!gameContext.showGame && (
        <>
          {/* <Hero /> */}
          <Herov2 />

          <div className="max-w-[1400px] mx-auto p-4 bg-white">
            {/* {user && (
              <ProgressSection balance={balance} canWithdraw={canWithdraw} />
            )} */}

            {/* <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} /> */}

            <div className="flex py-4 gap-2">
              <button
                className="w-1/4 lg:w-1/6 flex lg:flex-row flex-col items-center justify-around lg:justify-center py-1 lg:py-3 px-4 lg:px-8 rounded-lg lg:gap-4 text-[#00a6ff] border border-blue-300 hover:border-blue-400 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
                style={{
                  background: 'linear-gradient(0deg, #ffffff, #e6f3ff)',
                }}
              >
                <img
                  src="slot-icon.webp"
                  alt="slot"
                  className="w-7 h-7 lg:w-10 lg:h-10"
                />
                <span className="text-[#00a6ff] text-sm lg:text-[17px] font-medium">
                  Slot
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
                  className="w-7 h-7 lg:w-10 lg:h-10"
                />
                <span className="text-[#00a6ff] text-sm lg:text-[17px] font-medium">
                  Poker
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
                  className="w-10 h-10"
                />
                <span className="text-[#00a6ff] text-sm lg:text-[17px] font-medium">
                  Football
                </span>
              </button>
              <button
                className="relative w-1/4 lg:w-1/6 flex lg:flex-row flex-col items-center justify-around lg:justify-center py-1 lg:py-3 px-4 lg:px-8 rounded-lg lg:gap-4 text-[#00a6ff] border border-blue-300 hover:border-blue-400 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
                style={{
                  background: 'linear-gradient(0deg, #ffffff, #e6f3ff)',
                }}
              >
                <div className="text-white bg-[#00a6ff] absolute rounded-r-lg left-0 bottom-6 lg:bottom-2 text-xs px-1 lg:px-2 font-bold">
                  New
                </div>
                <img
                  src="pool-icon.webp"
                  alt="slot"
                  className="w-7 h-7 lg:w-10 lg:h-10"
                />
                <span className="text-[#00a6ff] text-sm lg:text-[17px] font-medium">
                  Pool
                </span>
              </button>
              <button
                className="w-1/6 hidden lg:flex items-center justify-center py-3 px-8 rounded-lg gap-4 text-[#00a6ff] border border-blue-300 hover:border-blue-400 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
                style={{
                  background: 'linear-gradient(0deg, #ffffff, #e6f3ff)',
                }}
              >
                <img
                  src="gift-icon.webp"
                  alt="slot"
                  className="w-7 h-7 lg:w-10 lg:h-10"
                />
                <span className="text-[#00a6ff] text-sm lg:text-[17px] font-medium">
                  Gift
                </span>
              </button>
              <button
                className="w-1/6 hidden lg:flex items-center justify-center py-3 px-8 rounded-lg gap-4 text-[#00a6ff] border border-blue-300 hover:border-blue-400 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
                style={{
                  background: 'linear-gradient(0deg, #ffffff, #e6f3ff)',
                }}
              >
                <img src="star-icon.webp" alt="slot" className="w-10 h-10" />
                <span className="text-[#00a6ff] text-sm lg:text-[17px] font-medium">
                  Star
                </span>
              </button>
            </div>
            <div className="">
              {/* {activeTab === 'games' && ( */}
              <GamesTab
                user={user}
                games={games}
                onPlayGame={handlePlayGame}
                onShowAuthModal={() => {
                  setAuthModalTab('login')
                  setShowAuthModal(true)
                }}
              />
              {/* )} */}
            </div>
          </div>

          <div className="bg-primary w-full flex items-center justify-center lg:mt-10">
            <div className="flex flex-col items-center justify-center w-full bg-primary relative h-max lg:py-0 py-10 lg:h-[300px] max-w-[1200px] border-2 border-primary">
              <img
                src="fun88-bottom.webp"
                className="w-[70%] h-auto lg:h-[450px] lg:w-auto lg:absolute left-0 bottom-[-55px]"
                alt="fun88-bottom"
              />

              <div className="lg:mt-6 text-white flex flex-col items-start justify-center lg:pl-[500px] lg:px-0 px-4">
                <span className="text-xl font-bold mb-4">เนทีฟแอป FUN88</span>
                <span className="text-sm">
                  มอบความปลอดภัย และประสิทธิภาพสูงสุดในการเข้าใช้งาน
                  พร้อมฟังก์ชั่นการโอนเงินรูปแบบใหม่ ที่เร็วขึ้น
                  และปลอดภัยมากขึ้น เพียงคลิก! ความสนุกตื่นเต้น
                  และการได้ลุ้นแบบเรียลไทม์ คุณจะไม่พลาด ทุกความเคลื่อนไหว
                  กับเว็บไซต์ออนไลน์ที่ดีที่สุดในเอเชีย
                  รองรับทั้งระบบปฏิบัติการแอนดรอยด์ และ iOS เพราะรางวัลก้อนใหญ่
                  อยู่ที่ปลายนิ้วคุณเอง!!
                </span>
                <img
                  src="fun88-apple-android.png"
                  className="w-10 lg:w-20 h-auto mt-0 lg:mt-4"
                />
                <span className="mt-4">คัดลอกลิงก์เพื่อดาวน์โหลดแอป :</span>
                <span className="underline text-yellow-300 text-md lg:text-xl">
                  https://www.fun88tha.com/th/ดาวน์โหลด-fun88/?affCode=333023
                </span>
              </div>
            </div>
          </div>

          <div className="w-full flex items-center justify-center lg:px-0 px-4 mt-10">
            <div className="w-full max-w-[1200px] flex flex-col items-center justify-center lg:mt-20">
              <img
                src="fun88-bottom-banner.png"
                alt="fun-88-bottom-banner"
                className="w-full h-auto"
              />

              <div className="bg-[#f5f5f5] border border-gray-300 w-full bg-white rounded-lg mt-8">
                <button
                  onClick={() => setIsContentExpanded(!isContentExpanded)}
                  className="w-full p-6 text-left hover:bg-gray-50 transition-colors duration-200 flex items-center justify-between"
                >
                  <h1 className="text-2xl font-bold text-black">
                    FUN88 เว็บพนันกีฬาและคาสิโนที่ดีที่สุดในไทย
                    ความบันเทิงและเงินรางวัลรอคุณอยู่
                  </h1>
                  {isContentExpanded ? (
                    <ChevronUp className="h-6 w-6 text-gray-600" />
                  ) : (
                    <ChevronDown className="h-6 w-6 text-gray-600" />
                  )}
                </button>

                {isContentExpanded && (
                  <div className="px-6 pb-6">
                    <div className="prose prose-lg max-w-none text-black leading-relaxed text-left">
                      <p className="text-lg mb-4">
                        <strong>FUN88</strong> คือ
                        แพลตฟอร์มการเดิมพันออนไลน์ที่กำลังมาแรงและได้รับความนิยมอย่างล้นหลามในเอเชีย
                        ด้วยการนำเสนอเกมเดิมพันที่หลากหลายและครบวงจร
                        ไม่ว่าจะเป็นกีฬา คาสิโนสด สล็อต หรือเกมสุดฮิตอีกมากมาย{' '}
                        <strong>FUN88 Thailand</strong>{' '}
                        ได้ก้าวขึ้นมาเป็นผู้นำในด้านการเดิมพันออนไลน์อย่างรวดเร็ว
                        เยี่ยมชมเว็บไซต์ FUN88 วันนี้
                        เพื่อสัมผัสประสบการณ์การเดิมพันที่เหนือกว่า
                      </p>

                      <h2 className="text-xl font-semibold text-black mb-3 mt-6 text-left">
                        แนะนำภาพรวมของ FUN88
                      </h2>
                      <p className="mb-4">
                        <strong>FUN88</strong>{' '}
                        เป็นหนึ่งในแพลตฟอร์มเดิมพันออนไลน์ชั้นนำของเอเชียที่ก่อตั้งขึ้นในปี
                        2008 และดำเนินการโดย Omega Sports Solutions N.V.
                        ด้วยเป้าหมายหลักในการสร้างประสบการณ์การเดิมพันที่ดีที่สุด
                        FUN88
                        ได้ขยายการให้บริการอย่างรวดเร็วจากเว็บไซต์เดิมพันกีฬาไปสู่คาสิโนออนไลน์
                        สล็อต และเกมอื่น ๆ ที่ได้รับความนิยมสูง การใช้{' '}
                        <strong>ทางเข้าFUN88</strong> และ{' '}
                        <strong>ลิงค์ FUN88</strong>{' '}
                        เป็นทางเลือกที่สะดวกสำหรับผู้เล่นเพื่อเข้าถึงแพลตฟอร์มได้อย่างรวดเร็ว
                      </p>

                      <h2 className="text-xl font-semibold text-black text-left mb-3 mt-6">
                        ประวัติการก่อตั้งและการเติบโตของ FUN88
                      </h2>
                      <p className="mb-4">
                        ตั้งแต่เปิดตัว FUN88
                        ได้เติบโตขึ้นอย่างต่อเนื่องและกลายเป็นหนึ่งในแบรนด์ที่มีชื่อเสียงมากที่สุดในตลาดเอเชีย
                        การขยายตัวของแพลตฟอร์มไม่เพียงแต่ครอบคลุมประเทศต่าง ๆ
                        ในภูมิภาคนี้
                        แต่ยังรวมถึงการพัฒนาเทคโนโลยีเพื่อให้รองรับการใช้งานบนมือถือ
                        ทำให้ผู้เล่นสามารถเดิมพันได้ทุกที่ทุกเวลา
                        หากคุณต้องการเข้าใช้งานจากมือถือ{' '}
                        <strong>FUN88 เข้าระบบ</strong>{' '}
                        ผ่านแอปพลิเคชันที่ใช้งานง่าย
                        เพิ่มความสะดวกให้กับสมาชิกมากยิ่งขึ้น และสามารถใช้{' '}
                        <strong>FUN88 Thailand</strong>{' '}
                        เพื่อเข้าถึงบริการในประเทศไทยได้อย่างง่ายดาย
                      </p>
                      <p className="mb-4">
                        นอกจากนี้ <strong>FUN88 Asia</strong>{' '}
                        ยังได้รับรางวัลอันทรงเกียรติ เช่น "Asian Operator of The
                        Year" และ "Online Gaming Operator of The Year" ในช่วงปี
                        2009 และ 2010
                        ซึ่งตอกย้ำถึงความเป็นผู้นำในอุตสาหกรรมเกมออนไลน์
                      </p>

                      <h2 className="text-xl font-semibold text-black text-left mb-3 mt-6">
                        ใบอนุญาตดำเนินงานและความน่าเชื่อถือในตลาดเดิมพัน
                      </h2>
                      <p className="mb-4">
                        หนึ่งในปัจจัยสำคัญที่ทำให้ FUN88
                        เป็นแพลตฟอร์มที่น่าเชื่อถือคือ
                        ใบอนุญาตดำเนินงานที่ถูกต้องตามกฎหมาย
                        ซึ่งช่วยให้ผู้เล่นมั่นใจในการวางเดิมพันทุกครั้ง
                      </p>
                      <p className="mb-4">
                        <strong>ฟัน88</strong> ดำเนินการโดย Omega Sports
                        Solutions N.V. ซึ่งเป็นบริษัทที่จดทะเบียนภายใต้กฎหมายของ
                        Curaçao โดยมีหมายเลขบริษัท 167239 และได้รับ{' '}
                        <strong>ใบอนุญาตดำเนินงานที่ถูกต้อง</strong>
                      </p>
                      <p className="mb-4">
                        นอกจากนี้ Omega Sports Solutions N.V.
                        กำลังอยู่ระหว่างการขอใบอนุญาตการพนันฉบับใหม่กับ Curaçao
                        Gaming Control Board ซึ่งเป็นหน่วยงานกำกับดูแลหลักของ
                        Curaçao จนกว่ากระบวนการขอใบอนุญาตจะเสร็จสมบูรณ์
                        บริษัทได้รับอนุญาตให้ดำเนินกิจการต่อไปตามเงื่อนไขที่กำหนดในกฎหมายที่เกี่ยวข้อง
                      </p>

                      <h2 className="text-xl font-semibold text-black text-left mb-3 mt-6">
                        ผลิตภัณฑ์การเดิมพันที่ FUN88 ให้บริการ
                      </h2>
                      <p className="mb-4">
                        FUN88 ไม่เพียงแต่เสนอการเดิมพันกีฬาเท่านั้น
                        แต่ยังมีผลิตภัณฑ์อื่น ๆ ที่น่าสนใจอีกมากมาย
                        ซึ่งตอบโจทย์ผู้เล่นในหลากหลายกลุ่ม
                        ตั้งแต่นักเดิมพันทั่วไปจนถึงนักพนันมืออาชีพ
                      </p>

                      <h3 className="text-lg font-semibold text-black text-left mb-2 mt-4">
                        เดิมพันกีฬา
                      </h3>
                      <p className="mb-4">
                        การเดิมพันกีฬาที่ <strong>FUN88 Thailand</strong>{' '}
                        นั้นมีความหลากหลาย ครอบคลุมการแข่งขันที่สำคัญทั่วโลก
                        ทั้งฟุตบอล เทนนิส บาสเกตบอล และกีฬาอื่น ๆ
                        โดยเฉพาะฟุตบอลที่ถือเป็นกีฬายอดฮิตในประเทศไทย
                      </p>
                      <p className="mb-4">
                        <strong>FUN88 sports</strong>{' '}
                        เสนอทางเลือกในการเดิมพันที่หลากหลาย เช่น
                        การเดิมพันก่อนการแข่งขัน, การเดิมพันสด,
                        และการเดิมพันในรูปแบบต่าง ๆ
                        ที่ช่วยเพิ่มความน่าสนใจให้กับผู้เล่น
                        และยังมีอัตราต่อรองที่เป็นธรรมและแข่งขันได้ในตลาด
                      </p>

                      <h3 className="text-lg font-semibold text-black text-left mb-2 mt-4">
                        เดิมพัน eSports
                      </h3>
                      <p className="mb-4">
                        <strong>เดิมพัน อี สปอร์ต</strong>{' '}
                        กำลังเป็นที่นิยมมากขึ้นในหมู่นักเดิมพัน โดย FUN88
                        มีกิจกรรมการเดิมพันในทัวร์นาเมนต์ที่สำคัญ เช่น CS:GO,
                        Dota 2, League of Legends และอื่น ๆ
                        ซึ่งช่วยให้ผู้เล่นสามารถเข้าร่วมกิจกรรมที่สนุกสนานนี้ได้
                      </p>
                      <p className="mb-4">
                        การเดิมพันใน eSports
                        ไม่ได้มีแค่ความตื่นเต้นเพียงเท่านั้น
                        ยังมีโอกาสในการชนะที่สูง
                        เนื่องจากสถิติและข้อมูลการเล่นในเกมนั้น ๆ
                        สามารถนำมาวิเคราะห์ได้
                        ทำให้ผู้เล่นสามารถตัดสินใจเดิมพันได้อย่างชาญฉลาด
                      </p>
                      <p className="mb-4">
                        ดาวน์โหลดแอปพลิเคชัน <strong>FUN88 App</strong>{' '}
                        ได้แล้ววันนี้ เพื่อสัมผัสประสบการณ์การเดิมพัน eSports
                        ที่ดีที่สุด พร้อมลุ้นรับโปรโมชั่นสุดพิเศษมากมาย
                      </p>

                      <h3 className="text-lg font-semibold text-black text-left mb-2 mt-4">
                        เกมสปีด
                      </h3>
                      <p className="mb-4">
                        <strong>เกมสปีด</strong> ที่ FUN88
                        ถูกออกแบบมาเพื่อให้ผู้เล่นได้สัมผัสความเร็วในการเล่น
                        โดยมีรูปแบบเกมที่รวดเร็วและเข้าใจง่าย เช่น
                        เกมรูเล็ตหรือลอตเตอรี่ที่มีรอบการเล่นสั้น
                        ผู้เล่นสามารถวางเดิมพันและรับผลลัพธ์ได้อย่างรวดเร็ว
                        ซึ่งเหมาะกับคนที่ไม่อยากรอนาน
                      </p>

                      <h3 className="text-lg font-semibold text-black text-left mb-2 mt-4">
                        คาสิโนสด
                      </h3>
                      <p className="mb-4">
                        <strong>คาสิโน สด</strong> ที่ FUN88
                        ต้องการให้ประสบการณ์การเล่นคาสิโนออนไลน์ที่สมจริงที่สุด
                        โดยผู้เล่นสามารถเข้ามาเล่นเกมยอดนิยมต่างๆ เช่น บาคาร่า
                        รูเล็ต แบล็คแจ็ค และซิคโบ ผ่านการถ่ายทอดสดจากคาสิโนจริง
                      </p>
                      <p className="mb-4">
                        การเล่น <strong>คาสิโนสด</strong> ที่ FUN88
                        ช่วยให้ผู้เล่นรู้สึกเหมือนอยู่ในบ่อนคาสิโนจริงๆ
                        มีดีลเลอร์สาวสวยและบรรยากาศที่เป็นกันเอง
                        ทำให้การเล่นมีความสนุกสนานและตื่นเต้นมากยิ่งขึ้น
                      </p>

                      <h3 className="text-lg font-semibold text-black text-left mb-2 mt-4">
                        สล็อต - ยิงปลา
                      </h3>
                      <p className="mb-4">
                        <strong>สล็อต เว็บ ตรง</strong> และเกมยิงปลาที่ FUN88
                        ถือเป็นผลิตภัณฑ์ที่ได้รับความนิยมสูง
                        โดยเฉพาะเกมสล็อตที่มีธีมหลากหลายและกราฟิกที่สวยงาม
                        พร้อมแจ็กพอตที่มีมูลค่าสูง
                      </p>
                      <p className="mb-4">
                        ไม่เพียงแค่ความสนุกในการเล่น
                        แต่ผู้เล่นยังมีโอกาสในการชนะรางวัลใหญ่อยู่เสมอ และ FUN88
                        ยังมีระบบโบนัสที่ช่วยเพิ่มโอกาสในการชนะให้กับผู้เล่นด้วย
                      </p>

                      <h3 className="text-lg font-semibold text-black text-left mb-2 mt-4">
                        เกม 3 มิติ
                      </h3>
                      <p className="mb-4">
                        <strong>เกม 3 มิติ</strong>{' '}
                        เป็นนวัตกรรมใหม่ที่ยกระดับประสบการณ์การเดิมพันให้เหนือชั้นกว่าคาสิโนออนไลน์แบบดั้งเดิม
                        ด้วยเทคโนโลยีกราฟิกสามมิติที่ทันสมัย
                        ผู้เล่นจะได้สัมผัสกับบรรยากาศของคาสิโนเสมือนจริงที่มีความสมจริงทั้งภาพและเสียง
                        ไม่ว่าจะเป็นการเล่นเกมไพ่ยอดนิยมอย่างบาคาร่า แบล็คแจ็ค
                        หรือรูเล็ต เกม 3 มิติ
                        จะมอบประสบการณ์ที่คล้ายคลึงกับการนั่งเล่นในคาสิโนจริง
                      </p>
                      <p className="mb-4">
                        จุดเด่นของ <strong>เกม 3 มิติ</strong>{' '}
                        คือความสามารถในการโต้ตอบกับเกมและผู้เล่นคนอื่น ๆ
                        ได้อย่างลื่นไหล
                        ทำให้การเล่นมีชีวิตชีวาและเพิ่มอรรถรสในการวางเดิมพัน
                        อีกทั้งยังมีฟีเจอร์พิเศษ เช่น การเปลี่ยนมุมมองโต๊ะ
                        การเลือกตัวละคร
                        หรือการออกแบบห้องเดิมพันตามสไตล์ของผู้เล่นเอง
                      </p>

                      <h3 className="text-lg font-semibold text-black text-left mb-2 mt-4">
                        หวย
                      </h3>
                      <p className="mb-4">
                        การเดิมพัน <strong>หวย</strong>{' '}
                        ก็ถือเป็นอีกหนึ่งบริการที่ FUN88 มีให้ รวมถึงหวยไทย
                        หวยเวียดนาม หวยลาว และหวยหุ้น
                        ซึ่งเป็นที่นิยมในหมู่นักเดิมพันที่ชื่นชอบการเสี่ยงโชค
                      </p>
                      <p className="mb-4">
                        FUN88 ยังมีหวยสปีดและ FAST 3
                        ที่ให้ผู้เล่นสามารถลุ้นโชคได้ในเวลาที่รวดเร็ว
                        การเล่นหวยที่ FUN88 นอกจากจะสนุกแล้ว
                        ยังมีโอกาสในการถูกรางวัลสูง
                        และระบบการจ่ายเงินที่เร็วทันใจ
                      </p>
                      <p className="mb-4">
                        เข้าสู่เว็บไซต์ FUN88 วันนี้เพื่อสัมผัสประสบการณ์{' '}
                        <strong>คาสิโน sport online</strong> ที่ดีที่สุด!
                      </p>

                      <h2 className="text-xl font-semibold text-black text-left mb-3 mt-6">
                        จุดเด่นของ FUN88
                      </h2>
                      <p className="mb-4">
                        FUN88
                        มีจุดเด่นหลายประการที่ทำให้ผู้เล่นจำนวนมากเลือกใช้บริการแพลตฟอร์มนี้
                        ซึ่งไม่เพียงแต่ให้บริการที่ครบครัน
                        แต่ยังมุ่งเน้นการให้ประสบการณ์ที่ดีที่สุดแก่ผู้เล่น
                      </p>

                      <h3 className="text-lg font-semibold text-black text-left mb-2 mt-4">
                        เว็บไซต์และแอปพลิเคชันที่ใช้งานง่ายและเป็นมิตรกับผู้ใช้
                      </h3>
                      <p className="mb-4">
                        เว็บไซต์ของ FUN88 ถูกออกแบบมาให้ใช้งานได้ง่าย
                        ไม่ว่าจะเป็นผู้ที่มีประสบการณ์หรือไม่มีประสบการณ์ก็สามารถเข้าถึงและใช้งานได้อย่างสะดวกสบาย
                      </p>
                      <p className="mb-4">
                        นอกจากนี้ FUN88
                        ยังพัฒนาแอปพลิเคชันที่สามารถดาวน์โหลดลงบนมือถือ
                        ซึ่งช่วยให้ผู้เล่นสามารถเดิมพันได้ทุกที่ทุกเวลา
                        โดยไม่ต้องเปิดคอมพิวเตอร์
                      </p>

                      <h3 className="text-lg font-semibold text-black text-left mb-2 mt-4">
                        อัตราต่อรองและโบนัสที่น่าสนใจ อัปเดตอย่างรวดเร็ว
                      </h3>
                      <p className="mb-4">
                        FUN88 เสนออัตราต่อรองที่แข่งขันได้และมีความยุติธรรม
                        แถมยังมีการอัปเดตอย่างรวดเร็วในทุกสถานการณ์
                        ทำให้ผู้เล่นไม่พลาดโอกาสในการทำกำไร
                      </p>
                      <p className="mb-4">
                        โบนัสและโปรโมชั่นก็ถือเป็นอีกหนึ่งจุดเด่นของ FUN88
                        ที่ผู้เล่นไม่ควรพลาด โดย FUN88 มักจะมีโปรโมชั่นใหม่ ๆ
                        ออกมาให้สมาชิกทุกวัน
                        ซึ่งช่วยเพิ่มความน่าสนใจให้กับการเล่น
                      </p>

                      <h3 className="text-lg font-semibold text-black text-left mb-2 mt-4">
                        บริการลูกค้าตลอด 24 ชั่วโมง ผ่านหลายช่องทาง
                      </h3>
                      <p className="mb-4">
                        การบริการลูกค้าเป็นสิ่งสำคัญที่ FUN88 ให้ความสำคัญ
                        ทีมงานบริการลูกค้าพร้อมให้บริการตลอด 24 ชั่วโมง
                        ผ่านช่องทางต่าง ๆ เช่น แชทสด โทรศัพท์ และอีเมล
                      </p>
                      <p className="mb-4">
                        ไม่ว่าจะเป็นคำถามทั่วไป การฝากเงิน หรือปัญหาที่เกิดขึ้น
                        ผู้เล่นสามารถติดต่อทีมงานได้อย่างรวดเร็วและสะดวกสบาย
                        เพื่อให้การเล่นพนันเป็นไปอย่างราบรื่นที่สุด
                      </p>

                      <h3 className="text-lg font-semibold text-black text-left mb-2 mt-4">
                        ความปลอดภัยของข้อมูลผู้เล่น และการทำธุรกรรมที่มั่นคง
                      </h3>
                      <p className="mb-4">
                        FUN88
                        ให้ความสำคัญกับความปลอดภัยของข้อมูลส่วนตัวของผู้เล่น
                        โดยใช้ระบบการเข้ารหัสล่าสุด
                        ซึ่งช่วยป้องกันข้อมูลจากการถูกโจรกรรม
                      </p>
                      <p className="mb-4">
                        การทำธุรกรรมทางการเงินก็เป็นไปอย่างรวดเร็วและปลอดภัย
                        ผู้เล่นสามารถฝากถอนเงินได้โดยไม่ต้องกังวลเรื่องความเสี่ยง
                      </p>

                      <h3 className="text-lg font-semibold text-black text-left mb-2 mt-4">
                        โปรโมชั่นและโบนัสสุดพิเศษสำหรับสมาชิกใหม่และเก่า
                      </h3>
                      <p className="mb-4">
                        FUN88
                        มีโปรโมชั่นและโบนัสที่น่าสนใจสำหรับทั้งสมาชิกใหม่และสมาชิกเก่า
                        ซึ่งช่วยเพิ่มโอกาสในการทำกำไร
                      </p>
                      <p className="mb-4">
                        โปรโมชั่นเหล่านี้รวมถึงโบนัสต้อนรับ โบนัสฝากเงินครั้งแรก
                        และโปรโมชั่นคืนเงิน
                        ซึ่งเป็นสิ่งที่ทำให้ผู้เล่นรู้สึกคุ้มค่าทุกครั้งที่เข้าเล่น
                      </p>

                      <h2 className="text-xl font-semibold text-black text-left mb-3 mt-6">
                        บทสรุป
                      </h2>
                      <p className="mb-4">
                        จากข้อมูลและจุดเด่นของ FUN88 ที่เราได้นำเสนอในบทความนี้
                        จะเห็นได้ว่า FUN88
                        เป็นแพลตฟอร์มการเดิมพันออนไลน์ที่น่าสนใจและครบวงจร
                        ด้วยประสบการณ์การใช้งานที่ผู้เล่นจะได้รับ ทำให้ FUN88
                        ยังคงเติบโตอย่างต่อเนื่องในวงการนี้
                        หากคุณกำลังมองหาแพลตฟอร์มที่ให้บริการที่หลากหลายและมีคุณภาพ
                        FUN88 อาจเป็นตัวเลือกที่เหมาะสมสำหรับคุณ อย่ารอช้า!{' '}
                        <strong>สมัคร</strong>{' '}
                        เพื่อสัมผัสประสบการณ์การเดิมพันออนไลน์ที่ดีที่สุดกับ
                        FUN88 ได้แล้ววันนี้!
                      </p>

                      <h2 className="text-xl font-semibold text-black text-left mb-3 mt-6">
                        FAQs
                      </h2>

                      <h3 className="text-lg font-semibold text-black text-left mb-2 mt-4">
                        FUN88 คืออะไร?
                      </h3>
                      <p className="mb-4">
                        FUN88
                        เป็นแพลตฟอร์มการเดิมพันออนไลน์ชั้นนำในเอเชียที่ให้บริการเกมเดิมพันหลากหลายรูปแบบ
                        เช่น กีฬา คาสิโนสด สล็อต และเกมยอดนิยมอื่น ๆ อีกมากมาย
                      </p>

                      <h3 className="text-lg font-semibold text-black text-left mb-2 mt-4">
                        FUN88 มีความน่าเชื่อถือหรือไม่?
                      </h3>
                      <p className="mb-4">
                        FUN88
                        ได้รับใบอนุญาตดำเนินงานที่ถูกต้องตามกฎหมายจากองค์กรกำกับดูแลที่มีชื่อเสียงระดับสากล
                        เช่น PAGCOR และ Isle of Man Gambling Supervision
                        Commission
                        ซึ่งยืนยันถึงความปลอดภัยและความโปร่งใสในการให้บริการ
                      </p>

                      <h3 className="text-lg font-semibold text-black text-left mb-2 mt-4">
                        FUN88 มีเกมเดิมพันอะไรบ้าง?
                      </h3>
                      <p className="mb-4">
                        FUN88 มีเกมเดิมพันให้เลือกมากมาย เช่น
                      </p>
                      <ul className="list-disc list-inside mb-4 space-y-1">
                        <li>การเดิมพันกีฬา (ฟุตบอล, บาสเกตบอล, เทนนิส)</li>
                        <li>คาสิโนสด (บาคาร่า, รูเล็ต, แบล็คแจ็ค)</li>
                        <li>สล็อตและเกมยิงปลา</li>
                        <li>เกม 3 มิติ</li>
                        <li>หวย (ไทย, เวียดนาม, ลาว)</li>
                        <li>eSports</li>
                        <li>เกมสปีด</li>
                      </ul>

                      <h3 className="text-lg font-semibold text-black text-left mb-2 mt-4">
                        จะฝากเงินเข้าบัญชี FUN88 ได้อย่างไร?
                      </h3>
                      <p className="mb-4">
                        <strong>FUN88 Thailand</strong>{' '}
                        มีวิธีการฝากเงินที่หลากหลายให้เลือก เช่น
                        โอนเงินผ่านธนาคาร บัตรเครดิต/เดบิต และ e-wallets
                        คุณสามารถดูรายละเอียดเพิ่มเติมและเลือกวิธีการที่สะดวกได้ในหน้า
                        "ฝากเงิน" หลังจากล็อกอินเข้าสู่ระบบแล้ว อย่ารอช้า!
                        คลิกที่นี่ เพื่อ <strong>"ฝากเงินทันที"</strong>{' '}
                        และเริ่มสัมผัสประสบการณ์การเดิมพันที่เหนือกว่ากับ FUN88
                        ได้แล้ววันนี้!
                      </p>

                      <h3 className="text-lg font-semibold text-black text-left mb-2 mt-4">
                        จะติดต่อเจ้าหน้าที่ได้อย่างไรหากมีปัญหา?
                      </h3>
                      <p className="mb-6">
                        FUN88 มีช่องทางการติดต่อหลากหลาย เช่น แชทสด อีเมล
                        หรือโทรศัพท์ ข้อมูลการติดต่อสามารถดูได้ที่หน้า
                        "ติดต่อเรา" หรือ "ศูนย์ช่วยเหลือ"
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Footer */}
      {/* <Footer /> */}

      {/* Mobile Navigation */}
      {/* <MobileNavigation
        onLoginClick={() => {
          setAuthModalTab('login')
          setShowAuthModal(true)
        }}
        onRegisterClick={() => {
          setAuthModalTab('register')
          setShowAuthModal(true)
        }}
      /> */}
      {/* Show game frame when in game mode */}
      {gameContext.showGame && (
        <GameFrame
          gameUrl={gameContext.gameUrl}
          onClose={handleCloseGame}
          isClosing={gameContext.isClosingGame}
        />
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={(user, token) => {
          if (onLogin) {
            onLogin(user, token)
          }
          setShowAuthModal(false)
        }}
        initialTab={authModalTab}
      />
    </div>
  )
}
