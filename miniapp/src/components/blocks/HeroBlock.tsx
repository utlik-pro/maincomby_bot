/**
 * Hero Block - Main banner with CTA
 */

import React from 'react'
import { motion } from 'framer-motion'
import { openTelegramLink } from '@/lib/telegram'
import type { AppBlock, HeroBlockConfig } from '@shared/types'

interface HeroBlockProps {
  block: AppBlock<'hero'>
}

export function HeroBlock({ block }: HeroBlockProps) {
  const config = block.config as HeroBlockConfig

  const handleCTA = () => {
    if (config.ctaLink) {
      if (config.ctaLink.startsWith('https://t.me/')) {
        openTelegramLink(config.ctaLink)
      } else {
        window.open(config.ctaLink, '_blank')
      }
    }
  }

  const title = config.title?.ru || block.title?.ru
  const subtitle = config.subtitle?.ru
  const ctaText = config.ctaText?.ru

  return (
    <div className="px-4 mb-6">
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          backgroundImage: config.imageUrl ? `url(${config.imageUrl})` : undefined,
          backgroundColor: config.imageUrl ? undefined : '#1a1a1a',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {config.gradientOverlay && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        )}

        <div className="relative p-6 min-h-[160px] flex flex-col justify-end">
          {title && (
            <h2 className="text-2xl font-bold text-white mb-1">{title}</h2>
          )}
          {subtitle && (
            <p className="text-gray-300 text-sm mb-4">{subtitle}</p>
          )}
          {ctaText && config.ctaLink && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleCTA}
              className="bg-accent text-bg px-6 py-2 rounded-xl font-semibold w-fit"
            >
              {ctaText}
            </motion.button>
          )}
        </div>
      </div>
    </div>
  )
}
