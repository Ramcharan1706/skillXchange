import React, { useState, useEffect, useMemo } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import { AlgorandClient, algo } from '@algorandfoundation/algokit-utils'
import StarRating from './StarRating'
import Badge from './Badge'
import ReviewModal from './ReviewModal'
import BookingModal from './BookingModal'
import { Skill, Feedback } from '../types'
import { SKILL_CONFIG, PAYMENT_CONFIG, VALIDATION_MESSAGES } from '../constants/config'

interface SkillListProps {
  onBookSkill: (skillId: number, skillRate: number, selectedSlot: { slot: string; link: string }) => void
  onOpenReviewModal: (skillId: number, skill?: Skill, mode?: 'submit' | 'view') => void
  algorandClient: AlgorandClient
  userAddress: string
  bookedSlots?: { skillId: number; slot: string }[]
  searchQuery?: string
  skills: Skill[]
  setSkills: React.Dispatch<React.SetStateAction<Skill[]>>
}

const SkillList: React.FC<SkillListProps> = ({
  onBookSkill,
  onOpenReviewModal,
  algorandClient,
  userAddress,
  bookedSlots = [],
  searchQuery,
  skills,
  setSkills,
}) => {
  const [loading, setLoading] = useState(false)
  const [registerLoading, setRegisterLoading] = useState(false)
  const [bookingModal, setBookingModal] = useState<{
    isOpen: boolean
    skillId: number
    skillRate: number
    selectedSlot: { slot: string; link: string }
    skill?: Skill
  }>({ isOpen: false, skillId: 0, skillRate: 0, selectedSlot: { slot: '', link: '' } })

  const [reviewModal, setReviewModal] = useState<{
    isOpen: boolean
    skillId: number
    skill?: Skill
    mode: 'submit' | 'view'
  }>({ isOpen: false, skillId: 0, mode: 'view' })

  const [form, setForm] = useState<{
    name: string
    description: string
    receiver: string
    rate: string
    category: string
    level: 'Beginner' | 'Intermediate' | 'Advanced'
    availability: { slot: string; link: string }[]
  }>({
    name: '',
    description: '',
    receiver: '',
    rate: '',
    category: '',
    level: 'Beginner',
    availability: [],
  })

  const [filters, setFilters] = useState({ category: '', level: '', minRate: '', maxRate: '' })
  const { transactionSigner, activeAccount } = useWallet()
  const { enqueueSnackbar } = useSnackbar()

  const validateForm = (): boolean => {
    if (!form.name?.trim() || !form.description?.trim() || !form.rate || !form.category) {
      enqueueSnackbar(VALIDATION_MESSAGES.REQUIRED_FIELDS, { variant: 'warning' })
      return false
    }

    const rate = Number(form.rate)
    if (isNaN(rate) || rate <= 0 || rate > SKILL_CONFIG.MAX_RATE) {
      enqueueSnackbar(VALIDATION_MESSAGES.INVALID_RATE, { variant: 'warning' })
      return false
    }

    if (!form.availability.length) {
      enqueueSnackbar(VALIDATION_MESSAGES.MIN_ONE_SLOT, { variant: 'warning' })
      return false
    }

    if (!userAddress || !transactionSigner) {
      enqueueSnackbar(VALIDATION_MESSAGES.WALLET_NOT_CONNECTED, { variant: 'warning' })
      return false
    }

    for (const slot of form.availability) {
      if (!slot.slot?.trim()) {
        enqueueSnackbar(VALIDATION_MESSAGES.INVALID_SLOT, { variant: 'warning' })
        return false
      }
    }

    return true
  }

  const sendPayment = async (): Promise<string> => {
    if (!transactionSigner || !userAddress) throw new Error(VALIDATION_MESSAGES.WALLET_NOT_CONNECTED)

    enqueueSnackbar(`Sending payment of ${PAYMENT_CONFIG.AMOUNT_ALGO} ALGO...`, { variant: 'info' })
    try {
      const result = await algorandClient.send.payment({
        sender: userAddress,
        receiver: PAYMENT_CONFIG.RECEIVER_ADDRESS,
        amount: algo(PAYMENT_CONFIG.AMOUNT_ALGO),
        signer: transactionSigner,
      })
      enqueueSnackbar(`Payment successful! TxID: ${result.txIds[0]}`, { variant: 'success' })
      return result.txIds[0]
    } catch (error: any) {
      const errorMsg = `Payment failed: ${error?.message || 'Unknown error'}`
      enqueueSnackbar(errorMsg, { variant: 'error' })
      throw new Error(errorMsg)
    }
  }

  const registerSkillOnChain = async (): Promise<Skill> => {
    const mockSkillId = Math.floor(Math.random() * 10000) + 1
    return {
      id: mockSkillId,
      name: form.name.trim(),
      description: form.description.trim(),
      teacher: userAddress,
      receiver: form.receiver.trim(),
      rate: Number(form.rate),
      category: form.category,
      level: form.level,
      sessionsCompleted: 0,
      rating: 0,
      availability: form.availability,
      feedbacks: [],
    }
  }

  const handleRegisterSkill = async (): Promise<void> => {
    if (!validateForm()) return

    setRegisterLoading(true)
    try {
      await sendPayment()
      const newSkill = await registerSkillOnChain()
      setSkills((prev) => [...prev, newSkill])
      setForm({
        name: '',
        description: '',
        receiver: '',
        rate: '',
        category: '',
        level: 'Beginner',
        availability: [],
      })
      enqueueSnackbar('Skill registered successfully!', { variant: 'success' })
    } catch (error) {
      enqueueSnackbar(`Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`, { variant: 'error' })
    } finally {
      setRegisterLoading(false)
    }
  }

  const handleAddSlot = (): void => {
    setForm((prev) => ({
      ...prev,
      availability: [...prev.availability, { slot: '', link: '' }],
    }))
  }

  const handleRemoveSlot = (index: number): void => {
    setForm((prev) => ({
      ...prev,
      availability: prev.availability.filter((_, i) => i !== index),
    }))
  }

  const handleSlotChange = (index: number, slot: string, link: string): void => {
    setForm((prev) => ({
      ...prev,
      availability: prev.availability.map((a, i) =>
        i === index ? { slot, link } : a
      ),
    }))
  }

  const filteredSkills = useMemo(() => {
    let filtered = skills.filter((skill) =>
      (!filters.category || skill.category === filters.category) &&
      (!filters.level || skill.level === filters.level) &&
      (!filters.minRate || skill.rate >= Number(filters.minRate)) &&
      (!filters.maxRate || skill.rate <= Number(filters.maxRate)) &&
      (!searchQuery ||
        skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    filtered.sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating
      return b.sessionsCompleted - a.sessionsCompleted
    })

    return filtered
  }, [skills, filters, searchQuery])

  const openReviewModal = (skillId: number, skill?: Skill, mode: 'submit' | 'view' = 'view') => {
    setReviewModal({
      isOpen: true,
      skillId,
      skill,
      mode,
    })
  }

  const closeReviewModal = () => {
    setReviewModal(prev => ({ ...prev, isOpen: false }))
  }

  const handleReviewSubmit = async (skillId: number, review: { rating: number; comment: string }) => {
    try {
      // Find the skill and add the new review
      setSkills(prevSkills =>
        prevSkills.map(skill => {
          if (skill.id === skillId) {
            const newFeedback: Feedback = {
              id: Date.now(), // Simple ID generation
              student: userAddress || 'Anonymous',
              rating: review.rating,
              comment: review.comment,
              date: new Date().toLocaleDateString(),
            }

            const updatedFeedbacks = [...skill.feedbacks, newFeedback]

            // Calculate new average rating
            const newRating = updatedFeedbacks.length > 0
              ? updatedFeedbacks.reduce((sum, fb) => sum + fb.rating, 0) / updatedFeedbacks.length
              : 0

            return {
              ...skill,
              feedbacks: updatedFeedbacks,
              rating: Math.round(newRating * 10) / 10, // Round to 1 decimal place
            }
          }
          return skill
        })
      )

      enqueueSnackbar('Review submitted successfully!', { variant: 'success' })

      // Update the modal with the new skill data
      const updatedSkill = skills.find(s => s.id === skillId)
      if (updatedSkill) {
        const newFeedback: Feedback = {
          id: Date.now(),
          student: userAddress || 'Anonymous',
          rating: review.rating,
          comment: review.comment,
          date: new Date().toLocaleDateString(),
        }
        const updatedFeedbacks = [...updatedSkill.feedbacks, newFeedback]
        const newRating = updatedFeedbacks.reduce((sum, fb) => sum + fb.rating, 0) / updatedFeedbacks.length

        setReviewModal(prev => ({
          ...prev,
          skill: {
            ...updatedSkill,
            feedbacks: updatedFeedbacks,
            rating: Math.round(newRating * 10) / 10,
          },
          mode: 'view', // Switch to view mode to show the new review
        }))
      }
    } catch (error) {
      enqueueSnackbar('Failed to submit review', { variant: 'error' })
      throw error
    }
  }

  return (
    <div className="w-full space-y-8">
      {/* Filters */}
      <div className="mb-8 flex flex-wrap gap-4 justify-center">
        <select
          value={filters.category}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, category: e.target.value }))
          }
          className="form-select"
        >
          <option value="">All Categories</option>
          {SKILL_CONFIG.CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <select
          value={filters.level}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, level: e.target.value }))
          }
          className="form-select"
        >
          <option value="">All Levels</option>
          {SKILL_CONFIG.LEVELS.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </div>

      {/* Skill Cards */}
      <div className="w-full flex flex-col gap-6 mb-10">
        {loading ? (
          <p className="center-content text-lg">Loading skills...</p>
        ) : filteredSkills.length === 0 ? (
          <p className="center-content text-lg">No skills found.</p>
        ) : (
          filteredSkills.map((skill) => (
            <div key={skill.id} className="card card-centered transform hover:scale-105 transition-all duration-300 w-full">
              <h3 className="text-2xl font-bold mb-3 text-center text-white">
                {skill.name}
              </h3>
              <p className="text-gray-700 text-lg mb-4 text-center font-medium">
                {skill.description}
              </p>
              <div className="center-content mb-3">
                <Badge text={skill.category} />
              </div>
              <div className="grid grid-cols-2 gap-6 mb-4 text-lg">
                <p className="text-center font-semibold">
                  <strong>Level:</strong>{' '}
                  <span className="text-white">{skill.level}</span>
                </p>
                <p className="text-center font-semibold">
                  <strong>Rate:</strong>{' '}
                  <span className="text-white">${skill.rate}</span>
                </p>
              </div>
              <div className="mb-4 text-center">
                <p className="text-lg font-semibold">
                  <strong>Receiver Address:</strong>
                </p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-gray-600 font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                    {skill.receiver}
                  </span>
                  <button
                    onClick={() => navigator.clipboard.writeText(skill.receiver)}
                    className="text-blue-500 hover:text-blue-700 font-bold"
                    title="Copy address"
                  >
                    📋
                  </button>
                </div>
              </div>
              <div className="center-content mb-4">
                <div className="text-lg font-medium">
                  Rating: <StarRating rating={skill.rating} /> (
                  {skill.feedbacks.length})
                </div>
              </div>

              {/* Availability with conditional meeting link visibility */}
              <div className="mt-4 text-lg">
                <p className="font-bold text-center mb-3 text-xl">
                  Availability:
                </p>
                <ul className="space-y-2">
                  {skill.availability.map((a, idx) => {
                    const isBooked = bookedSlots.some(
                      (bs) => bs.skillId === skill.id && bs.slot === a.slot
                    )

                    return (
                      <li
                        key={idx}
                        className="text-center bg-gray-50 p-3 rounded-2xl border-2 border-gray-200 text-black"
                      >
                        <span className="font-semibold text-lg">{a.slot}</span>
                        {' — '}
                        {isBooked ? (
                          <a
                            href={a.link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline font-bold text-lg"
                          >
                            Join Meeting
                          </a>
                        ) : (
                          <span className="italic text-gray-500 text-lg">
                            Book this slot to unlock the meeting link
                          </span>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>

              {/* Buttons – only unbooked slots are bookable */}
              <div className="btn-group mt-6">
                {skill.availability
                  .filter(
                    (slot) =>
                      !bookedSlots.some(
                        (bs) =>
                          bs.skillId === skill.id && bs.slot === slot.slot
                      )
                  )
                  .map((slot, idx) => (
                    <button
                      key={idx}
                      onClick={() =>
                        setBookingModal({
                          isOpen: true,
                          skillId: skill.id,
                          skillRate: skill.rate,
                          selectedSlot: slot,
                          skill,
                        })
                      }
                      className="btn btn-primary btn-large"
                    >
                      Book {slot.slot}
                    </button>
                  ))}
                <button
                  onClick={() => openReviewModal(skill.id, skill, 'view')}
                  className="btn btn-info btn-large"
                >
                  View Reviews
                </button>
                <button
                  onClick={() => openReviewModal(skill.id, skill, 'submit')}
                  className="btn btn-warning btn-large"
                >
                  Leave Review
                </button>
              </div>

              {/* Reviews Section */}
              {skill.feedbacks.length > 0 && (
                <div className="mt-8 border-t-2 border-gray-200 pt-6">
                  <h4 className="text-2xl font-bold mb-4 text-center text-white">
                    Recent Reviews
                  </h4>
                  <div className="space-y-4 max-h-48 overflow-y-auto">
                    {skill.feedbacks.slice(-2).map((feedback) => (
                      <div
                        key={feedback.id}
                        className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-2xl border-2 border-gray-100 shadow-md"
                      >
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-bold text-lg text-gray-800">
                            {feedback.student}
                          </span>
                          <span className="text-sm text-gray-500 font-medium">
                            {feedback.date}
                          </span>
                        </div>
                        <div className="mb-3">
                          <StarRating rating={feedback.rating} />
                        </div>
                        <p className="text-lg text-gray-700 font-medium">
                          {feedback.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                  {skill.feedbacks.length > 2 && (
                    <button
                      onClick={() =>
                        onOpenReviewModal(skill.id, skill, 'view')
                      }
                      className="text-blue-600 hover:underline text-lg font-bold mt-4 block text-center hover:text-blue-800 transition-colors"
                    >
                      View all {skill.feedbacks.length} reviews
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Register New Skill */}
      <div className="card card-centered w-full bg-blue-800 text-white border border-blue-800/30">
        <h2 className="text-4xl font-bold mb-8 text-center text-white">
          Register New Skill
        </h2>
        <div className="flex flex-col gap-6">
          <input
            type="text"
            placeholder="Skill Name"
            value={form.name}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, name: e.target.value }))
            }
            className="border-2 border-white/30 bg-white/10 text-white px-6 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all backdrop-blur-sm placeholder-white/50 text-lg font-medium"
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, description: e.target.value }))
            }
            className="border-2 border-white/30 bg-white/10 text-white px-6 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all backdrop-blur-sm placeholder-white/50 text-lg font-medium"
            rows={4}
          />
          <input
            type="text"
            placeholder="Receiver Wallet Address"
            value={form.receiver}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, receiver: e.target.value }))
            }
            className="border-2 border-white/30 bg-white/10 text-white px-6 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all backdrop-blur-sm placeholder-white/50 text-lg font-medium"
          />
          <input
            type="number"
            placeholder="Rate (Algo token)"
            value={form.rate}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, rate: e.target.value }))
            }
            className="border-2 border-white/30 bg-white/10 text-white px-6 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all backdrop-blur-sm placeholder-white/50 text-lg font-medium"
          />
          <select
            value={form.category}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, category: e.target.value }))
            }
            className="border-2 border-white/30 bg-white/10 text-white px-6 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all backdrop-blur-sm text-lg font-medium"
          >
            <option value="" className="bg-gray-800">
              Select Category
            </option>
            {SKILL_CONFIG.CATEGORIES.map((cat) => (
              <option key={cat} value={cat} className="bg-gray-800">
                {cat}
              </option>
            ))}
          </select>
          <select
            value={form.level}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                level: e.target.value as (typeof SKILL_CONFIG.LEVELS)[number],
              }))
            }
            className="border-2 border-white/30 bg-white/10 text-white px-6 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all backdrop-blur-sm text-lg font-medium"
          >
            {SKILL_CONFIG.LEVELS.map((level) => (
              <option key={level} value={level} className="bg-gray-800">
                {level}
              </option>
            ))}
          </select>

          {/* Dynamic Slots */}
          <div className="mt-6">
            <label className="font-bold mb-4 block text-center text-2xl">
              ⏰ Time Slots and Meeting Links
            </label>
            {form.availability.map((a, idx) => (
              <div
                key={idx}
                className="flex flex-col gap-4 mb-6 p-6 border-2 border-white/20 rounded-2xl shadow-lg bg-white/5 backdrop-blur-sm"
              >
                <div className="flex items-center gap-4">
                  <input
                    type="text"
                    placeholder="e.g. Monday 10 AM"
                    value={a.slot}
                    onChange={(e) =>
                      handleSlotChange(idx, e.target.value, a.link)
                    }
                    className="border-2 border-white/30 bg-white/10 text-white px-4 py-3 rounded-xl flex-1 shadow-md hover:shadow-lg transition-all backdrop-blur-sm placeholder-white/50 text-lg font-medium"
                  />
                  <input
                    type="url"
                    placeholder="Meeting link"
                    value={a.link}
                    onChange={(e) =>
                      handleSlotChange(idx, a.slot, e.target.value)
                    }
                    className="border-2 border-white/30 bg-white/10 text-white px-4 py-3 rounded-xl flex-1 shadow-md hover:shadow-lg transition-all backdrop-blur-sm placeholder-white/50 text-lg font-medium"
                  />
                  <button
                    onClick={() => handleRemoveSlot(idx)}
                    className="text-red-500 font-bold hover:text-red-700 transition-colors text-2xl px-3 py-1 rounded-lg hover:bg-red-500/20"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
            <div className="center-content mt-6">
              <button
                onClick={handleAddSlot}
                className="btn btn-primary btn-large"
              >
                Add Slot
              </button>
            </div>
          </div>

          <div className="center-content mt-8">
            <button
              onClick={handleRegisterSkill}
              disabled={registerLoading}
              className="btn btn-large text-2xl px-12 py-6"
            >
              {registerLoading ? 'Registering...' : 'Register Skill'}
            </button>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        openModal={bookingModal.isOpen}
        setModalState={(value) =>
          setBookingModal((prev) => ({ ...prev, isOpen: value }))
        }
        skillId={bookingModal.skillId}
        initialSkillRate={bookingModal.skillRate}
        selectedSlot={bookingModal.selectedSlot}
        algorand={algorandClient}
        activeAddress={userAddress}
        onBookingSuccess={(skillId, slot) => {
          onBookSkill(skillId, bookingModal.skillRate, bookingModal.selectedSlot)
          setBookingModal({
            isOpen: false,
            skillId: 0,
            skillRate: 0,
            selectedSlot: { slot: '', link: '' },
          })
        }}
        defaultReceiver={bookingModal.skill?.receiver}
      />

      {/* Review Modal */}
      <ReviewModal
        open={reviewModal.isOpen}
        skillId={reviewModal.skillId}
        skill={reviewModal.skill}
        mode={reviewModal.mode}
        onClose={closeReviewModal}
        onSubmit={handleReviewSubmit}
        onReviewSubmitted={() => {
          // Refresh the skill data in the modal
          const updatedSkill = skills.find(s => s.id === reviewModal.skillId)
          if (updatedSkill) {
            setReviewModal(prev => ({ ...prev, skill: updatedSkill }))
          }
        }}
      />
    </div>
  )
}

export default SkillList
