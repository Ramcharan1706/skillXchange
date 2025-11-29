import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Features from './components/Features'
import SkillList from './components/SkillList'
import UserProfile from './components/UserProfile'
import BookingModal from './components/BookingModal'
import ReviewModal from './components/ReviewModal'
import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { SkillSwapClient } from './contracts/SkillSwap'
import { getAlgodConfigFromViteEnvironment, getIndexerConfigFromViteEnvironment } from './utils/network/getAlgoClientConfigs'

const Home: React.FC = () => {
  const { role, userName } = useAuth()
  const navigate = useNavigate()
  const [openBookingModal, setOpenBookingModal] = useState(false)
  const [openFeedbackModal, setOpenFeedbackModal] = useState(false)
  const [selectedSkillId, setSelectedSkillId] = useState<number | null>(null)
  const [selectedSkillRate, setSelectedSkillRate] = useState<number>(0)
  const [selectedSlot, setSelectedSlot] = useState<{ slot: string; link: string } | null>(null)
  const [feedbackSkillId, setFeedbackSkillId] = useState<number | null>(null)
  const [bookedSlots, setBookedSlots] = useState<{ skillId: number; slot: string }[]>([])
  const [algorandClient, setAlgorandClient] = useState<AlgorandClient | null>(null)
  const [appClient, setAppClient] = useState<SkillSwapClient | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // -------------------------------
  // 🔹 Initialize Algorand client and app client
  // -------------------------------
  useEffect(() => {
    const initClients = async () => {
      try {
        const algodConfig = getAlgodConfigFromViteEnvironment()
        const indexerConfig = getIndexerConfigFromViteEnvironment()
        const algorand = AlgorandClient.fromConfig({ algodConfig, indexerConfig })
        setAlgorandClient(algorand)

        const appId = process.env.VITE_SKILL_SWAP_APP_ID || '123456789'
        const client = new SkillSwapClient({ appId: Number(appId), algorand })
        setAppClient(client)
      } catch (error) {
        console.error('Failed to initialize clients:', error)
      }
    }
    initClients()
  }, [])

  // -------------------------------
  // 🔹 UI Event Handlers
  // -------------------------------

  const openBooking = useCallback((skillId: number, skillRate: number, selectedSlot: { slot: string; link: string }) => {
    setSelectedSkillId(skillId)
    setSelectedSkillRate(skillRate)
    setSelectedSlot(selectedSlot)
    setOpenBookingModal(true)
  }, [])

  const handleBookingSuccess = useCallback((skillId: number, slot: string) => {
    setBookedSlots(prev => [...prev, { skillId, slot }])
  }, [])

  const closeBooking = useCallback(() => {
    setOpenBookingModal(false)
    setSelectedSkillId(null)
    setSelectedSkillRate(0)
    setSelectedSlot(null)
  }, [])

  const openFeedback = useCallback((skillId: number) => {
    setFeedbackSkillId(skillId)
    setOpenFeedbackModal(true)
  }, [])

  const closeFeedback = useCallback(() => {
    setOpenFeedbackModal(false)
    setFeedbackSkillId(null)
  }, [])

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  // Registration is now handled in RegisterPage, so this callback is no longer needed
  // Users are assumed to be registered when they reach Home

  // -------------------------------
  // 🔹 Derived Values (Memoized)
  // -------------------------------
  // Simplified - always connected since no wallet required
  const isConnected = true

  // -------------------------------
  // 🔹 Render Logic
  // -------------------------------
  const renderHeader = () => (
    <header className="navbar">
      <div className="navbar-content container">
        <div className="navbar-brand">
          🎨 SkillXchange
        </div>
        <nav className="navbar-nav">
          <a href="#home" className="nav-link active">Home</a>
          <a href="#skills" className="nav-link">Skills</a>
          <a href="#mentors" className="nav-link">Mentors</a>
          <a href="#dashboard" className="nav-link">Dashboard</a>
        </nav>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-semibold text-white">🌟 Welcome</p>
            <p className="text-xs text-muted font-mono">
              {userName || 'User'}
            </p>
          </div>
        </div>
      </div>
    </header>
  )

  const renderHero = () => (
    <section className="hero">
      <div className="container">
        <h2 className="hero-title">
          🌈 SkillXchange Platform
        </h2>
        <p className="hero-subtitle">
          🎯 Swap skills. Earn tokens. Build on-chain reputation.
        </p>
        <p className="text-muted text-lg md:text-xl mb-8 px-8 font-medium">
          Join thousands of learners and teachers in the most vibrant skill-sharing platform on blockchain.
        </p>
        <div className="hero-cta">
          <button className="btn btn-primary btn-lg">
            🚀 Get Started
          </button>
          <button className="btn btn-secondary btn-lg">
            🎨 Browse Skills
          </button>
        </div>
      </div>
    </section>
  )

  // Removed renderLoading since no wallet initialization needed

  const renderMainApp = () => (
    <section className="py-16" style={{ background: 'var(--color-neutral-900)' }}>
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="card">
              {appClient && <UserProfile appClient={appClient} />}
            </div>
          </div>
          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="card">
              <div className="card-header">
                <h2 className="card-title text-center">
                  🎨 Available Skills
                </h2>
              </div>
              {algorandClient && <SkillList onBookSkill={openBooking} onOpenReviewModal={openFeedback} algorandClient={algorandClient} userAddress={userName} bookedSlots={bookedSlots} searchQuery={searchQuery} />}
            </div>
          </div>
        </div>
      </div>
    </section>
  )

  const renderFooter = () => (
    <footer className="py-12 text-center" style={{ background: 'var(--color-neutral-900)' }}>
      <div className="container">
        <p className="text-xl md:text-2xl font-bold text-white mb-4">🎉 Welcome to SkillXchange - Where Learning Meets Blockchain ✨</p>
        <p className="text-muted text-lg md:text-xl font-medium">
          Empowering peer-to-peer skill exchange worldwide 🌍
        </p>
      </div>
    </footer>
  )

  // -------------------------------
  // 🔹 Final Render
  // -------------------------------
  return (
    <main className="min-h-screen text-white font-sans relative overflow-hidden flex flex-col">
      <Navbar onSearch={handleSearch} />

      <div className="flex-1 flex flex-col justify-center relative z-10 space-y-16">
        <Hero />
        <Features />
        {renderMainApp()}
      </div>

      {renderFooter()}

      {/* Modals */}
      {selectedSkillId !== null && openBookingModal && selectedSlot && algorandClient && (
        <BookingModal
          openModal={openBookingModal}
          setModalState={(value: boolean) => {
            closeBooking()
            if (!value) {
              // Booking completed, open review modal after a short delay
              setTimeout(() => {
                openFeedback(selectedSkillId!)
              }, 1000)
            }
          }}
          skillId={selectedSkillId}
          initialSkillRate={selectedSkillRate}
          selectedSlot={selectedSlot}
          algorand={algorandClient}
          activeAddress={userName}
          onBookingSuccess={handleBookingSuccess}
        />
      )}
      {feedbackSkillId !== null && openFeedbackModal && (
        <ReviewModal
          skillId={feedbackSkillId}
          onClose={closeFeedback}
          onSubmit={(skillId: number, review: { rating: number; comment: string }) => {
            // Review submission is handled in SkillList component
            closeFeedback()
          }}
        />
      )}
    </main>
  )
}

export default Home
