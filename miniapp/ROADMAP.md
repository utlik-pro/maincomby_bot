# ROADMAP: MAIN Community Mini App - Improvement Plan

**Last Updated:** 2026-01-03
**Total Tasks:** 45
**Estimated Effort:** ~100 hours
**Source:** Comprehensive Application Audit (2026-01-02)

---

## 📊 Overview

| Priority | Tasks | Hours | Timeline |
|----------|-------|-------|----------|
| **P0** (Critical) | 5 | 12h | Immediate (1-2 days) |
| **P1** (High) | 16 | 40h | Sprint 1 (1 week) |
| **P2** (Medium) | 16 | 32h | Sprint 2-3 (2-4 weeks) |
| **P3** (Low) | 8 | 16h | Backlog |

---

## 🔥 P0 - CRITICAL TASKS (Immediate)

### ✅ IMP-001: Add React Error Boundary
- **Priority:** P0 - CRITICAL
- **Effort:** 2-3 hours
- **Files:** `src/App.tsx`, create `src/components/ErrorBoundary.tsx`
- **Status:** ⬜ Not Started

**Problem:**
Any uncaught JavaScript error crashes the entire app with white screen. No recovery option for users.

**Solution:**
1. Create ErrorBoundary component with fallback UI
2. Add error logging for monitoring (Sentry/LogRocket)
3. Wrap App content with ErrorBoundary
4. Add retry button in fallback UI

**Acceptance Criteria:**
- [ ] ErrorBoundary catches all render errors
- [ ] Fallback UI shows with retry option
- [ ] Errors logged to console/monitoring
- [ ] App recoverable without page refresh

**Related Issues:** BUG-001, CQ-022

---

### 🔒 IMP-002: Validate Telegram initData on Server
- **Priority:** P0 - CRITICAL SECURITY
- **Effort:** 4-6 hours
- **Files:** `src/lib/supabase.ts`, Backend API/Edge Function
- **Status:** ⬜ Not Started
- **Dependencies:** Backend/Edge Function setup

**Problem:**
App uses `initDataUnsafe.user` without validation. Attackers can spoof any Telegram user identity and corrupt database.

**Solution:**
1. Send `initData` string to server on auth
2. Validate HMAC-SHA256 hash using bot token
3. Reject invalid signatures
4. Only trust server-validated user data

**Implementation:**
```typescript
// Server-side validation needed
const validateTelegramInitData = (initData: string, botToken: string) => {
  // Parse initData and validate hash
  // See: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
}
```

**Acceptance Criteria:**
- [ ] initData validated before any user operations
- [ ] Invalid signatures rejected with error
- [ ] Validation errors handled gracefully
- [ ] Dev mode fallback works

**Related Issues:** BUG-002

---

### 🔒 IMP-003: Remove Hardcoded Supabase URL
- **Priority:** P0 - SECURITY
- **Effort:** 30 minutes
- **Files:** `src/lib/supabase.ts`, `.env.example`
- **Status:** ⬜ Not Started

**Problem:**
Production Supabase URL hardcoded in source: `'https://ndpkxustvcijykzxqxrn.supabase.co'`

**Solution:**
```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
if (!supabaseUrl) {
  throw new Error('VITE_SUPABASE_URL environment variable is required')
}
```

**Acceptance Criteria:**
- [ ] App fails fast with clear error if env vars missing
- [ ] No production URLs in source code
- [ ] .env.example updated with instructions

**Related Issues:** BUG-003, CQ-034

---

### 🛠️ IMP-004: Create ESLint Configuration
- **Priority:** P0 - INFRASTRUCTURE
- **Effort:** 1-2 hours
- **Files:** Create `eslint.config.js`, update `package.json`
- **Status:** ⬜ Not Started

**Problem:**
ESLint 9.9.1 installed but no config exists. Lint script uses deprecated flags.

**Solution:**
```javascript
// eslint.config.js
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import react from 'eslint-plugin-react'

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': 'warn',
    }
  }
]
```

**Acceptance Criteria:**
- [ ] `npm run lint` executes without errors
- [ ] TypeScript files properly linted
- [ ] React rules applied
- [ ] CI/CD integration ready

**Related Issues:** BUG-051, CQ-033

---

### 🏷️ IMP-005: Fix Rank Name Translation Inconsistency
- **Priority:** P0 - DATA INTEGRITY
- **Effort:** 2-3 hours
- **Files:** Create `src/lib/ranks.ts`, update `src/lib/store.ts`, `src/lib/supabase.ts`, `src/types/index.ts`
- **Status:** ⬜ Not Started

**Problem:**
Rank names duplicated in 2 files with different Russian translations. Users see different rank names in UI vs notifications.

**Solution:**
Create single source of truth:
```typescript
// src/lib/ranks.ts
export const RANK_CONFIG = {
  private: { threshold: 0, label: 'Рядовой' },
  corporal: { threshold: 100, label: 'Ефрейтор' },
  sergeant: { threshold: 250, label: 'Сержант' },
  lieutenant: { threshold: 500, label: 'Лейтенант' },
  captain: { threshold: 1000, label: 'Капитан' },
  major: { threshold: 2000, label: 'Майор' },
  colonel: { threshold: 5000, label: 'Полковник' },
  general: { threshold: 10000, label: 'Генерал' }
}

export const calculateRank = (points: number): UserRank => {
  // Single implementation
}

export const getRankLabel = (rank: UserRank): string => {
  return RANK_CONFIG[rank].label
}
```

**Acceptance Criteria:**
- [ ] Single rank definition file
- [ ] All rank names consistent everywhere
- [ ] Notifications use same names as UI
- [ ] Remove duplicates from store.ts, supabase.ts, types/index.ts

**Related Issues:** BUG-005, CQ-007, UIUX-025

---

## ⚡ P1 - HIGH PRIORITY (Sprint 1)

### 🎯 IMP-006: Implement Achievement Auto-Unlock
- **Priority:** P1
- **Effort:** 4-6 hours
- **Files:** `src/lib/supabase.ts`, create `src/lib/achievements.ts`
- **Status:** ⬜ Not Started

**Problem:**
`unlockAchievement()` function exists but never called. Achievements never unlock automatically.

**Solution:**
```typescript
// src/lib/achievements.ts
export const checkAchievements = async (userId: number, eventType: string) => {
  // Check conditions for each achievement
  // Call unlockAchievement() when met
}

// Call after relevant events:
// - Event check-in → "Первое мероприятие"
// - Match creation → "Networking"
// - etc.
```

**Acceptance Criteria:**
- [ ] All 8 achievements have working unlock conditions
- [ ] Achievements unlock automatically when conditions met
- [ ] Notifications created for unlocks
- [ ] Achievement count updates in user stats

**Related Issues:** BUG-004

---

### 📊 IMP-007: Fix User Stats Display (Hardcoded to Zero)
- **Priority:** P1
- **Effort:** 2-3 hours
- **Files:** `src/screens/HomeScreen.tsx`, `src/screens/ProfileScreen.tsx`
- **Status:** ⬜ Not Started

**Problem:**
Stats cards show "0" for everything instead of real data.

**Solution:**
```typescript
// Fetch real data
const { data: matches } = useQuery(['matches', userId], () => getUserMatches(userId))
const { data: achievements } = useQuery(['achievements', userId], () => getUserAchievements(userId))
const { data: events } = useQuery(['events', userId], () => getUserEventRegistrations(userId))

// Display actual values
<StatCard value={matches?.length || 0} label="Matches" />
<StatCard value={achievements?.length || 0} label="Achievements" />
<StatCard value={events?.length || 0} label="Events" />
```

**Acceptance Criteria:**
- [ ] Stats show real user data
- [ ] Loading states while fetching
- [ ] Error handling for failed fetches
- [ ] Data updates when user performs actions

**Related Issues:** BUG-006, UIUX-031

---

### 🔔 IMP-008: Add Bell Notification Button Handler
- **Priority:** P1
- **Effort:** 30 minutes
- **Files:** `src/screens/HomeScreen.tsx`
- **Status:** ⬜ Not Started

**Problem:**
Bell icon in header has no onClick handler. NotificationsScreen exists but unreachable.

**Solution:**
```typescript
const [showNotifications, setShowNotifications] = useState(false)

<button onClick={() => setShowNotifications(true)}>
  <Bell />
</button>

{showNotifications && (
  <NotificationsScreen onClose={() => setShowNotifications(false)} />
)}
```

**Acceptance Criteria:**
- [ ] Bell button opens notifications modal
- [ ] Notifications display correctly
- [ ] Close button returns to HomeScreen
- [ ] Unread badge shows count

**Related Issues:** BUG-007, UIUX-021

---

### 🎮 IMP-009: Fix XP State Drift
- **Priority:** P1
- **Effort:** 3-4 hours
- **Files:** `src/lib/store.ts`, `src/lib/easterEggs.ts`, `src/screens/EventsScreen.tsx`
- **Status:** ⬜ Not Started

**Problem:**
Local XP can drift from server when `addXP()` fails but `addPoints()` still executes.

**Solution:**
```typescript
// Only update local state after server confirms
const addXP = async (userId: number, amount: number) => {
  const result = await supabase.rpc('add_xp', { user_id: userId, amount })
  if (result.error) {
    console.error('Failed to add XP:', result.error)
    return false
  }
  // Only NOW update local state
  store.addPoints(amount)
  return true
}
```

**Acceptance Criteria:**
- [ ] Local XP always matches server
- [ ] Failed XP operations don't update local state
- [ ] Shake easter egg properly updates XP
- [ ] Optimistic updates with rollback on error

**Related Issues:** BUG-008, BUG-020, CQ-045

---

### 💫 IMP-010: Fix daily_swipes_used State Drift
- **Priority:** P1
- **Effort:** 1-2 hours
- **Files:** `src/screens/NetworkScreen.tsx`, `src/lib/store.ts`
- **Status:** ⬜ Not Started

**Problem:**
After swiping, `daily_swipes_used` never updates locally. Swipe counter shows wrong value.

**Solution:**
```typescript
// Add to store
incrementSwipeCount: () => set((state) => ({
  user: state.user ? {
    ...state.user,
    daily_swipes_used: (state.user.daily_swipes_used || 0) + 1
  } : null
}))

// Call after successful swipe
createSwipe.mutate(swipeData, {
  onSuccess: () => {
    incrementSwipeCount()
    // ...
  }
})
```

**Acceptance Criteria:**
- [ ] Swipe counter increments after each swipe
- [ ] Remaining swipes calculation correct
- [ ] Swipe limit enforced properly
- [ ] Resets at midnight (if applicable)

**Related Issues:** BUG-009, CQ-046

---

### ⭐ IMP-011: Implement Superlike Button
- **Priority:** P1
- **Effort:** 2-3 hours
- **Files:** `src/screens/NetworkScreen.tsx`
- **Status:** ⬜ Not Started

**Problem:**
Premium "Superlike" feature defined in SUBSCRIPTION_LIMITS but no UI button exists.

**Solution:**
```typescript
const limits = getDailySwipesRemaining(user)

<div className="flex gap-4">
  <button onClick={handleSkip}>❌</button>
  {limits.canSuperlike && (
    <button onClick={handleSuperlike}>⭐ Superlike</button>
  )}
  <button onClick={handleLike}>❤️</button>
</div>
```

**Acceptance Criteria:**
- [ ] Superlike button visible for premium users
- [ ] Free users see disabled/hidden button
- [ ] Daily superlike limit enforced
- [ ] Creates swipe with `action: 'superlike'`
- [ ] Star icon from Lucide

**Related Issues:** BUG-010, BUG-011

---

### 🗺️ IMP-012: Fix Non-Functional Map Links
- **Priority:** P1
- **Effort:** 30 minutes
- **Files:** `src/screens/EventsScreen.tsx`
- **Status:** ⬜ Not Started

**Problem:**
"Открыть на карте" text styled as link but not clickable.

**Solution:**
```typescript
const openMap = (event: Event) => {
  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`
  window.Telegram?.WebApp?.openLink(url) || window.open(url, '_blank')
}

<button onClick={() => openMap(event)}>
  📍 Открыть на карте
</button>
```

**Acceptance Criteria:**
- [ ] Map link opens Google Maps
- [ ] Works in Telegram WebApp
- [ ] Location properly URL-encoded
- [ ] Fallback to window.open if Telegram API unavailable

**Related Issues:** BUG-012, UIUX-035

---

### 📱 IMP-013: Fix Phone Sharing Race Condition
- **Priority:** P1
- **Effort:** 2-3 hours
- **Files:** `src/screens/EventsScreen.tsx`
- **Status:** ⬜ Not Started

**Problem:**
Hardcoded 2-second timeout waiting for bot to save phone. Race condition causes failures.

**Solution:**
```typescript
// Replace timeout with polling
const waitForPhoneNumber = async (userId: number, maxAttempts = 3) => {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, 1000))
    const { data } = await supabase
      .from('users')
      .select('phone_number')
      .eq('id', userId)
      .single()

    if (data?.phone_number) return data.phone_number
  }
  return null
}
```

**Acceptance Criteria:**
- [ ] More reliable phone detection (polling vs fixed timeout)
- [ ] Loading indicator during wait
- [ ] Fallback to manual entry on failure
- [ ] Cleanup polling on component unmount

**Related Issues:** BUG-013

---

### 💬 IMP-014: Fix Message Button in Matches
- **Priority:** P1
- **Effort:** 30 minutes
- **Files:** `src/screens/NetworkScreen.tsx`
- **Status:** ⬜ Not Started

**Problem:**
MessageCircle button in matches list has no onClick handler.

**Solution:**
```typescript
<button onClick={() => {
  const username = match.matched_user?.username
  if (username) {
    window.Telegram?.WebApp?.openTelegramLink(`https://t.me/${username}`)
  } else {
    showToast('User has no Telegram username', 'error')
  }
}}>
  <MessageCircle />
</button>
```

**Acceptance Criteria:**
- [ ] Button opens Telegram chat with match
- [ ] Handles users without username gracefully
- [ ] Shows error message if username missing
- [ ] Works in Telegram WebApp environment

**Related Issues:** BUG-014, UIUX-034

---

### 🏆 IMP-015: Replace Fake Leaderboard with Real Data
- **Priority:** P1
- **Effort:** 3-4 hours
- **Files:** `src/lib/supabase.ts`, `src/screens/AchievementsScreen.tsx`
- **Status:** ⬜ Not Started

**Problem:**
Leaderboard shows hardcoded fake users instead of real top users.

**Solution:**
```typescript
// src/lib/supabase.ts
export const getTopUsers = async (limit = 10) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, first_name, last_name, points, rank, avatar_url')
    .order('points', { ascending: false })
    .limit(limit)

  return data || []
}

// src/screens/AchievementsScreen.tsx
const { data: topUsers } = useQuery(['leaderboard'], () => getTopUsers(10))
```

**Acceptance Criteria:**
- [ ] Leaderboard shows real top 10 users
- [ ] Full leaderboard modal with all users
- [ ] User's own rank highlighted
- [ ] "Показать весь рейтинг" button works
- [ ] Real-time updates when points change

**Related Issues:** BUG-015, BUG-016, UIUX-032

---

### ⚙️ IMP-016: Fix Non-Functional ProfileScreen Buttons
- **Priority:** P1
- **Effort:** 2-3 hours
- **Files:** `src/screens/ProfileScreen.tsx`
- **Status:** ⬜ Not Started
- **Dependencies:** Payment integration TBD

**Problem:**
Settings, upgrade subscription, and invite share buttons don't work.

**Solution:**
```typescript
// Settings
<button onClick={() => setShowSettings(true)}>⚙️ Настройки</button>

// Subscription upgrade
<button onClick={() => {
  // TODO: Navigate to payment flow
  showToast('Coming soon', 'info')
}}>Upgrade to Pro</button>

// Invite share
<button onClick={async () => {
  const link = `https://t.me/your_bot?start=${user.id}`
  await navigator.clipboard.writeText(link)
  showToast('Ссылка скопирована!', 'success')
}}>Поделиться</button>
```

**Acceptance Criteria:**
- [ ] Settings button opens settings modal
- [ ] Upgrade shows payment or "Coming soon"
- [ ] Invite copies link to clipboard
- [ ] Toast confirms copy success

**Related Issues:** BUG-017, BUG-018, BUG-019

---

### 🔔 IMP-017: Implement Notification Click Navigation
- **Priority:** P1
- **Effort:** 1-2 hours
- **Files:** `src/screens/NotificationsScreen.tsx`
- **Status:** ⬜ Not Started

**Problem:**
Clicking notifications does nothing (TODO comment in code).

**Solution:**
```typescript
const handleNotificationClick = (notification: Notification) => {
  markAsRead.mutate(notification.id)

  switch (notification.type) {
    case 'rank_up':
    case 'achievement':
      setActiveTab('achievements')
      break
    case 'match':
      setActiveTab('network')
      break
    case 'event_reminder':
      setActiveTab('events')
      break
  }

  onClose()
}
```

**Acceptance Criteria:**
- [ ] Each notification type navigates to correct screen
- [ ] Notification marked as read
- [ ] Modal closes after navigation
- [ ] Smooth tab transition

**Related Issues:** BUG-021

---

### ♿ IMP-018: Add Critical ARIA Attributes
- **Priority:** P1 - ACCESSIBILITY
- **Effort:** 3-4 hours
- **Files:** Multiple components
- **Status:** ⬜ Not Started

**Problem:**
App inaccessible to screen reader users. No ARIA attributes on interactive elements.

**Solution:**
```typescript
// Navigation
<nav role="tablist" aria-label="Main navigation">
  <button role="tab" aria-selected={active} aria-label="Home">...</button>
</nav>

// Dialogs
<div role="dialog" aria-modal="true" aria-labelledby="dialog-title">
  <h2 id="dialog-title">Title</h2>
</div>

// Toast
<div role="status" aria-live="polite">Toast message</div>

// Icon buttons
<button aria-label="Close">❌</button>
```

**Acceptance Criteria:**
- [ ] Navigation has tablist/tab roles
- [ ] Dialogs have dialog role and aria-modal
- [ ] Toasts have status role and aria-live
- [ ] All icon-only buttons have aria-label
- [ ] Pass basic WCAG 2.1 Level A compliance

**Related Issues:** UIUX-001, UIUX-002, BUG-028, BUG-031, BUG-036, BUG-037

---

### ⌨️ IMP-019: Add Focus Trap and ESC Key to Dialogs
- **Priority:** P1 - ACCESSIBILITY
- **Effort:** 2-3 hours
- **Files:** `src/components/ConfirmDialog.tsx`, `src/components/PhoneDialog.tsx`
- **Status:** ⬜ Not Started

**Problem:**
Tab navigation escapes dialogs. ESC key doesn't close them.

**Solution:**
```typescript
// Option 1: Use focus-trap-react library
import FocusTrap from 'focus-trap-react'

<FocusTrap>
  <div className="dialog" onKeyDown={(e) => {
    if (e.key === 'Escape') onClose()
  }}>
    {/* dialog content */}
  </div>
</FocusTrap>

// Option 2: Custom implementation
useEffect(() => {
  const handleEsc = (e) => e.key === 'Escape' && onClose()
  document.addEventListener('keydown', handleEsc)
  return () => document.removeEventListener('keydown', handleEsc)
}, [onClose])
```

**Acceptance Criteria:**
- [ ] Tab key stays within dialog
- [ ] ESC key closes dialog
- [ ] Focus returns to trigger element on close
- [ ] Works for both ConfirmDialog and PhoneDialog

**Related Issues:** UIUX-003, UIUX-004, BUG-029

---

### 🔷 IMP-020: Replace `any` Types with Proper Interfaces
- **Priority:** P1 - TYPE SAFETY
- **Effort:** 2-3 hours
- **Files:** `src/screens/EventsScreen.tsx`, `src/screens/NetworkScreen.tsx`, `src/screens/AchievementsScreen.tsx`, `src/screens/ProfileScreen.tsx`
- **Status:** ⬜ Not Started

**Problem:**
10 explicit `any` usages break TypeScript type safety and IDE autocomplete.

**Solution:**
```typescript
// Before
const handleSubmit = (e: any) => { ... }

// After
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => { ... }

// Define proper interfaces
interface EventFormData {
  title: string
  date: Date
  location: string
  // ...
}
```

**Acceptance Criteria:**
- [ ] Zero `any` type usages in screens
- [ ] All data properly typed
- [ ] IDE autocomplete works throughout
- [ ] No TypeScript errors

**Related Issues:** BUG-022, CQ-001

---

### 🗄️ IMP-021: Generate Supabase Types
- **Priority:** P1 - TYPE SAFETY
- **Effort:** 1-2 hours
- **Files:** Create `src/types/supabase.ts`, update `src/lib/supabase.ts`
- **Status:** ⬜ Not Started
- **Dependencies:** Supabase CLI access

**Problem:**
Supabase client untyped. All API responses implicitly `any`.

**Solution:**
```bash
# Generate types from Supabase schema
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/supabase.ts
```

```typescript
// src/lib/supabase.ts
import { Database } from '@/types/supabase'

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Now all queries are type-safe!
const { data } = await supabase.from('users').select('*') // data is typed!
```

**Acceptance Criteria:**
- [ ] Generated types in src/types/supabase.ts
- [ ] Supabase client typed with Database type
- [ ] All queries type-safe
- [ ] Regeneration script in package.json

**Related Issues:** CQ-002

---

## 📦 P2 - MEDIUM PRIORITY (Sprint 2-3)

### 🔄 IMP-022: Extract BaseDialog Component
- **Effort:** 2-3 hours
- **Dependencies:** IMP-019

### 🔘 IMP-023: Create IconButton Component
- **Effort:** 3-4 hours

### 🧭 IMP-024: Fix Hidden Network Tab Navigation
- **Effort:** 1 hour
- **Dependencies:** Product decision

### 📄 IMP-025: Add Pagination to getApprovedProfiles
- **Effort:** 2-3 hours

### 🎨 IMP-026: Centralize Color Definitions
- **Effort:** 2-3 hours

### ⏱️ IMP-027: Add Request Timeout to Supabase Client
- **Effort:** 30 minutes

### 🔒 IMP-028: Add Security Headers
- **Effort:** 30 minutes

### 🗑️ IMP-029: Clear React Query Cache on Logout
- **Effort:** 30 minutes

### 🐛 IMP-030: Remove Console Statements
- **Effort:** 1-2 hours
- **Dependencies:** IMP-004

### 🔧 IMP-031: Enable Stricter TypeScript Options
- **Effort:** 2-3 hours

### 🔔 IMP-032: Create Missing Notification Types
- **Effort:** 2-3 hours
- **Dependencies:** IMP-006

### 📱 IMP-033: Fix PhoneDialog State Reset
- **Effort:** 30 minutes

### 📡 IMP-034: Add Offline Detection
- **Effort:** 2-3 hours

### 🔑 IMP-035: Remove Hardcoded Dev User ID
- **Effort:** 30 minutes

### 🔁 IMP-036: Fix ConfirmDialog Duplicate Rendering
- **Effort:** 30 minutes

### ⚠️ IMP-037: Add Global Query Error Handler
- **Effort:** 1 hour

---

## 🧹 P3 - LOW PRIORITY (Backlog)

### 🗑️ IMP-038: Delete Dead Icons.tsx File
- **Effort:** 5 minutes

### ⌨️ IMP-039: Add Keyboard Navigation to Components
- **Effort:** 2-3 hours

### 📦 IMP-040: Configure Build Chunk Splitting
- **Effort:** 1 hour

### 📂 IMP-041: Split ProfileScreen into Components
- **Effort:** 3-4 hours

### 🗑️ IMP-042: Remove Unused Dependencies
- **Effort:** 10 minutes

### 👆 IMP-043: Add Swipe Gestures to Onboarding
- **Effort:** 2-3 hours

### 🎨 IMP-044: Use Lucide Icons in Toast
- **Effort:** 30 minutes

### ⏳ IMP-045: Add Loading Indicators for Mutations
- **Effort:** 2-3 hours

---

## 📅 4-Week Implementation Roadmap

### Week 1: Critical Fixes (P0) - 14 hours
**Days 1-2:** Security & Infrastructure
- [ ] IMP-001: Error Boundary (3h)
- [ ] IMP-003: Remove hardcoded URL (0.5h)
- [ ] IMP-004: ESLint config (2h)
- [ ] IMP-005: Rank consolidation (3h)

**Days 3-4:** Authentication Security
- [ ] IMP-002: Validate initData (6h)

### Week 2: High Priority Part 1 (P1) - 19 hours
**Day 1:**
- [ ] IMP-006: Achievement auto-unlock (5h)

**Day 2:**
- [ ] IMP-007: Fix stats (2h)
- [ ] IMP-008: Bell button (0.5h)
- [ ] IMP-009: XP state (3h)

**Day 3:**
- [ ] IMP-010: Swipes state (1.5h)
- [ ] IMP-011: Superlike (2.5h)
- [ ] IMP-012: Map links (0.5h)

**Day 4:**
- [ ] IMP-013: Phone race condition (3h)
- [ ] IMP-014: Message button (0.5h)

### Week 3: High Priority Part 2 (P1) - 18 hours
**Day 1:**
- [ ] IMP-015: Leaderboard (4h)

**Day 2:**
- [ ] IMP-016: ProfileScreen buttons (3h)

**Day 3:**
- [ ] IMP-017: Notification navigation (2h)

**Day 4:**
- [ ] IMP-018: ARIA attributes (4h)

**Day 5:**
- [ ] IMP-019: Focus trap (2.5h)
- [ ] IMP-020: Any types (2.5h)

### Week 4: Type Safety & Components (P1+P2) - 20 hours
**Day 1:**
- [ ] IMP-021: Supabase types (1.5h)
- [ ] IMP-022: BaseDialog (2.5h)

**Day 2:**
- [ ] IMP-023: IconButton component (4h)

**Day 3:**
- [ ] IMP-024: Network nav (1h)
- [ ] IMP-025: Pagination (3h)

**Day 4:**
- [ ] IMP-026: Centralize colors (2.5h)
- [ ] IMP-027: Request timeout (0.5h)
- [ ] IMP-028: Security headers (0.5h)
- [ ] IMP-029: Clear cache (0.5h)

**Day 5:**
- [ ] IMP-030: Remove console (1.5h)
- [ ] IMP-031: TypeScript strict (2.5h)

---

## 🎯 Success Metrics

After P0 + P1 completion:

| Metric | Before | After |
|--------|--------|-------|
| App crashes | 100% on error | 0% |
| Critical security issues | 2 | 0 |
| Working buttons | ~70% | 100% |
| Type coverage | ~60% | 95% |
| WCAG Level A | Partial | Full |
| Critical/High bugs | 21 | 0 |

---

## ⚠️ Dependencies Graph

```
P0 Tasks (Can run in parallel):
├─ IMP-001 (Error Boundary) → Independent
├─ IMP-002 (Validate initData) → Needs backend
├─ IMP-003 (Remove hardcoded URL) → Independent
├─ IMP-004 (ESLint config) → Independent
└─ IMP-005 (Rank consolidation) → Independent

P1 Dependencies:
├─ IMP-006 (Achievements) → Enables IMP-032
├─ IMP-019 (Focus trap) → Enables IMP-022
└─ IMP-020 (Any types) → Benefits from IMP-021

P2 Dependencies:
├─ IMP-022 (BaseDialog) → Needs IMP-019
├─ IMP-030 (Console) → Needs IMP-004
└─ IMP-032 (Notifications) → Needs IMP-006
```

---

## 📝 Task Status Legend

- ⬜ Not Started
- 🔄 In Progress
- ✅ Completed
- ⏸️ Blocked
- ❌ Cancelled

---

**Generated from:** Comprehensive Application Audit (Jan 2, 2026)
**Related Files:**
- Bug Report: 51 bugs documented
- Design Audit: 47 UI/UX issues
- Code Quality Report: 64 issues
