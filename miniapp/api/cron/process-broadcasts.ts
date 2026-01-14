import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const VERCEL_URL = process.env.VERCEL_URL || 'localhost:3000'

/**
 * Cron job to process scheduled and sending broadcasts
 * Runs every minute via Vercel Cron
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET requests (Vercel cron uses GET)
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  // Verify cron secret (optional but recommended)
  const authHeader = req.headers.authorization
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ success: false, error: 'Unauthorized' })
  }

  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return res.status(500).json({ success: false, error: 'Supabase not configured' })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    const results: {
      scheduledStarted: number[]
      batchesProcessed: { id: number; processed: number; hasMore: boolean }[]
    } = {
      scheduledStarted: [],
      batchesProcessed: []
    }

    // 1. Check for scheduled broadcasts that need to start
    const { data: scheduled } = await supabase
      .from('broadcasts')
      .select('id')
      .eq('status', 'scheduled')
      .lte('scheduled_at', new Date().toISOString())

    for (const broadcast of (scheduled || [])) {
      try {
        // Call the main API to start the broadcast
        const protocol = VERCEL_URL.startsWith('localhost') ? 'http' : 'https'
        const response = await fetch(`${protocol}://${VERCEL_URL}/api/send-broadcast`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ broadcastId: broadcast.id, action: 'start' })
        })

        if (response.ok) {
          results.scheduledStarted.push(broadcast.id)
        }
      } catch (err) {
        console.error(`Failed to start scheduled broadcast ${broadcast.id}:`, err)
      }
    }

    // 2. Process batches for any broadcasts in 'sending' state
    const { data: sending } = await supabase
      .from('broadcasts')
      .select('id')
      .eq('status', 'sending')

    for (const broadcast of (sending || [])) {
      try {
        const protocol = VERCEL_URL.startsWith('localhost') ? 'http' : 'https'
        const response = await fetch(`${protocol}://${VERCEL_URL}/api/send-broadcast`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ broadcastId: broadcast.id, action: 'process_batch' })
        })

        if (response.ok) {
          const result = await response.json()
          results.batchesProcessed.push({
            id: broadcast.id,
            processed: result.processed || 0,
            hasMore: result.hasMore || false
          })
        }
      } catch (err) {
        console.error(`Failed to process batch for broadcast ${broadcast.id}:`, err)
      }
    }

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      results
    })
  } catch (error) {
    console.error('Cron job error:', error)
    return res.status(500).json({ success: false, error: 'Internal server error' })
  }
}
