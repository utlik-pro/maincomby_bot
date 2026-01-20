'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Building2,
  Globe,
  Settings,
  Palette,
  Bot,
  Blocks,
  Edit,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { getTenantById, getTenantThemes, getTenantBot, deleteTenant } from '@/lib/api'
import type { Tenant, TenantTheme, TenantBot } from '@/lib/types'
import { toast } from 'sonner'

export default function TenantDetailPage() {
  const params = useParams()
  const router = useRouter()
  const tenantId = params.id as string

  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [themes, setThemes] = useState<TenantTheme[]>([])
  const [bot, setBot] = useState<TenantBot | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTenantData()
  }, [tenantId])

  async function loadTenantData() {
    try {
      const [tenantData, themesData, botData] = await Promise.all([
        getTenantById(tenantId),
        getTenantThemes(tenantId),
        getTenantBot(tenantId),
      ])

      if (!tenantData) {
        toast.error('Tenant not found')
        router.push('/tenants')
        return
      }

      setTenant(tenantData)
      setThemes(themesData)
      setBot(botData)
    } catch (error) {
      console.error('Failed to load tenant:', error)
      toast.error('Failed to load tenant data')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!tenant) return

    if (!confirm(`Are you sure you want to delete "${tenant.name}"? This will also delete all associated themes, blocks, and bots. This action cannot be undone.`)) {
      return
    }

    const success = await deleteTenant(tenant.id)
    if (success) {
      toast.success('Tenant deleted successfully')
      router.push('/tenants')
    } else {
      toast.error('Failed to delete tenant')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    )
  }

  if (!tenant) {
    return null
  }

  const defaultTheme = themes.find(t => t.is_default)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/tenants">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{tenant.name}</h1>
              <Badge variant={tenant.is_active ? 'default' : 'secondary'}>
                {tenant.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {tenant.domain || tenant.slug}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/tenants/${tenant.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              <p className="font-medium">{tenant.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Slug</label>
              <p className="font-mono">{tenant.slug}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Domain</label>
              <p>{tenant.domain || <span className="text-muted-foreground">Not configured</span>}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Created</label>
              <p>{new Date(tenant.created_at).toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">App Name</label>
              <p className="font-medium">{tenant.settings?.appName || tenant.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Default Locale</label>
              <p>{tenant.settings?.defaultLocale || 'ru'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Default City</label>
              <p>{tenant.settings?.defaultCity || 'Not set'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Timezone</label>
              <p>{tenant.settings?.timezone || 'Europe/Moscow'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Blocks className="h-5 w-5" />
              Features
            </CardTitle>
            <CardDescription>Enabled modules for this tenant</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {tenant.settings?.features?.networking && (
                <Badge variant="outline">Networking</Badge>
              )}
              {tenant.settings?.features?.events && (
                <Badge variant="outline">Events</Badge>
              )}
              {tenant.settings?.features?.learning && (
                <Badge variant="outline">Learning</Badge>
              )}
              {tenant.settings?.features?.achievements && (
                <Badge variant="outline">Achievements</Badge>
              )}
              {tenant.settings?.features?.leaderboard && (
                <Badge variant="outline">Leaderboard</Badge>
              )}
              {tenant.settings?.features?.referrals && (
                <Badge variant="outline">Referrals</Badge>
              )}
              {tenant.settings?.features?.subscriptions && (
                <Badge variant="outline">Subscriptions</Badge>
              )}
              {!tenant.settings?.features && (
                <p className="text-muted-foreground text-sm">No features configured</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Bot Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Telegram Bot
            </CardTitle>
            <CardDescription>Bot connection settings</CardDescription>
          </CardHeader>
          <CardContent>
            {bot ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Type</label>
                  <p className="font-medium">
                    {bot.bot_type === 'own' ? 'Own Bot' : 'Shared Bot'}
                  </p>
                </div>
                {bot.bot_username && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Username</label>
                    <p className="font-mono">@{bot.bot_username}</p>
                  </div>
                )}
                {bot.startapp_param && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Startapp Param</label>
                    <p className="font-mono">{bot.startapp_param}</p>
                  </div>
                )}
                <Badge variant={bot.is_active ? 'default' : 'secondary'}>
                  {bot.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No bot configured</p>
            )}
          </CardContent>
        </Card>

        {/* Theme Preview */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Theme
            </CardTitle>
            <CardDescription>
              {defaultTheme ? `"${defaultTheme.name}" theme` : 'Default theme'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {defaultTheme ? (
              <div className="space-y-4">
                <div className="flex gap-2">
                  {Object.entries(defaultTheme.colors || {}).slice(0, 8).map(([name, color]) => (
                    <div key={name} className="text-center">
                      <div
                        className="w-10 h-10 rounded-lg border"
                        style={{ backgroundColor: color as string }}
                      />
                      <p className="text-xs text-muted-foreground mt-1">{name}</p>
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="flex gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Font: </span>
                    <span className="font-medium">{defaultTheme.fonts?.primary || 'System'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Border Radius: </span>
                    <span className="font-medium">{defaultTheme.border_radius?.md || '8px'}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Using system default theme</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link href={`/builder?tenant=${tenant.id}`}>
              <Blocks className="mr-2 h-4 w-4" />
              Configure Blocks
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/themes?tenant=${tenant.id}`}>
              <Palette className="mr-2 h-4 w-4" />
              Edit Theme
            </Link>
          </Button>
          {tenant.domain && (
            <Button variant="outline" asChild>
              <a href={`https://${tenant.domain}`} target="_blank" rel="noopener noreferrer">
                <Globe className="mr-2 h-4 w-4" />
                Open Site
              </a>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
