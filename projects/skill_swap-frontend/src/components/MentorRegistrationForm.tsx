import React, { useState } from 'react'

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

interface MentorRegistrationFormProps {
  onRegister: (newMentor: Mentor) => void
  loading: boolean
  userAddress: string
}

const EXPERTISE_AREAS = [
  'Programming', 'Music', 'Coding', 'Languages', 'Art', 'Sports', 'Cooking',
  'Photography', 'Writing', 'Business', 'Science', 'Design', 'Other'
]

const MentorRegistrationForm: React.FC<MentorRegistrationFormProps> = ({ onRegister, loading, userAddress }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    expertise: [] as string[],
    experience: '',
    bio: '',
    rate: '',
    availability: [] as string[]
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleExpertiseChange = (area: string) => {
    setFormData(prev => ({
      ...prev,
      expertise: prev.expertise.includes(area)
        ? prev.expertise.filter(e => e !== area)
        : [...prev.expertise, area]
    }))
  }

  const handleAvailabilityChange = (day: string) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.includes(day)
        ? prev.availability.filter(d => d !== day)
        : [...prev.availability, day]
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newMentor: Mentor = {
      id: Date.now(),
      name: formData.name,
      email: formData.email,
      expertise: formData.expertise,
      experience: formData.experience,
      bio: formData.bio,
      rate: Number(formData.rate),
      availability: formData.availability,
      walletAddress: userAddress
    }
    onRegister(newMentor)
    setFormData({
      name: '',
      email: '',
      expertise: [],
      experience: '',
      bio: '',
      rate: '',
      availability: []
    })
  }

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  return (
    <div
      className="card card-centered w-full text-white border border-blue-800/30"
      style={{ background: 'linear-gradient(135deg, var(--color-neutral-900) 0%, var(--color-neutral-800) 100%)', padding: '3rem' }}
    >
      <h2 style={{color:'black'}} className="text-2xl font-bold mb-8 text-center">Register as Mentor</h2>

      <form onSubmit={handleSubmit} className="form-container">
        {/* Name */}
        <div>
          <label className="form-label">Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="form-input"
            style={{color:'white'}}
            placeholder="Enter your full name"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="form-label">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            style={{color:'white'}}
            className="form-input"
            placeholder="Enter your email"
            required
          />
        </div>

        {/* Expertise */}
        <div>
          <label className="form-label">Areas of Expertise</label>
          <div className="expertise-group">
            {EXPERTISE_AREAS.map(area => (
              <label key={area} className="expertise-area">
                <input
                  type="checkbox"
                  style={{color:'white'}}
                  checked={formData.expertise.includes(area)}
                  onChange={() => handleExpertiseChange(area)}
                  className="accent-purple-500"
                />
                {area}
              </label>
            ))}
          </div>
        </div>

        {/* Experience */}
        <div>
          <label className="form-label">Years of Experience</label>
          <input
            type="text"
            name="experience"
            value={formData.experience}
            onChange={handleChange}
            style={{color:'white'}}
            className="form-input"
            placeholder="e.g., 5 years"
            required
          />
        </div>

        {/* Bio */}
        <div>
          <label className="form-label ">Bio</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            style={{color:'white'}}
            className="form-textarea "
            placeholder="Tell us about yourself and your mentoring experience"
            rows={4}
            required
          />
        </div>

        {/* Rate */}
        <div>
          <label className="form-label">Hourly Rate ($)</label>
          <input
            type="number"
            name="rate"
            value={formData.rate}
            onChange={handleChange}
            className="form-input"
            min="0"
            step="0.01"
            placeholder="0.00"
            required
          />
        </div>

        {/* Availability */}
        <div>
          <label className="form-label">Availability</label>
          <div className="availability-group">
            {daysOfWeek.map(day => (
              <label key={day} className="availability-day">
                <input
                  type="checkbox"
                  style={{color:'white'}}
                  checked={formData.availability.includes(day)}
                  onChange={() => handleAvailabilityChange(day)}
                  className="accent-purple-500"
                />
                {day}
              </label>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="form-submit">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-large disabled:opacity-50 bg-blue-800 hover:bg-blue-900 text-black px-8 py-3 rounded-full font-bold shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            {loading ? 'Registering...' : 'Register as Mentor'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default MentorRegistrationForm
