import React, { useState } from 'react'
import StarRating from './StarRating'

interface Feedback {
  id: number
  student: string
  rating: number
  comment: string
  date: string
}

interface Skill {
  id: number
  name: string
  description: string
  teacher: string
  rate: number
  category: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  sessionsCompleted: number
  rating: number
  availability: { slot: string; link: string }[]
  feedbacks: Feedback[]
}

interface ReviewModalProps {
  skillId: number
  skill?: Skill
  mode?: 'submit' | 'view'
  onClose: () => void
  onSubmit: (skillId: number, review: { rating: number; comment: string }) => void
}

const ReviewModal: React.FC<ReviewModalProps> = ({ skillId, skill, mode = 'submit', onClose, onSubmit }) => {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'submit' | 'view'>(mode)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating > 0 && comment.trim()) {
      setLoading(true)
      try {
        await onSubmit(skillId, { rating, comment })
        onClose()
      } catch (error) {
        console.error('Failed to submit review:', error)
      } finally {
        setLoading(false)
      }
    }
  }

  const renderSubmitForm = () => (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="form-label text-center block">Rating</label>
        <div className="flex justify-center">
          <StarRating rating={rating} onChange={setRating} interactive />
        </div>
      </div>
      <div className="mb-6">
        <label className="form-label text-center block">Comment</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="form-textarea"
          rows={4}
          required
        />
      </div>
      <div className="btn-group">
        <button type="submit" disabled={loading} className="btn btn-primary btn-small disabled:opacity-50">
          {loading ? 'Submitting...' : 'Submit'}
        </button>
        <button type="button" onClick={onClose} className="btn btn-outline btn-small">
          Cancel
        </button>
      </div>
    </form>
  )

  const renderReviewsView = () => (
    <div>
      <div className="mb-4">
        <p className="text-sm text-white/70 text-center">Overall Rating: <StarRating rating={skill?.rating || 0} /> ({skill?.feedbacks.length || 0} reviews)</p>
      </div>
      {skill?.feedbacks.length === 0 ? (
        <p className="text-white/70 text-center">No reviews yet.</p>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {skill?.feedbacks.map(feedback => (
            <div key={feedback.id} className="border-b border-white/20 pb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-white">{feedback.student.slice(0, 10)}...</span>
                <span className="text-sm text-white/70">{feedback.date}</span>
              </div>
              <div className="mb-2">
                <StarRating rating={feedback.rating} />
              </div>
              <p className="text-white/90">{feedback.comment}</p>
            </div>
          ))}
        </div>
      )}
      <div className="btn-group mt-6">
        <button onClick={() => setViewMode('submit')} className="btn btn-primary btn-small">
          Leave Review
        </button>
        <button type="button" onClick={onClose} className="btn btn-warning btn-small">
          Close
        </button>
      </div>
    </div>
  )

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">
            {viewMode === 'submit' ? 'Submit Review' : `Reviews for ${skill?.name || 'Skill'}`}
          </h3>
          <button
            onClick={onClose}
            className="modal-close"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        <div className="modal-body">
          {viewMode === 'submit' ? renderSubmitForm() : renderReviewsView()}
        </div>
      </div>
    </div>
  )
}

export default ReviewModal
