import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useSnackbar } from 'notistack'
import Navbar from '../components/Navbar'
import SkillList from '../components/SkillList'
import ReviewModal from '../components/ReviewModal'
import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { getAlgodConfigFromViteEnvironment, getIndexerConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'
import { searchSkills } from '../utils/search'
import { Skill, Feedback } from '../types'

const SkillsPage: React.FC = () => {
  const { userName } = useAuth()
  const navigate = useNavigate()
  const [algorandClient, setAlgorandClient] = useState<AlgorandClient | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [bookedSlots, setBookedSlots] = useState<{ skillId: number; slot: string }[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewModal, setReviewModal] = useState<{
    skillId: number
    isOpen: boolean
    skill?: Skill
    mode: 'submit' | 'view'
  }>({ skillId: 0, isOpen: false, mode: 'view' })

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

  // Fetch skills (mock)
  const fetchSkills = async () => {
    setLoading(true)
    try {
      const mockSkills: Skill[] = [
        {
          id: 1,
          name: 'React Development Workshop',
          description: 'Learn React with hooks and modern practices.',
          teacher: 'ALICE1234567890123456789012345678901234567890',
          receiver: 'ALICE1234567890123456789012345678901234567890',
          rate: 25,
          category: 'Programming',
          level: 'Intermediate',
          sessionsCompleted: 12,
          rating: 4.3,
          availability: [
            { slot: 'Monday 10 AM', link: 'https://meet.google.com/abc-defg-hij' },
            { slot: 'Wednesday 2 PM', link: 'https://meet.google.com/klm-nopq-rst' },
          ],
          feedbacks: [
            { id: 1, student: 'BOB123...', rating: 5, comment: 'Excellent session!', date: '2024-01-10' },
          ],
        },
        {
          id: 2,
          name: 'Python for Beginners',
          description: 'Start your Python journey from scratch.',
          teacher: 'BOB1234567890123456789012345678901234567890',
          receiver: 'BOB1234567890123456789012345678901234567890',
          rate: 15,
          category: 'Programming',
          level: 'Beginner',
          sessionsCompleted: 8,
          rating: 4.5,
          availability: [
            { slot: 'Tuesday 3 PM', link: 'https://meet.google.com/xyz-abcd-efg' },
          ],
          feedbacks: [],
        },
      ]
      setSkills(mockSkills)
    } catch {
      console.error('Failed to fetch skills.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSkills()
  }, [])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const filteredSkills = useMemo(() => {
    return searchSkills(skills, searchQuery)
  }, [skills, searchQuery])

  const handleBookSkill = (skillId: number, skillRate: number, selectedSlot: { slot: string; link: string }) => {
    setBookedSlots(prev => [...prev, { skillId, slot: selectedSlot.slot }])
  }

  const handleOpenReviewModal = (skillId: number, skill?: Skill, mode: 'submit' | 'view' = 'view') => {
    setReviewModal({ skillId, isOpen: true, skill, mode })
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
                  {searchQuery.trim()
                    ? `Found ${filteredSkills.length} skill${filteredSkills.length !== 1 ? 's' : ''} matching "${searchQuery}"`
                    : `Browse and book skills from our community of experts (${skills.length} total)`
                  }
                </p>
              </div>
              {loading ? (
                <p className="center-content text-lg py-8">Loading skills...</p>
              ) : (
                algorandClient && (
                  <SkillList
                    onBookSkill={handleBookSkill}
                    onOpenReviewModal={handleOpenReviewModal}
                    algorandClient={algorandClient}
                    userAddress={userName}
                    bookedSlots={bookedSlots}
                    searchQuery={searchQuery}
                    skills={filteredSkills}
                    setSkills={setSkills}
                  />
                )
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Review Modal */}
      {reviewModal.isOpen && (
        <ReviewModal
          skillId={reviewModal.skillId}
          skill={reviewModal.skill}
          mode={reviewModal.mode}
          onClose={() => setReviewModal({ skillId: 0, isOpen: false, mode: 'view' })}
          onSubmit={async (skillId: number, review: { rating: number; comment: string }) => {
            console.log('Review submitted:', skillId, review)
            setReviewModal({ skillId: 0, isOpen: false, mode: 'view' })
          }}
        />
      )}
    </main>
  )
}

export default SkillsPage
