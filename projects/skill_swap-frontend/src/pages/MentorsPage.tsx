import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../components/Navbar'
import MentorRegistrationForm from '../components/MentorRegistrationForm'
import MentorCard from '../components/MentorCard'
import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { getAlgodConfigFromViteEnvironment, getIndexerConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'
import { searchMentors } from '../utils/search'

interface Mentor {
  id: number
  name: string
  email: string
  expertise: string[]
  experience: string
  bio: string
  rate: number
  availability: string[]
  walletAddress: string
}

const MentorsPage: React.FC = () => {
  const { userName } = useAuth()
  const navigate = useNavigate()
  const [algorandClient, setAlgorandClient] = useState<AlgorandClient | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showRegistrationForm, setShowRegistrationForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [registeredMentors, setRegisteredMentors] = useState<Mentor[]>([])
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    const initClients = async () => {
      try {
        const algodConfig = getAlgodConfigFromViteEnvironment()
        const indexerConfig = getIndexerConfigFromViteEnvironment()
        const algorand = AlgorandClient.fromConfig({ algodConfig, indexerConfig })
        setAlgorandClient(algorand)
      } catch (error) {
        console.error('Failed to initialize clients:', error)
      } finally {
        setInitialLoading(false)
      }
    }
    initClients()
  }, [])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const filteredMentors = useMemo(() => {
    return searchMentors(registeredMentors, searchQuery)
  }, [registeredMentors, searchQuery])

  const handleMentorRegistration = async (newMentor: Mentor) => {
    setLoading(true)
    try {
      setRegisteredMentors(prev => [...prev, newMentor])
      alert('Mentor registration submitted successfully!')
      setShowRegistrationForm(false)
    } catch (error) {
      console.error('Error registering mentor:', error)
      alert('Error registering mentor. Please try again.')
    } finally {
      setLoading(false)
    }
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
                  👨‍🏫 Expert Mentors
                </h2>
                <p className="text-muted text-center mt-2">
                  {searchQuery.trim()
                    ? `Found ${filteredMentors.length} mentor${filteredMentors.length !== 1 ? 's' : ''} matching "${searchQuery}"`
                    : `Connect with experienced mentors in various fields (${registeredMentors.length} total)`
                  }
                </p>
              </div>
              <div className="p-8">
                {!showRegistrationForm ? (
                  <>
                    {/* Register Button */}
                    <div className="text-center mb-8">
                      <button
                        onClick={() => setShowRegistrationForm(true)}
                        className="btn btn-large bg-blue-800 hover:bg-blue-900 text-black px-8 py-3 rounded-full font-bold shadow-lg transform hover:scale-105 transition-all duration-300"
                      >
                        Register as Mentor
                      </button>
                    </div>

                    {/* Registered Mentors List */}
                    {initialLoading ? (
                      <p className="center-content text-lg py-8">Loading mentors...</p>
                    ) : filteredMentors.length > 0 ? (
                      <div className="space-y-6">
                        <h3 className="text-2xl font-bold text-white text-center mb-6">
                          {searchQuery.trim()
                            ? `Search Results (${filteredMentors.length} of ${registeredMentors.length})`
                            : `Registered Mentors (${registeredMentors.length})`
                          }
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {filteredMentors.map((mentor) => (
                            <MentorCard key={mentor.id} mentor={mentor} />
                          ))}
                        </div>
                      </div>
                    ) : registeredMentors.length > 0 ? (
                      <div className="text-center py-12">
                        <p className="text-lg text-muted mb-4">
                          No mentors found matching "{searchQuery}"
                        </p>
                        <p className="text-sm text-gray-400">
                          Try searching for a different name, skill, or keyword.
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-lg text-muted mb-4">
                          No mentors registered yet.
                        </p>
                        <p className="text-sm text-gray-400">
                          Be the first to register as a mentor and start sharing your expertise!
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <MentorRegistrationForm
                    onRegister={handleMentorRegistration}
                    loading={loading}
                    userAddress={userName || ''}
                  />
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default MentorsPage
