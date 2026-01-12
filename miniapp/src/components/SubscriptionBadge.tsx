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
  color: string
  fill: string
  label: string
  glow?: boolean
}> = {
  free: {
    bg: 'bg-gray-500/10',
    color: 'text-gray-400',
    fill: 'none',
    label: 'фри'
  },
  light: {
    bg: 'bg-purple-500/10',
    color: 'text-purple-500',
    fill: 'currentColor',
    label: 'лайт'
  },
  pro: {
    bg: 'bg-amber-500/10',
    color: 'text-amber-500',
    fill: 'currentColor',
    label: 'про',
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
      className={`h-10 px-3 rounded-xl ${styles.bg} flex items-center gap-1.5 relative`}
    >
      {styles.glow && (
        <div className="absolute inset-0 rounded-xl bg-amber-500/20 blur-md" />
      )}
      <Crown
        size={14}
        className={`${styles.color} relative z-10`}
        fill={styles.fill}
        strokeWidth={tier === 'free' ? 2 : 1.5}
      />
      <span className={`${styles.color} text-sm font-medium relative z-10`}>
        {styles.label}
      </span>
    </motion.button>
  )
}
