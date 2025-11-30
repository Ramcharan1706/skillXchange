import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../components/Navbar'
import MentorRegistrationForm from '../components/MentorRegistrationForm'
import MentorCard from '../components/MentorCard'
import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { getAlgodConfigFromViteEnvironment, getIndexerConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'

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

  const handleMentorRegistration = async (newMentor: Mentor) => {
    setLoading(true)
    try {
      // Add mentor to the registered mentors list
      setRegisteredMentors(prev => [...prev, newMentor])

      // Show success message
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
                  Connect with experienced mentors in various fields
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
                    {(() => {
                      const filteredMentors = registeredMentors.filter((mentor) => {
                        if (!searchQuery.trim()) return true
                        const query = searchQuery.toLowerCase()
                        return (
                          mentor.name.toLowerCase().includes(query) ||
                          mentor.expertise.some(skill => skill.toLowerCase().includes(query)) ||
                          mentor.bio.toLowerCase().includes(query) ||
                          mentor.email.toLowerCase().includes(query)
                        )
                      })

                      return filteredMentors.length > 0 ? (
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
                        <div className="text-center">
                          <p className="text-lg text-muted mb-4">
                            No mentors found matching "{searchQuery}"
                          </p>
                          <p className="text-sm text-gray-400">
                            Try searching for a different name, skill, or keyword.
                          </p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <p className="text-lg text-muted mb-4">
                            No mentors registered yet.
                          </p>
                          <p className="text-sm text-gray-400">
                            Be the first to register as a mentor and start sharing your expertise!
                          </p>
                        </div>
                      )
                    })()}
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
