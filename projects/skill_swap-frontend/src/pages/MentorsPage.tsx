import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../components/Navbar'
import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { getAlgodConfigFromViteEnvironment, getIndexerConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'

const MentorsPage: React.FC = () => {
  const { userName } = useAuth()
  const navigate = useNavigate()
  const [algorandClient, setAlgorandClient] = useState<AlgorandClient | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

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
              <div className="p-8 text-center">
                <p className="text-lg text-muted">
                  Mentor profiles and connections coming soon!
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default MentorsPage
