import React, { useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Notification } from '../types'

interface NavbarProps {
  onSearch?: (query: string) => void
}

const Navbar: React.FC<NavbarProps> = ({ onSearch }) => {
  const { userName } = useAuth()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  const [notifications] = useState<Notification[]>([
    {
      id: 1,
      type: 'session_request',
      title: 'New Session Request',
      message: 'Alice wants to book your React workshop',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      read: false
    },
    {
      id: 2,
      type: 'confirmation',
      title: 'Session Confirmed',
      message: 'Your Python session with Bob is confirmed for tomorrow',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      read: false
    },
    {
      id: 3,
      type: 'message',
      title: 'New Message',
      message: 'Charlie: Thanks for the great session!',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
      read: true
    }
  ])

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications])

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim() && onSearch) {
      onSearch(searchQuery)
    }
  }, [searchQuery, onSearch])

  const handleNotificationClick = useCallback((notification: Notification) => {
    console.log('Clicked notification:', notification)
    setShowNotifications(false)
  }, [])

  const handleProfileAction = useCallback((action: string) => {
    switch (action) {
      case 'profile':
        navigate('/profile')
        break
      case 'settings':
        navigate('/settings')
        break
      case 'logout':
        navigate('/')
        break
    }
    setShowProfileMenu(false)
  }, [navigate])

  const formatUserName = useCallback((name: string | null): string => {
    if (!name) return 'User'
    return `${name.slice(0, 22)}...${name.length > 44 ? name.slice(-4) : ''}`
  }, [])

  return (
    <nav className="navbar">
      <div className="navbar-content container">
        {/* Logo */}
        <div className="navbar-brand">
          🎨 SkillXchange
        </div>

        {/* Navigation Links */}
        <div className="navbar-nav">
          <button onClick={() => navigate('/home')} className="nav-link active">Home</button>
          <button onClick={() => navigate('/skills')} className="nav-link">Skills</button>
          <button onClick={() => navigate('/mentors')} className="nav-link">Mentors</button>
          <button onClick={() => navigate('/dashboard')} className="nav-link">Dashboard</button>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="hidden md:flex">
            <input
              type="text"
              placeholder="Search skills & mentors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input px-4 py-2 rounded-lg text-sm w-64 text-white bg-neutral-800"
              aria-label="Search"
            />
          </form>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="btn btn-ghost p-2 relative"
              aria-label="Notifications"
            >
              🔔
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-card border border-neutral-700 rounded-xl shadow-xl z-50">
                <div className="p-4 border-b border-neutral-700">
                  <h3 className="font-semibold text-white">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-muted">
                      No notifications
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`p-4 border-b border-neutral-700 hover:bg-neutral-800 cursor-pointer ${
                          !notification.read ? 'bg-neutral-800/50' : ''
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-white text-sm">
                              {notification.title}
                            </h4>
                            <p className="text-muted text-xs mt-1">
                              {notification.message}
                            </p>
                            <p className="text-muted text-xs mt-2">
                              {notification.timestamp.toLocaleString()}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-primary rounded-full ml-2"></div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 btn btn-ghost p-2"
              aria-label="User menu"
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                {userName ? userName.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="hidden md:block text-sm text-white">
                {userName || 'User'}
              </span>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-card border border-neutral-700 rounded-xl shadow-xl z-50">
                <div className="p-4 border-b border-neutral-700">
                  <div className="font-medium text-white text-sm">
                    <div className="font-mono text-xs break-all">
                      {userName ? `${userName.slice(0, 22)}` : 'User'}
                    </div>
                    <div className="font-mono text-xs break-all mt-1">
                      {userName ? `${userName.slice(22)}` : ''}
                    </div>
                  </div>
                  <p className="text-muted text-xs mt-2">Wallet Address</p>
                </div>
                <div className="py-2">
                  <button
                    onClick={() => handleProfileAction('profile')}
                    className="w-full text-left px-4 py-2 text-black hover:bg-neutral-800 transition-colors"
                  >
                    👤 View Profile
                  </button>
                  <button
                    onClick={() => handleProfileAction('settings')}
                    className="w-full text-left px-4 py-2 text-black hover:bg-neutral-800 transition-colors"
                  >
                    ⚙️ Settings
                  </button>
            <button
              onClick={() => handleProfileAction('logout')}
              className="w-full text-left px-4 py-2 text-black hover:bg-neutral-800 transition-colors"
            >
              🚪 Logout
            </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
