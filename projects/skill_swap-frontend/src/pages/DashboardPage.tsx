import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../components/Navbar'
import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { getAlgodConfigFromViteEnvironment, getIndexerConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'

interface DashboardStats {
  totalSessions: number
  upcomingSessions: number
  completedSessions: number
  totalEarnings: number
  averageRating: number
}

interface RecentActivity {
  id: number
  type: 'session_booked' | 'session_completed' | 'payment_received'
  title: string
  description: string
  timestamp: Date
}

const DashboardPage: React.FC = () => {
  const { userName } = useAuth()
  const navigate = useNavigate()
  const [algorandClient, setAlgorandClient] = useState<AlgorandClient | null>(null)
  const [stats, setStats] = useState<DashboardStats>({
    totalSessions: 0,
    upcomingSessions: 0,
    completedSessions: 0,
    totalEarnings: 0,
    averageRating: 0
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initClient = async () => {
      try {
        const algodConfig = getAlgodConfigFromViteEnvironment()
        const indexerConfig = getIndexerConfigFromViteEnvironment()
        const algorand = AlgorandClient.fromConfig({ algodConfig, indexerConfig })
        setAlgorandClient(algorand)
      } catch (error) {
        console.error('Failed to initialize client:', error)
      }
    }
    initClient()
  }, [])

  useEffect(() => {
    // Mock dashboard data
    const mockStats: DashboardStats = {
      totalSessions: 24,
      upcomingSessions: 3,
      completedSessions: 21,
      totalEarnings: 450,
      averageRating: 4.6
    }
    setStats(mockStats)

    const mockActivity: RecentActivity[] = [
      {
        id: 1,
        type: 'session_booked',
        title: 'New Session Booked',
        description: 'React workshop with John Doe',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        id: 2,
        type: 'payment_received',
        title: 'Payment Received',
        description: '25 ALGO from Python session',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
      },
      {
        id: 3,
        type: 'session_completed',
        title: 'Session Completed',
        description: 'JavaScript fundamentals with Jane Smith',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      }
    ]
    setRecentActivity(mockActivity)
    setLoading(false)
  }, [])

  const handleSearch = (query: string) => {
    // Implement search functionality
    console.log('Searching dashboard for:', query)
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'session_booked': return '📅'
      case 'payment_received': return '💰'
      case 'session_completed': return '✅'
      default: return '📝'
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
                  📊 Your Dashboard
                </h2>
                <p className="text-muted text-center mt-2">
                  Track your progress and manage your sessions
                </p>
              </div>

              {loading ? (
                <p className="center-content text-lg">Loading dashboard...</p>
              ) : (
                <>
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    <div className="card card-centered">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-white">{stats.totalSessions}</p>
                        <p className="text-sm text-muted">Total Sessions</p>
                      </div>
                    </div>
                    <div className="card card-centered">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-white">{stats.upcomingSessions}</p>
                        <p className="text-sm text-muted">Upcoming</p>
                      </div>
                    </div>
                    <div className="card card-centered">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-white">{stats.completedSessions}</p>
                        <p className="text-sm text-muted">Completed</p>
                      </div>
                    </div>
                    <div className="card card-centered">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-white">{stats.totalEarnings} ALGO</p>
                        <p className="text-sm text-muted">Earnings</p>
                      </div>
                    </div>
                    <div className="card card-centered">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-white">⭐ {stats.averageRating}</p>
                        <p className="text-sm text-muted">Avg Rating</p>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="card">
                    <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                      {recentActivity.map(activity => (
                        <div key={activity.id} className="flex items-start gap-4 p-4 bg-neutral-800 rounded-lg">
                          <div className="text-2xl">{getActivityIcon(activity.type)}</div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-white">{activity.title}</h4>
                            <p className="text-muted text-sm">{activity.description}</p>
                            <p className="text-muted text-xs mt-1">
                              {activity.timestamp.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                    <button
                      onClick={() => navigate('/home')}
                      className="btn btn-primary btn-large"
                    >
                      🎨 Browse Skills
                    </button>
                    <button
                      onClick={() => navigate('/mentors')}
                      className="btn btn-secondary btn-large"
                    >
                      👨‍🏫 Find Mentors
                    </button>
                    <button
                      onClick={() => navigate('/skills')}
                      className="btn btn-info btn-large"
                    >
                      ➕ Register Skill
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default DashboardPage
