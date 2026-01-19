import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import { setCorsHeaders } from './_lib/cors'
import { applyRateLimit, RATE_LIMITS } from './_lib/rate-limiter'

const BOT_TOKEN = process.env.BOT_TOKEN || ''
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Rate limiting: Telegram allows ~30 msg/sec, we use 25 to be safe
const BATCH_SIZE = 25

type BroadcastAction = 'start' | 'process_batch' | 'check_scheduled' | 'log_click'

interface BroadcastRequest {
  broadcastId?: number
  userId?: number
  action: BroadcastAction
}

interface Broadcast {
  id: number
  title: string
  message: string
  message_type: string
  deep_link_screen: string | null
  deep_link_button_text: string | null
  audience_type: string
  audience_config: Record<string, unknown>
  exclude_banned: boolean
  status: string
  scheduled_at: string | null
  started_at: string | null
  completed_at: string | null
  total_recipients: number
  sent_count: number
  delivered_count: number
  failed_count: number
  created_by: number
  created_at: string
  updated_at: string
}

interface BroadcastRecipient {
  id: number
  broadcast_id: number
  user_id: number
  tg_user_id: number
  status: string
  message_id: number | null
  error_message: string | null
  queued_at: string
  sent_at: string | null
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers - restricted to Telegram domains
  const origin = req.headers.origin as string | undefined
  setCorsHeaders(res, origin)

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Rate limiting: 60 requests per minute (polling every 1.5s = 40 req/min)
  if (applyRateLimit(req, res, RATE_LIMITS.sendBroadcast)) {
    return // Response already sent by rate limiter
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  try {
    if (!BOT_TOKEN) {
      console.error('BOT_TOKEN not configured')
      return res.status(500).json({ success: false, error: 'BOT_TOKEN not configured' })
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      console.error('Supabase not configured')
      return res.status(500).json({ success: false, error: 'Supabase not configured' })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    const { broadcastId, userId, action } = req.body as BroadcastRequest

    switch (action) {
      case 'start':
        if (!broadcastId) {
          return res.status(400).json({ success: false, error: 'broadcastId required' })
        }
        return await startBroadcast(supabase, broadcastId, res)

      case 'process_batch':
        if (!broadcastId) {
          return res.status(400).json({ success: false, error: 'broadcastId required' })
        }
        return await processBatch(supabase, broadcastId, res)

      case 'check_scheduled':
        return await checkScheduledBroadcasts(supabase, res)

      case 'log_click':
        if (!broadcastId || !userId) {
          return res.status(400).json({ success: false, error: 'broadcastId and userId required' })
        }
        return await logBroadcastClick(supabase, broadcastId, userId, res)

      default:
        return res.status(400).json({ success: false, error: 'Invalid action' })
    }
  } catch (error) {
    console.error('Broadcast error:', error)
    return res.status(500).json({ success: false, error: 'Failed to process broadcast' })
  }
}

/**
 * Start a broadcast - queue recipients and begin sending
 */
async function startBroadcast(
  supabase: ReturnType<typeof createClient<any, any>>,
  broadcastId: number,
  res: VercelResponse
) {
  // Get broadcast details
  const { data: broadcast, error: broadcastError } = await supabase
    .from('broadcasts')
    .select('*')
    .eq('id', broadcastId)
    .single()

  if (broadcastError || !broadcast) {
    return res.status(404).json({ success: false, error: 'Broadcast not found' })
  }

  if (broadcast.status !== 'draft' && broadcast.status !== 'scheduled') {
    return res.status(400).json({ success: false, error: `Broadcast already ${broadcast.status}` })
  }

  // Get audience based on targeting
  const recipients = await getAudienceUsers(supabase, broadcast as Broadcast)

  if (recipients.length === 0) {
    await supabase
      .from('broadcasts')
      .update({ status: 'failed', updated_at: new Date().toISOString() })
      .eq('id', broadcastId)
    return res.status(400).json({ success: false, error: 'No recipients found for this audience' })
  }

  // Queue recipients in batches
  const batchSize = 500
  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize).map(r => ({
      broadcast_id: broadcastId,
      user_id: r.user_id,
      tg_user_id: r.tg_user_id,
      status: 'pending'
    }))

    const { error: insertError } = await supabase
      .from('broadcast_recipients')
      .insert(batch)

    if (insertError) {
      console.error('Error queuing recipients:', insertError)
    }
  }

  // Update broadcast status
  await supabase
    .from('broadcasts')
    .update({
      status: 'sending',
      total_recipients: recipients.length,
      started_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', broadcastId)

  return res.status(200).json({
    success: true,
    message: 'Broadcast started',
    totalRecipients: recipients.length
  })
}

/**
 * Process a batch of pending recipients
 */
async function processBatch(
  supabase: ReturnType<typeof createClient<any, any>>,
  broadcastId: number,
  res: VercelResponse
) {
  // Get broadcast
  const { data: broadcast, error: broadcastError } = await supabase
    .from('broadcasts')
    .select('*')
    .eq('id', broadcastId)
    .single()

  if (broadcastError || !broadcast) {
    return res.status(404).json({ success: false, error: 'Broadcast not found' })
  }

  if (broadcast.status !== 'sending') {
    return res.status(400).json({ success: false, error: `Broadcast not in sending state (${broadcast.status})` })
  }

  // Get pending recipients
  const { data: recipients, error: recipientsError } = await supabase
    .from('broadcast_recipients')
    .select('*')
    .eq('broadcast_id', broadcastId)
    .eq('status', 'pending')
    .limit(BATCH_SIZE)

  if (recipientsError) {
    return res.status(500).json({ success: false, error: 'Failed to get recipients' })
  }

  if (!recipients || recipients.length === 0) {
    // No more recipients - mark as completed
    await supabase
      .from('broadcasts')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', broadcastId)

    return res.status(200).json({
      success: true,
      message: 'Broadcast completed',
      processed: 0,
      hasMore: false
    })
  }

  // Send messages to each recipient
  let deliveredCount = 0
  let failedCount = 0

  for (const recipient of recipients as BroadcastRecipient[]) {
    const result = await sendTelegramMessage(
      recipient.tg_user_id,
      broadcast.title,
      broadcast.message,
      broadcast.deep_link_screen,
      broadcast.deep_link_button_text,
      broadcastId
    )

    if (result.success) {
      await supabase
        .from('broadcast_recipients')
        .update({
          status: 'delivered',
          message_id: result.message_id,
          sent_at: new Date().toISOString()
        })
        .eq('id', recipient.id)
      deliveredCount++
    } else {
      await supabase
        .from('broadcast_recipients')
        .update({
          status: 'failed',
          error_message: result.error,
          sent_at: new Date().toISOString()
        })
        .eq('id', recipient.id)
      failedCount++
    }
  }

  // Update broadcast stats
  await supabase.rpc('update_broadcast_stats', {
    p_broadcast_id: broadcastId,
    p_sent: deliveredCount + failedCount,
    p_delivered: deliveredCount,
    p_failed: failedCount
  })

  // Check if there are more recipients
  const { count } = await supabase
    .from('broadcast_recipients')
    .select('*', { count: 'exact', head: true })
    .eq('broadcast_id', broadcastId)
    .eq('status', 'pending')

  const hasMore = (count || 0) > 0

  return res.status(200).json({
    success: true,
    processed: recipients.length,
    delivered: deliveredCount,
    failed: failedCount,
    hasMore
  })
}

/**
 * Check for scheduled broadcasts that need to start
 */
async function checkScheduledBroadcasts(
  supabase: ReturnType<typeof createClient<any, any>>,
  res: VercelResponse
) {
  const now = new Date().toISOString()

  // Find scheduled broadcasts that are due
  const { data: scheduled, error } = await supabase
    .from('broadcasts')
    .select('id')
    .eq('status', 'scheduled')
    .lte('scheduled_at', now)

  if (error) {
    return res.status(500).json({ success: false, error: 'Failed to check scheduled broadcasts' })
  }

  const startedIds: number[] = []

  for (const broadcast of (scheduled || [])) {
    // Start each broadcast
    const recipients = await getAudienceUsersById(supabase, broadcast.id)

    if (recipients.length > 0) {
      // Queue recipients
      const batchSize = 500
      for (let i = 0; i < recipients.length; i += batchSize) {
        const batch = recipients.slice(i, i + batchSize).map(r => ({
          broadcast_id: broadcast.id,
          user_id: r.user_id,
          tg_user_id: r.tg_user_id,
          status: 'pending'
        }))

        await supabase.from('broadcast_recipients').insert(batch)
      }

      // Update status
      await supabase
        .from('broadcasts')
        .update({
          status: 'sending',
          total_recipients: recipients.length,
          started_at: now,
          updated_at: now
        })
        .eq('id', broadcast.id)

      startedIds.push(broadcast.id)
    } else {
      // No recipients - mark as failed
      await supabase
        .from('broadcasts')
        .update({ status: 'failed', updated_at: now })
        .eq('id', broadcast.id)
    }
  }

  return res.status(200).json({
    success: true,
    startedBroadcasts: startedIds.length,
    broadcastIds: startedIds
  })
}

/**
 * Get audience users for a broadcast by ID
 */
async function getAudienceUsersById(
  supabase: ReturnType<typeof createClient<any, any>>,
  broadcastId: number
): Promise<{ user_id: number; tg_user_id: number }[]> {
  const { data: broadcast } = await supabase
    .from('broadcasts')
    .select('*')
    .eq('id', broadcastId)
    .single()

  if (!broadcast) return []
  return getAudienceUsers(supabase, broadcast as Broadcast)
}

/**
 * Get users matching audience criteria
 */
async function getAudienceUsers(
  supabase: ReturnType<typeof createClient<any, any>>,
  broadcast: Broadcast
): Promise<{ user_id: number; tg_user_id: number }[]> {
  const { audience_type, audience_config, exclude_banned } = broadcast

  let baseQuery = supabase
    .from('bot_users')
    .select('id, tg_user_id')

  if (exclude_banned) {
    baseQuery = baseQuery.eq('banned', false)
  }

  switch (audience_type) {
    case 'all': {
      const { data } = await baseQuery
      return (data || []).map(u => ({ user_id: u.id, tg_user_id: u.tg_user_id }))
    }

    case 'city': {
      const city = (audience_config as { city?: string }).city
      if (!city) return []

      const { data: profiles } = await supabase
        .from('bot_profiles')
        .select('user_id')
        .eq('city', city)

      const userIds = profiles?.map(p => p.user_id) || []
      if (userIds.length === 0) return []

      const { data } = await baseQuery.in('id', userIds)
      return (data || []).map(u => ({ user_id: u.id, tg_user_id: u.tg_user_id }))
    }

    case 'subscription': {
      const tiers = (audience_config as { tiers?: string[] }).tiers
      if (!tiers || tiers.length === 0) return []

      const { data } = await baseQuery.in('subscription_tier', tiers)
      return (data || []).map(u => ({ user_id: u.id, tg_user_id: u.tg_user_id }))
    }

    case 'team_role': {
      const teamRoles = (audience_config as { team_roles?: string[] }).team_roles
      if (!teamRoles || teamRoles.length === 0) return []

      const { data } = await baseQuery.in('team_role', teamRoles)
      return (data || []).map(u => ({ user_id: u.id, tg_user_id: u.tg_user_id }))
    }

    case 'event_not_registered': {
      const eventId = (audience_config as { event_id?: number }).event_id
      if (!eventId) return []

      // Get registered users
      const { data: registrations } = await supabase
        .from('bot_registrations')
        .select('user_id')
        .eq('event_id', eventId)
        .neq('status', 'cancelled')

      const registeredIds = new Set(registrations?.map(r => r.user_id) || [])

      // Get all users and filter out registered ones
      const { data: allUsers } = await baseQuery
      return (allUsers || [])
        .filter(u => !registeredIds.has(u.id))
        .map(u => ({ user_id: u.id, tg_user_id: u.tg_user_id }))
    }

    case 'custom': {
      const userIds = (audience_config as { user_ids?: number[] }).user_ids
      if (!userIds || userIds.length === 0) return []

      const { data } = await baseQuery.in('id', userIds)
      return (data || []).map(u => ({ user_id: u.id, tg_user_id: u.tg_user_id }))
    }

    default:
      return []
  }
}

/**
 * Log a broadcast click (prevents duplicate counting)
 */
async function logBroadcastClick(
  supabase: ReturnType<typeof createClient<any, any>>,
  broadcastId: number,
  userId: number,
  res: VercelResponse
) {
  // Use the database function to handle deduplication
  const { data, error } = await supabase.rpc('log_broadcast_click', {
    p_broadcast_id: broadcastId,
    p_user_id: userId
  })

  if (error) {
    console.error('Error logging click:', error)
    return res.status(500).json({ success: false, error: 'Failed to log click' })
  }

  return res.status(200).json({
    success: true,
    logged: data === true
  })
}

/**
 * Send a single Telegram message
 */
async function sendTelegramMessage(
  chatId: number,
  title: string,
  message: string,
  deepLinkScreen?: string | null,
  buttonText?: string | null,
  broadcastId?: number
): Promise<{ success: boolean; message_id?: number; error?: string }> {
  const text = `*${escapeMarkdown(title)}*\n\n${escapeMarkdown(message)}`

  const body: Record<string, unknown> = {
    chat_id: chatId,
    text,
    parse_mode: 'Markdown'
  }

  if (deepLinkScreen) {
    // Include broadcast_id in deep link for click tracking
    const startParam = broadcastId
      ? `${deepLinkScreen}_b${broadcastId}`
      : deepLinkScreen
    body.reply_markup = {
      inline_keyboard: [[{
        text: buttonText || 'Открыть',
        url: `https://t.me/maincomapp_bot?startapp=${startParam}`
      }]]
    }
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    const result = await response.json()

    if (result.ok) {
      return { success: true, message_id: result.result?.message_id }
    }
    return { success: false, error: result.description || 'Unknown error' }
  } catch (err) {
    return { success: false, error: (err as Error).message || 'Network error' }
  }
}

/**
 * Escape special characters for Telegram Markdown
 */
function escapeMarkdown(text: string): string {
  return text
    .replace(/_/g, '\\_')
    .replace(/\*/g, '\\*')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/~/g, '\\~')
    .replace(/`/g, '\\`')
    .replace(/>/g, '\\>')
    .replace(/#/g, '\\#')
    .replace(/\+/g, '\\+')
    .replace(/\-/g, '\\-')
    .replace(/=/g, '\\=')
    .replace(/\|/g, '\\|')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/\./g, '\\.')
    .replace(/!/g, '\\!')
}
