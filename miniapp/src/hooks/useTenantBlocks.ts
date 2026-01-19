/**
 * Hook for accessing tenant blocks from context
 * Supports preview mode with auto-refresh for Builder live preview
 */

import { useState, useEffect, useCallback } from 'react'
import {
  getTenantBlocks,
  isTenantInitialized,
  initializeTenant,
  isPreviewMode,
  initializePreviewMode,
  refetchTenantBlocks,
} from '@/lib/tenant'
import type { AppBlock } from '@shared/types'

interface UseTenantBlocksResult {
  blocks: AppBlock[]
  loading: boolean
  error: Error | null
  isMultiTenant: boolean
  isPreview: boolean
  refetch: () => Promise<void>
}

const PREVIEW_REFRESH_INTERVAL = 2000 // 2 seconds

export function useTenantBlocks(): UseTenantBlocksResult {
  const [blocks, setBlocks] = useState<AppBlock[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isPreview, setIsPreview] = useState(false)

  const refetch = useCallback(async () => {
    try {
      const tenantBlocks = await refetchTenantBlocks()
      setBlocks(tenantBlocks)
      setError(null)
    } catch (err) {
      console.error('[useTenantBlocks] Refetch error:', err)
      setError(err instanceof Error ? err : new Error('Failed to refetch blocks'))
    }
  }, [])

  useEffect(() => {
    const previewMode = isPreviewMode()
    setIsPreview(previewMode)

    async function loadBlocks() {
      try {
        // Initialize based on mode
        if (!isTenantInitialized()) {
          if (previewMode) {
            await initializePreviewMode()
          } else {
            await initializeTenant()
          }
        }

        const tenantBlocks = getTenantBlocks()
        setBlocks(tenantBlocks)
        setError(null)
      } catch (err) {
        console.error('[useTenantBlocks] Error:', err)
        setError(err instanceof Error ? err : new Error('Failed to load blocks'))
      } finally {
        setLoading(false)
      }
    }

    loadBlocks()
  }, [])

  // Auto-refresh in preview mode
  useEffect(() => {
    if (!isPreview || loading) return

    const interval = setInterval(() => {
      refetch()
    }, PREVIEW_REFRESH_INTERVAL)

    return () => clearInterval(interval)
  }, [isPreview, loading, refetch])

  return {
    blocks,
    loading,
    error,
    isMultiTenant: blocks.length > 0,
    isPreview,
    refetch,
  }
}
