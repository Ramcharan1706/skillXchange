// src/pages/LoginPage.tsx
import React, { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, UserRole } from '../context/AuthContext'
import ConnectWallet from '../src/components/ConnectWallet'

const LoginPage: React.FC = () => {
  const { setRole, setUserName } = useAuth()
  const navigate = useNavigate()
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)

  const handleRoleSelect = useCallback(
    (role: UserRole) => {
      setRole(role)
      setUserName('') // reset username when role changes
      navigate('/register')
    },
    [setRole, setUserName, navigate]
  )

  return (
    <main className="login-shell">
      {/* Background gradient + blur orbs */}
      <div className="login-shell-bg">
        <div className="bg-orb orb-1" />
        <div className="bg-orb orb-2" />
        <div className="bg-orb orb-3" />
      </div>

      {/* Main layout */}
      <section className="login-grid">
        {/* Left: Hero / Brand side */}
        <div className="login-hero">
          <div className="login-brand">
            <div className="brand-logo-circle">
              <span className="brand-logo-emoji">⚡</span>
            </div>
            <span className="brand-name">SkillXchange</span>
          </div>

          <h1 className="hero-title">
            Trade <span className="hero-highlight">skills</span>, not fees.
          </h1>
          <p className="hero-subtitle">
            A peer-to-peer learning marketplace powered by Algorand. Discover mentors, become a
            teacher, or do both — all from a single decentralized profile.
          </p>

          <div className="hero-badges">
            <div className="hero-badge">
              <span>🧠</span> Learn from real people
            </div>
            <div className="hero-badge">
              <span>🌍</span> Global community
            </div>
            <div className="hero-badge">
              <span>🔒</span> Wallet-secured identity
            </div>
          </div>

          <div className="hero-footer">
            <div className="hero-avatars">
              <span className="avatar-dot avatar-dot-1" />
              <span className="avatar-dot avatar-dot-2" />
              <span className="avatar-dot avatar-dot-3" />
            </div>
            <p className="hero-footer-text">
              Thousands of sessions already exchanged on-chain.
            </p>
          </div>
        </div>

        {/* Right: Auth / Role selection card */}
        <div className="login-panel">
          <header className="panel-header">
            <p className="panel-kicker">Start in under 1 minute</p>
            <h2 className="panel-title">Sign in & choose your journey</h2>
            <p className="panel-subtitle">
              Connect your wallet, pick a role, and jump straight into live learning sessions.
            </p>
          </header>

          <button
            type="button"
            onClick={() => setIsWalletModalOpen(true)}
            aria-label="Connect Wallet"
            className="panel-wallet-btn"
          >
            <span className="wallet-icon">🪙</span>
            <span className="wallet-text">
              <span className="wallet-title">Connect Algorand Wallet</span>
              <span className="wallet-caption">Secure login · No passwords · No emails</span>
            </span>
          </button>

          <div className="panel-divider">
            <span className="divider-line" />
            <span className="divider-text">then choose your role</span>
            <span className="divider-line" />
          </div>

          <div className="role-grid">
            <button
              type="button"
              onClick={() => handleRoleSelect('teacher')}
              aria-label="Select Teacher Role"
              className="role-card role-card-teacher"
            >
              <div className="role-icon-wrap">
                <span className="role-emoji">👨‍🏫</span>
              </div>
              <div className="role-content">
                <h3 className="role-title">I&apos;m a Teacher</h3>
                <p className="role-description">
                  Host sessions, share your expertise, and earn reputation & on-chain rewards.
                </p>
                <ul className="role-list">
                  <li>📚 Create courses & 1:1 sessions</li>
                  <li>⭐ Build a verified on-chain profile</li>
                  <li>💸 Earn tokens or skill credits</li>
                </ul>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSelect('learner')}
              aria-label="Select Learner Role"
              className="role-card role-card-learner"
            >
              <div className="role-icon-wrap">
                <span className="role-emoji">🎓</span>
              </div>
              <div className="role-content">
                <h3 className="role-title">I&apos;m a Learner</h3>
                <p className="role-description">
                  Find mentors, join live workshops, and level up with real-world projects.
                </p>
                <ul className="role-list">
                  <li>🚀 Personalized learning paths</li>
                  <li>🤝 Direct access to mentors</li>
                  <li>🧾 Transparent on-chain reviews</li>
                </ul>
              </div>
            </button>
          </div>

          <footer className="panel-footer">
            <p className="panel-footer-text">
              ✨ Powered by <span className="panel-footer-highlight">Algorand Blockchain</span> ·
              Non-custodial · Gas-efficient.
            </p>
          </footer>
        </div>
      </section>

      <ConnectWallet
        openModal={isWalletModalOpen}
        closeModal={() => setIsWalletModalOpen(false)}
      />
    </main>
  )
}

export default LoginPage
