/**
 * Dynamic Block Renderer
 * Renders blocks based on tenant configuration
 */

import React from 'react'
import type { AppBlock, BlockType } from '@shared/types'

// Block components
import { ProfileBlock } from './ProfileBlock'
import { EventsBlock } from './EventsBlock'
import { LeaderboardBlock } from './LeaderboardBlock'
import { NetworkBlock } from './NetworkBlock'
import { AchievementsBlock } from './AchievementsBlock'
import { StatsBlock } from './StatsBlock'
import { CoursesBlock } from './CoursesBlock'
import { HeroBlock } from './HeroBlock'
import { AnnouncementsBlock } from './AnnouncementsBlock'
import { CustomHtmlBlock } from './CustomHtmlBlock'

// Block component registry
// Using 'any' here because each block component expects a specific AppBlock<T> type
// but we need to dynamically dispatch based on blockType at runtime
const BLOCK_COMPONENTS: Record<BlockType, React.ComponentType<{ block: any }>> = {
  profile: ProfileBlock,
  events: EventsBlock,
  leaderboard: LeaderboardBlock,
  network: NetworkBlock,
  achievements: AchievementsBlock,
  stats: StatsBlock,
  courses: CoursesBlock,
  hero: HeroBlock,
  announcements: AnnouncementsBlock,
  custom_html: CustomHtmlBlock,
}

interface DynamicBlockProps {
  block: AppBlock
}

/**
 * Renders a single block based on its type
 */
export function DynamicBlock({ block }: DynamicBlockProps) {
  if (!block.isVisible) return null

  const Component = BLOCK_COMPONENTS[block.blockType]

  if (!Component) {
    console.warn(`[DynamicBlock] Unknown block type: ${block.blockType}`)
    return null
  }

  return <Component block={block} />
}

interface DynamicBlockListProps {
  blocks: AppBlock[]
}

/**
 * Renders a list of blocks in order
 */
export function DynamicBlockList({ blocks }: DynamicBlockListProps) {
  const visibleBlocks = blocks
    .filter(b => b.isVisible)
    .sort((a, b) => a.position - b.position)

  return (
    <>
      {visibleBlocks.map((block) => (
        <DynamicBlock key={block.id} block={block} />
      ))}
    </>
  )
}

export {
  ProfileBlock,
  EventsBlock,
  LeaderboardBlock,
  NetworkBlock,
  AchievementsBlock,
  StatsBlock,
  CoursesBlock,
  HeroBlock,
  AnnouncementsBlock,
  CustomHtmlBlock,
}
