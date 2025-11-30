import React from 'react'

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

interface MentorCardProps {
  mentor: Mentor
}

const MentorCard: React.FC<MentorCardProps> = ({ mentor }) => {
  return (
    <div className="card bg-blue-800/10 border border-blue-800/30 rounded-2xl p-6 hover:bg-blue-800/20 transition-all duration-300">
      <div className="flex flex-col space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-white">{mentor.name}</h3>
            <p className="text-blue-300 text-sm">{mentor.email}</p>
          </div>
          <div className="text-right">
            <p className="text-green-400 font-semibold">${mentor.rate}/hr</p>
            <p className="text-gray-400 text-sm">{mentor.experience}</p>
          </div>
        </div>

        {/* Expertise */}
        <div>
          <h4 className="text-white font-semibold mb-2">Expertise</h4>
          <div className="flex flex-wrap gap-2">
            {mentor.expertise.map((skill, index) => (
              <span
                key={index}
                className="bg-blue-600/30 text-blue-200 px-3 py-1 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Bio */}
        <div>
          <h4 className="text-white font-semibold mb-2">About</h4>
          <p className="text-gray-300 text-sm leading-relaxed">{mentor.bio}</p>
        </div>

        {/* Availability */}
        <div>
          <h4 className="text-white font-semibold mb-2">Available Days</h4>
          <div className="flex flex-wrap gap-2">
            {mentor.availability.map((day, index) => (
              <span
                key={index}
                className="bg-green-600/30 text-green-200 px-3 py-1 rounded-full text-sm"
              >
                {day}
              </span>
            ))}
          </div>
        </div>

        {/* Wallet Address */}
        <div className="pt-2 border-t border-blue-800/30">
          <p className="text-gray-400 text-xs">
            Wallet: {mentor.walletAddress.slice(0, 6)}...{mentor.walletAddress.slice(-4)}
          </p>
        </div>
      </div>
    </div>
  )
}

export default MentorCard
