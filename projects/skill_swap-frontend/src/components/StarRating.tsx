import React from 'react'

interface StarRatingProps {
  rating: number
  onChange?: (rating: number) => void
  interactive?: boolean
}

const StarRating: React.FC<StarRatingProps> = ({ rating, onChange, interactive = false }) => {
  const handleClick = (index: number) => {
    if (interactive && onChange) {
      onChange(index + 1)
    }
  }

  return (
    <div className="star-rating">
      {Array(5)
        .fill(0)
        .map((_, i) => (
          <span
            key={i}
            className={`star-emoji ${interactive ? 'star-interactive' : ''} ${i < rating ? 'star-filled' : 'star-empty'}`}
            onClick={() => handleClick(i)}
            aria-label={`Rate ${i + 1}`}
          >
            {i < rating ? '🌟' : '☆'}
          </span>
        ))}
    </div>
  )
}

export default StarRating
