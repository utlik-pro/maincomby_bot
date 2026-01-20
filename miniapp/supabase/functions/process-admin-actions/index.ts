import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface GiftProPayload {
  user_id: number
  duration_days: number
  admin_name: string
  admin_username: string
  admin_avatar_url?: string
}

interface AdminAction {
  id: number
  action: string
  payload: GiftProPayload
  status: string
  created_at: string
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const BOT_TOKEN = Deno.env.get('BOT_TOKEN')

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Fetch pending admin actions
    const { data: actions, error: fetchError } = await supabase
      .from('bot_admin_actions')
      .select('*')
      .eq('status', 'pending')
      .eq('action', 'gift_pro')
      .order('created_at', { ascending: true })
      .limit(10)

    if (fetchError) {
      console.error('Error fetching actions:', fetchError)
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to fetch actions' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!actions || actions.length === 0) {
      return new Response(
        JSON.stringify({ success: true, processed: 0, message: 'No pending actions' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const results: { actionId: number; success: boolean; error?: string }[] = []

    for (const action of actions as AdminAction[]) {
      const { id: actionId, payload } = action
      const { user_id, duration_days = 30, admin_name, admin_username } = payload

      try {
        // Mark as processing
        await supabase
          .from('bot_admin_actions')
          .update({ status: 'processing' })
          .eq('id', actionId)

        // Get user data
        const { data: user, error: userError } = await supabase
          .from('bot_users')
          .select('id, tg_user_id, first_name, subscription_tier, subscription_expires_at')
          .eq('id', user_id)
          .single()

        if (userError || !user) {
          throw new Error(`User ${user_id} not found`)
        }

        // Calculate expiration date
        const now = new Date()
        let expiresAt: Date

        if (
          user.subscription_tier === 'pro' &&
          user.subscription_expires_at &&
          new Date(user.subscription_expires_at) > now
        ) {
          // Extend existing PRO
          expiresAt = new Date(user.subscription_expires_at)
          expiresAt.setDate(expiresAt.getDate() + duration_days)
        } else {
          // New PRO subscription
          expiresAt = new Date(now)
          expiresAt.setDate(expiresAt.getDate() + duration_days)
        }

        // Update user subscription
        const { error: updateError } = await supabase
          .from('bot_users')
          .update({
            subscription_tier: 'pro',
            subscription_expires_at: expiresAt.toISOString()
          })
          .eq('id', user_id)

        if (updateError) {
          throw new Error(`Failed to update user: ${updateError.message}`)
        }

        // Send Telegram notification
        if (BOT_TOKEN && user.tg_user_id) {
          try {
            const message =
              `🎁 <b>Вам подарил PRO подписку @${admin_username}!</b>\n\n` +
              `${admin_name} активировал для вас режим PRO на ${duration_days} дней.\n` +
              `Теперь вам доступны:\n` +
              `✨ Безлимитные лайки\n` +
              `✨ 5 суперлайков в день\n` +
              `✨ Режим инкогнито\n` +
              `✨ Перемотка последней анкеты\n\n` +
              `Поблагодари в ответ! 🙏`

            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: user.tg_user_id,
                text: message,
                parse_mode: 'HTML'
              })
            })
          } catch (notifyError) {
            console.error(`Failed to notify user ${user_id}:`, notifyError)
            // Don't fail the whole action if notification fails
          }
        }

        // Mark as completed
        await supabase
          .from('bot_admin_actions')
          .update({
            status: 'completed',
            processed_at: new Date().toISOString()
          })
          .eq('id', actionId)

        results.push({ actionId, success: true })
        console.log(`Processed action ${actionId}: Gifted PRO to user ${user_id} until ${expiresAt.toISOString()}`)

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        console.error(`Failed to process action ${actionId}:`, errorMessage)

        // Mark as failed
        await supabase
          .from('bot_admin_actions')
          .update({
            status: 'failed',
            error_message: errorMessage,
            processed_at: new Date().toISOString()
          })
          .eq('id', actionId)

        results.push({ actionId, success: false, error: errorMessage })
      }
    }

    const processed = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length

    return new Response(
      JSON.stringify({
        success: true,
        processed,
        failed,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Process admin actions error:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
