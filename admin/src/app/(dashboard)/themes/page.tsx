'use client'

import { useState, useEffect } from 'react'
import {
  Palette,
  Check,
  Plus,
  Trash2,
  Loader2,
  Building2,
  Pencil,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
  getTenants,
  getTenantThemes,
  createTenantTheme,
  updateTenantTheme,
  setDefaultTheme,
  deleteTenantTheme,
} from '@/lib/api'
import type { Tenant, TenantTheme, ThemeColors } from '@/lib/types'

// ═══════════════════════════════════════════════════════════════
// DEFAULT THEME COLORS
// ═══════════════════════════════════════════════════════════════

const DEFAULT_COLORS: ThemeColors = {
  accent: '#c8ff00',
  accentHover: '#b8e800',
  bgPrimary: '#0a0a0a',
  bgSecondary: '#111111',
  bgCard: '#1a1a1a',
  bgInput: '#222222',
  textPrimary: '#ffffff',
  textSecondary: '#cccccc',
  textMuted: '#888888',
  border: '#333333',
  success: '#00d26a',
  danger: '#ff4444',
  warning: '#ffc107',
  info: '#00b4d8',
}

const COLOR_LABELS: Record<keyof ThemeColors, string> = {
  accent: 'Accent',
  accentHover: 'Accent Hover',
  bgPrimary: 'Background',
  bgSecondary: 'Secondary BG',
  bgCard: 'Card BG',
  bgInput: 'Input BG',
  textPrimary: 'Text Primary',
  textSecondary: 'Text Secondary',
  textMuted: 'Text Muted',
  border: 'Border',
  success: 'Success',
  danger: 'Danger',
  warning: 'Warning',
  info: 'Info',
}

// ═══════════════════════════════════════════════════════════════
// COLOR INPUT COMPONENT
// ═══════════════════════════════════════════════════════════════

interface ColorInputProps {
  label: string
  value: string
  onChange: (value: string) => void
}

function ColorInput({ label, value, onChange }: ColorInputProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm">{label}</Label>
      <div className="flex items-center gap-2">
        <div className="relative">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-10 w-10 cursor-pointer rounded-lg border-0 p-0"
          />
        </div>
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 flex-1 font-mono text-sm"
          placeholder="#000000"
        />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// THEME PREVIEW COMPONENT
// ═══════════════════════════════════════════════════════════════

interface ThemePreviewProps {
  colors: ThemeColors
}

function ThemePreview({ colors }: ThemePreviewProps) {
  return (
    <div
      className="rounded-xl p-4 transition-colors"
      style={{ backgroundColor: colors.bgCard }}
    >
      <div className="flex items-center gap-3">
        <div
          className="h-10 w-10 rounded-full"
          style={{ backgroundColor: colors.accent }}
        />
        <div>
          <p className="font-medium" style={{ color: colors.textPrimary }}>
            Sample Card
          </p>
          <p className="text-sm" style={{ color: colors.textMuted }}>
            Preview text
          </p>
        </div>
      </div>
      <button
        className="mt-3 w-full rounded-lg py-2 font-medium transition-colors"
        style={{
          backgroundColor: colors.accent,
          color: colors.bgPrimary,
        }}
      >
        Action Button
      </button>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// MAIN THEMES PAGE
// ═══════════════════════════════════════════════════════════════

export default function ThemesPage() {
  // State
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [selectedTenantId, setSelectedTenantId] = useState<string>('')
  const [themes, setThemes] = useState<TenantTheme[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState<TenantTheme | null>(null)

  // Form state
  const [themeName, setThemeName] = useState('')
  const [themeColors, setThemeColors] = useState<ThemeColors>(DEFAULT_COLORS)

  // Load tenants on mount
  useEffect(() => {
    async function loadTenants() {
      const data = await getTenants()
      setTenants(data)
      if (data.length > 0) {
        const mainTenant = data.find(t => t.slug === 'main')
        setSelectedTenantId(mainTenant?.id || data[0].id)
      }
      setLoading(false)
    }
    loadTenants()
  }, [])

  // Load themes when tenant changes
  useEffect(() => {
    if (!selectedTenantId) return

    async function loadThemes() {
      setLoading(true)
      const data = await getTenantThemes(selectedTenantId)
      setThemes(data)
      setLoading(false)
    }
    loadThemes()
  }, [selectedTenantId])

  // Create new theme
  async function handleCreateTheme() {
    if (!selectedTenantId || !themeName.trim()) return

    setSaving(true)
    const newTheme = await createTenantTheme({
      tenant_id: selectedTenantId,
      name: themeName.trim(),
      colors: themeColors,
      fonts: { primary: 'Inter', heading: 'Inter', mono: 'JetBrains Mono' },
      border_radius: { sm: '4px', md: '8px', lg: '12px', xl: '16px', full: '9999px' },
      is_default: themes.length === 0,
    })
    setSaving(false)

    if (newTheme) {
      setThemes([...themes, newTheme])
      setCreateDialogOpen(false)
      setThemeName('')
      setThemeColors(DEFAULT_COLORS)
      toast.success('Theme created')
    } else {
      toast.error('Failed to create theme')
    }
  }

  // Open edit dialog
  function openEditDialog(theme: TenantTheme) {
    setSelectedTheme(theme)
    setThemeName(theme.name)
    setThemeColors(theme.colors)
    setEditDialogOpen(true)
  }

  // Update theme
  async function handleUpdateTheme() {
    if (!selectedTheme || !themeName.trim()) return

    setSaving(true)
    const updated = await updateTenantTheme(selectedTheme.id, {
      name: themeName.trim(),
      colors: themeColors,
    })
    setSaving(false)

    if (updated) {
      setThemes(themes.map(t => t.id === updated.id ? updated : t))
      setEditDialogOpen(false)
      setSelectedTheme(null)
      toast.success('Theme updated')
    } else {
      toast.error('Failed to update theme')
    }
  }

  // Apply theme (set as default)
  async function handleApplyTheme(themeId: string) {
    setSaving(true)
    const success = await setDefaultTheme(themeId, selectedTenantId)
    setSaving(false)

    if (success) {
      setThemes(themes.map(t => ({
        ...t,
        is_default: t.id === themeId,
      })))
      toast.success('Theme applied')
    } else {
      toast.error('Failed to apply theme')
    }
  }

  // Delete theme
  async function handleDeleteTheme() {
    if (!selectedTheme) return

    setSaving(true)
    const success = await deleteTenantTheme(selectedTheme.id)
    setSaving(false)

    if (success) {
      setThemes(themes.filter(t => t.id !== selectedTheme.id))
      setDeleteDialogOpen(false)
      setSelectedTheme(null)
      toast.success('Theme deleted')
    } else {
      toast.error('Failed to delete theme')
    }
  }

  // Update color helper
  function updateColor(key: keyof ThemeColors, value: string) {
    setThemeColors(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Themes</h1>
          <p className="text-muted-foreground">
            Customize the visual appearance of the Mini App
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Tenant Selector */}
          <Select value={selectedTenantId} onValueChange={setSelectedTenantId}>
            <SelectTrigger className="w-[200px]">
              <Building2 className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Select tenant" />
            </SelectTrigger>
            <SelectContent>
              {tenants.map((tenant) => (
                <SelectItem key={tenant.id} value={tenant.id}>
                  {tenant.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={() => {
            setThemeName('')
            setThemeColors(DEFAULT_COLORS)
            setCreateDialogOpen(true)
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Create Theme
          </Button>
        </div>
      </div>

      {/* Themes Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : themes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Palette className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p className="font-medium">No themes yet</p>
            <p className="text-sm">Create your first theme to customize the Mini App</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {themes.map((theme) => (
            <Card key={theme.id} className={theme.is_default ? 'ring-2 ring-primary' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {theme.name}
                    {theme.is_default && (
                      <Badge variant="default">Active</Badge>
                    )}
                  </CardTitle>
                  {theme.is_default && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </div>
                <CardDescription>
                  Created {new Date(theme.created_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Color Preview */}
                <div className="mb-4 flex gap-2">
                  {['accent', 'bgPrimary', 'bgCard', 'success'].map((key) => (
                    <div
                      key={key}
                      className="h-10 w-10 rounded-lg border"
                      style={{ backgroundColor: theme.colors[key as keyof ThemeColors] }}
                      title={COLOR_LABELS[key as keyof ThemeColors]}
                    />
                  ))}
                </div>

                {/* Preview Card */}
                <ThemePreview colors={theme.colors} />

                {/* Actions */}
                <div className="mt-4 flex gap-2">
                  {!theme.is_default && (
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleApplyTheme(theme.id)}
                      disabled={saving}
                    >
                      Apply Theme
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    className="flex-1"
                    onClick={() => openEditDialog(theme)}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  {!theme.is_default && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        setSelectedTheme(theme)
                        setDeleteDialogOpen(true)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Theme Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Theme</DialogTitle>
            <DialogDescription>
              Create a new theme for this tenant
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Theme Name</Label>
              <Input
                value={themeName}
                onChange={(e) => setThemeName(e.target.value)}
                placeholder="My Custom Theme"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {(Object.keys(COLOR_LABELS) as Array<keyof ThemeColors>).map((key) => (
                <ColorInput
                  key={key}
                  label={COLOR_LABELS[key]}
                  value={themeColors[key]}
                  onChange={(value) => updateColor(key, value)}
                />
              ))}
            </div>

            <div>
              <Label className="mb-2 block">Preview</Label>
              <ThemePreview colors={themeColors} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTheme} disabled={saving || !themeName.trim()}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Theme
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Theme Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Theme</DialogTitle>
            <DialogDescription>
              Modify theme colors and settings
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Theme Name</Label>
              <Input
                value={themeName}
                onChange={(e) => setThemeName(e.target.value)}
                placeholder="My Custom Theme"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {(Object.keys(COLOR_LABELS) as Array<keyof ThemeColors>).map((key) => (
                <ColorInput
                  key={key}
                  label={COLOR_LABELS[key]}
                  value={themeColors[key]}
                  onChange={(value) => updateColor(key, value)}
                />
              ))}
            </div>

            <div>
              <Label className="mb-2 block">Preview</Label>
              <ThemePreview colors={themeColors} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateTheme} disabled={saving || !themeName.trim()}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Theme</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{selectedTheme?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTheme} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
