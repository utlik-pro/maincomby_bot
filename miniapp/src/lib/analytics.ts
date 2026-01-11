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
  const { data: users } = await supabase
    .from('bot_users')
    .select('subscription_tier')

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

  // Total revenue from payments
  const { data: payments } = await supabase
    .from('bot_payments')
    .select('amount_stars')
    .eq('status', 'completed')

  const paymentRecords = (payments || []) as PaymentRecord[]
  const totalRevenueStars = paymentRecords.reduce((sum, p) => sum + (p.amount_stars || 0), 0)

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

// ============ ALL ANALYTICS ============

export interface AllAnalytics {
  overview: OverviewStats
  subscriptions: SubscriptionStats
  events: EventStats
  matching: MatchingStats
  roles: RoleDistribution
  topByXP: TopUser[]
  topByEvents: TopUser[]
  proUsers: TopUser[]
}

export async function getAllAnalytics(): Promise<AllAnalytics> {
  const [overview, subscriptions, events, matching, roles, topByXP, topByEvents, proUsers] = await Promise.all([
    getOverviewStats(),
    getSubscriptionStats(),
    getEventStats(),
    getMatchingStats(),
    getRoleDistribution(),
    getTopUsersByXP(10),
    getTopUsersByEvents(10),
    getProSubscribers(10)
  ])

  return {
    overview,
    subscriptions,
    events,
    matching,
    roles,
    topByXP,
    topByEvents,
    proUsers
  }
}
