import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { CustomBadge, UserBadge, Company, UserCompany, UserLink, LinkType, Event, AvatarSkin, UserAvatarSkin, SkinPermission, AppSetting, AppSettingKey, Invite, User } from '@/types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ndpkxustvcijykzxqxrn.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

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
    .select()
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
export async function addXP(userId: number, amount: number, reason: string) {
  const supabase = getSupabase()

  // Get current points before update
  const { data: userBefore } = await supabase
    .from('bot_users')
    .select('points')
    .eq('id', userId)
    .single()

  const oldPoints = userBefore?.points || 0
  const oldRank = getRankFromPoints(oldPoints)

  // Add transaction
  await supabase
    .from('xp_transactions')
    .insert({ user_id: userId, amount, reason })

  // Update user points (use correct param names from migration)
  const { data, error } = await supabase
    .rpc('increment_user_points', { p_user_id: userId, p_points_to_add: amount })

  if (error) throw error

  const newPoints = data || oldPoints + amount
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

  // Create XP notification
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

  return data
}

function getReasonText(reason: string): string {
  const reasons: Record<string, string> = {
    EVENT_REGISTER: 'регистрацию на событие',
    EVENT_CHECKIN: 'посещение события',
    PROFILE_COMPLETE: 'заполнение профиля',
    MATCH: 'новый матч',
    INVITE_FRIEND: 'приглашение друга',
  }
  return reasons[reason] || reason
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
  return `https://t.me/MainCommunityBot/app?startapp=invite_${code}`
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

const BOT_TOKEN = import.meta.env.VITE_BOT_TOKEN || '8302587804:AAH2ZIjWA9QQLzXlOiDUpYQiM8bw6NuO8nw'

// Send push notification to user via Telegram Bot
export async function sendNotification(
  userTgId: number,
  type: 'match' | 'event' | 'achievement' | 'reminder' | 'system',
  title: string,
  message: string
): Promise<boolean> {
  try {
    const emoji = {
      match: '',
      event: '',
      achievement: '',
      reminder: '',
      system: '',
    }[type] || ''

    const text = `${emoji} *${title}*\n\n${message}`

    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: userTgId,
        text,
        parse_mode: 'Markdown',
      }),
    })

    const result = await response.json()
    return result.ok === true
  } catch (error) {
    console.error('[sendNotification] Failed:', error)
    return false
  }
}

// Notify user about new match
export async function notifyNewMatch(userTgId: number, matchName: string): Promise<boolean> {
  return sendNotification(
    userTgId,
    'match',
    'У тебя новый матч!',
    `${matchName} тоже хочет познакомиться с тобой! Напиши первым 👋`
  )
}

// Notify user about upcoming event
export async function notifyUpcomingEvent(
  userTgId: number,
  eventTitle: string,
  eventDate: string,
  hoursUntil: number
): Promise<boolean> {
  const timeText = hoursUntil === 1 ? 'через 1 час' : hoursUntil === 24 ? 'завтра' : `через ${hoursUntil} часов`
  return sendNotification(
    userTgId,
    'event',
    `Напоминание: ${eventTitle}`,
    `Мероприятие начнётся ${timeText}!\n📍 Не забудь прийти и показать QR-код на входе.`
  )
}

// Notify user about new achievement
export async function notifyAchievement(
  userTgId: number,
  achievementTitle: string,
  xpReward: number
): Promise<boolean> {
  return sendNotification(
    userTgId,
    'achievement',
    'Новое достижение!',
    `Ты получил награду "${achievementTitle}"!\n+${xpReward} XP добавлено к твоему профилю.`
  )
}

// Notify user about event reminder (1 hour before)
export async function notifyEventReminder(userTgId: number, eventTitle: string, location: string): Promise<boolean> {
  return sendNotification(
    userTgId,
    'reminder',
    'Скоро начало!',
    `${eventTitle} начнётся через 1 час.\n📍 ${location}\n\nНе забудь открыть билет в приложении!`
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

  // Send notification to Dmitry via Telegram Bot API
  try {
    const userLink = userUsername ? `@${userUsername}` : `ID: ${userId}`
    const message = `🎯 *Новая заявка на консультацию!*\n\n👤 От: ${userName} (${userLink})\n📅 Время: ${new Date().toLocaleString('ru-RU')}\n\n_Пользователь перешёл в чат с вами через mini app_`

    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: DMITRY_UTLIK_TG_ID,
        text: message,
        parse_mode: 'Markdown',
      }),
    })
  } catch (err) {
    console.error('[requestConsultation] Failed to send notification:', err)
  }

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
