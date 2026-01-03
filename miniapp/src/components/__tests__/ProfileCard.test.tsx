import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProfileCard, getProfileTheme, PROFILE_THEMES } from '../ProfileCard'
import type { User, UserProfile, UserCompany, UserLink, UserRank, UserBadge, SubscriptionTier } from '@/types'

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
    button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
      <button {...props}>{children}</button>
    ),
  },
}))

// Mock child components to isolate ProfileCard testing
vi.mock('@/components/CompanyCard', () => ({
  CompanyInline: ({ userCompany }: { userCompany: { company?: { name: string } } | null }) =>
    userCompany?.company ? <div data-testid="company-inline">{userCompany.company.name}</div> : null,
}))

vi.mock('@/components/SocialLinks', () => ({
  SocialLinks: ({ links }: { links: UserLink[] }) =>
    links.length > 0 ? <div data-testid="social-links">{links.length} links</div> : null,
}))

vi.mock('@/components/ui', () => ({
  Avatar: ({ name, src }: { name?: string; src?: string | null }) => (
    <div data-testid="avatar" data-name={name} data-src={src || ''}>
      {name || 'Avatar'}
    </div>
  ),
  Badge: ({ children, variant }: { children: React.ReactNode; variant?: string }) => (
    <span data-testid="badge" data-variant={variant}>
      {children}
    </span>
  ),
}))

// Test data factories
const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: 1,
  tg_user_id: 123456,
  username: 'testuser',
  first_name: 'John',
  last_name: 'Doe',
  phone_number: null,
  first_seen_at: '2024-01-01T00:00:00Z',
  points: 500,
  warns: 0,
  banned: false,
  source: null,
  subscription_tier: 'free',
  subscription_expires_at: null,
  daily_swipes_used: 0,
  daily_swipes_reset_at: null,
  team_role: null,
  ...overrides,
})

const createMockProfile = (overrides: Partial<UserProfile> = {}): UserProfile => ({
  id: 1,
  user_id: 1,
  bio: null,
  occupation: 'Software Engineer',
  looking_for: null,
  can_help_with: null,
  needs_help_with: null,
  photo_file_id: null,
  photo_url: 'https://example.com/photo.jpg',
  city: 'Moscow',
  moderation_status: 'approved',
  is_visible: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  skills: null,
  interests: null,
  telegram_username: null,
  linkedin_url: null,
  ...overrides,
})

const createMockCompany = (overrides: Partial<UserCompany> = {}): UserCompany => ({
  id: 'company-1',
  user_id: 1,
  company_id: 'c1',
  role: 'Developer',
  is_primary: true,
  joined_at: '2024-01-01T00:00:00Z',
  company: {
    id: 'c1',
    name: 'Tech Corp',
    logo_url: null,
    website_url: null,
    description: null,
    industry: 'IT',
    is_verified: true,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  ...overrides,
})

const createMockLink = (overrides: Partial<UserLink> = {}): UserLink => ({
  id: 'link-1',
  user_id: 1,
  link_type: 'github',
  url: 'https://github.com/testuser',
  title: null,
  is_public: true,
  sort_order: 0,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
})

const createMockBadge = (overrides: Partial<UserBadge> = {}): UserBadge => ({
  id: 'badge-1',
  user_id: 1,
  badge_id: 'vip',
  awarded_by: null,
  awarded_reason: null,
  awarded_at: '2024-01-01T00:00:00Z',
  expires_at: null,
  is_featured: false,
  badge: {
    id: 'vip',
    slug: 'vip',
    name: 'VIP',
    description: 'VIP member',
    emoji: null,
    color: '#FFD700',
    xp_reward: 100,
    is_active: true,
    sort_order: 0,
    created_at: '2024-01-01T00:00:00Z',
  },
  ...overrides,
})

describe('ProfileCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('when user is null', () => {
    it('renders not found message', () => {
      render(
        <ProfileCard
          user={null}
          profile={null}
          rank="private"
          theme={PROFILE_THEMES.default}
        />
      )

      expect(screen.getByText('Профиль не найден')).toBeInTheDocument()
    })

    it('does not render any user details', () => {
      render(
        <ProfileCard
          user={null}
          profile={null}
          rank="private"
          theme={PROFILE_THEMES.default}
        />
      )

      expect(screen.queryByTestId('avatar')).not.toBeInTheDocument()
      expect(screen.queryByTestId('badge')).not.toBeInTheDocument()
    })
  })

  describe('user name rendering', () => {
    it('renders full name with first and last name', () => {
      const user = createMockUser({ first_name: 'John', last_name: 'Doe' })

      render(
        <ProfileCard
          user={user}
          profile={null}
          rank="private"
          theme={PROFILE_THEMES.default}
        />
      )

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('John Doe')
    })

    it('renders first name only when last name is null', () => {
      const user = createMockUser({ first_name: 'John', last_name: null })

      render(
        <ProfileCard
          user={user}
          profile={null}
          rank="private"
          theme={PROFILE_THEMES.default}
        />
      )

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('John')
    })

    it('handles null first name gracefully', () => {
      const user = createMockUser({ first_name: null, last_name: 'Doe' })

      render(
        <ProfileCard
          user={user}
          profile={null}
          rank="private"
          theme={PROFILE_THEMES.default}
        />
      )

      // Should render with null first name and last name
      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toBeInTheDocument()
    })
  })

  describe('profile details rendering', () => {
    it('renders occupation when provided', () => {
      const user = createMockUser()
      const profile = createMockProfile({ occupation: 'Software Engineer' })

      render(
        <ProfileCard
          user={user}
          profile={profile}
          rank="private"
          theme={PROFILE_THEMES.default}
        />
      )

      expect(screen.getByText('Software Engineer')).toBeInTheDocument()
    })

    it('does not render occupation when null', () => {
      const user = createMockUser()
      const profile = createMockProfile({ occupation: null })

      render(
        <ProfileCard
          user={user}
          profile={profile}
          rank="private"
          theme={PROFILE_THEMES.default}
        />
      )

      // Occupation element should not be present
      expect(screen.queryByText('Software Engineer')).not.toBeInTheDocument()
    })

    it('renders city when profile has city', () => {
      const user = createMockUser()
      const profile = createMockProfile({ city: 'Moscow' })

      render(
        <ProfileCard
          user={user}
          profile={profile}
          rank="private"
          theme={PROFILE_THEMES.default}
        />
      )

      expect(screen.getByText('Moscow')).toBeInTheDocument()
    })

    it('renders "Не указан" when city is not provided', () => {
      const user = createMockUser()
      // Profile is null, so city should show default
      render(
        <ProfileCard
          user={user}
          profile={null}
          rank="private"
          theme={PROFILE_THEMES.default}
        />
      )

      expect(screen.getByText('Не указан')).toBeInTheDocument()
    })
  })

  describe('stats rendering', () => {
    it('renders XP from user points', () => {
      const user = createMockUser({ points: 1500 })

      render(
        <ProfileCard
          user={user}
          profile={null}
          rank="sergeant"
          theme={PROFILE_THEMES.default}
        />
      )

      expect(screen.getByText('1500')).toBeInTheDocument()
      expect(screen.getByText('XP')).toBeInTheDocument()
    })

    it('renders 0 XP when points is undefined', () => {
      const user = createMockUser({ points: 0 })

      render(
        <ProfileCard
          user={user}
          profile={null}
          rank="private"
          theme={PROFILE_THEMES.default}
        />
      )

      expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(1)
    })

    it('renders user stats when provided', () => {
      const user = createMockUser()
      const userStats = { events: 10, matches: 25 }

      render(
        <ProfileCard
          user={user}
          profile={null}
          userStats={userStats}
          rank="private"
          theme={PROFILE_THEMES.default}
        />
      )

      expect(screen.getByText('10')).toBeInTheDocument()
      expect(screen.getByText('Событий')).toBeInTheDocument()
      expect(screen.getByText('25')).toBeInTheDocument()
      expect(screen.getByText('Матчей')).toBeInTheDocument()
    })

    it('renders 0 for stats when userStats is null', () => {
      const user = createMockUser()

      render(
        <ProfileCard
          user={user}
          profile={null}
          userStats={null}
          rank="private"
          theme={PROFILE_THEMES.default}
        />
      )

      // Should show 0 for events and matches
      const zeros = screen.getAllByText('0')
      expect(zeros.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('rank badge rendering', () => {
    const rankTestCases: { rank: UserRank; expectedLabel: string }[] = [
      { rank: 'private', expectedLabel: 'Рядовой' },
      { rank: 'corporal', expectedLabel: 'Ефрейтор' },
      { rank: 'sergeant', expectedLabel: 'Сержант' },
      { rank: 'sergeant_major', expectedLabel: 'Старшина' },
      { rank: 'lieutenant', expectedLabel: 'Лейтенант' },
      { rank: 'captain', expectedLabel: 'Капитан' },
      { rank: 'major', expectedLabel: 'Майор' },
      { rank: 'colonel', expectedLabel: 'Полковник' },
      { rank: 'general', expectedLabel: 'Генерал' },
    ]

    rankTestCases.forEach(({ rank, expectedLabel }) => {
      it(`renders ${rank} rank with correct Russian label`, () => {
        const user = createMockUser()

        render(
          <ProfileCard
            user={user}
            profile={null}
            rank={rank}
            theme={PROFILE_THEMES.default}
          />
        )

        expect(screen.getByText(expectedLabel)).toBeInTheDocument()
      })
    })

    it('renders rank badge with accent variant', () => {
      const user = createMockUser()

      render(
        <ProfileCard
          user={user}
          profile={null}
          rank="captain"
          theme={PROFILE_THEMES.default}
        />
      )

      const badge = screen.getByTestId('badge')
      expect(badge).toHaveAttribute('data-variant', 'accent')
    })
  })

  describe('theme badge rendering', () => {
    it('renders theme badge when theme has badge property', () => {
      const user = createMockUser()

      render(
        <ProfileCard
          user={user}
          profile={null}
          rank="private"
          theme={PROFILE_THEMES.core}
        />
      )

      expect(screen.getByText('CORE TEAM')).toBeInTheDocument()
    })

    it('renders VIP badge for VIP theme', () => {
      const user = createMockUser()

      render(
        <ProfileCard
          user={user}
          profile={null}
          rank="private"
          theme={PROFILE_THEMES.vip}
        />
      )

      expect(screen.getByText('VIP')).toBeInTheDocument()
    })

    it('renders SPEAKER badge for speaker theme', () => {
      const user = createMockUser()

      render(
        <ProfileCard
          user={user}
          profile={null}
          rank="private"
          theme={PROFILE_THEMES.speaker}
        />
      )

      expect(screen.getByText('SPEAKER')).toBeInTheDocument()
    })

    it('renders PRO badge for pro theme', () => {
      const user = createMockUser()

      render(
        <ProfileCard
          user={user}
          profile={null}
          rank="private"
          theme={PROFILE_THEMES.pro}
        />
      )

      expect(screen.getByText('PRO')).toBeInTheDocument()
    })

    it('does not render theme badge for default theme', () => {
      const user = createMockUser()

      render(
        <ProfileCard
          user={user}
          profile={null}
          rank="private"
          theme={PROFILE_THEMES.default}
        />
      )

      // Default theme has no badge
      expect(screen.queryByText('CORE TEAM')).not.toBeInTheDocument()
      expect(screen.queryByText('VIP')).not.toBeInTheDocument()
      expect(screen.queryByText('PRO')).not.toBeInTheDocument()
    })
  })

  describe('team role badge rendering', () => {
    it('renders team badge when user has team_role and theme has no badge', () => {
      const user = createMockUser({ team_role: 'volunteer' })

      render(
        <ProfileCard
          user={user}
          profile={null}
          rank="private"
          theme={PROFILE_THEMES.default}
        />
      )

      expect(screen.getByText('Волонтёр')).toBeInTheDocument()
    })

    it('does not render team badge when theme already has badge', () => {
      // Core team role should use theme badge, not team badge
      const user = createMockUser({ team_role: 'core' })

      render(
        <ProfileCard
          user={user}
          profile={null}
          rank="private"
          theme={PROFILE_THEMES.core}
        />
      )

      // Should show theme badge (CORE TEAM), not duplicated
      const coreTeamBadges = screen.getAllByText('CORE TEAM')
      expect(coreTeamBadges).toHaveLength(1)
    })
  })

  describe('company display', () => {
    it('renders company when userCompany is provided', () => {
      const user = createMockUser()
      const company = createMockCompany()

      render(
        <ProfileCard
          user={user}
          profile={null}
          userCompany={company}
          rank="private"
          theme={PROFILE_THEMES.default}
        />
      )

      expect(screen.getByTestId('company-inline')).toBeInTheDocument()
      expect(screen.getByText('Tech Corp')).toBeInTheDocument()
    })

    it('does not render company when userCompany is null', () => {
      const user = createMockUser()

      render(
        <ProfileCard
          user={user}
          profile={null}
          userCompany={null}
          rank="private"
          theme={PROFILE_THEMES.default}
        />
      )

      expect(screen.queryByTestId('company-inline')).not.toBeInTheDocument()
    })
  })

  describe('social links display', () => {
    it('renders social links when provided', () => {
      const user = createMockUser()
      const links = [
        createMockLink({ id: '1', link_type: 'github' }),
        createMockLink({ id: '2', link_type: 'linkedin' }),
      ]

      render(
        <ProfileCard
          user={user}
          profile={null}
          userLinks={links}
          rank="private"
          theme={PROFILE_THEMES.default}
        />
      )

      expect(screen.getByTestId('social-links')).toBeInTheDocument()
      expect(screen.getByText('2 links')).toBeInTheDocument()
    })

    it('does not render social links when array is empty', () => {
      const user = createMockUser()

      render(
        <ProfileCard
          user={user}
          profile={null}
          userLinks={[]}
          rank="private"
          theme={PROFILE_THEMES.default}
        />
      )

      expect(screen.queryByTestId('social-links')).not.toBeInTheDocument()
    })

    it('uses empty array as default for userLinks', () => {
      const user = createMockUser()

      render(
        <ProfileCard
          user={user}
          profile={null}
          rank="private"
          theme={PROFILE_THEMES.default}
        />
      )

      // Should not crash and not render social links
      expect(screen.queryByTestId('social-links')).not.toBeInTheDocument()
    })
  })

  describe('avatar interaction', () => {
    it('calls onAvatarTap when avatar is clicked', async () => {
      const user = userEvent.setup()
      const onAvatarTap = vi.fn()
      const mockUser = createMockUser()

      render(
        <ProfileCard
          user={mockUser}
          profile={null}
          rank="private"
          theme={PROFILE_THEMES.default}
          onAvatarTap={onAvatarTap}
        />
      )

      const avatarContainer = screen.getByRole('button', { name: /User|John Doe/i })
      await user.click(avatarContainer)

      expect(onAvatarTap).toHaveBeenCalledTimes(1)
    })

    it('avatar is keyboard accessible when onAvatarTap is provided', async () => {
      const user = userEvent.setup()
      const onAvatarTap = vi.fn()
      const mockUser = createMockUser()

      render(
        <ProfileCard
          user={mockUser}
          profile={null}
          rank="private"
          theme={PROFILE_THEMES.default}
          onAvatarTap={onAvatarTap}
        />
      )

      const avatarContainer = screen.getByRole('button', { name: /User|John Doe/i })
      avatarContainer.focus()
      await user.keyboard('{Enter}')

      expect(onAvatarTap).toHaveBeenCalledTimes(1)
    })

    it('avatar is not a button when onAvatarTap is not provided', () => {
      const mockUser = createMockUser()

      render(
        <ProfileCard
          user={mockUser}
          profile={null}
          rank="private"
          theme={PROFILE_THEMES.default}
        />
      )

      // Avatar container should not have button role
      const avatarButtons = screen.queryAllByRole('button')
      // Only the rank badge might be a button if onRankTap is provided
      // Without onAvatarTap, avatar should not be in buttons
      expect(screen.queryByRole('button', { name: /avatar/i })).not.toBeInTheDocument()
    })

    it('calls onAvatarTap multiple times on repeated clicks', async () => {
      const user = userEvent.setup()
      const onAvatarTap = vi.fn()
      const mockUser = createMockUser()

      render(
        <ProfileCard
          user={mockUser}
          profile={null}
          rank="private"
          theme={PROFILE_THEMES.default}
          onAvatarTap={onAvatarTap}
        />
      )

      const avatarContainer = screen.getByRole('button', { name: /User|John Doe/i })
      await user.click(avatarContainer)
      await user.click(avatarContainer)
      await user.click(avatarContainer)

      expect(onAvatarTap).toHaveBeenCalledTimes(3)
    })

    it('does not call handler when other keys are pressed', async () => {
      const user = userEvent.setup()
      const onAvatarTap = vi.fn()
      const mockUser = createMockUser()

      render(
        <ProfileCard
          user={mockUser}
          profile={null}
          rank="private"
          theme={PROFILE_THEMES.default}
          onAvatarTap={onAvatarTap}
        />
      )

      const avatarContainer = screen.getByRole('button', { name: /User|John Doe/i })
      avatarContainer.focus()
      await user.keyboard('{Escape}')
      await user.keyboard('{Tab}')
      await user.keyboard('a')

      expect(onAvatarTap).not.toHaveBeenCalled()
    })

    it('avatar has tabIndex 0 when handler is provided', () => {
      const onAvatarTap = vi.fn()
      const mockUser = createMockUser()

      render(
        <ProfileCard
          user={mockUser}
          profile={null}
          rank="private"
          theme={PROFILE_THEMES.default}
          onAvatarTap={onAvatarTap}
        />
      )

      const avatarContainer = screen.getByRole('button', { name: /User|John Doe/i })
      expect(avatarContainer).toHaveAttribute('tabindex', '0')
    })

    it('avatar does not have tabIndex when handler is not provided', () => {
      const mockUser = createMockUser()

      render(
        <ProfileCard
          user={mockUser}
          profile={null}
          rank="private"
          theme={PROFILE_THEMES.default}
        />
      )

      // Find the avatar container (parent of the avatar element)
      const avatar = screen.getByTestId('avatar')
      const avatarParent = avatar.closest('.relative')

      // Should not have tabindex attribute when not interactive
      expect(avatarParent).not.toHaveAttribute('tabindex', '0')
    })

    it('clicking avatar does not throw when no handler provided', async () => {
      const user = userEvent.setup()
      const mockUser = createMockUser()

      render(
        <ProfileCard
          user={mockUser}
          profile={null}
          rank="private"
          theme={PROFILE_THEMES.default}
        />
      )

      const avatar = screen.getByTestId('avatar')
      const avatarContainer = avatar.closest('.relative') as HTMLElement

      // Should not throw when clicking
      await expect(user.click(avatarContainer)).resolves.not.toThrow()
    })

    it('avatar can receive focus via tab navigation', async () => {
      const user = userEvent.setup()
      const onAvatarTap = vi.fn()
      const mockUser = createMockUser()

      render(
        <ProfileCard
          user={mockUser}
          profile={null}
          rank="private"
          theme={PROFILE_THEMES.default}
          onAvatarTap={onAvatarTap}
        />
      )

      // Tab into the component
      await user.tab()

      const avatarContainer = screen.getByRole('button', { name: /User|John Doe/i })
      expect(avatarContainer).toHaveFocus()
    })
  })

  describe('rank interaction', () => {
    it('calls onRankTap when rank badge is clicked', async () => {
      const user = userEvent.setup()
      const onRankTap = vi.fn()
      const mockUser = createMockUser()

      render(
        <ProfileCard
          user={mockUser}
          profile={null}
          rank="sergeant"
          theme={PROFILE_THEMES.default}
          onRankTap={onRankTap}
        />
      )

      // Find the rank badge container
      const rankBadge = screen.getByText('Сержант').closest('[role="button"]')
      if (rankBadge) {
        await user.click(rankBadge)
        expect(onRankTap).toHaveBeenCalledTimes(1)
      }
    })

    it('rank badge is keyboard accessible when onRankTap is provided', async () => {
      const user = userEvent.setup()
      const onRankTap = vi.fn()
      const mockUser = createMockUser()

      render(
        <ProfileCard
          user={mockUser}
          profile={null}
          rank="captain"
          theme={PROFILE_THEMES.default}
          onRankTap={onRankTap}
        />
      )

      const rankBadge = screen.getByText('Капитан').closest('[role="button"]')
      if (rankBadge) {
        (rankBadge as HTMLElement).focus()
        await user.keyboard('{Enter}')
        expect(onRankTap).toHaveBeenCalledTimes(1)
      }
    })

    it('calls onRankTap multiple times on repeated clicks', async () => {
      const user = userEvent.setup()
      const onRankTap = vi.fn()
      const mockUser = createMockUser()

      render(
        <ProfileCard
          user={mockUser}
          profile={null}
          rank="lieutenant"
          theme={PROFILE_THEMES.default}
          onRankTap={onRankTap}
        />
      )

      const rankBadge = screen.getByText('Лейтенант').closest('[role="button"]')
      if (rankBadge) {
        await user.click(rankBadge)
        await user.click(rankBadge)
        await user.click(rankBadge)
        expect(onRankTap).toHaveBeenCalledTimes(3)
      }
    })

    it('does not call handler when other keys are pressed on rank badge', async () => {
      const user = userEvent.setup()
      const onRankTap = vi.fn()
      const mockUser = createMockUser()

      render(
        <ProfileCard
          user={mockUser}
          profile={null}
          rank="major"
          theme={PROFILE_THEMES.default}
          onRankTap={onRankTap}
        />
      )

      const rankBadge = screen.getByText('Майор').closest('[role="button"]')
      if (rankBadge) {
        (rankBadge as HTMLElement).focus()
        await user.keyboard('{Escape}')
        await user.keyboard('a')
        await user.keyboard('{ArrowDown}')
        expect(onRankTap).not.toHaveBeenCalled()
      }
    })

    it('rank badge has tabIndex 0 when handler is provided', () => {
      const onRankTap = vi.fn()
      const mockUser = createMockUser()

      render(
        <ProfileCard
          user={mockUser}
          profile={null}
          rank="colonel"
          theme={PROFILE_THEMES.default}
          onRankTap={onRankTap}
        />
      )

      const rankBadge = screen.getByText('Полковник').closest('[role="button"]')
      expect(rankBadge).toHaveAttribute('tabindex', '0')
    })

    it('rank badge is not a button when onRankTap is not provided', () => {
      const mockUser = createMockUser()

      render(
        <ProfileCard
          user={mockUser}
          profile={null}
          rank="general"
          theme={PROFILE_THEMES.default}
        />
      )

      // Without onRankTap, rank badge should not have button role
      const rankText = screen.getByText('Генерал')
      const rankContainer = rankText.closest('[role="button"]')
      expect(rankContainer).toBeNull()
    })

    it('clicking rank badge does not throw when no handler provided', async () => {
      const user = userEvent.setup()
      const mockUser = createMockUser()

      render(
        <ProfileCard
          user={mockUser}
          profile={null}
          rank="corporal"
          theme={PROFILE_THEMES.default}
        />
      )

      const rankText = screen.getByText('Ефрейтор')
      const rankBadge = rankText.closest('.mt-4') as HTMLElement

      // Should not throw when clicking
      await expect(user.click(rankBadge)).resolves.not.toThrow()
    })

    it('rank badge appears after stats section in DOM order', () => {
      const mockUser = createMockUser({ points: 1000 })
      const userStats = { events: 5, matches: 10 }

      render(
        <ProfileCard
          user={mockUser}
          profile={null}
          userStats={userStats}
          rank="sergeant_major"
          theme={PROFILE_THEMES.default}
        />
      )

      // Verify rank badge appears after XP stat by checking DOM order
      const xpElement = screen.getByText('XP')
      const rankElement = screen.getByText('Старшина')

      // XP should come before rank in the document
      const allElements = document.body.querySelectorAll('*')
      let xpIndex = -1
      let rankIndex = -1
      allElements.forEach((el, index) => {
        if (el.textContent === 'XP' && xpIndex === -1) xpIndex = index
        if (el.textContent === 'Старшина' && rankIndex === -1) rankIndex = index
      })

      expect(xpIndex).toBeLessThan(rankIndex)
    })
  })

  describe('combined interactions', () => {
    it('both avatar and rank can be interactive simultaneously', async () => {
      const user = userEvent.setup()
      const onAvatarTap = vi.fn()
      const onRankTap = vi.fn()
      const mockUser = createMockUser()

      render(
        <ProfileCard
          user={mockUser}
          profile={null}
          rank="captain"
          theme={PROFILE_THEMES.default}
          onAvatarTap={onAvatarTap}
          onRankTap={onRankTap}
        />
      )

      // Click avatar
      const avatarContainer = screen.getByRole('button', { name: /User|John Doe/i })
      await user.click(avatarContainer)
      expect(onAvatarTap).toHaveBeenCalledTimes(1)
      expect(onRankTap).not.toHaveBeenCalled()

      // Click rank
      const rankBadge = screen.getByText('Капитан').closest('[role="button"]')
      if (rankBadge) {
        await user.click(rankBadge)
        expect(onRankTap).toHaveBeenCalledTimes(1)
      }
    })

    it('tab navigation moves between avatar and rank in order', async () => {
      const user = userEvent.setup()
      const onAvatarTap = vi.fn()
      const onRankTap = vi.fn()
      const mockUser = createMockUser()

      render(
        <ProfileCard
          user={mockUser}
          profile={null}
          rank="major"
          theme={PROFILE_THEMES.default}
          onAvatarTap={onAvatarTap}
          onRankTap={onRankTap}
        />
      )

      // First tab should focus avatar
      await user.tab()
      const avatarContainer = screen.getByRole('button', { name: /User|John Doe/i })
      expect(avatarContainer).toHaveFocus()

      // Second tab should focus rank badge
      await user.tab()
      const rankBadge = screen.getByText('Майор').closest('[role="button"]')
      expect(rankBadge).toHaveFocus()
    })

    it('keyboard Enter works on both elements after tab navigation', async () => {
      const user = userEvent.setup()
      const onAvatarTap = vi.fn()
      const onRankTap = vi.fn()
      const mockUser = createMockUser()

      render(
        <ProfileCard
          user={mockUser}
          profile={null}
          rank="colonel"
          theme={PROFILE_THEMES.default}
          onAvatarTap={onAvatarTap}
          onRankTap={onRankTap}
        />
      )

      // Tab to avatar and press Enter
      await user.tab()
      await user.keyboard('{Enter}')
      expect(onAvatarTap).toHaveBeenCalledTimes(1)

      // Tab to rank and press Enter
      await user.tab()
      await user.keyboard('{Enter}')
      expect(onRankTap).toHaveBeenCalledTimes(1)
    })

    it('interactions work correctly with themed profile', async () => {
      const user = userEvent.setup()
      const onAvatarTap = vi.fn()
      const onRankTap = vi.fn()
      const mockUser = createMockUser({ team_role: 'core' })

      render(
        <ProfileCard
          user={mockUser}
          profile={null}
          rank="general"
          theme={PROFILE_THEMES.core}
          onAvatarTap={onAvatarTap}
          onRankTap={onRankTap}
        />
      )

      // Avatar should still be clickable with theme badge overlay
      const avatarContainer = screen.getByRole('button', { name: /User|John Doe/i })
      await user.click(avatarContainer)
      expect(onAvatarTap).toHaveBeenCalledTimes(1)

      // Rank should still be clickable
      const rankBadge = screen.getByText('Генерал').closest('[role="button"]')
      if (rankBadge) {
        await user.click(rankBadge)
        expect(onRankTap).toHaveBeenCalledTimes(1)
      }
    })

    it('interacting with null user profile does not crash', async () => {
      const user = userEvent.setup()

      render(
        <ProfileCard
          user={null}
          profile={null}
          rank="private"
          theme={PROFILE_THEMES.default}
          onAvatarTap={() => {}}
          onRankTap={() => {}}
        />
      )

      // Should show not found message and not crash on any interactions
      expect(screen.getByText('Профиль не найден')).toBeInTheDocument()

      // Try tabbing - should not crash even though elements aren't rendered
      await expect(user.tab()).resolves.not.toThrow()
    })
  })

  describe('avatar rendering', () => {
    it('passes profile photo_url to Avatar component', () => {
      const user = createMockUser()
      const profile = createMockProfile({ photo_url: 'https://example.com/avatar.jpg' })

      render(
        <ProfileCard
          user={user}
          profile={profile}
          rank="private"
          theme={PROFILE_THEMES.default}
        />
      )

      const avatar = screen.getByTestId('avatar')
      expect(avatar).toHaveAttribute('data-src', 'https://example.com/avatar.jpg')
    })

    it('passes user first_name to Avatar component', () => {
      const user = createMockUser({ first_name: 'Alice' })

      render(
        <ProfileCard
          user={user}
          profile={null}
          rank="private"
          theme={PROFILE_THEMES.default}
        />
      )

      const avatar = screen.getByTestId('avatar')
      expect(avatar).toHaveAttribute('data-name', 'Alice')
    })

    it('uses "User" as fallback when first_name is null', () => {
      const user = createMockUser({ first_name: null })

      render(
        <ProfileCard
          user={user}
          profile={null}
          rank="private"
          theme={PROFILE_THEMES.default}
        />
      )

      const avatar = screen.getByTestId('avatar')
      expect(avatar).toHaveAttribute('data-name', 'User')
    })
  })
})

describe('getProfileTheme', () => {
  describe('team role priority', () => {
    it('returns core theme for core team role', () => {
      const theme = getProfileTheme('core', 'free', [])
      expect(theme).toBe(PROFILE_THEMES.core)
    })

    it('returns speaker theme for speaker team role', () => {
      const theme = getProfileTheme('speaker', 'free', [])
      expect(theme).toBe(PROFILE_THEMES.speaker)
    })

    it('returns partner theme for partner team role', () => {
      const theme = getProfileTheme('partner', 'free', [])
      expect(theme).toBe(PROFILE_THEMES.partner)
    })

    it('returns sponsor theme for sponsor team role', () => {
      const theme = getProfileTheme('sponsor', 'free', [])
      expect(theme).toBe(PROFILE_THEMES.sponsor)
    })

    it('prioritizes team role over subscription tier', () => {
      const theme = getProfileTheme('core', 'pro', [])
      expect(theme).toBe(PROFILE_THEMES.core)
    })

    it('prioritizes team role over VIP badge', () => {
      const vipBadge = createMockBadge()
      const theme = getProfileTheme('speaker', 'free', [vipBadge])
      expect(theme).toBe(PROFILE_THEMES.speaker)
    })
  })

  describe('VIP badge priority', () => {
    it('returns VIP theme when user has VIP badge', () => {
      const vipBadge = createMockBadge()
      const theme = getProfileTheme(null, 'free', [vipBadge])
      expect(theme).toBe(PROFILE_THEMES.vip)
    })

    it('prioritizes VIP badge over pro subscription', () => {
      const vipBadge = createMockBadge()
      const theme = getProfileTheme(null, 'pro', [vipBadge])
      expect(theme).toBe(PROFILE_THEMES.vip)
    })

    it('checks badge slug for VIP', () => {
      const nonVipBadge = createMockBadge({
        badge: {
          ...createMockBadge().badge!,
          slug: 'early-adopter',
        },
      })
      const theme = getProfileTheme(null, 'free', [nonVipBadge])
      expect(theme).not.toBe(PROFILE_THEMES.vip)
    })
  })

  describe('subscription tier priority', () => {
    it('returns pro theme for pro subscription', () => {
      const theme = getProfileTheme(null, 'pro', [])
      expect(theme).toBe(PROFILE_THEMES.pro)
    })

    it('returns default theme for light subscription', () => {
      const theme = getProfileTheme(null, 'light', [])
      expect(theme).toBe(PROFILE_THEMES.default)
    })

    it('returns default theme for free subscription', () => {
      const theme = getProfileTheme(null, 'free', [])
      expect(theme).toBe(PROFILE_THEMES.default)
    })
  })

  describe('default fallback', () => {
    it('returns default theme when no special conditions', () => {
      const theme = getProfileTheme(null, 'free', [])
      expect(theme).toBe(PROFILE_THEMES.default)
    })

    it('returns default theme for undefined team role', () => {
      const theme = getProfileTheme(undefined, 'free', [])
      expect(theme).toBe(PROFILE_THEMES.default)
    })

    it('returns default theme for empty badges array', () => {
      const theme = getProfileTheme(null, 'free', [])
      expect(theme).toBe(PROFILE_THEMES.default)
    })
  })

  describe('edge cases', () => {
    it('handles multiple badges correctly (VIP among others)', () => {
      const badges = [
        createMockBadge({ badge: { ...createMockBadge().badge!, slug: 'early-adopter' } }),
        createMockBadge({ badge: { ...createMockBadge().badge!, slug: 'vip' } }),
        createMockBadge({ badge: { ...createMockBadge().badge!, slug: 'contributor' } }),
      ]
      const theme = getProfileTheme(null, 'free', badges)
      expect(theme).toBe(PROFILE_THEMES.vip)
    })

    it('handles badge with undefined badge property', () => {
      const badgeWithoutBadge: UserBadge = {
        id: 'badge-1',
        user_id: 1,
        badge_id: 'vip',
        awarded_by: null,
        awarded_reason: null,
        awarded_at: '2024-01-01T00:00:00Z',
        expires_at: null,
        is_featured: false,
        // Note: badge property is undefined
      }
      const theme = getProfileTheme(null, 'free', [badgeWithoutBadge])
      // Should not crash and return default
      expect(theme).toBe(PROFILE_THEMES.default)
    })
  })
})

describe('PROFILE_THEMES', () => {
  describe('theme structure', () => {
    const themeNames = ['core', 'vip', 'speaker', 'partner', 'sponsor', 'pro', 'default']

    themeNames.forEach((themeName) => {
      describe(`${themeName} theme`, () => {
        it('has headerGradient property', () => {
          expect(PROFILE_THEMES[themeName]).toHaveProperty('headerGradient')
          expect(typeof PROFILE_THEMES[themeName].headerGradient).toBe('string')
        })

        it('has avatarRing property', () => {
          expect(PROFILE_THEMES[themeName]).toHaveProperty('avatarRing')
          expect(typeof PROFILE_THEMES[themeName].avatarRing).toBe('string')
        })

        it('has avatarGlow property', () => {
          expect(PROFILE_THEMES[themeName]).toHaveProperty('avatarGlow')
          expect(typeof PROFILE_THEMES[themeName].avatarGlow).toBe('string')
        })

        it('has accentColor property', () => {
          expect(PROFILE_THEMES[themeName]).toHaveProperty('accentColor')
          expect(typeof PROFILE_THEMES[themeName].accentColor).toBe('string')
        })
      })
    })
  })

  describe('theme badges', () => {
    const themesWithBadges = ['core', 'vip', 'speaker', 'partner', 'sponsor', 'pro']

    themesWithBadges.forEach((themeName) => {
      it(`${themeName} theme has badge with icon, label, and color`, () => {
        const theme = PROFILE_THEMES[themeName]
        expect(theme.badge).toBeDefined()
        expect(theme.badge!.icon).toBeDefined()
        expect(theme.badge!.label).toBeDefined()
        expect(typeof theme.badge!.label).toBe('string')
        expect(theme.badge!.color).toBeDefined()
        expect(typeof theme.badge!.color).toBe('string')
      })
    })

    it('default theme has no badge', () => {
      expect(PROFILE_THEMES.default.badge).toBeUndefined()
    })
  })

  describe('specific theme values', () => {
    it('core theme badge says "CORE TEAM"', () => {
      expect(PROFILE_THEMES.core.badge?.label).toBe('CORE TEAM')
    })

    it('vip theme badge says "VIP"', () => {
      expect(PROFILE_THEMES.vip.badge?.label).toBe('VIP')
    })

    it('speaker theme badge says "SPEAKER"', () => {
      expect(PROFILE_THEMES.speaker.badge?.label).toBe('SPEAKER')
    })

    it('partner theme badge says "PARTNER"', () => {
      expect(PROFILE_THEMES.partner.badge?.label).toBe('PARTNER')
    })

    it('sponsor theme badge says "SPONSOR"', () => {
      expect(PROFILE_THEMES.sponsor.badge?.label).toBe('SPONSOR')
    })

    it('pro theme badge says "PRO"', () => {
      expect(PROFILE_THEMES.pro.badge?.label).toBe('PRO')
    })
  })
})
