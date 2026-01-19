/**
 * Network Block - Match suggestions
 */

import React from 'react'
import { motion } from 'framer-motion'
import { Flame, ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui'
import { useAppStore } from '@/lib/store'
import type { AppBlock, NetworkBlockConfig } from '@shared/types'

interface NetworkBlockProps {
  block: AppBlock<'network'>
}

export function NetworkBlock({ block }: NetworkBlockProps) {
  const { setActiveTab } = useAppStore()
  const title = block.title?.ru || 'Network'

  return (
    <div className="px-4 mb-6">
      <Card
        onClick={() => setActiveTab('network')}
        className="bg-gradient-to-r from-accent/20 to-accent/5 border border-accent/20 cursor-pointer"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center shrink-0">
            <Flame className="text-accent" size={24} />
          </div>
          <div className="flex-1">
            <div className="font-bold text-white mb-0.5">{title}</div>
            <div className="text-xs text-gray-400">
              Find people to connect with
            </div>
          </div>
          <ChevronRight size={20} className="text-gray-500" />
        </div>
      </Card>
    </div>
  )
}
