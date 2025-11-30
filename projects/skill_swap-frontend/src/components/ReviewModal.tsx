import React, { useState, useCallback } from 'react'
import StarRating from './StarRating'
import { Skill } from '../types'

interface ReviewModalProps {
  open: boolean
  skillId: number
  skill?: Skill
  mode?: 'submit' | 'view'
  onClose: () => void
  onSubmit: (skillId: number, review: { rating: number; comment: string }) => Promise<void>
  onReviewSubmitted?: () => void
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  open,
  skillId,
  skill,
  mode = 'submit',
  onClose,
  onSubmit,
  onReviewSubmitted
}) => {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'submit' | 'view'>(mode)

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      setError('Please select a rating')
      return
    }

    if (!comment.trim()) {
      setError('Please write a comment')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await onSubmit(skillId, { rating, comment })
      setRating(0)
      setComment('')
      if (onReviewSubmitted) {
        onReviewSubmitted()
      }
      setViewMode('view') // Switch to view mode to show the newly submitted review
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to submit review'
      setError(errorMsg)
      console.error('Review submission error:', err)
    } finally {
      setLoading(false)
    }
  }, [rating, comment, skillId, onSubmit])

  const handleSwitchMode = useCallback(() => {
    setViewMode(prev => prev === 'submit' ? 'view' : 'submit')
    setError(null)
  }, [])

  const renderSubmitForm = () => (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <label className="form-label text-center block text-white text-lg font-semibold mb-4">
          ⭐ Your Rating
        </label>
        <div className="flex justify-center">
          <StarRating rating={rating} onChange={setRating} interactive={true} />
        </div>
      </div>

      <div className="mb-6">
        <label className="form-label text-center block text-white text-lg font-semibold mb-2">
          💬 Comment
        </label>
        <textarea
          value={comment}
          onChange={(e) => {
            setComment(e.target.value)
            setError(null)
          }}
          className="form-textarea bg-neutral-800 border-neutral-700 text-white placeholder-white/50"
          rows={4}
          placeholder="Share your experience with this skill..."
          disabled={loading}
          aria-label="Review comment"
        />
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg">
          <p className="text-red-200 text-sm">{error}</p>
        </div>
      )}

      <div className="flex gap-4 justify-center">
        <button
          type="submit"
          disabled={loading || rating === 0 || !comment.trim()}
          className="btn btn-primary btn-large disabled:opacity-50"
        >
          {loading ? '⏳ Submitting...' : '✅ Submit Review'}
        </button>
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="btn btn-outline btn-large"
        >
          ❌ Cancel
        </button>
      </div>
    </form>
  )

  const renderReviewsView = () => (
    <div>
      <div className="mb-6 text-center">
        <div className="text-lg text-white font-semibold">
          ⭐ Overall Rating: <StarRating rating={skill?.rating || 0} /> ({skill?.feedbacks.length || 0} reviews)
        </div>
      </div>

      {skill?.feedbacks.length === 0 ? (
        <p className="text-white/70 text-center py-8">No reviews yet. Be the first to review!</p>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {skill?.feedbacks.map(feedback => (
            <div key={feedback.id} className="bg-neutral-800 border border-neutral-700 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-white text-sm truncate">
                  {feedback.student.slice(0, 20)}...
                </span>
                <span className="text-sm text-white/70">{feedback.date}</span>
              </div>
              <div className="mb-3">
                <StarRating rating={feedback.rating} />
              </div>
              <p className="text-white/90 text-sm line-clamp-2">{feedback.comment}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-4 justify-center mt-6">
        <button onClick={handleSwitchMode} className="btn btn-primary btn-large">
          ✍️ Leave Another Review
        </button>
        <button type="button" onClick={onClose} className="btn btn-outline btn-large">
          ✨ Close
        </button>
      </div>
    </div>
  )

  if (!open) return null

  if (!open) return null

  return (
    <dialog
      open={true}
      className="modal modal-open"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="modal-box bg-neutral-900 border-2 border-neutral-700 max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-white">
            {viewMode === 'submit' ? '✍️ Submit Review' : `📋 Reviews for ${skill?.name || 'Skill'}`}
          </h3>
          <button
            onClick={onClose}
            className="text-2xl text-white/70 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>
        <div className="py-4">
          {viewMode === 'submit' ? renderSubmitForm() : renderReviewsView()}
        </div>
      </div>
    </dialog>
  )
}

export default ReviewModal
