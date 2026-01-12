import React from 'react'
import { Crown } from 'lucide-react'
import { motion } from 'framer-motion'
import { SubscriptionTier } from '@/types'

interface SubscriptionBadgeProps {
  tier: SubscriptionTier
  onClick?: () => void
}

const TIER_STYLES: Record<SubscriptionTier, {
  bg: string
  icon: string
  fill: string
  glow?: boolean
}> = {
  free: {
    bg: 'bg-gray-500/10',
    icon: 'text-gray-400',
    fill: 'none'
  },
  light: {
    bg: 'bg-purple-500/10',
    icon: 'text-purple-500',
    fill: 'currentColor'
  },
  pro: {
    bg: 'bg-amber-500/10',
    icon: 'text-amber-500',
    fill: 'currentColor',
    glow: true
  }
}

export const SubscriptionBadge: React.FC<SubscriptionBadgeProps> = ({
  tier,
  onClick
}) => {
  const styles = TIER_STYLES[tier]

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={`w-10 h-10 rounded-xl ${styles.bg} flex items-center justify-center relative`}
    >
      {styles.glow && (
        <div className="absolute inset-0 rounded-xl bg-amber-500/20 blur-md" />
      )}
      <Crown
        size={20}
        className={`${styles.icon} relative z-10`}
        fill={styles.fill}
        strokeWidth={tier === 'free' ? 2 : 1.5}
      />
    </motion.button>
  )
}
