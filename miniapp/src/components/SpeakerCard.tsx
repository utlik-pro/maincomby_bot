import React from 'react'
import { Users } from 'lucide-react'
import type { Speaker } from '@/types'

interface SpeakerCardProps {
  speaker: Speaker
}

// Parse bio into bullet points (split by newlines or semicolons)
function parseBioToBullets(bio: string | null): string[] {
  if (!bio) return []

  // Split by newlines first, then by semicolons
  return bio
    .split(/[\n;]/)
    .map(line => line.trim())
    .filter(line => line.length > 0)
}

export const SpeakerCard: React.FC<SpeakerCardProps> = ({ speaker }) => {
  const bioBullets = parseBioToBullets(speaker.description)

  return (
    <div className="bg-bg rounded-xl p-4 mb-3 last:mb-0">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {speaker.photo_url ? (
            <img
              src={speaker.photo_url}
              alt={speaker.name}
              className="w-14 h-14 rounded-full object-cover"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-bg-hover flex items-center justify-center">
              <Users className="w-6 h-6 text-gray-500" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-white text-base">
            {speaker.name}
          </h4>
          {speaker.title && (
            <p className="text-gray-400 text-sm flex items-center gap-1 mt-0.5">
              <Users className="w-3.5 h-3.5" />
              <span className="truncate">{speaker.title}</span>
            </p>
          )}
        </div>
      </div>

      {/* Bio bullets */}
      {bioBullets.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {bioBullets.map((bullet, index) => (
            <li key={index} className="flex gap-2 text-sm text-gray-300">
              <span className="text-gray-500 mt-0.5">&#9632;</span>
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
