import React from 'react'
import { useNavigate } from 'react-router-dom'

const Hero: React.FC = () => {
  const navigate = useNavigate()

  return (
    <section className="hero">
      <div className="container">
        <h2 className="hero-title">
          🌈 SkillXchange Platform
        </h2>
        <p className="hero-subtitle">
          🎯 Swap skills. Earn tokens. Build on-chain reputation.
        </p>
        <p className="text-muted text-lg md:text-xl mb-8 px-8 font-medium">
          Join thousands of learners and teachers in the most vibrant skill-sharing platform on blockchain.
        </p>
        <div className="hero-cta">
          <button onClick={() => navigate('')} className="btn btn-primary btn-lg">
            🚀 Get Started
          </button>
          <button onClick={() => navigate('/skills')} className="btn btn-secondary btn-lg">
            🎨 Browse Skills
          </button>
        </div>
      </div>
    </section>
  )
}

export default Hero
