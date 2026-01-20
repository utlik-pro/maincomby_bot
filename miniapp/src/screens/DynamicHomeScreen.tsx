/**
 * Dynamic Home Screen
 * Renders blocks based on tenant configuration
 */

import React from 'react'
import { Loader2 } from 'lucide-react'
import { useTenantBlocks } from '@/hooks/useTenantBlocks'
import { DynamicBlockList } from '@/components/blocks'

export function DynamicHomeScreen() {
  const { blocks, loading, error, isMultiTenant } = useTenantBlocks()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    )
  }

  if (error) {
    console.error('[DynamicHomeScreen] Error:', error)
    return null // Fall back to default HomeScreen
  }

  if (!isMultiTenant || blocks.length === 0) {
    return null // Fall back to default HomeScreen
  }

  return (
    <div className="pb-6">
      <DynamicBlockList blocks={blocks} />
    </div>
  )
}

export default DynamicHomeScreen
