// src/pages/LoginPage.tsx
import React, { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, UserRole } from '../context/AuthContext'
import ConnectWallet from '../src/components/ConnectWallet'

const LoginPage: React.FC = () => {
  const { setRole, setUserName } = useAuth()
  const navigate = useNavigate()
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)

  /** ------------------------------------------------
   * 🧾 Handle role selection
   * ------------------------------------------------ */
  const handleRoleSelect = useCallback(
    (role: UserRole) => {
      setRole(role)
      setUserName('') // reset username when role changes
      navigate('/register')
    },
    [setRole, setUserName, navigate]
  )

  /** ------------------------------------------------
   * 🧱 Render
   * ------------------------------------------------ */
  return (
    <main className="login-page">
      <div className="login-bg-elements">
        <div className="bg-element bg-element-1"></div>
        <div className="bg-element bg-element-2"></div>
        <div className="bg-element bg-element-3"></div>
      </div>

      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">
            <span className="icon-medium">🎨</span>
          </div>
          <h1 className="login-title">
            Welcome to SkillXchange
          </h1>
          <p className="login-subtitle">
            🌟 Connect, Learn, and Grow Together 🌟
          </p>
        </div>

        <p className="login-description">
          Connect your wallet to unlock a world of peer-to-peer learning. Choose your role and start your journey in the decentralized education revolution!
        </p>

        <button
          type="button"
          onClick={() => setIsWalletModalOpen(true)}
          aria-label="Connect Wallet"
          className="connect-wallet-btn"
        >
          🔗 Connect Your Wallet
        </button>

        <div className="role-buttons">
          <button
            type="button"
            onClick={() => handleRoleSelect('teacher')}
            aria-label="Select Teacher Role"
            className="role-btn role-btn-teacher"
          >
            👨‍🏫 I'm a Teacher
            <span className="icon-medium">📚</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleSelect('learner')}
            aria-label="Select Learner Role"
            className="role-btn role-btn-learner"
          >
            🎓 I'm a Learner
            <span className="icon-medium">🚀</span>
          </button>
        </div>

        <div className="register-footer">
          <p className="footer-text">
            ✨ Powered by Algorand Blockchain ✨
          </p>
        </div>
      </div>

      <ConnectWallet openModal={isWalletModalOpen} closeModal={() => setIsWalletModalOpen(false)} />
    </main>
  )
}

export default LoginPage
