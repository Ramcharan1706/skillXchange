import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../components/Navbar'
import SkillList from '../components/SkillList'
import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { getAlgodConfigFromViteEnvironment, getIndexerConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'

const SkillsPage: React.FC = () => {
  const { userName } = useAuth()
  const navigate = useNavigate()
  const [algorandClient, setAlgorandClient] = useState<AlgorandClient | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [bookedSlots, setBookedSlots] = useState<{ skillId: number; slot: string }[]>([])

  useEffect(() => {
    const initClients = async () => {
      try {
        const algodConfig = getAlgodConfigFromViteEnvironment()
        const indexerConfig = getIndexerConfigFromViteEnvironment()
        const algorand = AlgorandClient.fromConfig({ algodConfig, indexerConfig })
        setAlgorandClient(algorand)
      } catch (error) {
        console.error('Failed to initialize clients:', error)
      }
    }
    initClients()
  }, [])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleBookSkill = (skillId: number, skillRate: number, selectedSlot: { slot: string; link: string }) => {
    // Handle booking logic
    console.log('Booking skill:', skillId, skillRate, selectedSlot)
    setBookedSlots(prev => [...prev, { skillId, slot: selectedSlot.slot }])
  }

  const handleOpenReviewModal = (skillId: number) => {
    // Handle review modal opening
  }

  return (
    <main className="min-h-screen text-white font-sans relative overflow-hidden flex flex-col">
      <Navbar onSearch={handleSearch} />

      <div className="flex-1 flex flex-col justify-center relative z-10 space-y-16 py-16">
        <section className="py-16" style={{ background: 'var(--color-neutral-900)' }}>
          <div className="container">
            <div className="card">
              <div className="card-header">
                <h2 className="card-title text-center">
                  🎨 All Available Skills
                </h2>
                <p className="text-muted text-center mt-2">
                  Browse and book skills from our community of experts
                </p>
              </div>
              {algorandClient && (
                <SkillList
                  onBookSkill={handleBookSkill}
                  onOpenReviewModal={handleOpenReviewModal}
                  algorandClient={algorandClient}
                  userAddress={userName}
                  bookedSlots={bookedSlots}
                  searchQuery={searchQuery}
                />
              )}
            </div>
          </div>
        </section>


      </div>
    </main>
  )
}

export default SkillsPage
