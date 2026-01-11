import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ndpkxustvcijykzxqxrn.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

let _supabase: ReturnType<typeof createClient> | null = null

function getSupabase() {
  if (!_supabase) {
    if (!supabaseAnonKey) {
      throw new Error('Supabase not configured')
    }
    _supabase = createClient(supabaseUrl, supabaseAnonKey)
  }
  return _supabase
}

// ============ TYPES ============

export interface OverviewStats {
  totalUsers: number
  newThisWeek: number
  newThisMonth: number
  activeUsers: number
  avgXP: number
}

export interface SubscriptionStats {
  free: number
  light: number
  pro: number
  totalRevenueStars: number
}

export interface EventStats {
  total: number
  active: number
  totalRegistrations: number
  totalCheckins: number
  totalCancelled: number
  checkinRate: number
  avgRating: number
  totalReviews: number
}

export interface MatchingStats {
  totalSwipes: number
  totalLikes: number
  totalMatches: number
  matchRate: number
  pendingProfiles: number
  approvedProfiles: number
}

export interface RoleDistribution {
  core: number
  partner: number
  sponsor: number
  volunteer: number
  speaker: number
  none: number
}

export interface TopUser {
  id: number
  username: string | null
  first_name: string | null
  last_name: string | null
  points: number
  subscription_tier: string
  team_role: string | null
  eventCount?: number
}

// DB record types for proper typing
interface UserRecord {
  id: number
  username: string | null
  first_name: string | null
  last_name: string | null
  points: number
  subscription_tier: string | null
  team_role: string | null
}

interface RegistrationRecord {
  user_id: number
  status: string
}

interface PaymentRecord {
  amount_stars: number
}

interface ReviewRecord {
  rating: number
}

interface ProfileRecord {
  moderation_status: string
}

// ============ OVERVIEW STATS ============

export async function getOverviewStats(): Promise<OverviewStats> {
  const supabase = getSupabase()
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  // Total users
  const { count: totalUsers } = await supabase
    .from('bot_users')
    .select('*', { count: 'exact', head: true })

  // New this week
  const { count: newThisWeek } = await supabase
    .from('bot_users')
    .select('*', { count: 'exact', head: true })
    .gte('first_seen_at', weekAgo.toISOString())

  // New this month
  const { count: newThisMonth } = await supabase
    .from('bot_users')
    .select('*', { count: 'exact', head: true })
    .gte('first_seen_at', monthAgo.toISOString())

  // Active users (with registrations in last 30 days)
  const { data: activeData } = await supabase
    .from('bot_registrations')
    .select('user_id')
    .gte('registered_at', monthAgo.toISOString())

  const activeRecords = (activeData || []) as { user_id: number }[]
  const uniqueActiveUsers = new Set(activeRecords.map(r => r.user_id))

  // Average XP
  const { data: xpData } = await supabase
    .from('bot_users')
    .select('points')

  const xpRecords = (xpData || []) as { points: number }[]
  const totalXP = xpRecords.reduce((sum, u) => sum + (u.points || 0), 0)
  const avgXP = xpRecords.length ? Math.round(totalXP / xpRecords.length) : 0

  return {
    totalUsers: totalUsers || 0,
    newThisWeek: newThisWeek || 0,
    newThisMonth: newThisMonth || 0,
    activeUsers: uniqueActiveUsers.size,
    avgXP
  }
}

// ============ SUBSCRIPTION STATS ============

export async function getSubscriptionStats(): Promise<SubscriptionStats> {
  const supabase = getSupabase()

  // Count by tier
  const { data: users, error: usersError } = await supabase
    .from('bot_users')
    .select('subscription_tier')

  if (usersError) {
    console.warn('Error fetching users for subscription stats:', usersError)
  }

  const userRecords = (users || []) as { subscription_tier: string | null }[]
  const tiers = { free: 0, light: 0, pro: 0 }
  userRecords.forEach(u => {
    const tier = u.subscription_tier || 'free'
    if (tier in tiers) {
      tiers[tier as keyof typeof tiers]++
    } else {
      tiers.free++
    }
  })

  // Total revenue from payments (table may not exist)
  let totalRevenueStars = 0
  try {
    const { data: payments, error: paymentsError } = await supabase
      .from('bot_payments')
      .select('amount_stars')
      .eq('status', 'completed')

    if (!paymentsError && payments) {
      const paymentRecords = payments as PaymentRecord[]
      totalRevenueStars = paymentRecords.reduce((sum, p) => sum + (p.amount_stars || 0), 0)
    }
  } catch (e) {
    console.warn('Payments table may not exist:', e)
  }

  return {
    ...tiers,
    totalRevenueStars
  }
}

// ============ EVENT STATS ============

export async function getEventStats(): Promise<EventStats> {
  const supabase = getSupabase()
  const now = new Date()

  // Total events
  const { count: total } = await supabase
    .from('bot_events')
    .select('*', { count: 'exact', head: true })

  // Active events (future)
  const { count: active } = await supabase
    .from('bot_events')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)
    .gte('event_date', now.toISOString())

  // Registration stats
  const { data: registrations } = await supabase
    .from('bot_registrations')
    .select('status')

  const regRecords = (registrations || []) as RegistrationRecord[]
  let totalRegistrations = 0
  let totalCheckins = 0
  let totalCancelled = 0

  regRecords.forEach(r => {
    if (r.status === 'registered') totalRegistrations++
    if (r.status === 'attended') {
      totalRegistrations++
      totalCheckins++
    }
    if (r.status === 'cancelled') totalCancelled++
  })

  // Check-in rate
  const checkinRate = totalRegistrations > 0
    ? Math.round((totalCheckins / totalRegistrations) * 100)
    : 0

  // Average rating from reviews
  const { data: reviews } = await supabase
    .from('bot_event_reviews')
    .select('rating')

  const reviewRecords = (reviews || []) as ReviewRecord[]
  const totalRating = reviewRecords.reduce((sum, r) => sum + (r.rating || 0), 0)
  const avgRating = reviewRecords.length ? Math.round((totalRating / reviewRecords.length) * 10) / 10 : 0

  return {
    total: total || 0,
    active: active || 0,
    totalRegistrations,
    totalCheckins,
    totalCancelled,
    checkinRate,
    avgRating,
    totalReviews: reviewRecords.length
  }
}

// ============ TOP USERS ============

export async function getTopUsersByXP(limit: number = 10): Promise<TopUser[]> {
  const supabase = getSupabase()

  const { data } = await supabase
    .from('bot_users')
    .select('id, username, first_name, last_name, points, subscription_tier, team_role')
    .order('points', { ascending: false })
    .limit(limit)

  const records = (data || []) as UserRecord[]
  return records.map(u => ({
    ...u,
    points: u.points || 0,
    subscription_tier: u.subscription_tier || 'free'
  }))
}

export async function getTopUsersByEvents(limit: number = 10): Promise<TopUser[]> {
  const supabase = getSupabase()

  // Get all attended registrations
  const { data: registrations } = await supabase
    .from('bot_registrations')
    .select('user_id')
    .eq('status', 'attended')

  const regRecords = (registrations || []) as { user_id: number }[]

  // Count events per user
  const eventCounts: Record<number, number> = {}
  regRecords.forEach(r => {
    eventCounts[r.user_id] = (eventCounts[r.user_id] || 0) + 1
  })

  // Sort and get top user IDs
  const topUserIds = Object.entries(eventCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => parseInt(id))

  if (topUserIds.length === 0) return []

  // Get user details
  const { data: users } = await supabase
    .from('bot_users')
    .select('id, username, first_name, last_name, points, subscription_tier, team_role')
    .in('id', topUserIds)

  const userRecords = (users || []) as UserRecord[]

  // Add event count and sort
  const usersWithCount = userRecords.map(u => ({
    ...u,
    points: u.points || 0,
    subscription_tier: u.subscription_tier || 'free',
    eventCount: eventCounts[u.id] || 0
  }))

  return usersWithCount.sort((a, b) => (b.eventCount || 0) - (a.eventCount || 0))
}

export async function getProSubscribers(limit: number = 10): Promise<TopUser[]> {
  const supabase = getSupabase()

  const { data } = await supabase
    .from('bot_users')
    .select('id, username, first_name, last_name, points, subscription_tier, team_role')
    .eq('subscription_tier', 'pro')
    .order('points', { ascending: false })
    .limit(limit)

  const records = (data || []) as UserRecord[]
  return records.map(u => ({
    ...u,
    points: u.points || 0,
    subscription_tier: u.subscription_tier || 'pro'
  }))
}

// ============ MATCHING STATS ============

export async function getMatchingStats(): Promise<MatchingStats> {
  const supabase = getSupabase()

  // Total swipes
  const { count: totalSwipes } = await supabase
    .from('bot_swipes')
    .select('*', { count: 'exact', head: true })

  // Total likes
  const { count: totalLikes } = await supabase
    .from('bot_swipes')
    .select('*', { count: 'exact', head: true })
    .eq('action', 'like')

  // Total matches
  const { count: totalMatches } = await supabase
    .from('bot_matches')
    .select('*', { count: 'exact', head: true })

  // Match rate
  const matchRate = totalLikes && totalLikes > 0
    ? Math.round(((totalMatches || 0) / totalLikes) * 100)
    : 0

  // Pending profiles
  const { count: pendingProfiles } = await supabase
    .from('bot_profiles')
    .select('*', { count: 'exact', head: true })
    .eq('moderation_status', 'pending')

  // Approved profiles
  const { count: approvedProfiles } = await supabase
    .from('bot_profiles')
    .select('*', { count: 'exact', head: true })
    .eq('moderation_status', 'approved')

  return {
    totalSwipes: totalSwipes || 0,
    totalLikes: totalLikes || 0,
    totalMatches: totalMatches || 0,
    matchRate,
    pendingProfiles: pendingProfiles || 0,
    approvedProfiles: approvedProfiles || 0
  }
}

// ============ USERS BY ROLE ============

export async function getUsersByRole(role: string): Promise<TopUser[]> {
  const supabase = getSupabase()

  const { data } = await supabase
    .from('bot_users')
    .select('id, username, first_name, last_name, points, subscription_tier, team_role')
    .eq('team_role', role)
    .order('points', { ascending: false })

  const records = (data || []) as UserRecord[]
  return records.map(u => ({
    ...u,
    points: u.points || 0,
    subscription_tier: u.subscription_tier || 'free'
  }))
}

// ============ ROLE DISTRIBUTION ============

export async function getRoleDistribution(): Promise<RoleDistribution> {
  const supabase = getSupabase()

  const { data: users } = await supabase
    .from('bot_users')
    .select('team_role')

  const userRecords = (users || []) as { team_role: string | null }[]

  const roles: RoleDistribution = {
    core: 0,
    partner: 0,
    sponsor: 0,
    volunteer: 0,
    speaker: 0,
    none: 0
  }

  userRecords.forEach(u => {
    const role = u.team_role as keyof RoleDistribution | null
    if (role && role in roles && role !== 'none') {
      roles[role]++
    } else {
      roles.none++
    }
  })

  return roles
}

// ============ REFERRAL STATS ============

export interface ReferralStats {
  totalReferrals: number
  totalXPEarned: number
}

export interface ReferralEntry {
  inviter_id: number
  inviter_username: string | null
  inviter_first_name: string | null
  invitee_id: number
  invitee_username: string | null
  invitee_first_name: string | null
  invited_at: string
}

export interface TopReferrer {
  user_id: number
  username: string | null
  first_name: string | null
  last_name: string | null
  referral_count: number
}

export async function getReferralStats(): Promise<ReferralStats> {
  const supabase = getSupabase()

  // Count users who have invited_by set
  const { count: totalReferrals } = await supabase
    .from('bot_users')
    .select('*', { count: 'exact', head: true })
    .not('invited_by', 'is', null)

  return {
    totalReferrals: totalReferrals || 0,
    totalXPEarned: (totalReferrals || 0) * 50 // 50 XP per referral
  }
}

interface InviteeRecord {
  id: number
  username: string | null
  first_name: string | null
  invited_by: number
  first_seen_at: string
}

interface InviterRecord {
  id: number
  username: string | null
  first_name: string | null
}

export async function getReferralTree(limit: number = 50): Promise<ReferralEntry[]> {
  const supabase = getSupabase()

  try {
    const { data, error } = await supabase.rpc('get_referral_tree')

    if (error) {
      console.warn('RPC get_referral_tree not available, using fallback')
      // Fallback: manual query
      const { data: inviteesData } = await supabase
        .from('bot_users')
        .select(`
          id,
          username,
          first_name,
          invited_by,
          first_seen_at
        `)
        .not('invited_by', 'is', null)
        .order('first_seen_at', { ascending: false })
        .limit(limit)

      const invitees = (inviteesData || []) as InviteeRecord[]
      if (invitees.length === 0) return []

      // Get inviter info
      const inviterIds = [...new Set(invitees.map(u => u.invited_by))]
      const { data: invitersData } = await supabase
        .from('bot_users')
        .select('id, username, first_name')
        .in('id', inviterIds)

      const inviters = (invitersData || []) as InviterRecord[]
      const inviterMap = new Map(inviters.map(i => [i.id, i]))

      return invitees.map(inv => {
        const inviter = inviterMap.get(inv.invited_by)
        return {
          inviter_id: inv.invited_by,
          inviter_username: inviter?.username || null,
          inviter_first_name: inviter?.first_name || null,
          invitee_id: inv.id,
          invitee_username: inv.username,
          invitee_first_name: inv.first_name,
          invited_at: inv.first_seen_at
        }
      })
    }

    return ((data || []) as ReferralEntry[]).slice(0, limit)
  } catch (e) {
    console.error('Error fetching referral tree:', e)
    return []
  }
}

interface ReferralCountRecord {
  invited_by: number
}

interface TopUserRecord {
  id: number
  username: string | null
  first_name: string | null
  last_name: string | null
}

export async function getTopReferrers(limit: number = 10): Promise<TopReferrer[]> {
  const supabase = getSupabase()

  try {
    // Always use fallback since RPC might not exist yet
    // Fallback: count invited_by manually
    const { data: usersData } = await supabase
      .from('bot_users')
      .select('invited_by')
      .not('invited_by', 'is', null)

    const users = (usersData || []) as ReferralCountRecord[]
    if (users.length === 0) return []

    // Count referrals per user
    const counts: Record<number, number> = {}
    users.forEach(u => {
      counts[u.invited_by] = (counts[u.invited_by] || 0) + 1
    })

    // Get top users
    const topIds = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id]) => parseInt(id))

    if (topIds.length === 0) return []

    const { data: topUsersData } = await supabase
      .from('bot_users')
      .select('id, username, first_name, last_name')
      .in('id', topIds)

    const topUsers = (topUsersData || []) as TopUserRecord[]

    return topUsers.map(u => ({
      user_id: u.id,
      username: u.username,
      first_name: u.first_name,
      last_name: u.last_name,
      referral_count: counts[u.id] || 0
    })).sort((a, b) => b.referral_count - a.referral_count)
  } catch (e) {
    console.error('Error fetching top referrers:', e)
    return []
  }
}

// ============ ALL ANALYTICS ============

export interface AllAnalytics {
  overview: OverviewStats
  subscriptions: SubscriptionStats
  events: EventStats
  matching: MatchingStats
  roles: RoleDistribution
  referrals: ReferralStats
  topByXP: TopUser[]
  topByEvents: TopUser[]
  topReferrers: TopReferrer[]
  proUsers: TopUser[]
}

const defaultOverview: OverviewStats = { totalUsers: 0, newThisWeek: 0, newThisMonth: 0, activeUsers: 0, avgXP: 0 }
const defaultSubscriptions: SubscriptionStats = { free: 0, light: 0, pro: 0, totalRevenueStars: 0 }
const defaultEvents: EventStats = { total: 0, active: 0, totalRegistrations: 0, totalCheckins: 0, totalCancelled: 0, checkinRate: 0, avgRating: 0, totalReviews: 0 }
const defaultMatching: MatchingStats = { totalSwipes: 0, totalLikes: 0, totalMatches: 0, matchRate: 0, pendingProfiles: 0, approvedProfiles: 0 }
const defaultRoles: RoleDistribution = { core: 0, partner: 0, sponsor: 0, volunteer: 0, speaker: 0, none: 0 }
const defaultReferrals: ReferralStats = { totalReferrals: 0, totalXPEarned: 0 }

async function safeCall<T>(fn: () => Promise<T>, defaultValue: T, name: string): Promise<T> {
  try {
    return await fn()
  } catch (e) {
    console.error(`Analytics error in ${name}:`, e)
    return defaultValue
  }
}

export async function getAllAnalytics(): Promise<AllAnalytics> {
  const [overview, subscriptions, events, matching, roles, referrals, topByXP, topByEvents, topReferrers, proUsers] = await Promise.all([
    safeCall(getOverviewStats, defaultOverview, 'getOverviewStats'),
    safeCall(getSubscriptionStats, defaultSubscriptions, 'getSubscriptionStats'),
    safeCall(getEventStats, defaultEvents, 'getEventStats'),
    safeCall(getMatchingStats, defaultMatching, 'getMatchingStats'),
    safeCall(getRoleDistribution, defaultRoles, 'getRoleDistribution'),
    safeCall(getReferralStats, defaultReferrals, 'getReferralStats'),
    safeCall(() => getTopUsersByXP(10), [], 'getTopUsersByXP'),
    safeCall(() => getTopUsersByEvents(10), [], 'getTopUsersByEvents'),
    safeCall(() => getTopReferrers(10), [], 'getTopReferrers'),
    safeCall(() => getProSubscribers(10), [], 'getProSubscribers')
  ])

  return {
    overview,
    subscriptions,
    events,
    matching,
    roles,
    referrals,
    topByXP,
    topByEvents,
    topReferrers,
    proUsers
  }
}
