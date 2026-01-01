// Centralized icons export from Lucide
// This makes it easy to swap icon library later if needed

export {
  // Navigation
  Home,
  Calendar,
  Flame,
  Trophy,
  User,

  // Actions
  Heart,
  X,
  Check,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  ArrowRight,

  // Common
  Bell,
  Settings,
  Search,
  Filter,
  Share2 as Share,
  ExternalLink,
  Copy,

  // Profile & Social
  UserCircle,
  Users,
  MessageCircle,
  Send,
  Star,
  Award,
  Medal,
  Crown,
  Shield,
  Zap,

  // Events
  CalendarDays,
  Clock,
  MapPin,
  Ticket,
  QrCode,
  ScanLine,
  Camera,

  // Content
  FileText,
  Image,
  Play,
  Bookmark,

  // Status
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Loader2,

  // Misc
  Gift,
  Sparkles,
  Target,
  TrendingUp,
  BarChart3,
  Wallet,
  CreditCard,
  LogOut,
  HelpCircle,
  MoreHorizontal,
  MoreVertical,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Link,
  Globe,
  Building2,
  Briefcase,
  GraduationCap,
  Coffee,
  HandshakeIcon as Handshake,
  Rocket,
  PartyPopper,
  Megaphone,
  Lightbulb,
  Code,
  Wrench,
  Palette,
} from 'lucide-react'

// Icon size presets
export const iconSizes = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 48,
}

// Common icon wrapper with consistent sizing
import { LucideIcon } from 'lucide-react'

interface IconProps {
  icon: LucideIcon
  size?: keyof typeof iconSizes | number
  className?: string
}

export const Icon: React.FC<IconProps> = ({ icon: IconComponent, size = 'md', className = '' }) => {
  const sizeValue = typeof size === 'number' ? size : iconSizes[size]
  return <IconComponent size={sizeValue} className={className} />
}
