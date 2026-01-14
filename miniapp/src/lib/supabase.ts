import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { CustomBadge, UserBadge, Company, UserCompany, UserLink, LinkType, Event, AvatarSkin, UserAvatarSkin, SkinPermission, AppSetting, AppSettingKey, Invite, User, TeamRole, ProfilePhoto, PhotoUploadResult, SwipeCardProfile, UserProfile, Speaker, EventSpeaker, EventProgramItem, Course, Lesson, UserLessonProgress, LessonBlock, Broadcast, BroadcastRecipient, BroadcastTemplate, BroadcastAudienceType, BroadcastAudienceConfig, BroadcastStatus } from '@/types'
import { sendPushNotification, callEdgeFunction, type NotificationType as TelegramNotificationType } from './telegram'


const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  console.error('[Supabase] VITE_SUPABASE_URL is required')
}
if (!supabaseAnonKey) {
  console.error('[Supabase] VITE_SUPABASE_ANON_KEY is required')
}

// Lazy initialization - only create client when needed and key is available
let _supabase: SupabaseClient | null = null

function getSupabase(): SupabaseClient {
  if (!_supabase) {
    if (!supabaseAnonKey) {
      throw new Error('Supabase not configured - running in dev mode')
    }
    _supabase = createClient(supabaseUrl, supabaseAnonKey)
  }
  return _supabase
}

// Helper functions for common operations

// Users
export async function getUserByTelegramId(tgUserId: number) {
  const { data, error } = await getSupabase()
    .from('bot_users')
    .select('*')
    .eq('tg_user_id', tgUserId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function getUserById(userId: number) {
  const { data, error } = await getSupabase()
    .from('bot_users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function createOrUpdateUser(userData: {
  tg_user_id: number
  username?: string | null
  first_name?: string | null
  last_name?: string | null
  phone_number?: string | null
}) {
  const { data, error } = await getSupabase()
    .from('bot_users')
    .upsert(userData, { onConflict: 'tg_user_id' })
    .select('*')
    .single()

  if (error) throw error
  return data
}

// Profiles
export async function getProfile(userId: number) {
  const { data, error } = await getSupabase()
    .from('bot_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function updateProfile(userId: number, profileData: {
  bio?: string | null
  occupation?: string | null
  city?: string
  looking_for?: string | null
  can_help_with?: string | null
  photo_url?: string | null
  skills?: string[] | null
  interests?: string[] | null
}) {
  const { data, error } = await getSupabase()
    .from('bot_profiles')
    .update({
      ...profileData,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateProfileVisibility(userId: number, isVisible: boolean) {
  const { data, error } = await getSupabase()
    .from('bot_profiles')
    .update({ is_visible: isVisible, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function createProfile(userId: number, profileData: {
  bio?: string | null
  occupation?: string | null
  city: string
  looking_for?: string | null
  can_help_with?: string | null
  photo_url?: string | null
  skills?: string[] | null
  interests?: string[] | null
}) {
  const { data, error } = await getSupabase()
    .from('bot_profiles')
    .insert({
      user_id: userId,
      ...profileData,
      moderation_status: 'pending',
      is_visible: true,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getApprovedProfiles(excludeUserId: number, city?: string) {
  const supabase = getSupabase()

  // Получаем ID уже просвайпанных пользователей
  const { data: swipedData } = await supabase
    .from('bot_swipes')
    .select('swiped_id')
    .eq('swiper_id', excludeUserId)

  const swipedIds = swipedData?.map(s => s.swiped_id) || []

  let query = supabase
    .from('bot_profiles')
    .select(`
      *,
      user:bot_users(
        *,
        active_skin:avatar_skins(*)
      )
    `)
    .eq('is_visible', true)
    .neq('user_id', excludeUserId)

  if (city) {
    query = query.eq('city', city)
  }

  const { data, error } = await query
  if (error) throw error

  // Фильтруем уже просвайпанных на клиенте
  if (swipedIds.length > 0) {
    return (data || []).filter(p => !swipedIds.includes(p.user_id))
  }

  return data
}

// Swipes
export async function getSwipedUserIds(swiperId: number) {
  const { data, error } = await getSupabase()
    .from('bot_swipes')
    .select('swiped_id')
    .eq('swiper_id', swiperId)

  if (error) throw error
  return data?.map(s => s.swiped_id) || []
}

export async function createSwipe(swiperId: number, swipedId: number, action: 'like' | 'skip' | 'superlike') {
  const { data, error } = await getSupabase()
    .from('bot_swipes')
    .insert({ swiper_id: swiperId, swiped_id: swipedId, action })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Increment daily swipes counter for a user
 * Resets counter if it's a new day
 */
export async function incrementDailySwipes(userId: number): Promise<{ daily_swipes_used: number; daily_swipes_reset_at: string }> {
  const supabase = getSupabase()

  // Get current user data
  const { data: user, error: fetchError } = await supabase
    .from('bot_users')
    .select('daily_swipes_used, daily_swipes_reset_at')
    .eq('id', userId)
    .single()

  if (fetchError) throw fetchError

  const now = new Date()
  const resetAt = user?.daily_swipes_reset_at ? new Date(user.daily_swipes_reset_at) : null

  // Check if we need to reset (new day or never set)
  const needsReset = !resetAt || now >= resetAt

  let newCount: number
  let newResetAt: string

  if (needsReset) {
    // Reset to 1 and set next reset time to tomorrow midnight
    newCount = 1
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    newResetAt = tomorrow.toISOString()
  } else {
    // Increment counter
    newCount = (user?.daily_swipes_used || 0) + 1
    newResetAt = user?.daily_swipes_reset_at || now.toISOString()
  }

  // Update user
  const { error: updateError } = await supabase
    .from('bot_users')
    .update({
      daily_swipes_used: newCount,
      daily_swipes_reset_at: newResetAt
    })
    .eq('id', userId)

  if (updateError) throw updateError

  return { daily_swipes_used: newCount, daily_swipes_reset_at: newResetAt }
}

export async function getCoreTeamUsers() {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('bot_users')
    .select(`
      *,
      profile:bot_profiles(*),
      active_skin:avatar_skins(*)
    `)
    .eq('team_role', 'core')
    .order('points', { ascending: false })

  if (error) throw error
  return data
}

export async function checkMutualLike(userId1: number, userId2: number) {
  const { data, error } = await getSupabase()
    .from('bot_swipes')
    .select('id')
    .eq('swiper_id', userId2)
    .eq('swiped_id', userId1)
    .in('action', ['like', 'superlike'])
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return !!data
}

// Matches
export async function createMatch(userId1: number, userId2: number) {
  const supabase = getSupabase()
  const minId = Math.min(userId1, userId2)
  const maxId = Math.max(userId1, userId2)

  // Check if match already exists
  const { data: existing } = await supabase
    .from('bot_matches')
    .select('id')
    .eq('user1_id', minId)
    .eq('user2_id', maxId)
    .single()

  if (existing) {
    // Match already exists, return it
    return existing
  }

  const { data, error } = await supabase
    .from('bot_matches')
    .insert({
      user1_id: minId,
      user2_id: maxId,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getUserMatches(userId: number) {
  const supabase = getSupabase()

  // Get matches
  const { data: matches, error } = await supabase
    .from('bot_matches')
    .select('*')
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .eq('is_active', true)
    .order('matched_at', { ascending: false })

  if (error) throw error
  if (!matches || matches.length === 0) return []

  // Get all user IDs from matches
  const userIds = new Set<number>()
  matches.forEach(m => {
    userIds.add(m.user1_id)
    userIds.add(m.user2_id)
  })

  // Fetch users and profiles with skin data
  const { data: users } = await supabase
    .from('bot_users')
    .select(`
      *,
      active_skin:avatar_skins(*)
    `)
    .in('id', Array.from(userIds))

  const { data: profiles } = await supabase
    .from('bot_profiles')
    .select('*')
    .in('user_id', Array.from(userIds))

  // Combine data
  return matches.map(match => ({
    ...match,
    user1: users?.find(u => u.id === match.user1_id) || null,
    user2: users?.find(u => u.id === match.user2_id) || null,
    profile1: profiles?.find(p => p.user_id === match.user1_id) || null,
    profile2: profiles?.find(p => p.user_id === match.user2_id) || null,
  }))
}

// Events
export async function getActiveEvents() {
  const { data, error } = await getSupabase()
    .from('bot_events')
    .select('*')
    .eq('is_active', true)
    .gte('event_date', new Date().toISOString())
    .order('event_date', { ascending: true })

  if (error) throw error
  return data
}

export async function getEventById(eventId: number): Promise<Event | null> {
  const { data, error } = await getSupabase()
    .from('bot_events')
    .select('*')
    .eq('id', eventId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function getEventRegistration(eventId: number, userId: number) {
  const { data, error } = await getSupabase()
    .from('bot_registrations')
    .select('*')
    .eq('event_id', eventId)
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function createEventRegistration(eventId: number, userId: number) {
  const supabase = getSupabase()

  // Check if already registered
  const { data: existing } = await supabase
    .from('bot_registrations')
    .select('id')
    .eq('event_id', eventId)
    .eq('user_id', userId)
    .neq('status', 'cancelled')
    .single()

  if (existing) {
    throw new Error('Вы уже зарегистрированы на это событие')
  }

  // Generate unique ticket code
  const ticketCode = `MAIN-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

  const { data, error } = await supabase
    .from('bot_registrations')
    .insert({
      event_id: eventId,
      user_id: userId,
      status: 'registered',
      ticket_code: ticketCode,
    })
    .select()
    .single()

  if (error) throw error

  // Sync to leads table for web admin panel
  try {
    await syncRegistrationToLeads(supabase, eventId, userId)
  } catch (e) {
    console.warn('Failed to sync registration to leads:', e)
  }

  return data
}

// Sync registration to web admin leads table
async function syncRegistrationToLeads(supabase: SupabaseClient, eventId: number, userId: number) {
  // Get bot event info
  const { data: botEvent } = await supabase
    .from('bot_events')
    .select('title')
    .eq('id', eventId)
    .single()

  if (!botEvent) return

  // Find matching web event by title to get UUID
  const { data: webEvents } = await supabase
    .from('events')
    .select('id')
    .eq('title', botEvent.title)

  const webEventId = webEvents?.[0]?.id || null

  // Get user info
  const { data: user } = await supabase
    .from('bot_users')
    .select('tg_user_id, username, first_name, last_name, phone_number')
    .eq('id', userId)
    .single()

  if (!user) return

  // Check if lead already exists by telegram_id or placeholder email
  const placeholderEmail = `tg_${user.tg_user_id}@telegram.placeholder`
  const { data: existingLead } = await supabase
    .from('leads')
    .select('id')
    .or(`email.eq.${placeholderEmail},telegram_id.eq.${user.tg_user_id}`)
    .maybeSingle()

  if (existingLead) return

  // Create lead with event_id for admin panel filtering
  await supabase.from('leads').insert({
    event_id: webEventId,
    name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || 'Unknown',
    email: placeholderEmail,
    phone: user.phone_number,
    telegram_username: user.username,
    telegram_id: user.tg_user_id,
    source: 'telegram_miniapp',
    status: 'registered',
    notes: `Mini App | ${botEvent.title}`,
  })
}

export async function getUserRegistrations(userId: number) {
  const { data, error } = await getSupabase()
    .from('bot_registrations')
    .select(`
      *,
      event:bot_events(*)
    `)
    .eq('user_id', userId)
    .order('registered_at', { ascending: false })

  if (error) throw error
  return data
}

// Get checked-in attendees for an event (for volunteers/admins)
export async function getEventCheckins(eventId: number) {
  const supabase = getSupabase()

  // Get registrations with attended status
  const { data: registrations, error } = await supabase
    .from('bot_registrations')
    .select('*')
    .eq('event_id', eventId)
    .eq('status', 'attended')
    .order('checked_in_at', { ascending: false })

  if (error) throw error
  if (!registrations || registrations.length === 0) return []

  // Get user details for each registration
  const userIds = registrations.map(r => r.user_id)

  const { data: users } = await supabase
    .from('bot_users')
    .select('id, first_name, last_name, username, tg_user_id')
    .in('id', userIds)

  const { data: profiles } = await supabase
    .from('bot_profiles')
    .select('user_id, photo_url')
    .in('user_id', userIds)

  // Combine data
  return registrations.map(reg => ({
    ...reg,
    user: users?.find(u => u.id === reg.user_id) || null,
    profile: profiles?.find(p => p.user_id === reg.user_id) || null,
  }))
}

// Get all registrations for an event (for volunteers/admins)
export async function getEventRegistrations(eventId: number) {
  const supabase = getSupabase()

  // Get registrations
  const { data: registrations, error } = await supabase
    .from('bot_registrations')
    .select('*')
    .eq('event_id', eventId)
    .neq('status', 'cancelled')
    .order('registered_at', { ascending: false })

  if (error) throw error
  if (!registrations || registrations.length === 0) return []

  // Get user IDs
  const userIds = registrations.map(r => r.user_id)

  // Fetch users
  const { data: users } = await supabase
    .from('bot_users')
    .select('id, first_name, last_name, username, tg_user_id, phone_number')
    .in('id', userIds)

  // Fetch profiles
  const { data: profiles } = await supabase
    .from('bot_profiles')
    .select('user_id, photo_url')
    .in('user_id', userIds)

  // Combine data
  return registrations.map(reg => ({
    ...reg,
    user: users?.find(u => u.id === reg.user_id) || null,
    profile: profiles?.find(p => p.user_id === reg.user_id) || null,
  }))
}

// Cancel registration
export async function cancelEventRegistration(registrationId: number, userId: number) {
  const supabase = getSupabase()

  // Update status to cancelled
  const { error } = await supabase
    .from('bot_registrations')
    .update({ status: 'cancelled' })
    .eq('id', registrationId)

  if (error) throw error

  // Remove XP that was awarded for registration
  try {
    await addXP(userId, -10, 'EVENT_CANCEL')
  } catch (e) {
    console.warn('Failed to remove XP for cancelled registration:', e)
  }
}

// Check-in (for volunteers/admins)
export async function checkInByTicketCode(ticketCode: string, volunteerId: number) {
  const supabase = getSupabase()

  const { data: registration, error: findError } = await supabase
    .from('bot_registrations')
    .select('*, event:bot_events(*)')
    .eq('ticket_code', ticketCode)
    .single()

  if (findError) throw findError
  if (!registration) throw new Error('Билет не найден')
  if (registration.status === 'attended') throw new Error('Билет уже использован')
  if (registration.status === 'cancelled') throw new Error('Регистрация отменена')

  const { data, error } = await supabase
    .from('bot_registrations')
    .update({
      status: 'attended',
      checked_in_at: new Date().toISOString(),
      checked_in_by: volunteerId,
    })
    .eq('id', registration.id)
    .select()
    .single()

  if (error) throw error

  // Award XP to the user who is checking in (not the volunteer)
  try {
    await addXP(registration.user_id, 50, 'EVENT_CHECKIN')
    console.log(`[CheckIn] Awarded 50 XP to user ${registration.user_id} for check-in`)
  } catch (e) {
    console.warn('[CheckIn] XP award failed:', e)
  }

  return { registration: data, event: registration.event }
}

// Rank thresholds (same as store.ts)
const RANK_THRESHOLDS: Record<string, number> = {
  newcomer: 0,
  member: 100,
  activist: 300,
  enthusiast: 600,
  contributor: 1000,
  ambassador: 2000,
  expert: 5000,
  leader: 10000,
  founder: 20000,
}

const RANK_NAMES: Record<string, string> = {
  newcomer: 'Новичок',
  member: 'Участник',
  activist: 'Активист',
  enthusiast: 'Энтузиаст',
  contributor: 'Контрибьютор',
  ambassador: 'Амбассадор',
  expert: 'Эксперт',
  leader: 'Лидер',
  founder: 'Основатель',
}

function getRankFromPoints(points: number): string {
  if (points >= RANK_THRESHOLDS.founder) return 'founder'
  if (points >= RANK_THRESHOLDS.leader) return 'leader'
  if (points >= RANK_THRESHOLDS.expert) return 'expert'
  if (points >= RANK_THRESHOLDS.ambassador) return 'ambassador'
  if (points >= RANK_THRESHOLDS.contributor) return 'contributor'
  if (points >= RANK_THRESHOLDS.enthusiast) return 'enthusiast'
  if (points >= RANK_THRESHOLDS.activist) return 'activist'
  if (points >= RANK_THRESHOLDS.member) return 'member'
  return 'newcomer'
}

// XP & Achievements
export async function addXP(userId: number, amount: number, reason: string, skipNotification = false) {
  const supabase = getSupabase()

  console.log(`[XP] Adding ${amount} XP to user ${userId} for ${reason}`)

  // Get current points before update
  const { data: userBefore, error: getUserError } = await supabase
    .from('bot_users')
    .select('points')
    .eq('id', userId)
    .single()

  if (getUserError) {
    console.error('[XP] Failed to get user:', getUserError)
  }

  const oldPoints = userBefore?.points || 0
  const oldRank = getRankFromPoints(oldPoints)

  // Try to add transaction (don't fail if table doesn't exist or RLS blocks)
  const { error: txError } = await supabase
    .from('xp_transactions')
    .insert({ user_id: userId, amount, reason })

  if (txError) {
    console.warn('[XP] Failed to insert xp_transaction (continuing anyway):', txError.message)
    // Don't throw - continue with points update
  }

  // Try RPC first, fallback to direct update
  let newPoints = oldPoints + amount

  const { data: rpcData, error: rpcError } = await supabase
    .rpc('increment_user_points', { p_user_id: userId, p_points_to_add: amount })

  if (rpcError) {
    console.warn('[XP] RPC failed, trying direct update:', rpcError.message)

    // Fallback: direct update
    const { data: updateData, error: updateError } = await supabase
      .from('bot_users')
      .update({ points: Math.max(0, oldPoints + amount) })
      .eq('id', userId)
      .select('points')
      .single()

    if (updateError) {
      console.error('[XP] Direct update also failed:', updateError)
      throw updateError
    }

    newPoints = updateData?.points || newPoints
    console.log(`[XP] Success via direct update! User ${userId} now has ${newPoints} points`)
  } else {
    newPoints = rpcData || newPoints
    console.log(`[XP] Success via RPC! User ${userId} now has ${newPoints} points`)
  }

  const newRank = getRankFromPoints(newPoints)

  // Check for rank up and create notification
  if (newRank !== oldRank) {
    try {
      await createNotification(
        userId,
        'rank_up',
        `Новый уровень: ${RANK_NAMES[newRank]}!`,
        `Поздравляем! Вы достигли уровня "${RANK_NAMES[newRank]}" с ${newPoints} XP!`,
        { rank: newRank, points: newPoints }
      )
    } catch (e) {
      console.warn('Failed to create rank up notification:', e)
    }
  }

  // Create XP notification (unless skipped)
  if (!skipNotification) {
    try {
      await createNotification(
        userId,
        'xp',
        `+${amount} XP`,
        `Вы получили ${amount} XP за: ${getReasonText(reason)}`,
        { amount, reason }
      )
    } catch (e) {
      console.warn('Failed to create XP notification:', e)
    }
  }

  return newPoints
}

export function getXPReasonText(reason: string): string {
  const reasons: Record<string, string> = {
    EVENT_REGISTER: 'регистрация на событие',
    EVENT_CHECKIN: 'посещение события',
    EVENT_CANCEL: 'отмена регистрации',
    PROFILE_COMPLETE: 'заполнение профиля',
    MATCH_RECEIVED: 'новый контакт',
    FRIEND_INVITE: 'приглашение друга',
    FIRST_SWIPE: 'первый свайп',
    FEEDBACK_SUBMIT: 'отзыв о событии',
    TEAM_ROLE_ASSIGNED: 'роль в команде',
    // Easter eggs
    EASTER_EGG_LOGO_TAPS: 'секрет логотипа',
    EASTER_EGG_AVATAR_TAPS: 'секрет аватара',
    EASTER_EGG_RANK_TAPS: 'секрет ранга',
    EASTER_EGG_LONG_PRESS: 'долгое нажатие',
    EASTER_EGG_DOUBLE_TAP: 'двойной тап',
    EASTER_EGG_SWIPE_PATTERN: 'паттерн свайпов',
    EASTER_EGG_SECRET_CODE: 'секретный код MAIN',
    EASTER_EGG_SPEED_RUNNER: 'спидраннер',
    EASTER_EGG_KONAMI_CODE: 'код Konami',
    EASTER_EGG_TRIPLE_TAP: 'тройной тап',
    EASTER_EGG_PULL_REFRESH: 'обновлятор',
    EASTER_EGG_IDLE_MASTER: 'мастер ожидания',
    EASTER_EGG_COLLECTOR: 'коллекционер',
    // Profile completion rewards
    PROFILE_PHOTO_ADDED: 'добавление фото',
    PROFILE_BIO_ADDED: 'добавление био',
    PROFILE_OCCUPATION_ADDED: 'добавление профессии',
    PROFILE_CITY_ADDED: 'указание города',
    PROFILE_LINKEDIN_ADDED: 'добавление LinkedIn',
    PROFILE_SKILLS_ADDED: 'добавление навыков',
    PROFILE_INTERESTS_ADDED: 'добавление интересов',
    PROFILE_COMPLETE_BONUS: 'полный профиль',
    // Invite rewards
    INVITE_ACCEPTED: 'присоединение по инвайту',
  }
  return reasons[reason] || reason
}

// Internal alias for backward compatibility
function getReasonText(reason: string): string {
  return getXPReasonText(reason)
}

// Check if user has received a specific XP bonus
export async function hasReceivedXPBonus(userId: number, reason: string): Promise<boolean> {
  const supabase = getSupabase()
  const { data } = await supabase
    .from('xp_transactions')
    .select('id')
    .eq('user_id', userId)
    .eq('reason', reason)
    .limit(1)

  return (data && data.length > 0) || false
}

// Get XP transaction history for a user
export interface XPTransaction {
  id: number
  user_id: number
  amount: number
  reason: string
  created_at: string
}

export async function getXPHistory(userId: number, limit = 50): Promise<XPTransaction[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('xp_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('[XP] Failed to get XP history:', error)
    return []
  }

  return data as XPTransaction[]
}

export async function getUserAchievements(userId: number) {
  const { data, error } = await getSupabase()
    .from('user_achievements')
    .select('*')
    .eq('user_id', userId)

  if (error) throw error
  return data
}

export async function unlockAchievement(userId: number, achievementId: string) {
  const { data, error } = await getSupabase()
    .from('user_achievements')
    .insert({ user_id: userId, achievement_id: achievementId })
    .select()
    .single()

  if (error && error.code !== '23505') throw error // Ignore duplicate key
  return data
}

// Get user stats (events attended, matches, achievements)
export async function getUserStats(userId: number) {
  const supabase = getSupabase()

  // Get attended events count
  const { count: eventsCount } = await supabase
    .from('bot_registrations')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'attended')

  // Get matches count
  const { count: matchesCount } = await supabase
    .from('bot_matches')
    .select('*', { count: 'exact', head: true })
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)

  // Get achievements count
  const { count: achievementsCount } = await supabase
    .from('user_achievements')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  return {
    events: eventsCount || 0,
    matches: matchesCount || 0,
    achievements: achievementsCount || 0,
  }
}

// Check and unlock achievements based on user stats
export async function checkAndUnlockAchievements(userId: number) {
  const supabase = getSupabase()
  const unlockedAchievements: string[] = []

  // Get user's attended events count
  const { count: attendedCount } = await supabase
    .from('bot_registrations')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'attended')

  // Get user's matches count
  const { count: matchesCount } = await supabase
    .from('bot_matches')
    .select('*', { count: 'exact', head: true })
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)

  // Get existing achievements
  const { data: existingAchievements } = await supabase
    .from('user_achievements')
    .select('achievement_id')
    .eq('user_id', userId)

  const hasAchievement = (id: string) => existingAchievements?.some(a => a.achievement_id === id)

  // first_step - first event attended
  if ((attendedCount || 0) >= 1 && !hasAchievement('first_step')) {
    await unlockAchievement(userId, 'first_step')
    unlockedAchievements.push('first_step')
  }

  // on_fire - 3 events
  if ((attendedCount || 0) >= 3 && !hasAchievement('on_fire')) {
    await unlockAchievement(userId, 'on_fire')
    unlockedAchievements.push('on_fire')
  }

  // regular - 10 events
  if ((attendedCount || 0) >= 10 && !hasAchievement('regular')) {
    await unlockAchievement(userId, 'regular')
    unlockedAchievements.push('regular')
  }

  // social_butterfly - 10 matches
  if ((matchesCount || 0) >= 10 && !hasAchievement('social_butterfly')) {
    await unlockAchievement(userId, 'social_butterfly')
    unlockedAchievements.push('social_butterfly')
  }

  // networker - 25 matches
  if ((matchesCount || 0) >= 25 && !hasAchievement('networker')) {
    await unlockAchievement(userId, 'networker')
    unlockedAchievements.push('networker')
  }

  if (unlockedAchievements.length > 0) {
    return unlockedAchievements
  }

  return []
}

// ============================================
// App Settings & Invites System
// ============================================

// Get app setting value
export async function getAppSetting<T>(key: AppSettingKey, defaultValue: T): Promise<T> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', key)
    .single()

  if (error || !data) {
    return defaultValue
  }

  return data.value as T
}

// Update app setting (admins only)
export async function updateAppSetting(key: AppSettingKey, value: any, updatedBy: number): Promise<boolean> {
  const supabase = getSupabase()

  const { error } = await supabase
    .from('app_settings')
    .upsert({
      key,
      value,
      updated_by: updatedBy,
      updated_at: new Date().toISOString()
    })

  return !error
}

// Check if invite is required
export async function isInviteRequired(): Promise<boolean> {
  return getAppSetting<boolean>('invite_required', false)
}

// Check user access (is existing user or whitelisted)
export async function checkUserAccess(tgUserId: number): Promise<{
  hasAccess: boolean
  isExistingUser: boolean
  isWhitelisted: boolean
}> {
  const supabase = getSupabase()

  // 1. Check if user exists
  const { data: user } = await supabase
    .from('bot_users')
    .select('id')
    .eq('tg_user_id', tgUserId)
    .single()

  if (user) {
    return { hasAccess: true, isExistingUser: true, isWhitelisted: false }
  }

  // 2. Check whitelist
  const { data: whitelist } = await supabase
    .from('admin_whitelist')
    .select('id')
    .eq('tg_user_id', tgUserId)
    .single()

  if (whitelist) {
    return { hasAccess: true, isExistingUser: false, isWhitelisted: true }
  }

  return { hasAccess: false, isExistingUser: false, isWhitelisted: false }
}

// Validate invite code
export async function validateInviteCode(code: string): Promise<{
  valid: boolean
  inviterName?: string
  error?: string
  invite?: any
}> {
  const supabase = getSupabase()

  const { data: invite, error } = await supabase
    .from('invites')
    .select('*, inviter:bot_users!inviter_id(first_name, last_name, username)')
    .eq('code', code.toUpperCase())
    .single()

  if (error || !invite) {
    return { valid: false, error: 'Код не найден' }
  }

  if (invite.invitee_id || invite.used_at) {
    return { valid: false, error: 'Код уже использован' }
  }

  const inviterName = invite.inviter?.first_name
    ? `${invite.inviter.first_name} ${invite.inviter.last_name || ''}`.trim()
    : invite.inviter?.username || 'Друг'

  return { valid: true, inviterName, invite }
}

// Use invite and create user
export async function useInviteAndCreateUser(
  code: string,
  userData: { tg_user_id: number; username?: string | null; first_name?: string | null; last_name?: string | null; photo_url?: string | null }
): Promise<{ success: boolean; user?: User; error?: string }> {
  const supabase = getSupabase()

  // 1. Validate code again
  const { valid, invite, error: valError } = await validateInviteCode(code)
  if (!valid || !invite) {
    return { success: false, error: valError || 'Invalid code' }
  }

  // 2. Create user with invite info
  const { data: newUser, error: createError } = await supabase
    .from('bot_users')
    .insert({
      tg_user_id: userData.tg_user_id,
      username: userData.username,
      first_name: userData.first_name,
      last_name: userData.last_name,
      invited_by: invite.inviter_id,
      invite_code_used: code,
      invites_remaining: 5, // Give 5 invites to new user
      subscription_tier: 'free',
      points: 50 // +50 XP for joining
    })
    .select()
    .single()

  if (createError || !newUser) {
    console.error('Failed to create user:', createError)
    return { success: false, error: 'Ошибка при создании пользователя' }
  }

  // 3. Mark invite as used
  await supabase
    .from('invites')
    .update({
      invitee_id: newUser.id,
      used_at: new Date().toISOString()
    })
    .eq('id', invite.id)

  // 3.5. Decrement inviter's remaining invites
  await supabase.rpc('decrement_invites', { p_user_id: invite.inviter_id })

  // 4. Create 5 invites for new user
  await supabase.rpc('create_user_invites', { p_user_id: newUser.id, p_count: 5 })

  // 5. Reward inviter (+50 XP)
  await addXP(invite.inviter_id, 50, 'FRIEND_INVITE')

  // 6. Reward new user (already got 50 points, but let's log transaction)
  await supabase
    .from('xp_transactions')
    .insert({
      user_id: newUser.id,
      amount: 50,
      reason: 'INVITE_ACCEPTED'
    })

  // 7. Initialize profile for new user
  try {
    await createProfile(newUser.id, {
      city: 'Минск',
      photo_url: userData.photo_url || null
    })
  } catch (e) {
    console.warn('Profile auto-creation failed, user can create later')
  }

  return { success: true, user: newUser }
}

// Get user invites
export async function getUserInvites(userId: number): Promise<Invite[]> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('invites')
    .select('*')
    .eq('inviter_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to get invites:', error)
    return []
  }

  return data as Invite[]
}

// Create invites for user
export async function createUserInvites(userId: number, count: number = 5): Promise<boolean> {
  const { error } = await getSupabase().rpc('create_user_invites', {
    p_user_id: userId,
    p_count: count
  })

  if (error) {
    console.error('Failed to create invites:', error)
    return false
  }
  return true
}

// Generate invite link
export function generateInviteLink(code: string): string {
  return `https://t.me/maincomapp_bot?startapp=invite_${code}`
}

// Notifications
export type NotificationType = 'event_reminder' | 'event_invitation' | 'match' | 'achievement' | 'rank_up' | 'system' | 'xp'

export interface AppNotification {
  id: number
  user_id: number
  type: NotificationType
  title: string
  message: string
  data: Record<string, any>
  is_read: boolean
  created_at: string
}

export async function getNotifications(userId: number, limit = 50) {
  const { data, error } = await getSupabase()
    .from('app_notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as AppNotification[]
}

export async function getUnreadNotificationsCount(userId: number): Promise<number> {
  const { count, error } = await getSupabase()
    .from('app_notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false)

  if (error) throw error
  return count || 0
}

export async function markNotificationAsRead(notificationId: number) {
  const { error } = await getSupabase()
    .from('app_notifications')
    .update({ is_read: true })
    .eq('id', notificationId)

  if (error) throw error
}

export async function markAllNotificationsAsRead(userId: number) {
  const { error } = await getSupabase()
    .from('app_notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false)

  if (error) throw error
}

export async function createNotification(
  userId: number,
  type: NotificationType,
  title: string,
  message: string,
  data: Record<string, any> = {}
) {
  const { data: notification, error } = await getSupabase()
    .from('app_notifications')
    .insert({ user_id: userId, type, title, message, data })
    .select()
    .single()

  if (error) throw error
  return notification as AppNotification
}

// Get unseen event invitations (notifications with event data)
export async function getUnseenEventInvitations(userId: number): Promise<AppNotification[]> {
  const { data, error } = await getSupabase()
    .from('app_notifications')
    .select('*')
    .eq('user_id', userId)
    .eq('type', 'event_invitation')
    .eq('is_read', false)
    .order('created_at', { ascending: false })
    .limit(5)

  if (error) {
    console.error('[getUnseenEventInvitations] Error:', error)
    return []
  }
  return (data || []) as AppNotification[]
}

// Get latest active event for announcement
export async function getLatestEventForAnnouncement(lastSeenEventId: number | null): Promise<Event | null> {
  const query = getSupabase()
    .from('bot_events')
    .select('*')
    .eq('is_active', true)
    .gte('event_date', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)

  if (lastSeenEventId) {
    query.gt('id', lastSeenEventId)
  }

  const { data, error } = await query

  if (error) {
    console.error('[getLatestEventForAnnouncement] Error:', error)
    return null
  }
  return data?.[0] as Event | null
}

// Leaderboard - Top users by XP
export async function getLeaderboard(limit = 10) {
  const { data, error } = await getSupabase()
    .from('bot_users')
    .select(`
      id,
      tg_user_id,
      username,
      first_name,
      last_name,
      points,
      team_role,
      subscription_tier,
      profile:bot_profiles(photo_url),
      active_skin:avatar_skins(*)
    `)
    .gt('points', 0)
    .order('points', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}

// Team members
export async function getTeamMembers() {
  const { data, error } = await getSupabase()
    .from('bot_users')
    .select(`
      id,
      tg_user_id,
      username,
      first_name,
      last_name,
      team_role,
      profile:bot_profiles(photo_url, occupation, bio),
      active_skin:avatar_skins(*)
    `)
    .not('team_role', 'is', null)
    .order('team_role', { ascending: true })

  if (error) throw error
  return data
}

// ============================================
// Extended Profile: Badges, Companies, Links
// ============================================

// Custom Badges
export async function getCustomBadges(): Promise<CustomBadge[]> {
  const { data, error } = await getSupabase()
    .from('custom_badges')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) throw error
  return data || []
}

export async function getUserBadges(userId: number): Promise<UserBadge[]> {
  const { data, error } = await getSupabase()
    .from('user_badges')
    .select(`
      *,
      badge:custom_badges(*)
    `)
    .eq('user_id', userId)
    .order('awarded_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getFeaturedBadges(userId: number): Promise<UserBadge[]> {
  const { data, error } = await getSupabase()
    .from('user_badges')
    .select(`
      *,
      badge:custom_badges(*)
    `)
    .eq('user_id', userId)
    .eq('is_featured', true)
    .order('awarded_at', { ascending: false })
    .limit(4)

  if (error) throw error
  return data || []
}

// Check if badge is still valid (not expired)
export function isBadgeValid(badge: UserBadge): boolean {
  if (!badge.expires_at) return true
  return new Date(badge.expires_at) > new Date()
}

// Companies
export async function getCompanies(): Promise<Company[]> {
  const { data, error } = await getSupabase()
    .from('companies')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true })

  if (error) throw error
  return data || []
}

export async function getCompanyById(companyId: string): Promise<Company | null> {
  const { data, error } = await getSupabase()
    .from('companies')
    .select('*')
    .eq('id', companyId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function getUserCompany(userId: number): Promise<UserCompany | null> {
  try {
    const { data, error } = await getSupabase()
      .from('user_companies')
      .select(`
        *,
        company:companies(*)
      `)
      .eq('user_id', userId)
      .eq('is_primary', true)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.warn('[getUserCompany] Error fetching user company:', error)
      return null
    }
    return data
  } catch (err) {
    console.warn('[getUserCompany] Table may not exist:', err)
    return null
  }
}

export async function setUserCompany(userId: number, companyId: string, role: string | null): Promise<UserCompany> {
  const supabase = getSupabase()

  // First, remove any existing primary company
  await supabase
    .from('user_companies')
    .delete()
    .eq('user_id', userId)
    .eq('is_primary', true)

  // Insert new company relationship
  const { data, error } = await supabase
    .from('user_companies')
    .insert({
      user_id: userId,
      company_id: companyId,
      role,
      is_primary: true,
    })
    .select(`
      *,
      company:companies(*)
    `)
    .single()

  if (error) throw error
  return data
}

export async function removeUserCompany(userId: number): Promise<void> {
  const { error } = await getSupabase()
    .from('user_companies')
    .delete()
    .eq('user_id', userId)
    .eq('is_primary', true)

  if (error) throw error
}

// User Links
export async function getUserLinks(userId: number): Promise<UserLink[]> {
  try {
    const { data, error } = await getSupabase()
      .from('user_links')
      .select('*')
      .eq('user_id', userId)
      .eq('is_public', true)
      .order('sort_order', { ascending: true })

    if (error) {
      console.warn('[getUserLinks] Error fetching user links:', error)
      return []
    }
    return data || []
  } catch (err) {
    console.warn('[getUserLinks] Table may not exist:', err)
    return []
  }
}

export async function setUserLink(userId: number, linkType: LinkType, url: string, title?: string): Promise<UserLink> {
  const { data, error } = await getSupabase()
    .from('user_links')
    .upsert({
      user_id: userId,
      link_type: linkType,
      url,
      title: title || null,
      is_public: true,
    }, { onConflict: 'user_id,link_type' })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function removeUserLink(userId: number, linkType: LinkType): Promise<void> {
  const { error } = await getSupabase()
    .from('user_links')
    .delete()
    .eq('user_id', userId)
    .eq('link_type', linkType)

  if (error) throw error
}

// Extended profile with all relations
export async function getExtendedProfile(userId: number) {
  const [profile, badges, company, links] = await Promise.all([
    getProfile(userId),
    getUserBadges(userId),
    getUserCompany(userId),
    getUserLinks(userId),
  ])

  return {
    ...profile,
    badges: badges.filter(isBadgeValid),
    company,
    links,
  }
}

// ============ NOTIFICATIONS ============
// Notifications are now handled via Edge Functions - see src/lib/telegram.ts

// Re-export for backwards compatibility
export async function sendNotification(
  userTgId: number,
  type: TelegramNotificationType,
  title: string,
  message: string
): Promise<boolean> {
  return sendPushNotification(userTgId, { type, title, message })
}

// Notify user about new connection
export async function notifyNewMatch(userTgId: number, matchName: string): Promise<boolean> {
  return sendPushNotification(
    userTgId,
    { type: 'match', title: 'Новый контакт!', message: `${matchName} тоже хочет познакомиться. Начните общение!` },
    { screen: 'matches', buttonText: 'Открыть контакты' }
  )
}

// Notify user about upcoming event
export async function notifyUpcomingEvent(
  userTgId: number,
  eventTitle: string,
  _eventDate: string,
  hoursUntil: number
): Promise<boolean> {
  const timeText = hoursUntil === 1 ? 'через 1 час' : hoursUntil === 24 ? 'завтра' : `через ${hoursUntil} часов`
  return sendPushNotification(
    userTgId,
    { type: 'event', title: `Напоминание: ${eventTitle}`, message: `Мероприятие начнётся ${timeText}!\nНе забудь прийти и показать QR-код на входе.` },
    { screen: 'events', buttonText: 'Открыть события' }
  )
}

// Notify user about new achievement
export async function notifyAchievement(
  userTgId: number,
  achievementTitle: string,
  xpReward: number
): Promise<boolean> {
  return sendPushNotification(
    userTgId,
    { type: 'achievement', title: 'Новое достижение!', message: `Ты получил награду "${achievementTitle}"!\n+${xpReward} XP добавлено к твоему профилю.` },
    { screen: 'achievements', buttonText: 'Открыть достижения' }
  )
}

// Notify user about event reminder (1 hour before)
export async function notifyEventReminder(userTgId: number, eventTitle: string, location: string): Promise<boolean> {
  return sendPushNotification(
    userTgId,
    { type: 'reminder', title: 'Скоро начало!', message: `${eventTitle} начнётся через 1 час.\n${location}\n\nНе забудь открыть билет в приложении!` },
    { screen: 'events', buttonText: 'Открыть билет' }
  )
}

// ============ CONSULTATIONS ============

const DMITRY_UTLIK_TG_ID = 1379584180

// Request consultation from Dmitry Utlik
export async function requestConsultation(userId: number, userName: string, userUsername?: string | null) {
  // Record consultation request in database
  const { data, error } = await getSupabase()
    .from('consultation_requests')
    .insert({
      user_id: userId,
      consultant_tg_id: DMITRY_UTLIK_TG_ID,
      status: 'pending',
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  // If table doesn't exist, just send notification anyway
  if (error && !error.message.includes('does not exist')) {
    console.warn('[requestConsultation] DB error:', error)
  }

  // Send notification via Edge Function (no BOT_TOKEN on client)
  const userLink = userUsername ? `@${userUsername}` : `ID: ${userId}`
  const message = `Новая заявка на консультацию!\n\nОт: ${userName} (${userLink})\nВремя: ${new Date().toLocaleString('ru-RU')}\n\nПользователь перешёл в чат с вами через mini app`

  await callEdgeFunction('send-notification', {
    userTgId: DMITRY_UTLIK_TG_ID,
    type: 'system',
    title: 'Новая заявка на консультацию',
    message
  })

  return data
}

// ============================================
// Avatar Skins System
// ============================================

// Get all available skins (catalog)
export async function getAllAvatarSkins(): Promise<AvatarSkin[]> {
  const { data, error } = await getSupabase()
    .from('avatar_skins')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) {
    console.warn('[getAllAvatarSkins] Error:', error)
    return []
  }
  return data || []
}

// Get skin by slug
export async function getAvatarSkinBySlug(slug: string): Promise<AvatarSkin | null> {
  const { data, error } = await getSupabase()
    .from('avatar_skins')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.warn('[getAvatarSkinBySlug] Error:', error)
    return null
  }
  return data
}

// Get user's active skin
export async function getUserActiveSkin(userId: number): Promise<AvatarSkin | null> {
  const { data, error } = await getSupabase()
    .from('bot_users')
    .select(`
      active_skin_id,
      active_skin:avatar_skins(*)
    `)
    .eq('id', userId)
    .single()

  if (error) {
    console.warn('[getUserActiveSkin] Error:', error)
    return null
  }

  // Handle the joined data
  const skinData = data?.active_skin
  if (Array.isArray(skinData)) {
    return skinData[0] || null
  }
  return skinData || null
}

// Get all skins available to user (awarded skins)
export async function getUserAvailableSkins(userId: number): Promise<UserAvatarSkin[]> {
  const supabase = getSupabase()

  // Get user's awarded skins
  const { data: awardedSkins, error } = await supabase
    .from('user_avatar_skins')
    .select(`
      *,
      skin:avatar_skins(*)
    `)
    .eq('user_id', userId)

  if (error) {
    console.warn('[getUserAvailableSkins] Error:', error)
    return []
  }

  // Get user's active skin ID
  const { data: userData } = await supabase
    .from('bot_users')
    .select('active_skin_id')
    .eq('id', userId)
    .single()

  const activeSkinId = userData?.active_skin_id

  // Filter out expired skins and mark active
  const now = new Date()
  return (awardedSkins || [])
    .filter(uas => {
      if (!uas.expires_at) return true
      return new Date(uas.expires_at) > now
    })
    .map(uas => ({
      ...uas,
      skin: Array.isArray(uas.skin) ? uas.skin[0] : uas.skin,
      is_active_skin: uas.skin_id === activeSkinId,
    }))
    .sort((a, b) => (b.skin?.priority || 0) - (a.skin?.priority || 0))
}

// Set user's active skin
export async function setUserActiveSkin(userId: number, skinId: string | null): Promise<boolean> {
  const { error } = await getSupabase()
    .from('bot_users')
    .update({ active_skin_id: skinId })
    .eq('id', userId)

  if (error) {
    console.error('[setUserActiveSkin] Error:', error)
    return false
  }
  return true
}

// Award skin to user
export async function awardSkinToUser(
  userId: number,
  skinSlug: string,
  awardedBy: number | null = null,
  reason: string | null = null,
  expiresAt: string | null = null,
  setActive: boolean = true
): Promise<UserAvatarSkin | null> {
  const supabase = getSupabase()

  // Get skin by slug
  const { data: skin, error: skinError } = await supabase
    .from('avatar_skins')
    .select('id')
    .eq('slug', skinSlug)
    .eq('is_active', true)
    .single()

  if (skinError || !skin) {
    console.error('[awardSkinToUser] Skin not found:', skinSlug)
    return null
  }

  // Award skin
  const { data: awarded, error } = await supabase
    .from('user_avatar_skins')
    .upsert({
      user_id: userId,
      skin_id: skin.id,
      awarded_by: awardedBy,
      awarded_reason: reason,
      expires_at: expiresAt,
    }, { onConflict: 'user_id,skin_id' })
    .select(`
      *,
      skin:avatar_skins(*)
    `)
    .single()

  if (error) {
    console.error('[awardSkinToUser] Error:', error)
    return null
  }

  // Set as active if requested
  if (setActive) {
    await setUserActiveSkin(userId, skin.id)
  }

  return awarded
}

// Revoke skin from user
export async function revokeSkinFromUser(userId: number, skinSlug: string): Promise<boolean> {
  const supabase = getSupabase()

  // Get skin by slug
  const { data: skin } = await supabase
    .from('avatar_skins')
    .select('id')
    .eq('slug', skinSlug)
    .single()

  if (!skin) return false

  // Remove skin
  const { error } = await supabase
    .from('user_avatar_skins')
    .delete()
    .eq('user_id', userId)
    .eq('skin_id', skin.id)

  if (error) {
    console.error('[revokeSkinFromUser] Error:', error)
    return false
  }

  // If this was active skin, clear it
  const { data: user } = await supabase
    .from('bot_users')
    .select('active_skin_id')
    .eq('id', userId)
    .single()

  if (user?.active_skin_id === skin.id) {
    await setUserActiveSkin(userId, null)
  }

  return true
}

// Check if user has a specific permission through any of their skins
export async function userHasSkinPermission(userId: number, permission: SkinPermission): Promise<boolean> {
  const { data, error } = await getSupabase()
    .from('user_avatar_skins')
    .select(`
      skin:avatar_skins(permissions)
    `)
    .eq('user_id', userId)

  if (error || !data) return false

  for (const uas of data) {
    const skinData = Array.isArray(uas.skin) ? uas.skin[0] : uas.skin
    if (!skinData) continue

    const permissions = skinData.permissions as SkinPermission[] || []
    if (permissions.includes(permission)) {
      return true
    }
  }

  return false
}

// Get user's skin permissions (all permissions from all their skins)
export async function getUserSkinPermissions(userId: number): Promise<SkinPermission[]> {
  const skins = await getUserAvailableSkins(userId)

  const allPermissions = new Set<SkinPermission>()
  for (const uas of skins) {
    const permissions = uas.skin?.permissions || []
    permissions.forEach(p => allPermissions.add(p))
  }

  return Array.from(allPermissions)
}

// Get users with a specific skin (for admin)
export async function getUsersWithSkin(skinSlug: string): Promise<any[]> {
  const supabase = getSupabase()

  const { data: skin } = await supabase
    .from('avatar_skins')
    .select('id')
    .eq('slug', skinSlug)
    .single()

  if (!skin) return []

  const { data, error } = await supabase
    .from('user_avatar_skins')
    .select(`
      *,
      user:bot_users(id, tg_user_id, username, first_name, last_name)
    `)
    .eq('skin_id', skin.id)

  if (error) {
    console.error('[getUsersWithSkin] Error:', error)
    return []
  }

  return data || []
}

// ============================================
// Admin: Skin Management
// ============================================

// Search users by username or name (for admin skin assignment)
export async function searchUsersForAdmin(query: string, limit = 20): Promise<any[]> {
  if (!query || query.length < 2) return []

  const { data, error } = await getSupabase()
    .from('bot_users')
    .select(`
      id,
      tg_user_id,
      username,
      first_name,
      last_name,
      active_skin_id,
      profile:bot_profiles(photo_url),
      active_skin:avatar_skins(id, name, slug, ring_color)
    `)
    .or(`username.ilike.%${query}%,first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
    .limit(limit)

  if (error) {
    console.error('[searchUsersForAdmin] Error:', error)
    return []
  }

  return data || []
}

// Get all available skins (for admin selection)
export async function getAllSkins(): Promise<AvatarSkin[]> {
  const { data, error } = await getSupabase()
    .from('avatar_skins')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('[getAllSkins] Error:', error)
    return []
  }

  return data || []
}

// Admin: Assign skin to user (sets active_skin_id directly)
export async function adminAssignSkin(userId: number, skinId: string | null): Promise<boolean> {
  const { error } = await getSupabase()
    .from('bot_users')
    .update({ active_skin_id: skinId })
    .eq('id', userId)

  if (error) {
    console.error('[adminAssignSkin] Error:', error)
    return false
  }
  return true
}

// ============================================
// User Role Management (Admin Only)
// ============================================

/**
 * Update user role (admin only)
 */
export async function updateUserRole(
  userId: number,
  newRole: TeamRole
): Promise<boolean> {
  try {
    const supabase = getSupabase()

    // Get user info for notification
    const { data: userData } = await supabase
      .from('bot_users')
      .select('tg_user_id, team_role')
      .eq('id', userId)
      .single()

    const oldRole = userData?.team_role

    // Update role
    const { error } = await supabase
      .from('bot_users')
      .update({ team_role: newRole })
      .eq('id', userId)

    if (error) throw error

    // Send notification if role was assigned (not removed)
    if (newRole && newRole !== oldRole) {
      const roleLabel = TEAM_BADGES[newRole]?.label || newRole

      // Award XP for receiving a team role (+100 XP)
      if (!oldRole) {
        try {
          await addXP(userId, 100, 'TEAM_ROLE_ASSIGNED')
          console.log(`[Role] Awarded 100 XP to user ${userId} for team role: ${newRole}`)
        } catch (e) {
          console.warn('Failed to award role XP:', e)
        }
      }

      // Create in-app notification
      try {
        await createNotification(
          userId,
          'achievement',
          'Добро пожаловать в команду!',
          `Поздравляем! Вам назначена роль "${roleLabel}" в сообществе MAIN. +100 XP`,
          { role: newRole }
        )
      } catch (e) {
        console.warn('Failed to create role notification:', e)
      }

      // Send Telegram notification via Edge Function (secure)
      if (userData?.tg_user_id) {
        try {
          await callEdgeFunction('send-notification', {
            userTgId: userData.tg_user_id,
            type: 'achievement',
            title: 'Добро пожаловать в команду!',
            message: `Поздравляем! Вам назначена роль "${roleLabel}" в сообществе MAIN.\n+100 XP`,
            deepLink: { screen: 'profile', buttonText: 'Открыть профиль' }
          })
        } catch (e) {
          console.warn('Failed to send Telegram role notification:', e)
        }
      }
    }

    return true
  } catch (e) {
    console.error('Failed to update user role:', e)
    return false
  }
}

/**
 * Search users by name or username (admin only)
 */
export async function searchUsers(query: string, limit = 20) {
  const { data, error } = await getSupabase()
    .from('bot_users')
    .select(`
      id,
      tg_user_id,
      username,
      first_name,
      last_name,
      team_role,
      points,
      profile:bot_profiles(photo_url, occupation)
    `)
    .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,username.ilike.%${query}%`)
    .limit(limit)
    .order('points', { ascending: false })

  if (error) throw error
  return data
}

/**
 * Get all users with specific role (admin only)
 */
export async function getUsersByRole(role: Exclude<TeamRole, null>) {
  const { data, error } = await getSupabase()
    .from('bot_users')
    .select(`
      id,
      tg_user_id,
      username,
      first_name,
      last_name,
      team_role,
      points,
      profile:bot_profiles(photo_url, occupation),
      active_skin:avatar_skins(*)
    `)
    .eq('team_role', role)
    .order('points', { ascending: false })

  if (error) throw error
  return data
}

// ============================================
// Backlog System (Feedback Collection)
// ============================================

import type { BacklogItem, BacklogStats, BacklogFilters, BacklogStatus, BacklogItemType, BacklogPriority } from '@/types'
import { TEAM_BADGES } from '@/types'

/**
 * Get backlog items with optional filters
 */
export async function getBacklogItems(filters?: BacklogFilters): Promise<BacklogItem[]> {
  const supabase = getSupabase()

  let query = supabase
    .from('backlog_items')
    .select('*')
    .order('created_at', { ascending: false })

  if (filters?.status) {
    if (Array.isArray(filters.status)) {
      query = query.in('status', filters.status)
    } else {
      query = query.eq('status', filters.status)
    }
  }

  if (filters?.item_type) {
    if (Array.isArray(filters.item_type)) {
      query = query.in('item_type', filters.item_type)
    } else {
      query = query.eq('item_type', filters.item_type)
    }
  }

  if (filters?.priority) {
    if (Array.isArray(filters.priority)) {
      query = query.in('priority', filters.priority)
    } else {
      query = query.eq('priority', filters.priority)
    }
  }

  if (filters?.search) {
    query = query.or(`original_message.ilike.%${filters.search}%,ai_summary.ilike.%${filters.search}%,sender_username.ilike.%${filters.search}%`)
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1)
  }

  const { data, error } = await query

  if (error) throw error
  return data as BacklogItem[]
}

/**
 * Get a single backlog item by ID
 */
export async function getBacklogItem(id: number): Promise<BacklogItem | null> {
  const { data, error } = await getSupabase()
    .from('backlog_items')
    .select('*')
    .eq('id', id)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data as BacklogItem | null
}

/**
 * Update a backlog item
 */
export async function updateBacklogItem(
  id: number,
  updates: Partial<Pick<BacklogItem, 'status' | 'priority' | 'item_type' | 'admin_notes' | 'assigned_to' | 'reviewed_by' | 'reviewed_at'>>
): Promise<BacklogItem> {
  const { data, error } = await getSupabase()
    .from('backlog_items')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as BacklogItem
}

/**
 * Update backlog item status with reviewer info
 */
export async function updateBacklogStatus(
  id: number,
  status: BacklogStatus,
  reviewerId: number
): Promise<BacklogItem> {
  const updates: Record<string, any> = {
    status,
    updated_at: new Date().toISOString()
  }

  if (['accepted', 'rejected', 'in_review'].includes(status)) {
    updates.reviewed_by = reviewerId
    updates.reviewed_at = new Date().toISOString()
  }

  const { data, error } = await getSupabase()
    .from('backlog_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as BacklogItem
}

/**
 * Get backlog statistics
 */
export async function getBacklogStats(): Promise<BacklogStats> {
  const { data, error } = await getSupabase().rpc('get_backlog_stats')

  if (error) {
    // Fallback if RPC doesn't exist yet
    console.warn('get_backlog_stats RPC not available, using fallback')
    return {
      total: 0,
      new: 0,
      in_review: 0,
      accepted: 0,
      in_progress: 0,
      done: 0,
      rejected: 0,
      by_type: { bug: 0, feature: 0, improvement: 0, question: 0, ux: 0, other: 0 },
      by_priority: { critical: 0, high: 0, medium: 0, low: 0 }
    }
  }

  return data as BacklogStats
}

/**
 * Create a new backlog item (for manual entry or bot)
 */
export async function createBacklogItem(item: Omit<BacklogItem, 'id' | 'created_at' | 'updated_at'>): Promise<BacklogItem> {
  const { data, error } = await getSupabase()
    .from('backlog_items')
    .insert(item)
    .select()
    .single()

  if (error) throw error
  return data as BacklogItem
}

/**
 * Delete a backlog item (admin only)
 */
export async function deleteBacklogItem(id: number): Promise<void> {
  const { error } = await getSupabase()
    .from('backlog_items')
    .delete()
    .eq('id', id)

  if (error) throw error
}

/**
 * Get count of new backlog items (for badge)
 */
export async function getNewBacklogCount(): Promise<number> {
  const { count, error } = await getSupabase()
    .from('backlog_items')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'new')

  if (error) throw error
  return count || 0
}

// ============================================
// Profile Photos Management
// ============================================

/**
 * Upload a profile photo to Supabase Storage
 */
export async function uploadProfilePhoto(
  userId: number,
  file: File,
  position: number
): Promise<PhotoUploadResult> {
  const supabase = getSupabase()

  // Validate file size (10MB max)
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    return { success: false, error: 'Файл слишком большой (макс. 10MB)' }
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return { success: false, error: 'Неподдерживаемый формат. Используйте JPEG, PNG или WebP' }
  }

  // Validate position
  if (position < 0 || position > 2) {
    return { success: false, error: 'Недопустимая позиция фото' }
  }

  // Generate unique filename
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const filename = `${userId}/${Date.now()}-${position}.${ext}`

  // Delete existing photo at this position first
  await deleteProfilePhotoByPosition(userId, position)

  // Upload to storage
  const { error: uploadError } = await supabase.storage
    .from('profile-photos')
    .upload(filename, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (uploadError) {
    console.error('[uploadProfilePhoto] Upload error:', uploadError)
    // Show actual error for debugging
    const errorMsg = uploadError.message || 'Ошибка загрузки файла'
    return { success: false, error: `Ошибка: ${errorMsg}` }
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('profile-photos')
    .getPublicUrl(filename)

  // Insert photo record
  const { data: photo, error: insertError } = await supabase
    .from('profile_photos')
    .insert({
      user_id: userId,
      photo_url: publicUrl,
      storage_path: filename,
      position,
      is_primary: position === 0,
      moderation_status: 'approved'
    })
    .select()
    .single()

  if (insertError) {
    console.error('[uploadProfilePhoto] Insert error:', insertError)
    // Cleanup uploaded file
    await supabase.storage.from('profile-photos').remove([filename])
    const errorMsg = insertError.message || 'Ошибка сохранения фото'
    return { success: false, error: `БД: ${errorMsg}` }
  }

  // Update profile photo_url if this is the primary photo
  if (position === 0) {
    await supabase
      .from('bot_profiles')
      .update({ photo_url: publicUrl })
      .eq('user_id', userId)
  }

  return { success: true, photo: photo as ProfilePhoto }
}

/**
 * Get all profile photos for a user
 */
export async function getProfilePhotos(userId: number): Promise<ProfilePhoto[]> {
  const { data, error } = await getSupabase()
    .from('profile_photos')
    .select('*')
    .eq('user_id', userId)
    .order('position', { ascending: true })

  if (error) {
    console.error('[getProfilePhotos] Error:', error)
    return []
  }

  return (data || []) as ProfilePhoto[]
}

/**
 * Delete a profile photo by ID
 */
export async function deleteProfilePhoto(photoId: string): Promise<boolean> {
  const supabase = getSupabase()

  // Get photo info first
  const { data: photo } = await supabase
    .from('profile_photos')
    .select('storage_path, user_id, is_primary')
    .eq('id', photoId)
    .single()

  if (!photo) return false

  // Delete from storage
  await supabase.storage
    .from('profile-photos')
    .remove([photo.storage_path])

  // Delete record
  const { error } = await supabase
    .from('profile_photos')
    .delete()
    .eq('id', photoId)

  if (error) {
    console.error('[deleteProfilePhoto] Error:', error)
    return false
  }

  // If was primary, promote next photo and update profile
  if (photo.is_primary) {
    const remaining = await getProfilePhotos(photo.user_id)
    const newPrimary = remaining[0]

    await supabase
      .from('bot_profiles')
      .update({ photo_url: newPrimary?.photo_url || null })
      .eq('user_id', photo.user_id)

    if (newPrimary) {
      await supabase
        .from('profile_photos')
        .update({ is_primary: true, position: 0 })
        .eq('id', newPrimary.id)
    }
  }

  return true
}

/**
 * Delete photo by position (internal helper)
 */
async function deleteProfilePhotoByPosition(userId: number, position: number): Promise<void> {
  const supabase = getSupabase()

  const { data: existing } = await supabase
    .from('profile_photos')
    .select('id, storage_path')
    .eq('user_id', userId)
    .eq('position', position)
    .single()

  if (existing) {
    await supabase.storage.from('profile-photos').remove([existing.storage_path])
    await supabase.from('profile_photos').delete().eq('id', existing.id)
  }
}

/**
 * Reorder profile photos
 */
export async function reorderProfilePhotos(
  userId: number,
  photoIds: string[]
): Promise<boolean> {
  const supabase = getSupabase()

  try {
    for (let i = 0; i < photoIds.length; i++) {
      await supabase
        .from('profile_photos')
        .update({ position: i, is_primary: i === 0 })
        .eq('id', photoIds[i])
        .eq('user_id', userId)
    }

    // Update profile primary photo
    const { data: primary } = await supabase
      .from('profile_photos')
      .select('photo_url')
      .eq('user_id', userId)
      .eq('is_primary', true)
      .single()

    if (primary) {
      await supabase
        .from('bot_profiles')
        .update({ photo_url: primary.photo_url })
        .eq('user_id', userId)
    }

    return true
  } catch (error) {
    console.error('[reorderProfilePhotos] Error:', error)
    return false
  }
}

/**
 * Get approved profiles with photos for swipe feed
 * Falls back to profiles without photos if profile_photos table doesn't exist
 */
export async function getApprovedProfilesWithPhotos(
  excludeUserId: number,
  city?: string
): Promise<SwipeCardProfile[]> {
  const supabase = getSupabase()

  // Get swiped user IDs
  const { data: swipedData } = await supabase
    .from('bot_swipes')
    .select('swiped_id')
    .eq('swiper_id', excludeUserId)

  const swipedIds = swipedData?.map(s => s.swiped_id) || []

  // Try to get profiles with photos first
  let query = supabase
    .from('bot_profiles')
    .select(`
      *,
      user:bot_users(
        *,
        active_skin:avatar_skins(*)
      ),
      photos:profile_photos(*)
    `)
    .eq('is_visible', true)
    .neq('user_id', excludeUserId)

  if (city) {
    query = query.eq('city', city)
  }

  let { data, error } = await query

  // Fallback: if profile_photos table doesn't exist, query without it
  if (error && error.message?.includes('profile_photos')) {
    console.warn('[getApprovedProfilesWithPhotos] profile_photos table not found, using fallback')

    let fallbackQuery = supabase
      .from('bot_profiles')
      .select(`
        *,
        user:bot_users(
          *,
          active_skin:avatar_skins(*)
        )
      `)
      .eq('is_visible', true)
      .neq('user_id', excludeUserId)

    if (city) {
      fallbackQuery = fallbackQuery.eq('city', city)
    }

    const fallbackResult = await fallbackQuery
    data = fallbackResult.data
    error = fallbackResult.error
  }

  if (error) throw error

  // Filter and transform
  return (data || [])
    .filter(p => !swipedIds.includes(p.user_id))
    .map(p => {
      const userData = Array.isArray(p.user) ? p.user[0] : p.user
      const skinData = userData?.active_skin
      return {
        profile: p as UserProfile,
        user: userData as User,
        photos: ((p.photos || []) as ProfilePhoto[]).sort((a, b) => a.position - b.position),
        activeSkin: Array.isArray(skinData) ? skinData[0] : skinData
      }
    })
}

// ============================================
// Event Reviews System
// ============================================

import type { EventReview } from '@/types'

/**
 * Get all reviews for an event with user info
 */
export async function getEventReviews(eventId: number): Promise<EventReview[]> {
  const supabase = getSupabase()

  const { data: reviews, error } = await supabase
    .from('bot_event_reviews')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[getEventReviews] Error:', error)
    return []
  }

  if (!reviews || reviews.length === 0) return []

  // Get user info for each review
  const userIds = reviews.map(r => r.user_id)
  const { data: users } = await supabase
    .from('bot_users')
    .select('id, first_name, last_name, username')
    .in('id', userIds)

  // Combine data
  return reviews.map(review => ({
    ...review,
    user: users?.find(u => u.id === review.user_id) || null
  })) as EventReview[]
}

/**
 * Get average rating for an event
 */
export async function getEventAverageRating(eventId: number): Promise<{ average: number; count: number }> {
  const { data, error } = await getSupabase()
    .from('bot_event_reviews')
    .select('rating')
    .eq('event_id', eventId)

  if (error || !data || data.length === 0) {
    return { average: 0, count: 0 }
  }

  const sum = data.reduce((acc, r) => acc + r.rating, 0)
  return {
    average: Math.round((sum / data.length) * 10) / 10,
    count: data.length
  }
}

/**
 * Check if user can leave a review (attended event + hasn't reviewed yet)
 */
export async function canUserReviewEvent(eventId: number, userId: number): Promise<boolean> {
  const supabase = getSupabase()

  // Check if user attended the event
  const { data: registration } = await supabase
    .from('bot_registrations')
    .select('status')
    .eq('event_id', eventId)
    .eq('user_id', userId)
    .single()

  if (!registration || registration.status !== 'attended') {
    return false
  }

  // Check if user already reviewed
  const { data: existingReview } = await supabase
    .from('bot_event_reviews')
    .select('id')
    .eq('event_id', eventId)
    .eq('user_id', userId)
    .single()

  return !existingReview
}

/**
 * Get user's review for an event (if exists)
 */
export async function getUserEventReview(eventId: number, userId: number): Promise<EventReview | null> {
  const { data, error } = await getSupabase()
    .from('bot_event_reviews')
    .select('*')
    .eq('event_id', eventId)
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('[getUserEventReview] Error:', error)
  }

  return data as EventReview | null
}

/**
 * Get events that user attended but hasn't reviewed yet
 */
export async function getPendingReviewEvents(userId: number): Promise<Event[]> {
  const supabase = getSupabase()

  // Get attended registrations
  const { data: registrations, error: regError } = await supabase
    .from('bot_registrations')
    .select('event_id')
    .eq('user_id', userId)
    .eq('status', 'attended')

  if (regError || !registrations || registrations.length === 0) {
    return []
  }

  const eventIds = registrations.map(r => r.event_id)

  // Get existing reviews
  const { data: reviews } = await supabase
    .from('bot_event_reviews')
    .select('event_id')
    .eq('user_id', userId)
    .in('event_id', eventIds)

  const reviewedEventIds = reviews?.map(r => r.event_id) || []

  // Filter to events without reviews
  const pendingEventIds = eventIds.filter(id => !reviewedEventIds.includes(id))

  if (pendingEventIds.length === 0) {
    return []
  }

  // Get event details
  const { data: events, error: eventsError } = await supabase
    .from('bot_events')
    .select('*')
    .in('id', pendingEventIds)
    .lt('event_date', new Date().toISOString()) // Only past events
    .order('event_date', { ascending: false })

  if (eventsError) {
    console.error('[getPendingReviewEvents] Error:', eventsError)
    return []
  }

  return (events || []) as Event[]
}

/**
 * Create a new event review with optional speaker rating
 */
export async function createEventReview(
  eventId: number,
  userId: number,
  rating: number,
  text?: string,
  speakerId?: string,
  speakerRating?: number
): Promise<EventReview | null> {
  const supabase = getSupabase()

  // Validate ratings
  if (rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5')
  }
  if (speakerRating !== undefined && (speakerRating < 1 || speakerRating > 5)) {
    throw new Error('Speaker rating must be between 1 and 5')
  }

  // Check if user can review
  const canReview = await canUserReviewEvent(eventId, userId)
  if (!canReview) {
    throw new Error('User cannot review this event')
  }

  const { data, error } = await supabase
    .from('bot_event_reviews')
    .insert({
      event_id: eventId,
      user_id: userId,
      rating,
      text: text?.trim() || null,
      speaker_id: speakerId || null,
      speaker_rating: speakerRating || null
    })
    .select()
    .single()

  if (error) {
    console.error('[createEventReview] Error:', error)
    throw error
  }

  // Award XP for leaving a review (+20 XP)
  try {
    await addXP(userId, 20, 'FEEDBACK_SUBMIT')
  } catch (e) {
    console.warn('Failed to add XP for review:', e)
  }

  return data as EventReview
}

// ============================================
// STREAK SYSTEM & REWARDS
// ============================================

// Streak reward milestones
export const DAILY_STREAK_REWARDS = [
  { days: 5, proAwarded: 1, id: 'daily_streak_5' },
  { days: 10, proAwarded: 3, id: 'daily_streak_10' },
  { days: 30, proAwarded: 7, id: 'daily_streak_30' },
]

export const SWIPE_STREAK_REWARDS = [
  { days: 5, proAwarded: 1, id: 'swipe_streak_5' },
]

// Check if dates are consecutive days
function isConsecutiveDay(lastDate: string | null, now: Date): boolean {
  if (!lastDate) return false

  const last = new Date(lastDate)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const lastDayStart = new Date(last.getFullYear(), last.getMonth(), last.getDate())

  return lastDayStart.getTime() === yesterday.getTime()
}

// Check if date is today
function isSameDay(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate()
}

// Grant Pro subscription for X days
export async function grantProSubscription(userId: number, days: number, reason: string): Promise<boolean> {
  const supabase = getSupabase()

  // Get current subscription
  const { data: user } = await supabase
    .from('bot_users')
    .select('subscription_tier, subscription_expires_at')
    .eq('id', userId)
    .single()

  if (!user) return false

  // Calculate new expiry
  let expiresAt = new Date()
  if (user.subscription_tier === 'pro' && user.subscription_expires_at) {
    // Extend existing Pro
    expiresAt = new Date(user.subscription_expires_at)
  }
  expiresAt.setDate(expiresAt.getDate() + days)

  // Update subscription
  const { error } = await supabase
    .from('bot_users')
    .update({
      subscription_tier: 'pro',
      subscription_expires_at: expiresAt.toISOString()
    })
    .eq('id', userId)

  if (error) {
    console.error('[grantProSubscription] Error:', error)
    return false
  }

  console.log(`[Streak] Granted ${days} days Pro to user ${userId} for ${reason}`)
  return true
}

// Check if streak reward was already claimed
async function hasClaimedStreakReward(userId: number, rewardType: string): Promise<boolean> {
  const supabase = getSupabase()

  const { data } = await supabase
    .from('streak_rewards')
    .select('id')
    .eq('user_id', userId)
    .eq('reward_type', rewardType)
    .limit(1)

  return (data && data.length > 0) || false
}

// Record streak reward claim
async function recordStreakReward(userId: number, rewardType: string, daysAwarded: number): Promise<void> {
  const supabase = getSupabase()

  await supabase
    .from('streak_rewards')
    .insert({
      user_id: userId,
      reward_type: rewardType,
      days_awarded: daysAwarded
    })
}

// Check and update daily login streak
// Helper to get ISO week number
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

export async function checkAndUpdateDailyStreak(userId: number): Promise<{
  streak: number
  reward?: { days: number; proAwarded: number }
  alreadyCheckedToday: boolean
  weekActivity: number[]
}> {
  const supabase = getSupabase()
  const now = new Date()

  // Get current streak info
  const { data: user } = await supabase
    .from('bot_users')
    .select('daily_streak, last_streak_check_at, week_activity')
    .eq('id', userId)
    .single()

  if (!user) {
    return { streak: 0, alreadyCheckedToday: false, weekActivity: [] }
  }

  const lastCheck = user.last_streak_check_at

  // Calculate day of week (0=Mon, 6=Sun)
  const dayOfWeek = (now.getDay() + 6) % 7

  // Check if new week (compare week numbers)
  const lastCheckDate = lastCheck ? new Date(lastCheck) : null
  const isNewWeek = !lastCheckDate || getWeekNumber(lastCheckDate) !== getWeekNumber(now) ||
                    lastCheckDate.getFullYear() !== now.getFullYear()

  // Update week_activity
  let weekActivity: number[]
  if (isNewWeek) {
    weekActivity = [dayOfWeek]
  } else {
    const current = user.week_activity || []
    weekActivity = current.includes(dayOfWeek) ? current : [...current, dayOfWeek]
  }

  // Already checked today?
  if (lastCheck && isSameDay(new Date(lastCheck), now)) {
    return { streak: user.daily_streak || 0, alreadyCheckedToday: true, weekActivity }
  }

  let newStreak = 1

  // Check if consecutive day
  if (isConsecutiveDay(lastCheck, now)) {
    newStreak = (user.daily_streak || 0) + 1
  }
  // If more than 1 day gap, reset to 1

  // Update streak in DB
  await supabase
    .from('bot_users')
    .update({
      daily_streak: newStreak,
      last_streak_check_at: now.toISOString(),
      week_activity: weekActivity
    })
    .eq('id', userId)

  // Check for rewards
  for (const milestone of DAILY_STREAK_REWARDS) {
    if (newStreak >= milestone.days) {
      const alreadyClaimed = await hasClaimedStreakReward(userId, milestone.id)
      if (!alreadyClaimed) {
        // Award Pro!
        const success = await grantProSubscription(userId, milestone.proAwarded, milestone.id)
        if (success) {
          await recordStreakReward(userId, milestone.id, milestone.proAwarded)
          return {
            streak: newStreak,
            reward: { days: milestone.days, proAwarded: milestone.proAwarded },
            alreadyCheckedToday: false,
            weekActivity
          }
        }
      }
    }
  }

  return { streak: newStreak, alreadyCheckedToday: false, weekActivity }
}

// Check and update swipe streak (called when all daily swipes are used)
export async function checkAndUpdateSwipeStreak(userId: number): Promise<{
  streak: number
  reward?: { days: number; proAwarded: number }
}> {
  const supabase = getSupabase()
  const now = new Date()

  // Get current streak info
  const { data: user } = await supabase
    .from('bot_users')
    .select('swipe_streak, last_swipe_streak_at')
    .eq('id', userId)
    .single()

  if (!user) {
    return { streak: 0 }
  }

  const lastSwipeStreak = user.last_swipe_streak_at

  // Already recorded today?
  if (lastSwipeStreak && isSameDay(new Date(lastSwipeStreak), now)) {
    return { streak: user.swipe_streak || 0 }
  }

  let newStreak = 1

  // Check if consecutive day
  if (isConsecutiveDay(lastSwipeStreak, now)) {
    newStreak = (user.swipe_streak || 0) + 1
  }

  // Update streak in DB
  await supabase
    .from('bot_users')
    .update({
      swipe_streak: newStreak,
      last_swipe_streak_at: now.toISOString()
    })
    .eq('id', userId)

  // Check for rewards
  for (const milestone of SWIPE_STREAK_REWARDS) {
    if (newStreak >= milestone.days) {
      const alreadyClaimed = await hasClaimedStreakReward(userId, milestone.id)
      if (!alreadyClaimed) {
        const success = await grantProSubscription(userId, milestone.proAwarded, milestone.id)
        if (success) {
          await recordStreakReward(userId, milestone.id, milestone.proAwarded)
          return {
            streak: newStreak,
            reward: { days: milestone.days, proAwarded: milestone.proAwarded }
          }
        }
      }
    }
  }

  return { streak: newStreak }
}

// Profile completion reward reasons and amounts
export const PROFILE_COMPLETION_REWARDS: Record<string, { xp: number; reason: string }> = {
  photo: { xp: 25, reason: 'PROFILE_PHOTO_ADDED' },
  bio: { xp: 25, reason: 'PROFILE_BIO_ADDED' },
  occupation: { xp: 25, reason: 'PROFILE_OCCUPATION_ADDED' },
  city: { xp: 15, reason: 'PROFILE_CITY_ADDED' },
  linkedin: { xp: 50, reason: 'PROFILE_LINKEDIN_ADDED' },
  skills: { xp: 25, reason: 'PROFILE_SKILLS_ADDED' },
  interests: { xp: 25, reason: 'PROFILE_INTERESTS_ADDED' },
}

// Check which profile fields were filled and award XP (first time only)
export async function checkProfileCompletionRewards(
  userId: number,
  newProfile: Partial<UserProfile>,
  oldProfile: UserProfile | null
): Promise<{ awarded: { field: string; xp: number }[] }> {
  const awarded: { field: string; xp: number }[] = []

  // Check photo
  if (newProfile.photo_url && (!oldProfile || !oldProfile.photo_url)) {
    const already = await hasReceivedXPBonus(userId, PROFILE_COMPLETION_REWARDS.photo.reason)
    if (!already) {
      await addXP(userId, PROFILE_COMPLETION_REWARDS.photo.xp, PROFILE_COMPLETION_REWARDS.photo.reason, true)
      awarded.push({ field: 'photo', xp: PROFILE_COMPLETION_REWARDS.photo.xp })
    }
  }

  // Check bio
  if (newProfile.bio && (!oldProfile || !oldProfile.bio)) {
    const already = await hasReceivedXPBonus(userId, PROFILE_COMPLETION_REWARDS.bio.reason)
    if (!already) {
      await addXP(userId, PROFILE_COMPLETION_REWARDS.bio.xp, PROFILE_COMPLETION_REWARDS.bio.reason, true)
      awarded.push({ field: 'bio', xp: PROFILE_COMPLETION_REWARDS.bio.xp })
    }
  }

  // Check occupation
  if (newProfile.occupation && (!oldProfile || !oldProfile.occupation)) {
    const already = await hasReceivedXPBonus(userId, PROFILE_COMPLETION_REWARDS.occupation.reason)
    if (!already) {
      await addXP(userId, PROFILE_COMPLETION_REWARDS.occupation.xp, PROFILE_COMPLETION_REWARDS.occupation.reason, true)
      awarded.push({ field: 'occupation', xp: PROFILE_COMPLETION_REWARDS.occupation.xp })
    }
  }

  // Check city (only award if changed from default)
  if (newProfile.city && newProfile.city !== 'Минск' && (!oldProfile || oldProfile.city === 'Минск' || !oldProfile.city)) {
    const already = await hasReceivedXPBonus(userId, PROFILE_COMPLETION_REWARDS.city.reason)
    if (!already) {
      await addXP(userId, PROFILE_COMPLETION_REWARDS.city.xp, PROFILE_COMPLETION_REWARDS.city.reason, true)
      awarded.push({ field: 'city', xp: PROFILE_COMPLETION_REWARDS.city.xp })
    }
  }

  // Check LinkedIn
  if (newProfile.linkedin_url && (!oldProfile || !oldProfile.linkedin_url)) {
    const already = await hasReceivedXPBonus(userId, PROFILE_COMPLETION_REWARDS.linkedin.reason)
    if (!already) {
      await addXP(userId, PROFILE_COMPLETION_REWARDS.linkedin.xp, PROFILE_COMPLETION_REWARDS.linkedin.reason, true)
      awarded.push({ field: 'linkedin', xp: PROFILE_COMPLETION_REWARDS.linkedin.xp })
    }
  }

  // Check skills
  if (newProfile.skills && newProfile.skills.length > 0 && (!oldProfile || !oldProfile.skills || oldProfile.skills.length === 0)) {
    const already = await hasReceivedXPBonus(userId, PROFILE_COMPLETION_REWARDS.skills.reason)
    if (!already) {
      await addXP(userId, PROFILE_COMPLETION_REWARDS.skills.xp, PROFILE_COMPLETION_REWARDS.skills.reason, true)
      awarded.push({ field: 'skills', xp: PROFILE_COMPLETION_REWARDS.skills.xp })
    }
  }

  // Check interests
  if (newProfile.interests && newProfile.interests.length > 0 && (!oldProfile || !oldProfile.interests || oldProfile.interests.length === 0)) {
    const already = await hasReceivedXPBonus(userId, PROFILE_COMPLETION_REWARDS.interests.reason)
    if (!already) {
      await addXP(userId, PROFILE_COMPLETION_REWARDS.interests.xp, PROFILE_COMPLETION_REWARDS.interests.reason, true)
      awarded.push({ field: 'interests', xp: PROFILE_COMPLETION_REWARDS.interests.xp })
    }
  }

  // Check for complete profile bonus (all fields filled)
  if (awarded.length > 0) {
    const isComplete = !!(
      (newProfile.photo_url || oldProfile?.photo_url) &&
      (newProfile.bio || oldProfile?.bio) &&
      (newProfile.occupation || oldProfile?.occupation) &&
      (newProfile.linkedin_url || oldProfile?.linkedin_url) &&
      ((newProfile.skills && newProfile.skills.length > 0) || (oldProfile?.skills && oldProfile.skills.length > 0)) &&
      ((newProfile.interests && newProfile.interests.length > 0) || (oldProfile?.interests && oldProfile.interests.length > 0))
    )

    if (isComplete) {
      const already = await hasReceivedXPBonus(userId, 'PROFILE_COMPLETE_BONUS')
      if (!already) {
        await addXP(userId, 100, 'PROFILE_COMPLETE_BONUS', true)
        awarded.push({ field: 'complete_bonus', xp: 100 })
      }
    }
  }

  return { awarded }
}

// Get user's current streak status
export async function getUserStreakStatus(userId: number): Promise<{
  dailyStreak: number
  swipeStreak: number
  nextDailyMilestone: number | null
  nextSwipeMilestone: number | null
  weekActivity: number[]
}> {
  const supabase = getSupabase()
  const now = new Date()

  const { data: user } = await supabase
    .from('bot_users')
    .select('daily_streak, swipe_streak, week_activity, last_streak_check_at')
    .eq('id', userId)
    .single()

  const dailyStreak = user?.daily_streak || 0
  const swipeStreak = user?.swipe_streak || 0

  // Check if it's a new week - if so, week_activity should be empty
  const lastCheck = user?.last_streak_check_at ? new Date(user.last_streak_check_at) : null
  const isNewWeek = !lastCheck || getWeekNumber(lastCheck) !== getWeekNumber(now) ||
                    lastCheck.getFullYear() !== now.getFullYear()
  const weekActivity = isNewWeek ? [] : (user?.week_activity || [])

  // Find next unclaimed daily milestone
  let nextDailyMilestone: number | null = null
  for (const milestone of DAILY_STREAK_REWARDS) {
    if (dailyStreak < milestone.days) {
      const claimed = await hasClaimedStreakReward(userId, milestone.id)
      if (!claimed) {
        nextDailyMilestone = milestone.days
        break
      }
    }
  }

  // Find next unclaimed swipe milestone
  let nextSwipeMilestone: number | null = null
  for (const milestone of SWIPE_STREAK_REWARDS) {
    if (swipeStreak < milestone.days) {
      const claimed = await hasClaimedStreakReward(userId, milestone.id)
      if (!claimed) {
        nextSwipeMilestone = milestone.days
        break
      }
    }
  }

  return {
    dailyStreak,
    swipeStreak,
    nextDailyMilestone,
    nextSwipeMilestone,
    weekActivity
  }
}

// ==========================================
// SESSION TRACKING
// ==========================================

// Start a new session for user
export async function startSession(userId: number): Promise<number | null> {
  const supabase = getSupabase()

  // First, close any unclosed sessions for this user
  const now = new Date().toISOString()

  // Find unclosed sessions and close them
  const { data: openSessions } = await supabase
    .from('user_sessions')
    .select('id, started_at')
    .eq('user_id', userId)
    .is('ended_at', null)

  if (openSessions && openSessions.length > 0) {
    for (const session of openSessions) {
      const startedAt = new Date(session.started_at)
      const duration = Math.floor((Date.now() - startedAt.getTime()) / 1000)

      await supabase
        .from('user_sessions')
        .update({
          ended_at: now,
          duration_seconds: Math.min(duration, 7200) // Max 2 hours per session
        })
        .eq('id', session.id)

      // Update total time
      const rpcResult = await supabase.rpc('increment_total_time', {
        p_user_id: userId,
        p_seconds: Math.min(duration, 7200)
      })
      if (rpcResult.error) {
        // Fallback if RPC doesn't exist
        const { data } = await supabase
          .from('bot_users')
          .select('total_time_seconds')
          .eq('id', userId)
          .single()
        const currentTotal = data?.total_time_seconds || 0
        await supabase
          .from('bot_users')
          .update({ total_time_seconds: currentTotal + Math.min(duration, 7200) })
          .eq('id', userId)
      }
    }
  }

  // Create new session
  const { data: newSession, error } = await supabase
    .from('user_sessions')
    .insert({
      user_id: userId,
      started_at: now,
      last_heartbeat_at: now
    })
    .select('id')
    .single()

  if (error) {
    console.error('Failed to start session:', error)
    return null
  }

  return newSession?.id || null
}

// Update session heartbeat
export async function sessionHeartbeat(sessionId: number): Promise<void> {
  const supabase = getSupabase()

  await supabase
    .from('user_sessions')
    .update({ last_heartbeat_at: new Date().toISOString() })
    .eq('id', sessionId)
}

// End session
export async function endSession(sessionId: number, userId: number): Promise<void> {
  const supabase = getSupabase()

  // Get session start time
  const { data: session } = await supabase
    .from('user_sessions')
    .select('started_at, ended_at')
    .eq('id', sessionId)
    .single()

  if (!session || session.ended_at) return // Already ended

  const startedAt = new Date(session.started_at)
  const duration = Math.floor((Date.now() - startedAt.getTime()) / 1000)
  const cappedDuration = Math.min(duration, 7200) // Max 2 hours

  // Update session
  await supabase
    .from('user_sessions')
    .update({
      ended_at: new Date().toISOString(),
      duration_seconds: cappedDuration
    })
    .eq('id', sessionId)

  // Update user's total time
  const { data: user } = await supabase
    .from('bot_users')
    .select('total_time_seconds')
    .eq('id', userId)
    .single()

  const currentTotal = user?.total_time_seconds || 0

  await supabase
    .from('bot_users')
    .update({ total_time_seconds: currentTotal + cappedDuration })
    .eq('id', userId)
}

// ============================================
// EVENT SPEAKERS & PROGRAM (from iishnica admin)
// ============================================

// Helper: Find web event UUID by bot_event title
async function findWebEventId(botEventTitle: string): Promise<string | null> {
  const supabase = getSupabase()

  const { data } = await supabase
    .from('events')
    .select('id')
    .eq('title', botEventTitle)
    .limit(1)
    .maybeSingle()

  return data?.id || null
}

// Fetch event speakers with speaker details (uses web event UUID)
export async function fetchEventSpeakers(webEventId: string): Promise<EventSpeaker[]> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('event_speakers')
    .select(`
      speaker_id,
      talk_title,
      talk_description,
      order_index,
      speaker:speakers (
        id,
        name,
        title,
        description,
        photo_url
      )
    `)
    .eq('event_id', webEventId)
    .order('order_index')

  if (error) {
    console.error('[fetchEventSpeakers] Error:', error)
    return []
  }

  // Transform data to match EventSpeaker interface
  // Note: Supabase returns single relation as object, but TS infers as array
  return (data || []).map(item => ({
    speaker_id: item.speaker_id,
    talk_title: item.talk_title,
    talk_description: item.talk_description,
    order_index: item.order_index,
    speaker: item.speaker as unknown as Speaker
  }))
}

// Fetch event program with optional speaker details (uses web event UUID)
export async function fetchEventProgram(webEventId: string): Promise<EventProgramItem[]> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('event_program')
    .select(`
      id,
      time_start,
      time_end,
      title,
      description,
      type,
      speaker_id,
      order_index,
      speaker:speakers (
        id,
        name,
        title,
        description,
        photo_url
      )
    `)
    .eq('event_id', webEventId)
    .order('order_index')

  if (error) {
    console.error('[fetchEventProgram] Error:', error)
    return []
  }

  // Transform data to match EventProgramItem interface
  // Note: Supabase returns single relation as object, but TS infers as array
  return (data || []).map(item => ({
    id: item.id,
    time_start: item.time_start,
    time_end: item.time_end,
    title: item.title,
    description: item.description,
    type: item.type,
    speaker_id: item.speaker_id,
    order_index: item.order_index,
    speaker: item.speaker as unknown as Speaker | undefined
  }))
}

// Combined: Get speakers and program by bot_event title
export async function fetchEventDetails(botEventTitle: string): Promise<{
  speakers: EventSpeaker[]
  program: EventProgramItem[]
}> {
  // Find web event UUID by title
  const webEventId = await findWebEventId(botEventTitle)

  if (!webEventId) {
    return { speakers: [], program: [] }
  }

  // Fetch speakers and program in parallel
  const [speakers, program] = await Promise.all([
    fetchEventSpeakers(webEventId),
    fetchEventProgram(webEventId)
  ])

  return { speakers, program }
}

// ============================================
// SHARE TRACKING & ANALYTICS
// ============================================

export type ShareType = 'event' | 'profile' | 'invite'
export type ShareMethod = 'telegram' | 'qr_view'

// Track share action for analytics
export async function trackShare(
  userId: number,
  shareType: ShareType,
  targetId: string | number,
  method: ShareMethod
): Promise<void> {
  const supabase = getSupabase()

  try {
    await supabase.from('share_events').insert({
      user_id: userId,
      share_type: shareType,
      target_id: String(targetId),
      method: method,
    })
  } catch (error) {
    // Silently fail - don't break UX for analytics
    console.warn('[trackShare] Failed to track share:', error)
  }
}

// Get share statistics for admin dashboard
export async function getShareStats(): Promise<{
  total: number
  byType: Record<ShareType, number>
  byMethod: Record<ShareMethod, number>
  recentShares: Array<{
    user_id: number
    share_type: ShareType
    target_id: string
    method: ShareMethod
    created_at: string
  }>
}> {
  const supabase = getSupabase()

  // Get total count
  const { count: total } = await supabase
    .from('share_events')
    .select('*', { count: 'exact', head: true })

  // Get counts by type
  const { data: typeData } = await supabase
    .from('share_events')
    .select('share_type')

  const byType: Record<ShareType, number> = { event: 0, profile: 0, invite: 0 }
  typeData?.forEach(row => {
    if (row.share_type in byType) {
      byType[row.share_type as ShareType]++
    }
  })

  // Get counts by method
  const { data: methodData } = await supabase
    .from('share_events')
    .select('method')

  const byMethod: Record<ShareMethod, number> = { telegram: 0, qr_view: 0 }
  methodData?.forEach(row => {
    if (row.method in byMethod) {
      byMethod[row.method as ShareMethod]++
    }
  })

  // Get recent shares
  const { data: recentShares } = await supabase
    .from('share_events')
    .select('user_id, share_type, target_id, method, created_at')
    .order('created_at', { ascending: false })
    .limit(50)

  return {
    total: total || 0,
    byType,
    byMethod,
    recentShares: recentShares || []
  }
}

// ============ APP SETTINGS HELPERS ============

// Get show_funnel_for_team setting specifically
export async function getShowFunnelForTeam(): Promise<boolean> {
  return getAppSetting('show_funnel_for_team', true)
}

// ============ LEARNING SYSTEM HELPERS ============

// Get all enabled courses (for users)
export async function getEnabledCourses(): Promise<Course[]> {
  const { data, error } = await getSupabase()
    .from('courses')
    .select('*')
    .eq('is_enabled', true)
    .order('sort_order')

  if (error) throw error
  return data || []
}

// Get all courses (for admin)
export async function getAllCourses(): Promise<Course[]> {
  const { data, error } = await getSupabase()
    .from('courses')
    .select('*')
    .order('sort_order')

  if (error) throw error
  return data || []
}

// Get enabled lessons for a course (for users)
export async function getCourseLessons(courseId: string): Promise<Lesson[]> {
  const { data, error } = await getSupabase()
    .from('lessons')
    .select('*')
    .eq('course_id', courseId)
    .eq('is_enabled', true)
    .order('sort_order')

  if (error) throw error
  return (data || []).map(lesson => ({
    ...lesson,
    content: lesson.content as LessonBlock[]
  }))
}

// Get all lessons for a course (for admin)
export async function getAllCourseLessons(courseId: string): Promise<Lesson[]> {
  const { data, error } = await getSupabase()
    .from('lessons')
    .select('*')
    .eq('course_id', courseId)
    .order('sort_order')

  if (error) throw error
  return (data || []).map(lesson => ({
    ...lesson,
    content: lesson.content as LessonBlock[]
  }))
}

// Get a single lesson by ID
export async function getLesson(lessonId: string): Promise<Lesson | null> {
  const { data, error } = await getSupabase()
    .from('lessons')
    .select('*')
    .eq('id', lessonId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw error
  }

  return data ? {
    ...data,
    content: data.content as LessonBlock[]
  } : null
}

// Get user's lesson progress
export async function getUserLessonProgress(userId: number): Promise<UserLessonProgress[]> {
  const { data, error } = await getSupabase()
    .from('user_lesson_progress')
    .select('*')
    .eq('user_id', userId)

  if (error) throw error
  return data || []
}

// Mark a lesson as completed
export async function markLessonComplete(userId: number, lessonId: string): Promise<UserLessonProgress> {
  const { data, error } = await getSupabase()
    .from('user_lesson_progress')
    .upsert({
      user_id: userId,
      lesson_id: lessonId,
      completed_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Toggle course enabled status (admin)
export async function toggleCourseEnabled(courseId: string, enabled: boolean): Promise<void> {
  const { error } = await getSupabase()
    .from('courses')
    .update({
      is_enabled: enabled,
      updated_at: new Date().toISOString()
    })
    .eq('id', courseId)

  if (error) throw error
}

// Toggle lesson enabled status (admin)
export async function toggleLessonEnabled(lessonId: string, enabled: boolean): Promise<void> {
  const { error } = await getSupabase()
    .from('lessons')
    .update({
      is_enabled: enabled,
      updated_at: new Date().toISOString()
    })
    .eq('id', lessonId)

  if (error) throw error
}

// Get course statistics (for admin/landing)
export async function getCourseStats(courseId: string): Promise<{
  totalLessons: number
  enabledLessons: number
  totalDuration: number
}> {
  const { data, error } = await getSupabase()
    .from('lessons')
    .select('is_enabled, duration_minutes')
    .eq('course_id', courseId)

  if (error) throw error

  const lessons = data || []
  return {
    totalLessons: lessons.length,
    enabledLessons: lessons.filter(l => l.is_enabled).length,
    totalDuration: lessons
      .filter(l => l.is_enabled)
      .reduce((sum, l) => sum + (l.duration_minutes || 0), 0)
  }
}

// Get course with all lessons and user progress
export async function getCourseWithProgress(
  courseId: string,
  userId: number
): Promise<{
  course: Course
  lessons: Array<Lesson & { isCompleted: boolean; completedAt?: string }>
  completedCount: number
  totalDuration: number
} | null> {
  // Get course
  const { data: course, error: courseError } = await getSupabase()
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .single()

  if (courseError || !course) return null

  // Get lessons
  const lessons = await getCourseLessons(courseId)

  // Get user progress
  const progress = await getUserLessonProgress(userId)
  const progressMap = new Map(progress.map(p => [p.lesson_id, p.completed_at]))

  // Combine lessons with progress
  const lessonsWithProgress = lessons.map(lesson => ({
    ...lesson,
    isCompleted: progressMap.has(lesson.id),
    completedAt: progressMap.get(lesson.id)
  }))

  return {
    course,
    lessons: lessonsWithProgress,
    completedCount: lessonsWithProgress.filter(l => l.isCompleted).length,
    totalDuration: lessons.reduce((sum, l) => sum + l.duration_minutes, 0)
  }
}

// ============================================
// BROADCAST SYSTEM
// ============================================

/**
 * Get users by audience criteria for broadcast targeting
 */
export async function getBroadcastAudience(
  audienceType: BroadcastAudienceType,
  config: BroadcastAudienceConfig,
  excludeBanned: boolean = true
): Promise<{ user_id: number; tg_user_id: number }[]> {
  const supabase = getSupabase()

  // Start with base query
  let baseQuery = supabase
    .from('bot_users')
    .select('id, tg_user_id')

  // Always exclude banned users if requested
  if (excludeBanned) {
    baseQuery = baseQuery.eq('banned', false)
  }

  switch (audienceType) {
    case 'all': {
      const { data, error } = await baseQuery
      if (error) throw error
      return (data || []).map(u => ({ user_id: u.id, tg_user_id: u.tg_user_id }))
    }

    case 'city': {
      if (!config.city) return []

      // Get users with profiles in the specified city
      const { data: profiles } = await supabase
        .from('bot_profiles')
        .select('user_id')
        .eq('city', config.city)

      const userIds = profiles?.map(p => p.user_id) || []
      if (userIds.length === 0) return []

      const { data, error } = await baseQuery.in('id', userIds)
      if (error) throw error
      return (data || []).map(u => ({ user_id: u.id, tg_user_id: u.tg_user_id }))
    }

    case 'subscription': {
      if (!config.tiers || config.tiers.length === 0) return []

      const { data, error } = await baseQuery.in('subscription_tier', config.tiers)
      if (error) throw error
      return (data || []).map(u => ({ user_id: u.id, tg_user_id: u.tg_user_id }))
    }

    case 'team_role': {
      if (!config.team_roles || config.team_roles.length === 0) return []

      const { data, error } = await baseQuery.in('team_role', config.team_roles)
      if (error) throw error
      return (data || []).map(u => ({ user_id: u.id, tg_user_id: u.tg_user_id }))
    }

    case 'event_not_registered': {
      if (!config.event_id) return []

      // Get all users who ARE registered for this event
      const { data: registrations } = await supabase
        .from('bot_registrations')
        .select('user_id')
        .eq('event_id', config.event_id)
        .neq('status', 'cancelled')

      const registeredIds = new Set(registrations?.map(r => r.user_id) || [])

      // Get all non-banned users
      const { data: allUsers, error } = await baseQuery
      if (error) throw error

      // Filter out registered users
      return (allUsers || [])
        .filter(u => !registeredIds.has(u.id))
        .map(u => ({ user_id: u.id, tg_user_id: u.tg_user_id }))
    }

    case 'custom': {
      if (!config.user_ids || config.user_ids.length === 0) return []

      const { data, error } = await baseQuery.in('id', config.user_ids)
      if (error) throw error
      return (data || []).map(u => ({ user_id: u.id, tg_user_id: u.tg_user_id }))
    }

    default:
      return []
  }
}

/**
 * Get count of audience (for preview)
 */
export async function getBroadcastAudienceCount(
  audienceType: BroadcastAudienceType,
  config: BroadcastAudienceConfig,
  excludeBanned: boolean = true
): Promise<number> {
  const audience = await getBroadcastAudience(audienceType, config, excludeBanned)
  return audience.length
}

/**
 * Create a new broadcast
 */
export async function createBroadcast(broadcast: {
  title: string
  message: string
  message_type?: 'text' | 'markdown'
  deep_link_screen?: string | null
  deep_link_button_text?: string | null
  audience_type: BroadcastAudienceType
  audience_config: BroadcastAudienceConfig
  exclude_banned?: boolean
  scheduled_at?: string | null
  created_by: number
}): Promise<Broadcast> {
  const supabase = getSupabase()

  const status: BroadcastStatus = broadcast.scheduled_at ? 'scheduled' : 'draft'

  const { data, error } = await supabase
    .from('broadcasts')
    .insert({
      title: broadcast.title,
      message: broadcast.message,
      message_type: broadcast.message_type || 'text',
      deep_link_screen: broadcast.deep_link_screen || null,
      deep_link_button_text: broadcast.deep_link_button_text || null,
      audience_type: broadcast.audience_type,
      audience_config: broadcast.audience_config,
      exclude_banned: broadcast.exclude_banned ?? true,
      scheduled_at: broadcast.scheduled_at || null,
      status,
      created_by: broadcast.created_by
    })
    .select()
    .single()

  if (error) throw error
  return data as Broadcast
}

/**
 * Get broadcast by ID
 */
export async function getBroadcastById(broadcastId: number): Promise<Broadcast | null> {
  const { data, error } = await getSupabase()
    .from('broadcasts')
    .select('*')
    .eq('id', broadcastId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data as Broadcast | null
}

/**
 * Get all broadcasts with pagination
 */
export async function getBroadcasts(
  limit = 20,
  offset = 0,
  status?: BroadcastStatus
): Promise<Broadcast[]> {
  const supabase = getSupabase()

  let query = supabase
    .from('broadcasts')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query
  if (error) throw error
  return (data || []) as Broadcast[]
}

/**
 * Update broadcast status
 */
export async function updateBroadcastStatus(
  broadcastId: number,
  status: BroadcastStatus,
  updates?: Partial<Broadcast>
): Promise<void> {
  const { error } = await getSupabase()
    .from('broadcasts')
    .update({
      status,
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', broadcastId)

  if (error) throw error
}

/**
 * Queue recipients for a broadcast
 */
export async function queueBroadcastRecipients(
  broadcastId: number,
  recipients: { user_id: number; tg_user_id: number }[]
): Promise<void> {
  const supabase = getSupabase()

  // Batch insert recipients (500 at a time)
  const batchSize = 500
  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize).map(r => ({
      broadcast_id: broadcastId,
      user_id: r.user_id,
      tg_user_id: r.tg_user_id,
      status: 'pending'
    }))

    const { error } = await supabase
      .from('broadcast_recipients')
      .insert(batch)

    if (error) throw error
  }

  // Update total recipients count
  await supabase
    .from('broadcasts')
    .update({ total_recipients: recipients.length })
    .eq('id', broadcastId)
}

/**
 * Get pending recipients for processing
 */
export async function getPendingRecipients(
  broadcastId: number,
  limit = 30
): Promise<BroadcastRecipient[]> {
  const { data, error } = await getSupabase()
    .from('broadcast_recipients')
    .select('*')
    .eq('broadcast_id', broadcastId)
    .eq('status', 'pending')
    .limit(limit)

  if (error) throw error
  return (data || []) as BroadcastRecipient[]
}

/**
 * Update recipient status after send attempt
 */
export async function updateRecipientStatus(
  recipientId: number,
  status: 'sent' | 'delivered' | 'failed',
  messageId?: number,
  errorMessage?: string
): Promise<void> {
  const { error } = await getSupabase()
    .from('broadcast_recipients')
    .update({
      status,
      message_id: messageId || null,
      error_message: errorMessage || null,
      sent_at: new Date().toISOString()
    })
    .eq('id', recipientId)

  if (error) throw error
}

/**
 * Get broadcast recipients with user data
 */
export async function getBroadcastRecipients(
  broadcastId: number,
  status?: string,
  limit = 50,
  offset = 0
): Promise<BroadcastRecipient[]> {
  const supabase = getSupabase()

  let query = supabase
    .from('broadcast_recipients')
    .select(`
      *,
      user:bot_users(first_name, last_name, username)
    `)
    .eq('broadcast_id', broadcastId)
    .order('sent_at', { ascending: false, nullsFirst: false })
    .range(offset, offset + limit - 1)

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query
  if (error) throw error
  return (data || []) as BroadcastRecipient[]
}

/**
 * Get scheduled broadcasts that need processing
 */
export async function getScheduledBroadcasts(): Promise<Broadcast[]> {
  const { data, error } = await getSupabase()
    .from('broadcasts')
    .select('*')
    .eq('status', 'scheduled')
    .lte('scheduled_at', new Date().toISOString())

  if (error) throw error
  return (data || []) as Broadcast[]
}

/**
 * Cancel a broadcast
 */
export async function cancelBroadcast(broadcastId: number): Promise<void> {
  await updateBroadcastStatus(broadcastId, 'cancelled')
}

/**
 * Delete a broadcast and its recipients
 */
export async function deleteBroadcast(broadcastId: number): Promise<void> {
  const { error } = await getSupabase()
    .from('broadcasts')
    .delete()
    .eq('id', broadcastId)

  if (error) throw error
}

// ============================================
// BROADCAST TEMPLATES
// ============================================

/**
 * Get all broadcast templates
 */
export async function getBroadcastTemplates(): Promise<BroadcastTemplate[]> {
  const { data, error } = await getSupabase()
    .from('broadcast_templates')
    .select('*')
    .order('use_count', { ascending: false })

  if (error) throw error
  return (data || []) as BroadcastTemplate[]
}

/**
 * Create a broadcast template
 */
export async function createBroadcastTemplate(template: {
  name: string
  title: string
  message: string
  deep_link_screen?: string | null
  deep_link_button_text?: string | null
  created_by: number
}): Promise<BroadcastTemplate> {
  const { data, error } = await getSupabase()
    .from('broadcast_templates')
    .insert({
      name: template.name,
      title: template.title,
      message: template.message,
      deep_link_screen: template.deep_link_screen || null,
      deep_link_button_text: template.deep_link_button_text || null,
      created_by: template.created_by
    })
    .select()
    .single()

  if (error) throw error
  return data as BroadcastTemplate
}

/**
 * Increment template use count
 */
export async function incrementTemplateUseCount(templateId: number): Promise<void> {
  const { data: template } = await getSupabase()
    .from('broadcast_templates')
    .select('use_count')
    .eq('id', templateId)
    .single()

  if (template) {
    await getSupabase()
      .from('broadcast_templates')
      .update({ use_count: (template.use_count || 0) + 1 })
      .eq('id', templateId)
  }
}

/**
 * Delete a broadcast template
 */
export async function deleteBroadcastTemplate(templateId: number): Promise<void> {
  const { error } = await getSupabase()
    .from('broadcast_templates')
    .delete()
    .eq('id', templateId)

  if (error) throw error
}

/**
 * Get distinct cities from profiles (for audience picker)
 */
export async function getDistinctCities(): Promise<string[]> {
  const { data, error } = await getSupabase()
    .from('bot_profiles')
    .select('city')
    .not('city', 'is', null)

  if (error) throw error

  // Get unique cities
  const cities = [...new Set((data || []).map(p => p.city).filter(Boolean))]
  return cities.sort()
}
