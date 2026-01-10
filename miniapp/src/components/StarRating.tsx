import { Star } from 'lucide-react'

interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  onChange?: (rating: number) => void
  showValue?: boolean
  count?: number
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
}

export function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onChange,
  showValue = false,
  count,
}: StarRatingProps) {
  const handleClick = (value: number) => {
    if (interactive && onChange) {
      onChange(value)
    }
  }

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {Array.from({ length: maxRating }, (_, i) => i + 1).map((value) => (
          <button
            key={value}
            type="button"
            disabled={!interactive}
            onClick={() => handleClick(value)}
            className={`
              ${interactive ? 'cursor-pointer hover:scale-110 active:scale-95' : 'cursor-default'}
              transition-transform duration-100
              disabled:opacity-100
            `}
          >
            <Star
              className={`
                ${sizeClasses[size]}
                ${value <= rating ? 'fill-yellow-400 text-yellow-400' : 'fill-transparent text-gray-400'}
                transition-colors duration-100
              `}
            />
          </button>
        ))}
      </div>
      {showValue && (
        <span className="text-sm text-muted ml-1">
          {rating > 0 ? rating.toFixed(1) : '—'}
          {count !== undefined && count > 0 && (
            <span className="text-xs"> ({count})</span>
          )}
        </span>
      )}
    </div>
  )
}

// Display-only compact version for cards
export function StarRatingDisplay({
  rating,
  count,
}: {
  rating: number
  count?: number
}) {
  return (
    <div className="flex items-center gap-1 text-sm">
      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      <span className="font-medium">{rating > 0 ? rating.toFixed(1) : '—'}</span>
      {count !== undefined && count > 0 && (
        <span className="text-muted text-xs">({count})</span>
      )}
    </div>
  )
}
