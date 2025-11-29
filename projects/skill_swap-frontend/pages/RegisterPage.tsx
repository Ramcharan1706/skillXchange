
// src/pages/RegisterPage.tsx
import React, { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSnackbar } from 'notistack'
import { useAuth } from '../context/AuthContext'
import { useWallet } from '@txnlab/use-wallet-react'

const RegisterPage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const { role, setUserName } = useAuth()
  const { enqueueSnackbar } = useSnackbar()
  const navigate = useNavigate()
  const { activeAccount } = useWallet()

  const walletAddress = activeAccount?.address || ''

  /** ------------------------------------------------
   * 🔁 Redirect if role not selected
   * ------------------------------------------------ */
  useEffect(() => {
    if (!role) {
      enqueueSnackbar('Please select a role first', { variant: 'warning' })
      navigate('/')
    }
  }, [role, enqueueSnackbar, navigate])

  /** ------------------------------------------------
   * 🧾 Register using connected wallet address
   * ------------------------------------------------ */
  const handleRegister = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      if (!walletAddress) {
        enqueueSnackbar('Please connect your Algorand wallet first', { variant: 'warning' })
        return
      }

      if (!role) {
        enqueueSnackbar('User role not defined', { variant: 'error' })
        return
      }

      setLoading(true)
      try {
        // Use wallet address as name
        setUserName(walletAddress)
        enqueueSnackbar(`Welcome! Registered as ${role.toUpperCase()} with wallet ${walletAddress}`, {
          variant: 'success',
        })
        navigate('/home')
      } catch (error: unknown) {
        const message =
          error && typeof error === 'object' && 'message' in error && typeof error.message === 'string'
            ? error.message
            : 'Unknown error occurred'
        enqueueSnackbar(`Registration failed: ${message}`, { variant: 'error' })
      } finally {
        setLoading(false)
      }
    },
    [enqueueSnackbar, navigate, role, setUserName, walletAddress]
  )

  /** ------------------------------------------------
   * 🧱 UI Render
   * ------------------------------------------------ */
  return (
    <main className="register-page">
      <div className="register-bg-elements">
        <div className="bg-element bg-element-1"></div>
        <div className="bg-element bg-element-2"></div>
        <div className="bg-element bg-element-3"></div>
      </div>

      <div className="register-card">
        <div className="register-header">
          <div className="register-icon">
            <span className="icon-medium">{role === 'teacher' ? '👨‍🏫' : '🎓'}</span>
          </div>
          <h2 className="register-title">
            Register as {role ? role.charAt(0).toUpperCase() + role.slice(1) : ''}
          </h2>
          <p className="register-subtitle">
            {role === 'teacher' ? '🎯 Share Your Expertise' : '🚀 Start Your Learning Journey'}
          </p>
        </div>

        <form
          onSubmit={handleRegister}
          className="register-form"
        >
          <div className="form-group">
            <label htmlFor="wallet" className="form-label">
              <span className="icon-medium">🔐</span> Wallet Address
            </label>

            <div className="wallet-input-container">
              <input
                id="wallet"
                name="wallet"
                type="text"
                readOnly
                className="form-input wallet-input"
                value={walletAddress || 'No wallet connected'}
                aria-readonly="true"
              />
              {walletAddress && (
                <div className="wallet-status">
                  <span className="icon-medium success-icon">✅</span>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !walletAddress}
            className={`btn btn-primary btn-large ${loading || !walletAddress ? 'btn-disabled' : ''}`}
            aria-busy={loading}
          >
            {loading ? (
              <span className="btn-content">
                <span className="icon-medium">🔄</span> Registering...
              </span>
            ) : walletAddress ? (
              <span className="btn-content">
                <span className="icon-medium">✨</span> Register with Wallet
              </span>
            ) : (
              <span className="btn-content">
                <span className="icon-medium">🔗</span> Connect Wallet to Continue
              </span>
            )}
          </button>

          {!walletAddress && (
            <div className="warning-message">
              <p className="warning-text">
                <span className="icon-medium">⚠️</span> Please connect your wallet before registering.
              </p>
            </div>
          )}
        </form>

        <div className="register-footer">
          <p className="footer-text">
            🔒 Your wallet address will be used as your unique identifier
          </p>
        </div>
      </div>
    </main>
  )
}

export default RegisterPage
