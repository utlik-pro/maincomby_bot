'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Blocks,
  GripVertical,
  X,
  Target,
  Calendar,
  Trophy,
  Users,
  BookOpen,
  Medal,
  User,
  BarChart3,
  Megaphone,
  Code,
  Loader2,
  Building2,
  Undo2,
  Save,
  Upload,
  Sparkles,
  Home,
  GraduationCap,
  Flame,
  Eye,
  EyeOff,
  ChevronRight,
  Crown,
  TrendingUp,
  Star,
  MapPin,
  Lock,
  Bell,
  Pencil,
  Trash2,
  Plus,
  Navigation,
  RefreshCw,
  type LucideIcon,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { getTenants, getTenantBlocks, saveAllBlocks } from '@/lib/api'
import type { Tenant, AppBlock, BlockType } from '@/lib/types'

// ═══════════════════════════════════════════════════════════════
// TYPES & CONSTANTS
// ═══════════════════════════════════════════════════════════════

interface BlockDefinition {
  type: BlockType
  name: string
  icon: LucideIcon
  description: string
}

interface DraftBlock {
  id: string
  block_type: BlockType
  title: Record<string, string>
  config: Record<string, unknown>
  is_visible: boolean
}

// Navigation Types
type ScreenId = 'home' | 'events' | 'learn' | 'achievements' | 'profile' | 'network' | 'notifications'
type NavIconId = 'home' | 'calendar' | 'graduation-cap' | 'trophy' | 'user' | 'flame' | 'bell' | 'users'

interface NavigationTab {
  id: string
  screenId: ScreenId
  icon: NavIconId
  label: { ru: string; en: string }
  visible: boolean
}

interface ScreenDefinition {
  id: ScreenId
  name: string
  icon: LucideIcon
}

interface NavIconDefinition {
  id: NavIconId
  icon: LucideIcon
}

const AVAILABLE_SCREENS: ScreenDefinition[] = [
  { id: 'home', name: 'Главная', icon: Home },
  { id: 'events', name: 'События', icon: Calendar },
  { id: 'learn', name: 'Обучение', icon: GraduationCap },
  { id: 'achievements', name: 'Награды', icon: Trophy },
  { id: 'profile', name: 'Профиль', icon: User },
  { id: 'network', name: 'Нетворк', icon: Flame },
  { id: 'notifications', name: 'Уведомления', icon: Bell },
]

const AVAILABLE_NAV_ICONS: NavIconDefinition[] = [
  { id: 'home', icon: Home },
  { id: 'calendar', icon: Calendar },
  { id: 'graduation-cap', icon: GraduationCap },
  { id: 'trophy', icon: Trophy },
  { id: 'user', icon: User },
  { id: 'flame', icon: Flame },
  { id: 'bell', icon: Bell },
  { id: 'users', icon: Users },
]

const DEFAULT_NAVIGATION_TABS: NavigationTab[] = [
  { id: 'tab-1', screenId: 'home', icon: 'home', label: { ru: 'Главная', en: 'Home' }, visible: true },
  { id: 'tab-2', screenId: 'events', icon: 'calendar', label: { ru: 'События', en: 'Events' }, visible: true },
  { id: 'tab-3', screenId: 'learn', icon: 'graduation-cap', label: { ru: 'Обучение', en: 'Learn' }, visible: true },
  { id: 'tab-4', screenId: 'achievements', icon: 'trophy', label: { ru: 'Награды', en: 'Achievements' }, visible: true },
  { id: 'tab-5', screenId: 'profile', icon: 'user', label: { ru: 'Профиль', en: 'Profile' }, visible: true },
]

const NAV_ICON_MAP: Record<NavIconId, LucideIcon> = {
  home: Home,
  calendar: Calendar,
  'graduation-cap': GraduationCap,
  trophy: Trophy,
  user: User,
  flame: Flame,
  bell: Bell,
  users: Users,
}

const AVAILABLE_BLOCKS: BlockDefinition[] = [
  { type: 'hero', name: 'Hero Banner', icon: Target, description: 'Main welcome banner' },
  { type: 'profile', name: 'Profile Card', icon: User, description: 'User profile preview' },
  { type: 'events', name: 'Events', icon: Calendar, description: 'Upcoming events list' },
  { type: 'leaderboard', name: 'Leaderboard', icon: Trophy, description: 'Top users ranking' },
  { type: 'network', name: 'Networking', icon: Users, description: 'Match suggestions' },
  { type: 'courses', name: 'Courses', icon: BookOpen, description: 'Learning modules' },
  { type: 'achievements', name: 'Achievements', icon: Medal, description: 'User badges' },
  { type: 'stats', name: 'Statistics', icon: BarChart3, description: 'Community stats' },
  { type: 'announcements', name: 'Announcements', icon: Megaphone, description: 'Important notices' },
  { type: 'custom_html', name: 'Custom HTML', icon: Code, description: 'Custom content block' },
]

const BLOCK_ICON_MAP: Record<BlockType, LucideIcon> = {
  hero: Target,
  events: Calendar,
  leaderboard: Trophy,
  network: Users,
  courses: BookOpen,
  achievements: Medal,
  profile: User,
  stats: BarChart3,
  announcements: Megaphone,
  custom_html: Code,
}

// ═══════════════════════════════════════════════════════════════
// DRAGGABLE LIBRARY BLOCK
// ═══════════════════════════════════════════════════════════════

interface DraggableLibraryBlockProps {
  block: BlockDefinition
  isInPhone: boolean
}

function DraggableLibraryBlock({ block, isInPhone }: DraggableLibraryBlockProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useSortable({
    id: `library-${block.type}`,
    data: { source: 'library', blockType: block.type, blockDef: block },
  })

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`flex items-center gap-3 rounded-xl border-2 border-dashed p-3 cursor-grab active:cursor-grabbing transition-all ${
        isDragging
          ? 'opacity-50 border-primary bg-primary/5'
          : isInPhone
          ? 'opacity-40 border-muted'
          : 'border-border hover:border-primary hover:bg-accent/50'
      }`}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
        <block.icon className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{block.name}</p>
        <p className="text-xs text-muted-foreground truncate">{block.description}</p>
      </div>
      {isInPhone && <Badge variant="secondary" className="text-xs shrink-0">In use</Badge>}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// SORTABLE PHONE BLOCK
// ═══════════════════════════════════════════════════════════════

interface SortablePhoneBlockProps {
  block: DraftBlock
  onRemove: () => void
}

function SortablePhoneBlock({ block, onRemove }: SortablePhoneBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: block.id,
    data: { source: 'phone', block },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${isDragging ? 'z-50' : ''}`}
    >
      {/* Remove button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onRemove()
        }}
        className="absolute -top-2 -right-2 z-10 bg-red-500 text-white rounded-full p-1.5 shadow-lg
                   opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
      >
        <X className="h-3 w-3" />
      </button>

      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className={`cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-50' : ''}`}
      >
        <BlockPreview block={block} />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// BLOCK PREVIEW (Realistic miniapp-style)
// ═══════════════════════════════════════════════════════════════

function BlockPreview({ block }: { block: DraftBlock }) {
  const Icon = BLOCK_ICON_MAP[block.block_type] || Blocks
  const blockDef = AVAILABLE_BLOCKS.find(b => b.type === block.block_type)

  switch (block.block_type) {
    case 'hero':
      return (
        <div className="mb-3 relative rounded-2xl overflow-hidden min-h-[140px]"
          style={{ background: 'linear-gradient(to bottom, rgba(200,255,0,0.2), rgba(200,255,0,0.05))' }}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="relative p-4 h-full flex flex-col justify-end">
            <h3 className="text-xl font-bold text-white">Добро пожаловать!</h3>
            <p className="text-sm text-gray-300 mt-1">Ваш центр сообщества</p>
            <button className="mt-3 bg-[#c8ff00] text-black px-4 py-1.5 rounded-xl text-sm font-semibold w-fit">
              Начать
            </button>
          </div>
        </div>
      )

    case 'profile':
      return (
        <div className="bg-[#1a1a1a] rounded-2xl p-4 mb-3">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[#c8ff00]/30 to-[#c8ff00]/10 rounded-full flex items-center justify-center shrink-0">
              <User className="h-7 w-7 text-[#c8ff00]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-white">Dmitry</div>
              <div className="flex items-center gap-2">
                <span className="text-[#c8ff00] text-sm font-medium flex items-center gap-1">
                  <Star size={14} className="fill-[#c8ff00]" />
                  Лидер
                </span>
                <span className="text-gray-500 text-sm">5,240 XP</span>
              </div>
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>До Основателя</span>
              <span>26%</span>
            </div>
            <div className="h-1.5 bg-gray-700 rounded-full">
              <div className="h-1.5 w-1/4 bg-[#c8ff00] rounded-full" />
            </div>
          </div>
        </div>
      )

    case 'events':
      return (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#c8ff00]" />
              <span className="text-sm font-medium text-white">События</span>
            </div>
            <span className="text-xs text-[#c8ff00]">Все →</span>
          </div>
          <div className="space-y-2">
            <div className="bg-[#1a1a1a] rounded-xl p-3 flex gap-3">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center shrink-0">
                <Calendar className="h-5 w-5 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-white text-sm">React Conf 2025</div>
                <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                  <Calendar size={10} /> 23 янв
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <MapPin size={10} /> Москва
                </div>
              </div>
              <button className="bg-[#c8ff00]/10 text-[#c8ff00] px-3 py-1 rounded-lg text-xs self-center shrink-0">
                Join
              </button>
            </div>
          </div>
        </div>
      )

    case 'leaderboard':
      return (
        <div className="bg-[#1a1a1a] rounded-2xl p-4 mb-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-yellow-400" />
              <span className="text-sm font-medium text-white">Топ</span>
            </div>
            <span className="text-xs text-[#c8ff00]">Все →</span>
          </div>
          <div className="space-y-2">
            {[
              { rank: 1, name: 'Alex', xp: '5,850', medal: '🥇', color: 'text-yellow-400' },
              { rank: 2, name: 'Marina', xp: '5,420', medal: '🥈', color: 'text-gray-300' },
              { rank: 3, name: 'Dmitry', xp: '5,240', medal: '🥉', color: 'text-orange-400', isYou: true },
            ].map((user) => (
              <div key={user.rank} className={`flex items-center gap-3 ${user.isYou ? 'bg-[#c8ff00]/10 -mx-2 px-2 py-1 rounded-lg' : ''}`}>
                <span className={`text-sm font-bold w-5 ${user.color}`}>{user.medal}</span>
                <div className="w-7 h-7 bg-gray-600 rounded-full shrink-0" />
                <span className="flex-1 text-sm text-white truncate">
                  {user.name}
                  {user.isYou && <span className="text-[#c8ff00] ml-1">(you)</span>}
                </span>
                <span className="text-[#c8ff00] text-sm font-semibold shrink-0">{user.xp} XP</span>
              </div>
            ))}
          </div>
        </div>
      )

    case 'network':
      return (
        <div className="bg-gradient-to-r from-[#c8ff00]/20 to-[#c8ff00]/5 border border-[#c8ff00]/20 rounded-2xl p-4 mb-3">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#c8ff00]/20 flex items-center justify-center shrink-0">
              <Flame className="text-[#c8ff00]" size={24} />
            </div>
            <div className="flex-1">
              <div className="font-bold text-white mb-0.5">Нетворк</div>
              <div className="text-xs text-gray-400">
                Найди людей для знакомства
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-500" />
          </div>
        </div>
      )

    case 'courses':
      return (
        <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/20 rounded-2xl p-4 mb-3">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center shrink-0">
              <BookOpen className="text-blue-400" size={24} />
            </div>
            <div className="flex-1">
              <div className="font-bold text-white mb-0.5">Курсы</div>
              <div className="text-xs text-gray-400">
                Учись и получай XP
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-500" />
          </div>
        </div>
      )

    case 'achievements':
      return (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-[#c8ff00]" />
              <span className="text-sm font-medium text-white">Достижения</span>
            </div>
            <span className="text-xs text-[#c8ff00]">Все →</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 1, earned: true, title: 'Первое событие' },
              { id: 2, earned: true, title: 'Streak 7 дней' },
              { id: 3, earned: false, title: 'Нетворкер' },
              { id: 4, earned: false, title: 'Эксперт' },
            ].map(badge => (
              <div
                key={badge.id}
                className={`aspect-square rounded-xl flex items-center justify-center ${
                  badge.earned ? 'bg-[#c8ff00]/20' : 'bg-[#1a1a1a] opacity-50'
                }`}
                title={badge.title}
              >
                {badge.earned ? (
                  <Trophy className="h-5 w-5 text-[#c8ff00]" />
                ) : (
                  <Lock className="h-4 w-4 text-gray-600" />
                )}
              </div>
            ))}
          </div>
        </div>
      )

    case 'stats':
      return (
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-3 px-1">
            <TrendingUp className="h-4 w-4 text-[#c8ff00]" />
            <span className="text-sm font-medium text-white">Статистика</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'События', value: 12, color: 'text-[#c8ff00]' },
              { label: 'Знакомства', value: 45, color: 'text-green-400' },
              { label: 'Бейджи', value: 8, color: 'text-white' },
            ].map((stat) => (
              <div key={stat.label} className="bg-[#1a1a1a] rounded-xl p-3 text-center">
                <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-[10px] text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      )

    case 'announcements':
      return (
        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/20 rounded-2xl p-4 mb-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center shrink-0">
              <Megaphone className="text-yellow-400" size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-yellow-300">Новый митап!</div>
              <div className="text-sm text-gray-400">Регистрация открыта до 25 января</div>
            </div>
          </div>
        </div>
      )

    case 'custom_html':
      return (
        <div className="bg-[#1a1a1a] rounded-2xl p-4 mb-3 border border-dashed border-gray-600">
          <div className="flex items-center gap-2 mb-2">
            <Code className="h-4 w-4 text-[#c8ff00]" />
            <span className="text-sm font-medium text-white">Custom Block</span>
          </div>
          <div className="h-12 bg-gray-700/30 rounded-lg flex items-center justify-center">
            <span className="text-xs text-gray-500">Custom content</span>
          </div>
        </div>
      )

    default:
      return (
        <div className="bg-[#1a1a1a] rounded-2xl p-4 mb-3">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-[#c8ff00]" />
            <span className="text-sm font-medium text-white">{blockDef?.name || block.block_type}</span>
          </div>
        </div>
      )
  }
}

// ═══════════════════════════════════════════════════════════════
// NAVIGATION EDITOR (Separate Tab)
// ═══════════════════════════════════════════════════════════════

interface NavigationEditorProps {
  tabs: NavigationTab[]
  onChange: (tabs: NavigationTab[]) => void
}

function NavigationEditor({ tabs, onChange }: NavigationEditorProps) {
  const [editingTab, setEditingTab] = useState<NavigationTab | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  // Generate unique ID for new tabs
  function generateTabId(): string {
    return `tab-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
  }

  // Open edit dialog
  function handleEdit(tab: NavigationTab) {
    setEditingTab({ ...tab })
  }

  // Save edited tab
  function handleSaveEdit() {
    if (!editingTab) return
    onChange(tabs.map(t => t.id === editingTab.id ? editingTab : t))
    setEditingTab(null)
  }

  // Delete tab
  function handleDelete(tabId: string) {
    if (tabs.length <= 2) {
      toast.error('Minimum 2 tabs required')
      return
    }
    onChange(tabs.filter(t => t.id !== tabId))
  }

  // Add new tab
  function handleAddTab() {
    if (tabs.length >= 5) {
      toast.error('Maximum 5 tabs allowed')
      return
    }

    const newTab: NavigationTab = {
      id: generateTabId(),
      screenId: 'home',
      icon: 'home',
      label: { ru: 'Новый', en: 'New' },
      visible: true,
    }
    onChange([...tabs, newTab])
    setIsAddDialogOpen(false)
    // Open edit dialog for new tab
    setEditingTab(newTab)
  }

  // Move tab up
  function handleMoveUp(index: number) {
    if (index === 0) return
    const newTabs = [...tabs]
    ;[newTabs[index - 1], newTabs[index]] = [newTabs[index], newTabs[index - 1]]
    onChange(newTabs)
  }

  // Move tab down
  function handleMoveDown(index: number) {
    if (index === tabs.length - 1) return
    const newTabs = [...tabs]
    ;[newTabs[index], newTabs[index + 1]] = [newTabs[index + 1], newTabs[index]]
    onChange(newTabs)
  }

  // Toggle visibility
  function handleToggleVisibility(tabId: string) {
    const visibleCount = tabs.filter(t => t.visible).length
    const tab = tabs.find(t => t.id === tabId)
    if (tab?.visible && visibleCount <= 2) {
      toast.error('Minimum 2 visible tabs required')
      return
    }
    onChange(tabs.map(t => t.id === tabId ? { ...t, visible: !t.visible } : t))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Bottom Navigation</h3>
        <Badge variant="outline">{tabs.length}/5 tabs</Badge>
      </div>

      <p className="text-sm text-muted-foreground">
        Configure navigation tabs for your app. Assign screens, change icons, and reorder.
      </p>

      {/* Sortable list of tabs */}
      <div className="space-y-2">
        {tabs.map((tab, index) => {
          const IconComponent = NAV_ICON_MAP[tab.icon]
          const screen = AVAILABLE_SCREENS.find(s => s.id === tab.screenId)

          return (
            <div
              key={tab.id}
              className={`bg-card border rounded-lg p-3 transition-all ${
                !tab.visible ? 'opacity-50' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Drag handle / position */}
                <div className="flex flex-col gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                  >
                    <ChevronRight className="h-3 w-3 -rotate-90" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={() => handleMoveDown(index)}
                    disabled={index === tabs.length - 1}
                  >
                    <ChevronRight className="h-3 w-3 rotate-90" />
                  </Button>
                </div>

                {/* Icon */}
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                  <IconComponent className="h-5 w-5 text-primary" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{tab.label.ru}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    {screen && <screen.icon className="h-3 w-3" />}
                    {screen?.name || tab.screenId}
                  </div>
                </div>

                {/* Visibility toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleToggleVisibility(tab.id)}
                  title={tab.visible ? 'Hide tab' : 'Show tab'}
                >
                  {tab.visible ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>

                {/* Edit button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleEdit(tab)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>

                {/* Delete button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => handleDelete(tab.id)}
                  disabled={tabs.length <= 2}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Add new tab button */}
      <Button
        variant="outline"
        className="w-full"
        onClick={handleAddTab}
        disabled={tabs.length >= 5}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Tab
      </Button>

      {/* Edit Dialog */}
      <Dialog open={!!editingTab} onOpenChange={(open) => !open && setEditingTab(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Navigation Tab</DialogTitle>
            <DialogDescription>
              Configure this tab&apos;s screen, icon, and label.
            </DialogDescription>
          </DialogHeader>

          {editingTab && (
            <div className="space-y-4 py-4">
              {/* Screen selector */}
              <div className="space-y-2">
                <Label>Screen</Label>
                <Select
                  value={editingTab.screenId}
                  onValueChange={(value) =>
                    setEditingTab({ ...editingTab, screenId: value as ScreenId })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select screen" />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_SCREENS.map((screen) => (
                      <SelectItem key={screen.id} value={screen.id}>
                        <div className="flex items-center gap-2">
                          <screen.icon className="h-4 w-4" />
                          {screen.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Icon selector */}
              <div className="space-y-2">
                <Label>Icon</Label>
                <div className="grid grid-cols-4 gap-2">
                  {AVAILABLE_NAV_ICONS.map((iconDef) => (
                    <button
                      key={iconDef.id}
                      onClick={() => setEditingTab({ ...editingTab, icon: iconDef.id })}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        editingTab.icon === iconDef.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <iconDef.icon className="h-5 w-5 mx-auto" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Label (RU) */}
              <div className="space-y-2">
                <Label>Label (RU)</Label>
                <Input
                  value={editingTab.label.ru}
                  onChange={(e) =>
                    setEditingTab({
                      ...editingTab,
                      label: { ...editingTab.label, ru: e.target.value },
                    })
                  }
                  placeholder="Главная"
                />
              </div>

              {/* Label (EN) */}
              <div className="space-y-2">
                <Label>Label (EN)</Label>
                <Input
                  value={editingTab.label.en}
                  onChange={(e) =>
                    setEditingTab({
                      ...editingTab,
                      label: { ...editingTab.label, en: e.target.value },
                    })
                  }
                  placeholder="Home"
                />
              </div>

              {/* Visibility toggle */}
              <div className="flex items-center justify-between">
                <Label>Visible</Label>
                <Switch
                  checked={editingTab.visible}
                  onCheckedChange={(checked) =>
                    setEditingTab({ ...editingTab, visible: checked })
                  }
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTab(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview hint */}
      <p className="text-xs text-muted-foreground text-center">
        Preview shows how navigation will appear in the app →
      </p>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// PHONE MOCKUP (Drop Zone) with Navigation Preview
// ═══════════════════════════════════════════════════════════════

interface PhoneMockupProps {
  blocks: DraftBlock[]
  navigationTabs: NavigationTab[]
  onRemove: (id: string) => void
  isOver: boolean
}

function PhoneMockup({ blocks, navigationTabs, onRemove, isOver }: PhoneMockupProps) {
  // Only show visible tabs
  const visibleTabs = navigationTabs.filter(tab => tab.visible)
  const { setNodeRef } = useDroppable({ id: 'phone-drop-zone' })

  return (
    <div className="flex flex-col items-center justify-start h-full py-4">
      {/* Phone frame */}
      <div className="relative">
        <div className={`w-[320px] bg-black rounded-[2.5rem] p-2.5 shadow-2xl transition-all ${
          isOver ? 'ring-4 ring-primary ring-opacity-50' : ''
        }`}>
          {/* Screen */}
          <div className="w-full h-[620px] bg-[#0a0a0a] rounded-[2rem] overflow-hidden relative flex flex-col">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-b-2xl z-10" />

            {/* Content Area (scrollable) */}
            <div
              ref={setNodeRef}
              className="flex-1 overflow-y-auto pt-8 px-3 pb-2 scrollbar-thin scrollbar-thumb-gray-700"
            >
              {blocks.length === 0 ? (
                <div className={`h-full flex flex-col items-center justify-center text-center transition-colors ${
                  isOver ? 'bg-primary/10 rounded-xl' : ''
                }`}>
                  <Blocks className="h-12 w-12 text-gray-600 mb-3" />
                  <p className="text-gray-500 text-sm font-medium">
                    {isOver ? 'Drop here!' : 'Drag blocks here'}
                  </p>
                  <p className="text-gray-600 text-xs mt-1">
                    Build your app layout
                  </p>
                </div>
              ) : (
                <SortableContext
                  items={blocks.map(b => b.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {blocks.map((block) => (
                    <SortablePhoneBlock
                      key={block.id}
                      block={block}
                      onRemove={() => onRemove(block.id)}
                    />
                  ))}
                </SortableContext>
              )}
            </div>

            {/* Bottom Navigation */}
            <div className="border-t border-gray-800 bg-[#0a0a0a] px-2 py-2 shrink-0">
              <div className="flex justify-around">
                {visibleTabs.map((tab, index) => {
                  const IconComponent = NAV_ICON_MAP[tab.icon] || Home
                  const isFirst = index === 0 // First tab is always "active" in preview

                  return (
                    <div
                      key={tab.id}
                      className={`flex flex-col items-center gap-1 px-2 py-1.5 ${
                        isFirst ? 'text-[#c8ff00]' : 'text-gray-500'
                      }`}
                    >
                      <div className="relative">
                        <IconComponent className="h-5 w-5" />
                        {/* Active dot for first tab */}
                        {isFirst && (
                          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#c8ff00]" />
                        )}
                      </div>
                      <span className="text-[9px] font-medium">{tab.label.ru}</span>
                    </div>
                  )
                })}
              </div>
              {visibleTabs.length < 5 && (
                <p className="text-[8px] text-gray-600 text-center mt-1">
                  {visibleTabs.length} of {navigationTabs.length} tabs visible
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Side buttons */}
        <div className="absolute right-[-2px] top-24 w-[3px] h-10 bg-gray-700 rounded-l" />
        <div className="absolute left-[-2px] top-20 w-[3px] h-6 bg-gray-700 rounded-r" />
        <div className="absolute left-[-2px] top-28 w-[3px] h-12 bg-gray-700 rounded-r" />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// PHONE PREVIEW IFRAME (Live miniapp preview)
// ═══════════════════════════════════════════════════════════════

interface PhonePreviewIframeProps {
  tenantId: string
  activeScreen: ScreenId
  onScreenChange: (screen: ScreenId) => void
  navigationTabs: NavigationTab[]
  refreshKey: number
}

function PhonePreviewIframe({
  tenantId,
  activeScreen,
  onScreenChange,
  navigationTabs,
  refreshKey,
}: PhonePreviewIframeProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [iframeLoaded, setIframeLoaded] = useState(false)

  // Build miniapp URL
  const miniappUrl = `${process.env.NEXT_PUBLIC_MINIAPP_URL || 'http://localhost:5173'}?tenant=${tenantId}&preview=true&screen=${activeScreen}`

  // Send navigation command via postMessage when screen changes
  useEffect(() => {
    if (iframeLoaded && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: 'NAVIGATE', screen: activeScreen },
        '*'
      )
    }
  }, [activeScreen, iframeLoaded])

  // Handle iframe load
  const handleIframeLoad = useCallback(() => {
    setIsLoading(false)
    setIframeLoaded(true)
  }, [])

  // Reload iframe
  const handleRefresh = useCallback(() => {
    setIsLoading(true)
    setIframeLoaded(false)
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src
    }
  }, [])

  // Only show visible tabs
  const visibleTabs = navigationTabs.filter(tab => tab.visible)

  return (
    <div className="flex flex-col items-center justify-start h-full py-4">
      {/* Refresh button */}
      <div className="mb-2 flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Preview
        </Button>
        <Badge variant="secondary" className="text-xs">
          Live Preview
        </Badge>
      </div>

      {/* Phone frame */}
      <div className="relative">
        <div className="w-[320px] bg-black rounded-[2.5rem] p-2.5 shadow-2xl">
          {/* Screen */}
          <div className="w-full h-[620px] bg-[#0a0a0a] rounded-[2rem] overflow-hidden relative flex flex-col">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-b-2xl z-20" />

            {/* iframe container */}
            <div className="flex-1 relative">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0a] z-10">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-[#c8ff00] mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">Loading preview...</p>
                  </div>
                </div>
              )}
              <iframe
                ref={iframeRef}
                key={refreshKey}
                src={miniappUrl}
                className="w-full h-full border-0 rounded-t-[2rem]"
                onLoad={handleIframeLoad}
                title="App Preview"
              />
            </div>

            {/* Custom Navigation Overlay (for admin control) */}
            <div className="border-t border-gray-800 bg-[#0a0a0a]/95 px-2 py-2 shrink-0 backdrop-blur-sm z-10">
              <div className="flex justify-around">
                {visibleTabs.map((tab) => {
                  const IconComponent = NAV_ICON_MAP[tab.icon] || Home
                  const isActive = tab.screenId === activeScreen

                  return (
                    <button
                      key={tab.id}
                      onClick={() => onScreenChange(tab.screenId)}
                      className={`flex flex-col items-center gap-1 px-2 py-1.5 transition-colors ${
                        isActive ? 'text-[#c8ff00]' : 'text-gray-500 hover:text-gray-400'
                      }`}
                    >
                      <div className="relative">
                        <IconComponent className="h-5 w-5" />
                        {isActive && (
                          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#c8ff00]" />
                        )}
                      </div>
                      <span className="text-[9px] font-medium">{tab.label.ru}</span>
                    </button>
                  )
                })}
              </div>
              <p className="text-[8px] text-gray-600 text-center mt-1">
                Click tabs to navigate • {visibleTabs.length} tabs visible
              </p>
            </div>
          </div>
        </div>

        {/* Side buttons */}
        <div className="absolute right-[-2px] top-24 w-[3px] h-10 bg-gray-700 rounded-l" />
        <div className="absolute left-[-2px] top-20 w-[3px] h-6 bg-gray-700 rounded-r" />
        <div className="absolute left-[-2px] top-28 w-[3px] h-12 bg-gray-700 rounded-r" />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// DRAG OVERLAY (Ghost when dragging)
// ═══════════════════════════════════════════════════════════════

function DragOverlayContent({ activeData }: { activeData: { source: string; blockType?: BlockType; blockDef?: BlockDefinition; block?: DraftBlock } }) {
  if (activeData.source === 'library' && activeData.blockDef) {
    const { blockDef } = activeData
    return (
      <div className="flex items-center gap-3 rounded-xl border-2 border-primary bg-card p-3 shadow-2xl w-64">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 shrink-0">
          <blockDef.icon className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">{blockDef.name}</p>
          <p className="text-xs text-muted-foreground truncate">{blockDef.description}</p>
        </div>
      </div>
    )
  }

  if (activeData.source === 'phone' && activeData.block) {
    return (
      <div className="w-[280px] opacity-90">
        <BlockPreview block={activeData.block} />
      </div>
    )
  }

  return null
}

// ═══════════════════════════════════════════════════════════════
// MAIN BUILDER PAGE
// ═══════════════════════════════════════════════════════════════

export default function BuilderPage() {
  // State
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [selectedTenantId, setSelectedTenantId] = useState<string>('')
  const [savedBlocks, setSavedBlocks] = useState<DraftBlock[]>([])
  const [draftBlocks, setDraftBlocks] = useState<DraftBlock[]>([])
  const [savedNavigation, setSavedNavigation] = useState<NavigationTab[]>(DEFAULT_NAVIGATION_TABS)
  const [draftNavigation, setDraftNavigation] = useState<NavigationTab[]>(DEFAULT_NAVIGATION_TABS)
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState(false)
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false)
  const [activeData, setActiveData] = useState<{ source: string; blockType?: BlockType; blockDef?: BlockDefinition; block?: DraftBlock } | null>(null)
  const [isOverPhone, setIsOverPhone] = useState(false)
  const [builderTab, setBuilderTab] = useState<'blocks' | 'navigation'>('blocks')

  // Preview state
  const [previewMode, setPreviewMode] = useState<'edit' | 'live'>('live')
  const [activeScreen, setActiveScreen] = useState<ScreenId>('home')
  const [previewRefreshKey, setPreviewRefreshKey] = useState(0)

  // Check if draft has changes (blocks or navigation)
  const isDirty =
    JSON.stringify(draftBlocks) !== JSON.stringify(savedBlocks) ||
    JSON.stringify(draftNavigation) !== JSON.stringify(savedNavigation)

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

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

  // Load blocks when tenant changes
  useEffect(() => {
    if (!selectedTenantId) return

    async function loadBlocks() {
      setLoading(true)
      const data = await getTenantBlocks(selectedTenantId)
      const blocks: DraftBlock[] = data.map(b => ({
        id: b.id,
        block_type: b.block_type as BlockType,
        title: b.title || {},
        config: b.config || {},
        is_visible: b.is_visible,
      }))
      setSavedBlocks(blocks)
      setDraftBlocks(blocks)
      setLoading(false)
    }
    loadBlocks()
  }, [selectedTenantId])

  // Generate unique ID for new blocks
  function generateId(): string {
    return `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // Add block to draft
  function addBlockToDraft(blockType: BlockType) {
    const blockDef = AVAILABLE_BLOCKS.find(b => b.type === blockType)
    if (!blockDef) return

    const newBlock: DraftBlock = {
      id: generateId(),
      block_type: blockType,
      title: { ru: blockDef.name, en: blockDef.name },
      config: {},
      is_visible: true,
    }

    setDraftBlocks([...draftBlocks, newBlock])
  }

  // Remove block from draft
  function removeBlockFromDraft(blockId: string) {
    setDraftBlocks(draftBlocks.filter(b => b.id !== blockId))
  }

  // Drag handlers
  function handleDragStart(event: DragStartEvent) {
    const data = event.active.data.current as { source: string; blockType?: BlockType; blockDef?: BlockDefinition; block?: DraftBlock }
    setActiveData(data)
  }

  function handleDragOver(event: DragOverEvent) {
    setIsOverPhone(event.over?.id === 'phone-drop-zone')
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveData(null)
    setIsOverPhone(false)

    if (!over) return

    const activeSource = active.data.current?.source
    const overId = over.id

    // Drag from library to phone
    if (activeSource === 'library' && (overId === 'phone-drop-zone' || draftBlocks.some(b => b.id === overId))) {
      const blockType = active.data.current?.blockType as BlockType
      addBlockToDraft(blockType)
      return
    }

    // Reorder within phone
    if (activeSource === 'phone') {
      const oldIndex = draftBlocks.findIndex(b => b.id === active.id)
      const newIndex = draftBlocks.findIndex(b => b.id === overId)

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        setDraftBlocks(arrayMove(draftBlocks, oldIndex, newIndex))
      }
    }
  }

  // Discard changes
  function handleDiscard() {
    setDraftBlocks(savedBlocks)
    setDraftNavigation(savedNavigation)
    setDiscardDialogOpen(false)
    toast.info('Changes discarded')
  }

  // Save draft to localStorage
  function handleSaveDraft() {
    localStorage.setItem(`builder-draft-${selectedTenantId}`, JSON.stringify({
      blocks: draftBlocks,
      navigation: draftNavigation,
    }))
    toast.success('Draft saved locally')
  }

  // Publish to database
  async function handlePublish() {
    if (!selectedTenantId) return

    setPublishing(true)

    // Save blocks
    const success = await saveAllBlocks(selectedTenantId, draftBlocks.map(b => ({
      block_type: b.block_type,
      title: b.title,
      config: b.config,
      is_visible: b.is_visible,
    })))

    // TODO: Save navigation to tenant_navigation table
    // For now, navigation is saved in localStorage only

    setPublishing(false)

    if (success) {
      // Reload from DB to get real IDs
      const data = await getTenantBlocks(selectedTenantId)
      const blocks: DraftBlock[] = data.map(b => ({
        id: b.id,
        block_type: b.block_type as BlockType,
        title: b.title || {},
        config: b.config || {},
        is_visible: b.is_visible,
      }))
      setSavedBlocks(blocks)
      setDraftBlocks(blocks)
      setSavedNavigation(draftNavigation) // Update saved navigation state
      localStorage.removeItem(`builder-draft-${selectedTenantId}`)

      // Refresh live preview to show changes
      setPreviewRefreshKey(k => k + 1)

      toast.success('Published successfully!')
    } else {
      toast.error('Failed to publish')
    }
  }

  // Which block types are already in phone
  const usedBlockTypes = new Set(draftBlocks.map(b => b.block_type))

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Block Builder</h1>
          <p className="text-sm text-muted-foreground">
            Drag blocks to build your app layout
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Tenant Selector */}
          <Select value={selectedTenantId} onValueChange={setSelectedTenantId}>
            <SelectTrigger className="w-[180px]">
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

          {/* Draft indicator */}
          {isDirty && (
            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
              Unsaved changes
            </Badge>
          )}

          {/* Actions */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => isDirty ? setDiscardDialogOpen(true) : null}
            disabled={!isDirty}
          >
            <Undo2 className="h-4 w-4 mr-2" />
            Discard
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveDraft}
            disabled={!isDirty}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button
            size="sm"
            onClick={handlePublish}
            disabled={!isDirty || publishing}
          >
            {publishing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            Publish
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-2 h-full">
            {/* Left: Tabbed Panel (Blocks / Navigation) */}
            <div className="border-r overflow-y-auto p-6">
              {/* Tab buttons */}
              <div className="flex gap-2 mb-4">
                <Button
                  variant={builderTab === 'blocks' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setBuilderTab('blocks')}
                  className="flex-1"
                >
                  <Blocks className="h-4 w-4 mr-2" />
                  Blocks
                </Button>
                <Button
                  variant={builderTab === 'navigation' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setBuilderTab('navigation')}
                  className="flex-1"
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Navigation
                </Button>
              </div>

              {/* Tab content */}
              {builderTab === 'blocks' ? (
                <>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Blocks className="h-5 w-5" />
                        Block Library
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {loading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                      ) : (
                        AVAILABLE_BLOCKS.map((block) => (
                          <DraggableLibraryBlock
                            key={block.type}
                            block={block}
                            isInPhone={usedBlockTypes.has(block.type)}
                          />
                        ))
                      )}
                    </CardContent>
                  </Card>

                  <p className="text-xs text-muted-foreground text-center mt-4">
                    Drag blocks to the phone preview →
                  </p>
                </>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <NavigationEditor
                      tabs={draftNavigation}
                      onChange={setDraftNavigation}
                    />
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right: Phone Preview */}
            <div className="bg-muted/30 overflow-y-auto flex flex-col">
              {/* Preview mode toggle */}
              <div className="flex justify-center gap-2 pt-4 pb-2">
                <Button
                  variant={previewMode === 'edit' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPreviewMode('edit')}
                >
                  <Blocks className="h-4 w-4 mr-2" />
                  Edit Blocks
                </Button>
                <Button
                  variant={previewMode === 'live' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPreviewMode('live')}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Live Preview
                </Button>
              </div>

              {/* Preview content */}
              <div className="flex-1">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : previewMode === 'edit' ? (
                  <PhoneMockup
                    blocks={draftBlocks}
                    navigationTabs={draftNavigation}
                    onRemove={removeBlockFromDraft}
                    isOver={isOverPhone}
                  />
                ) : selectedTenantId ? (
                  <PhonePreviewIframe
                    tenantId={selectedTenantId}
                    activeScreen={activeScreen}
                    onScreenChange={setActiveScreen}
                    navigationTabs={draftNavigation}
                    refreshKey={previewRefreshKey}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Select a tenant to preview
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Drag Overlay */}
          <DragOverlay>
            {activeData && <DragOverlayContent activeData={activeData} />}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Discard Confirmation Dialog */}
      <AlertDialog open={discardDialogOpen} onOpenChange={setDiscardDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to discard them?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDiscard}>Discard</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
