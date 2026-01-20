/**
 * God Mode - API Functions
 */

import { getSupabase } from './supabase/client'
import type { Tenant, TenantTheme, AdminUser, DashboardStats, AppBlock, TenantBot } from './types'

// ═══════════════════════════════════════════════════════════════
// ADMIN USER
// ═══════════════════════════════════════════════════════════════

export async function getAdminUserByTelegramUsername(username: string): Promise<AdminUser | null> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('telegram_username', username)
    .eq('is_active', true)
    .single()

  if (error) return null
  return data as AdminUser
}

export async function getAdminUserByTelegramId(telegramId: number): Promise<AdminUser | null> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('telegram_id', telegramId)
    .eq('is_active', true)
    .single()

  if (error) return null
  return data as AdminUser
}

// ═══════════════════════════════════════════════════════════════
// TENANTS
// ═══════════════════════════════════════════════════════════════

export async function getTenants(): Promise<Tenant[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching tenants:', error)
    return []
  }
  return data as Tenant[]
}

export async function getTenantById(id: string): Promise<Tenant | null> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data as Tenant
}

export async function createTenant(tenant: Partial<Tenant>): Promise<Tenant | null> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('tenants')
    .insert([tenant])
    .select()
    .single()

  if (error) {
    console.error('Error creating tenant:', error)
    return null
  }
  return data as Tenant
}

export async function updateTenant(id: string, updates: Partial<Tenant>): Promise<Tenant | null> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('tenants')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating tenant:', error)
    return null
  }
  return data as Tenant
}

export async function deleteTenant(id: string): Promise<boolean> {
  const supabase = getSupabase()
  const { error } = await supabase
    .from('tenants')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting tenant:', error)
    return false
  }
  return true
}

// ═══════════════════════════════════════════════════════════════
// TENANT THEMES
// ═══════════════════════════════════════════════════════════════

export async function getTenantThemes(tenantId: string): Promise<TenantTheme[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('tenant_themes')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('is_default', { ascending: false })

  if (error) return []
  return data as TenantTheme[]
}

export async function createTenantTheme(theme: Partial<TenantTheme>): Promise<TenantTheme | null> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('tenant_themes')
    .insert([theme])
    .select()
    .single()

  if (error) {
    console.error('Error creating theme:', error)
    return null
  }
  return data as TenantTheme
}

export async function updateTenantTheme(
  themeId: string,
  updates: Partial<Pick<TenantTheme, 'name' | 'colors' | 'fonts' | 'border_radius'>>
): Promise<TenantTheme | null> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('tenant_themes')
    .update(updates)
    .eq('id', themeId)
    .select()
    .single()

  if (error) {
    console.error('Error updating theme:', error)
    return null
  }
  return data as TenantTheme
}

export async function setDefaultTheme(themeId: string, tenantId: string): Promise<boolean> {
  const supabase = getSupabase()

  // First, unset all defaults for this tenant
  await supabase
    .from('tenant_themes')
    .update({ is_default: false })
    .eq('tenant_id', tenantId)

  // Then set the new default
  const { error } = await supabase
    .from('tenant_themes')
    .update({ is_default: true })
    .eq('id', themeId)

  if (error) {
    console.error('Error setting default theme:', error)
    return false
  }
  return true
}

export async function deleteTenantTheme(themeId: string): Promise<boolean> {
  const supabase = getSupabase()
  const { error } = await supabase
    .from('tenant_themes')
    .delete()
    .eq('id', themeId)

  if (error) {
    console.error('Error deleting theme:', error)
    return false
  }
  return true
}

// ═══════════════════════════════════════════════════════════════
// APP BLOCKS
// ═══════════════════════════════════════════════════════════════

export async function getTenantBlocks(tenantId: string): Promise<AppBlock[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('app_blocks')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('position', { ascending: true })

  if (error) return []
  return data as AppBlock[]
}

export async function updateBlockPosition(blockId: string, newPosition: number): Promise<boolean> {
  const supabase = getSupabase()
  const { error } = await supabase.rpc('move_block', {
    p_block_id: blockId,
    p_new_position: newPosition,
  })

  if (error) {
    console.error('Error moving block:', error)
    return false
  }
  return true
}

export async function createBlock(block: {
  tenant_id: string
  block_type: string
  title?: Record<string, string>
  config?: Record<string, unknown>
}): Promise<AppBlock | null> {
  const supabase = getSupabase()

  // Get max position for this tenant
  const { data: existing } = await supabase
    .from('app_blocks')
    .select('position')
    .eq('tenant_id', block.tenant_id)
    .order('position', { ascending: false })
    .limit(1)

  const nextPosition = existing && existing.length > 0 ? existing[0].position + 1 : 0

  const { data, error } = await supabase
    .from('app_blocks')
    .insert([{
      ...block,
      position: nextPosition,
      is_visible: true,
    }])
    .select()
    .single()

  if (error) {
    console.error('Error creating block:', error)
    return null
  }
  return data as AppBlock
}

export async function updateBlock(
  blockId: string,
  updates: Partial<Pick<AppBlock, 'title' | 'config' | 'is_visible'>>
): Promise<AppBlock | null> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('app_blocks')
    .update(updates)
    .eq('id', blockId)
    .select()
    .single()

  if (error) {
    console.error('Error updating block:', error)
    return null
  }
  return data as AppBlock
}

export async function deleteBlock(blockId: string): Promise<boolean> {
  const supabase = getSupabase()
  const { error } = await supabase
    .from('app_blocks')
    .delete()
    .eq('id', blockId)

  if (error) {
    console.error('Error deleting block:', error)
    return false
  }
  return true
}

/**
 * Save all blocks for a tenant (bulk replace)
 * Used by Builder to publish draft changes
 */
export async function saveAllBlocks(
  tenantId: string,
  blocks: Array<{
    id?: string
    block_type: string
    title?: Record<string, string>
    config?: Record<string, unknown>
    is_visible?: boolean
  }>
): Promise<boolean> {
  const supabase = getSupabase()

  // Delete all existing blocks for this tenant
  const { error: deleteError } = await supabase
    .from('app_blocks')
    .delete()
    .eq('tenant_id', tenantId)

  if (deleteError) {
    console.error('Error deleting existing blocks:', deleteError)
    return false
  }

  // Insert new blocks with correct positions
  if (blocks.length > 0) {
    const blocksToInsert = blocks.map((block, index) => ({
      tenant_id: tenantId,
      block_type: block.block_type,
      title: block.title || { ru: block.block_type, en: block.block_type },
      config: block.config || {},
      position: index,
      is_visible: block.is_visible ?? true,
    }))

    const { error: insertError } = await supabase
      .from('app_blocks')
      .insert(blocksToInsert)

    if (insertError) {
      console.error('Error inserting blocks:', insertError)
      return false
    }
  }

  return true
}

// ═══════════════════════════════════════════════════════════════
// TENANT BOTS
// ═══════════════════════════════════════════════════════════════

export async function getTenantBot(tenantId: string): Promise<TenantBot | null> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('tenant_bots')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('is_active', true)
    .single()

  if (error) return null
  return data as TenantBot
}

// ═══════════════════════════════════════════════════════════════
// DASHBOARD STATS
// ═══════════════════════════════════════════════════════════════

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = getSupabase()

  // Get counts in parallel
  const [usersResult, eventsResult, matchesResult, tenantsResult] = await Promise.all([
    supabase.from('bot_users').select('*', { count: 'exact', head: true }),
    supabase.from('events').select('*', { count: 'exact', head: true }),
    supabase.from('matches').select('*', { count: 'exact', head: true }),
    supabase.from('tenants').select('*', { count: 'exact', head: true }),
  ])

  // Active today (users with activity in last 24 hours)
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  const activeResult = await supabase
    .from('bot_users')
    .select('*', { count: 'exact', head: true })
    .gte('last_activity_at', yesterday.toISOString())

  return {
    totalUsers: usersResult.count || 0,
    totalEvents: eventsResult.count || 0,
    totalMatches: matchesResult.count || 0,
    activeToday: activeResult.count || 0,
    tenantCount: tenantsResult.count || 0,
  }
}
