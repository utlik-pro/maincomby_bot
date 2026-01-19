/**
 * Courses Block - Learning modules
 */

import React from 'react'
import { motion } from 'framer-motion'
import { BookOpen, ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui'
import { useAppStore } from '@/lib/store'
import type { AppBlock, CoursesBlockConfig } from '@shared/types'

interface CoursesBlockProps {
  block: AppBlock<'courses'>
}

export function CoursesBlock({ block }: CoursesBlockProps) {
  const { setActiveTab } = useAppStore()
  const title = block.title?.ru || 'Courses'

  return (
    <div className="px-4 mb-6">
      <Card
        onClick={() => setActiveTab('learn')}
        className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/20 cursor-pointer"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center shrink-0">
            <BookOpen className="text-blue-400" size={24} />
          </div>
          <div className="flex-1">
            <div className="font-bold text-white mb-0.5">{title}</div>
            <div className="text-xs text-gray-400">
              Learn new skills and earn XP
            </div>
          </div>
          <ChevronRight size={20} className="text-gray-500" />
        </div>
      </Card>
    </div>
  )
}
