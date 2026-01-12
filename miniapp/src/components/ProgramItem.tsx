import React from 'react'
import { Users } from 'lucide-react'
import type { EventProgramItem } from '@/types'

interface ProgramItemProps {
  item: EventProgramItem
}

// Format time from "HH:MM:SS" to "HH:MM"
function formatTime(time: string): string {
  return time.slice(0, 5)
}

export const ProgramItem: React.FC<ProgramItemProps> = ({ item }) => {
  const hasDescription = item.description && item.description.trim().length > 0
  const hasSpeaker = item.speaker && item.speaker_id

  return (
    <div className="bg-bg rounded-xl p-4 mb-3 last:mb-0">
      {/* Time badge */}
      <div className="inline-block bg-accent/20 text-accent text-xs font-medium px-2.5 py-1 rounded-full mb-2">
        {formatTime(item.time_start)}-{formatTime(item.time_end)}
      </div>

      {/* Title - plain for non-talks, or with speaker info for talks */}
      {hasSpeaker ? (
        <>
          {/* Speaker info */}
          <div className="flex items-center gap-2 mb-2">
            {item.speaker?.photo_url ? (
              <img
                src={item.speaker.photo_url}
                alt={item.speaker.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-bg-hover flex items-center justify-center">
                <Users className="w-4 h-4 text-gray-500" />
              </div>
            )}
            <div>
              <p className="font-semibold text-white text-sm">
                {item.speaker?.name}
              </p>
              {item.speaker?.title && (
                <p className="text-gray-400 text-xs truncate">
                  {item.speaker.title}
                </p>
              )}
            </div>
          </div>

          {/* Talk title */}
          <h4 className="font-semibold text-accent text-sm mb-1">
            {item.title}
          </h4>
        </>
      ) : (
        /* Simple title for non-speaker items like Registration, Coffee break, etc */
        <h4 className="font-semibold text-white text-base">
          {item.title}
        </h4>
      )}

      {/* Description */}
      {hasDescription && (
        <p className="text-gray-400 text-sm mt-2 leading-relaxed">
          {item.description}
        </p>
      )}
    </div>
  )
}
