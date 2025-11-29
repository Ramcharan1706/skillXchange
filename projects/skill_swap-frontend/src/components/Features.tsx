import React from 'react'

const Features: React.FC = () => {
  const features = [
    {
      icon: '🔗',
      title: 'Decentralized',
      description: 'Built on blockchain technology ensuring transparency, security, and trust. No central authority controls your data or transactions.'
    },
    {
      icon: '🔒',
      title: 'Secure',
      description: 'End-to-end encrypted communications and smart contract-based transactions protect your learning journey and earned tokens.'
    },
    {
      icon: '🤝',
      title: 'Community-Driven',
      description: 'Join a global community of learners and mentors. Rate sessions, build reputation, and connect with like-minded individuals.'
    },
    {
      icon: '💎',
      title: 'Token Rewards',
      description: 'Earn tokens for teaching and learning. Build your on-chain reputation and unlock exclusive opportunities in the ecosystem.'
    }
  ]

  return (
    <section className="features">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Why Choose SkillXchange?
          </h2>
          <p className="text-xl text-muted max-w-2xl mx-auto">
            Experience the future of learning with our innovative blockchain-powered platform
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">
                {feature.icon}
              </div>
              <h3 className="feature-title">
                {feature.title}
              </h3>
              <p className="feature-description">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features
