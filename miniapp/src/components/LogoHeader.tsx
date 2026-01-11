import React from 'react'
import { useLongPressEasterEgg } from '@/lib/easterEggs'

export const LogoHeader: React.FC = () => {
  // Long press on logo for 3 seconds = easter egg
  const { isPressed, progress, handlers } = useLongPressEasterEgg(3000)

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-[90px] bg-bg flex items-center justify-center pt-[50px]">
      <div className="relative" {...handlers}>
        <img
          src="/logo.png"
          alt="MAIN"
          className={`h-8 w-auto transition-transform select-none ${isPressed ? 'scale-110' : ''}`}
          draggable={false}
        />
        {/* Progress ring while pressing */}
        {isPressed && (
          <svg
            className="absolute -inset-2 w-12 h-12 -rotate-90"
            viewBox="0 0 48 48"
          >
            <circle
              cx="24"
              cy="24"
              r="20"
              fill="none"
              stroke="rgba(124, 58, 237, 0.3)"
              strokeWidth="3"
            />
            <circle
              cx="24"
              cy="24"
              r="20"
              fill="none"
              stroke="#7c3aed"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${(progress / 100) * 125.6} 125.6`}
              className="transition-all duration-100"
            />
          </svg>
        )}
      </div>
    </div>
  )
}
