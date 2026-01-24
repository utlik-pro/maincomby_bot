import React from 'react'
import { Crown } from 'lucide-react'
import { motion } from 'framer-motion'
import { SubscriptionTier } from '@/types'

interface SubscriptionBadgeProps {
  tier: SubscriptionTier
  expiresAt?: string | Date | null
  onClick?: () => void
}

const TIER_STYLES: Record<SubscriptionTier, {
  bg: string
  color: string
  fill: string
  label: string
  glow?: boolean
}> = {
  free: {
    bg: 'bg-gray-500/10',
    color: 'text-gray-400',
    fill: 'none',
    label: 'Free'
  },
  light: {
    bg: 'bg-purple-500/10',
    color: 'text-purple-500',
    fill: 'currentColor',
    label: 'Light'
  },
  pro: {
    bg: 'bg-amber-500/10',
    color: 'text-amber-500',
    fill: 'currentColor',
    label: 'Pro',
    glow: true
  }
}

// Format expiration date
const formatExpirationDate = (date: string | Date | null | undefined): string | null => {
  if (!date) return null
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return null
  return `до ${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}`
}

export const SubscriptionBadge: React.FC<SubscriptionBadgeProps> = ({
  tier,
  expiresAt,
  onClick
}) => {
  const styles = TIER_STYLES[tier]
  const expirationText = tier !== 'free' ? formatExpirationDate(expiresAt) : null

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={`h-10 px-3 rounded-xl ${styles.bg} flex flex-col items-center justify-center gap-0 relative`}
    >
      {styles.glow && (
        <div className="absolute inset-0 rounded-xl bg-amber-500/20 blur-md" />
      )}
      <div className="flex items-center gap-1.5 relative z-10">
        <Crown
          size={14}
          className={`${styles.color}`}
          fill={styles.fill}
          strokeWidth={tier === 'free' ? 2 : 1.5}
        />
        <span className={`${styles.color} text-sm font-medium`}>
          {styles.label}
        </span>
      </div>
      {expirationText && (
        <span className="text-[10px] text-gray-500 relative z-10 -mt-0.5">
          {expirationText}
        </span>
      )}
    </motion.button>
  )
}
