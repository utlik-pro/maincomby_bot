import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { CustomBadge, UserBadge, Company, UserCompany, UserLink, LinkType } from '@/types'

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

export async function createProfile(userId: number, profileData: {
  bio?: string | null
  occupation?: string | null
  city: string
  looking_for?: string | null
  can_help_with?: string | null
  photo_url?: string | null
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
  let query = getSupabase()
    .from('bot_profiles')
    .select(`
      *,
      user:bot_users(*)
    `)
    .eq('moderation_status', 'approved')
    .eq('is_visible', true)
    .neq('user_id', excludeUserId)

  if (city) {
    query = query.eq('city', city)
  }

  const { data, error } = await query
  if (error) throw error
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
  const { data, error } = await getSupabase()
    .from('bot_matches')
    .insert({
      user1_id: Math.min(userId1, userId2),
      user2_id: Math.max(userId1, userId2),
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getUserMatches(userId: number) {
  const { data, error } = await getSupabase()
    .from('bot_matches')
    .select(`
      *,
      user1:bot_users!bot_matches_user1_id_fkey(*),
      user2:bot_users!bot_matches_user2_id_fkey(*),
      profile1:bot_profiles!bot_matches_user1_id_fkey(*),
      profile2:bot_profiles!bot_matches_user2_id_fkey(*)
    `)
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .eq('is_active', true)
    .order('matched_at', { ascending: false })

  if (error) throw error
  return data
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
  private: 0,
  corporal: 100,
  sergeant: 300,
  sergeant_major: 600,
  lieutenant: 1000,
  captain: 2000,
  major: 5000,
  colonel: 10000,
  general: 20000,
}

const RANK_NAMES: Record<string, string> = {
  private: 'Рядовой',
  corporal: 'Капрал',
  sergeant: 'Сержант',
  sergeant_major: 'Старший сержант',
  lieutenant: 'Лейтенант',
  captain: 'Капитан',
  major: 'Майор',
  colonel: 'Полковник',
  general: 'Генерал',
}

function getRankFromPoints(points: number): string {
  if (points >= RANK_THRESHOLDS.general) return 'general'
  if (points >= RANK_THRESHOLDS.colonel) return 'colonel'
  if (points >= RANK_THRESHOLDS.major) return 'major'
  if (points >= RANK_THRESHOLDS.captain) return 'captain'
  if (points >= RANK_THRESHOLDS.lieutenant) return 'lieutenant'
  if (points >= RANK_THRESHOLDS.sergeant_major) return 'sergeant_major'
  if (points >= RANK_THRESHOLDS.sergeant) return 'sergeant'
  if (points >= RANK_THRESHOLDS.corporal) return 'corporal'
  return 'private'
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
        `Новое звание: ${RANK_NAMES[newRank]}!`,
        `Поздравляем! Вы достигли звания "${RANK_NAMES[newRank]}" с ${newPoints} XP!`,
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

// Notifications
export type NotificationType = 'event_reminder' | 'match' | 'achievement' | 'rank_up' | 'system' | 'xp'

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
      profile:bot_profiles(photo_url, occupation, bio)
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
