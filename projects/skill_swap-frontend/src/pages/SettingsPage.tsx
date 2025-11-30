import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../components/Navbar'

const SettingsPage: React.FC = () => {
  const { userName } = useAuth()
  const navigate = useNavigate()
  const [settings, setSettings] = useState({
    notifications: true,
    emailUpdates: false,
    theme: 'dark',
    language: 'en'
  })

  const handleSettingChange = (key: string, value: boolean | string) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    // In a real app, this would save to backend
    alert('Settings saved successfully!')
  }

  return (
    <main className="min-h-screen text-white font-sans relative overflow-hidden flex flex-col">
      <Navbar />

      <div className="flex-1 flex flex-col justify-center relative z-10 py-16">
        <section className="py-16" style={{ background: 'var(--color-neutral-900)' }}>
          <div className="container max-w-2xl">
            <div className="card">
              <div className="card-header">
                <h2 className="card-title text-center">
                  ⚙️ Settings
                </h2>
                <p className="text-muted text-center mt-2">
                  Customize your SkillXchange experience
                </p>
              </div>

              <div className="p-8 space-y-8">
                {/* Profile Section */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white">Profile</h3>
                  <div className="bg-blue-800/10 p-4 rounded-lg border border-blue-800/30">
                    <p className="text-sm text-gray-400">Wallet Address</p>
                    <p className="font-mono text-sm break-all text-white">
                      {userName || 'Not connected'}
                    </p>
                  </div>
                </div>

                {/* Notifications */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white">Notifications</h3>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between">
                      <span className="text-white">Push Notifications</span>
                      <input
                        type="checkbox"
                        checked={settings.notifications}
                        onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                        className="toggle toggle-primary"
                      />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-white">Email Updates</span>
                      <input
                        type="checkbox"
                        checked={settings.emailUpdates}
                        onChange={(e) => handleSettingChange('emailUpdates', e.target.checked)}
                        className="toggle toggle-primary"
                      />
                    </label>
                  </div>
                </div>

                {/* Appearance */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white">Appearance</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Theme</label>
                      <select
                        value={settings.theme}
                        onChange={(e) => handleSettingChange('theme', e.target.value)}
                        className="form-select w-full"
                      >
                        <option value="dark">Dark</option>
                        <option value="light">Light</option>
                        <option value="auto">Auto</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Language</label>
                      <select
                        value={settings.language}
                        onChange={(e) => handleSettingChange('language', e.target.value)}
                        className="form-select w-full"
                      >
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-6">
                  <button
                    onClick={handleSave}
                    className="btn btn-primary flex-1"
                  >
                    Save Settings
                  </button>
                  <button
                    onClick={() => navigate(-1)}
                    className="btn btn-outline"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default SettingsPage
