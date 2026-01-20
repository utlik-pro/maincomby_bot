'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { createTenant } from '@/lib/api'
import type { Tenant, TenantSettings } from '@/lib/types'
import { toast } from 'sonner'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

const DEFAULT_FEATURES = {
  networking: true,
  events: true,
  learning: true,
  achievements: true,
  leaderboard: true,
  referrals: false,
  subscriptions: false,
}

type LocaleType = 'ru' | 'en' | 'uk'

interface FormState {
  name: string
  slug: string
  domain: string
  appName: string
  defaultLocale: LocaleType
  defaultCity: string
  timezone: string
  supportContact: string
  is_active: boolean
  features: typeof DEFAULT_FEATURES
}

export default function NewTenantPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState<FormState>({
    name: '',
    slug: '',
    domain: '',
    appName: '',
    defaultLocale: 'ru',
    defaultCity: '',
    timezone: 'Europe/Moscow',
    supportContact: '',
    is_active: true,
    features: { ...DEFAULT_FEATURES },
  })

  function updateField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function setLocale(value: string) {
    if (value === 'ru' || value === 'en' || value === 'uk') {
      setForm(prev => ({ ...prev, defaultLocale: value as LocaleType }))
    }
  }

  function updateFeature(key: keyof typeof form.features, value: boolean) {
    setForm(prev => ({
      ...prev,
      features: { ...prev.features, [key]: value }
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!form.name.trim()) {
      toast.error('Name is required')
      return
    }

    const slug = form.slug.trim() || slugify(form.name)

    setSaving(true)
    try {
      const settings: TenantSettings = {
        appName: form.appName || form.name,
        defaultLocale: form.defaultLocale,
        defaultCity: form.defaultCity,
        timezone: form.timezone,
        supportContact: form.supportContact || undefined,
        features: form.features,
      }

      const tenantData: Partial<Tenant> = {
        name: form.name.trim(),
        slug,
        domain: form.domain.trim() || null,
        is_active: form.is_active,
        settings,
      }

      const created = await createTenant(tenantData)
      if (created) {
        toast.success('Tenant created successfully')
        router.push(`/tenants/${created.id}`)
      } else {
        toast.error('Failed to create tenant')
      }
    } catch (error) {
      console.error('Error creating tenant:', error)
      toast.error('Failed to create tenant')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/tenants">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Tenant</h1>
          <p className="text-muted-foreground">
            Create a new partner community.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Core details about this partner community.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="MAIN Community"
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  placeholder={slugify(form.name) || 'auto-generated'}
                  value={form.slug}
                  onChange={(e) => updateField('slug', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Used in URLs. Leave empty to auto-generate.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="domain">Domain</Label>
                <Input
                  id="domain"
                  placeholder="app.example.com"
                  value={form.domain}
                  onChange={(e) => updateField('domain', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="appName">App Display Name</Label>
                <Input
                  id="appName"
                  placeholder={form.name || 'App name in UI'}
                  value={form.appName}
                  onChange={(e) => updateField('appName', e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label>Active</Label>
                <p className="text-sm text-muted-foreground">
                  Enable this tenant for public access.
                </p>
              </div>
              <Switch
                checked={form.is_active}
                onCheckedChange={(checked) => updateField('is_active', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Localization */}
        <Card>
          <CardHeader>
            <CardTitle>Localization</CardTitle>
            <CardDescription>
              Language and regional settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="defaultLocale">Default Language</Label>
                <select
                  id="defaultLocale"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.defaultLocale}
                  onChange={(e) => setLocale(e.target.value)}
                >
                  <option value="ru">Russian</option>
                  <option value="en">English</option>
                  <option value="uk">Ukrainian</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultCity">Default City</Label>
                <Input
                  id="defaultCity"
                  placeholder="Moscow"
                  value={form.defaultCity}
                  onChange={(e) => updateField('defaultCity', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Input
                  id="timezone"
                  placeholder="Europe/Moscow"
                  value={form.timezone}
                  onChange={(e) => updateField('timezone', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
            <CardDescription>
              Enable or disable platform modules.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {(Object.keys(form.features) as Array<keyof typeof form.features>).map((feature) => (
                <div key={feature} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label className="capitalize">{feature}</Label>
                  </div>
                  <Switch
                    checked={form.features[feature]}
                    onCheckedChange={(checked) => updateFeature(feature, checked)}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle>Support Contact</CardTitle>
            <CardDescription>
              Contact information shown to users.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="supportContact">Telegram Username</Label>
              <Input
                id="supportContact"
                placeholder="@support"
                value={form.supportContact}
                onChange={(e) => updateField('supportContact', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Tenant
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/tenants">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}
