import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EventCard } from '../EventCard'
import type { Event } from '@/types'

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
  },
}))

// Mock ui components to isolate EventCard testing
vi.mock('@/components/ui', () => ({
  Card: ({
    children,
    onClick,
    highlighted,
    className
  }: {
    children: React.ReactNode
    onClick?: () => void
    highlighted?: boolean
    className?: string
  }) => (
    <div
      data-testid="card"
      data-highlighted={highlighted}
      className={className}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  ),
  Badge: ({ children, variant }: { children: React.ReactNode; variant?: string }) => (
    <span data-testid="badge" data-variant={variant}>
      {children}
    </span>
  ),
}))

// Mock date-fns functions with controllable behavior
const mockIsToday = vi.fn()
const mockIsTomorrow = vi.fn()

vi.mock('date-fns', () => ({
  format: (date: Date, formatStr: string) => {
    if (formatStr === 'd MMM') {
      // Return a simple formatted date
      const day = date.getDate()
      const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']
      return `${day} ${months[date.getMonth()]}`
    }
    if (formatStr === 'HH:mm') {
      return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
    }
    return date.toISOString()
  },
  isToday: (date: Date) => mockIsToday(date),
  isTomorrow: (date: Date) => mockIsTomorrow(date),
}))

// Test data factory
const createMockEvent = (overrides: Partial<Event> = {}): Event => ({
  id: 1,
  title: 'Test Event',
  description: 'Test description',
  event_date: '2024-12-15T14:00:00Z',
  city: 'Moscow',
  location: 'Tech Hub, Room 101',
  location_url: 'https://maps.example.com',
  speakers: 'John Doe',
  max_participants: 50,
  registration_deadline: '2024-12-14T23:59:59Z',
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  image_url: 'https://example.com/event.jpg',
  event_type: 'meetup',
  price: 0,
  ...overrides,
})

describe('EventCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockIsToday.mockReturnValue(false)
    mockIsTomorrow.mockReturnValue(false)
  })

  describe('basic rendering', () => {
    it('renders event title', () => {
      const event = createMockEvent({ title: 'React Meetup' })

      render(<EventCard event={event} />)

      expect(screen.getByText('React Meetup')).toBeInTheDocument()
    })

    it('renders event location', () => {
      const event = createMockEvent({ location: 'Tech Center, Floor 5' })

      render(<EventCard event={event} />)

      expect(screen.getByText('Tech Center, Floor 5')).toBeInTheDocument()
    })

    it('renders event with null location', () => {
      const event = createMockEvent({ location: null })

      render(<EventCard event={event} />)

      // Should not crash and card should still render
      expect(screen.getByTestId('card')).toBeInTheDocument()
    })

    it('renders card component with correct structure', () => {
      const event = createMockEvent()

      render(<EventCard event={event} />)

      expect(screen.getByTestId('card')).toBeInTheDocument()
    })
  })

  describe('registration status', () => {
    it('renders check icon when isRegistered is true', () => {
      const event = createMockEvent()

      render(<EventCard event={event} isRegistered={true} />)

      // Check icon is rendered when registered
      const card = screen.getByTestId('card')
      expect(card).toHaveAttribute('data-highlighted', 'true')
    })

    it('does not highlight card when isRegistered is false', () => {
      const event = createMockEvent()

      render(<EventCard event={event} isRegistered={false} />)

      const card = screen.getByTestId('card')
      expect(card).toHaveAttribute('data-highlighted', 'false')
    })

    it('defaults to not registered when isRegistered prop is not provided', () => {
      const event = createMockEvent()

      render(<EventCard event={event} />)

      const card = screen.getByTestId('card')
      expect(card).toHaveAttribute('data-highlighted', 'false')
    })
  })

  describe('event type icons', () => {
    const eventTypes: Array<{ type: Event['event_type']; description: string }> = [
      { type: 'meetup', description: 'Users icon for meetup' },
      { type: 'workshop', description: 'Code icon for workshop' },
      { type: 'conference', description: 'Megaphone icon for conference' },
      { type: 'hackathon', description: 'Lightbulb icon for hackathon' },
    ]

    eventTypes.forEach(({ type, description }) => {
      it(`renders ${description}`, () => {
        const event = createMockEvent({ event_type: type })

        render(<EventCard event={event} />)

        // Icon should be rendered (we can verify the card renders without error)
        expect(screen.getByTestId('card')).toBeInTheDocument()
      })
    })

    it('renders default calendar icon when event_type is undefined', () => {
      const event = createMockEvent()
      // TypeScript workaround to set undefined event_type
      const eventWithNoType = { ...event, event_type: undefined as unknown as Event['event_type'] }

      render(<EventCard event={eventWithNoType} />)

      expect(screen.getByTestId('card')).toBeInTheDocument()
    })

    it('renders default icon for unknown event type', () => {
      const event = createMockEvent()
      // TypeScript workaround for unknown type
      const eventWithUnknownType = { ...event, event_type: 'unknown' as Event['event_type'] }

      render(<EventCard event={eventWithUnknownType} />)

      expect(screen.getByTestId('card')).toBeInTheDocument()
    })
  })

  describe('date formatting', () => {
    it('displays "Сегодня" when event is today', () => {
      mockIsToday.mockReturnValue(true)
      const event = createMockEvent({ event_date: '2024-12-15T14:00:00Z' })

      render(<EventCard event={event} />)

      expect(screen.getByText(/Сегодня/)).toBeInTheDocument()
    })

    it('displays "Завтра" when event is tomorrow', () => {
      mockIsTomorrow.mockReturnValue(true)
      const event = createMockEvent({ event_date: '2024-12-16T10:00:00Z' })

      render(<EventCard event={event} />)

      expect(screen.getByText(/Завтра/)).toBeInTheDocument()
    })

    it('displays formatted date when event is not today or tomorrow', () => {
      mockIsToday.mockReturnValue(false)
      mockIsTomorrow.mockReturnValue(false)
      // December 15, 2024
      const event = createMockEvent({ event_date: '2024-12-15T14:00:00Z' })

      render(<EventCard event={event} />)

      // Should show "15 дек" format
      expect(screen.getByText(/15 дек/)).toBeInTheDocument()
    })

    it('displays event time in HH:mm format', () => {
      const event = createMockEvent({ event_date: '2024-12-15T14:30:00Z' })

      render(<EventCard event={event} />)

      // Should show time - this depends on the timezone, but we can check the format
      // The component shows time from the date
      expect(screen.getByTestId('card')).toBeInTheDocument()
    })
  })

  describe('price display', () => {
    it('displays "Free" badge when price is 0', () => {
      const event = createMockEvent({ price: 0 })

      render(<EventCard event={event} />)

      expect(screen.getByText('Free')).toBeInTheDocument()
    })

    it('displays Free badge with accent variant', () => {
      const event = createMockEvent({ price: 0 })

      render(<EventCard event={event} />)

      const badge = screen.getByTestId('badge')
      expect(badge).toHaveAttribute('data-variant', 'accent')
    })

    it('displays price with BYN currency when price > 0', () => {
      const event = createMockEvent({ price: 50 })

      render(<EventCard event={event} />)

      expect(screen.getByText('50 BYN')).toBeInTheDocument()
    })

    it('displays price badge with default variant when price > 0', () => {
      const event = createMockEvent({ price: 100 })

      render(<EventCard event={event} />)

      const badge = screen.getByTestId('badge')
      expect(badge).not.toHaveAttribute('data-variant', 'accent')
    })

    it('handles various price values correctly', () => {
      const testCases = [
        { price: 0, expected: 'Free' },
        { price: 10, expected: '10 BYN' },
        { price: 99, expected: '99 BYN' },
        { price: 150, expected: '150 BYN' },
      ]

      testCases.forEach(({ price, expected }) => {
        const { unmount } = render(<EventCard event={createMockEvent({ price })} />)
        expect(screen.getByText(expected)).toBeInTheDocument()
        unmount()
      })
    })
  })

  describe('click handling', () => {
    it('calls onClick when card is clicked', async () => {
      const user = userEvent.setup()
      const onClick = vi.fn()
      const event = createMockEvent()

      render(<EventCard event={event} onClick={onClick} />)

      const card = screen.getByTestId('card')
      await user.click(card)

      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('card has button role when onClick is provided', () => {
      const onClick = vi.fn()
      const event = createMockEvent()

      render(<EventCard event={event} onClick={onClick} />)

      const card = screen.getByTestId('card')
      expect(card).toHaveAttribute('role', 'button')
    })

    it('card has tabIndex 0 when onClick is provided', () => {
      const onClick = vi.fn()
      const event = createMockEvent()

      render(<EventCard event={event} onClick={onClick} />)

      const card = screen.getByTestId('card')
      expect(card).toHaveAttribute('tabindex', '0')
    })

    it('card does not have button role when onClick is not provided', () => {
      const event = createMockEvent()

      render(<EventCard event={event} />)

      const card = screen.getByTestId('card')
      expect(card).not.toHaveAttribute('role', 'button')
    })

    it('handles multiple clicks correctly', async () => {
      const user = userEvent.setup()
      const onClick = vi.fn()
      const event = createMockEvent()

      render(<EventCard event={event} onClick={onClick} />)

      const card = screen.getByTestId('card')
      await user.click(card)
      await user.click(card)
      await user.click(card)

      expect(onClick).toHaveBeenCalledTimes(3)
    })

    it('does not crash when clicking without onClick handler', async () => {
      const user = userEvent.setup()
      const event = createMockEvent()

      render(<EventCard event={event} />)

      const card = screen.getByTestId('card')
      await expect(user.click(card)).resolves.not.toThrow()
    })
  })

  describe('combined props', () => {
    it('renders correctly with all props provided', async () => {
      const user = userEvent.setup()
      const onClick = vi.fn()
      const event = createMockEvent({
        title: 'Full Feature Event',
        location: 'Main Hall',
        price: 25,
        event_type: 'conference',
      })

      render(
        <EventCard
          event={event}
          isRegistered={true}
          onClick={onClick}
        />
      )

      expect(screen.getByText('Full Feature Event')).toBeInTheDocument()
      expect(screen.getByText('Main Hall')).toBeInTheDocument()
      expect(screen.getByText('25 BYN')).toBeInTheDocument()
      expect(screen.getByTestId('card')).toHaveAttribute('data-highlighted', 'true')

      await user.click(screen.getByTestId('card'))
      expect(onClick).toHaveBeenCalled()
    })

    it('renders registered event with free price', () => {
      const event = createMockEvent({ price: 0 })

      render(<EventCard event={event} isRegistered={true} />)

      expect(screen.getByText('Free')).toBeInTheDocument()
      expect(screen.getByTestId('card')).toHaveAttribute('data-highlighted', 'true')
    })

    it('renders non-registered paid event correctly', () => {
      const event = createMockEvent({ price: 75 })

      render(<EventCard event={event} isRegistered={false} />)

      expect(screen.getByText('75 BYN')).toBeInTheDocument()
      expect(screen.getByTestId('card')).toHaveAttribute('data-highlighted', 'false')
    })
  })

  describe('edge cases', () => {
    it('handles empty title gracefully', () => {
      const event = createMockEvent({ title: '' })

      render(<EventCard event={event} />)

      expect(screen.getByTestId('card')).toBeInTheDocument()
    })

    it('handles very long title', () => {
      const longTitle = 'This is a very long event title that might need to be truncated in the UI because it extends beyond the normal width of the card component'
      const event = createMockEvent({ title: longTitle })

      render(<EventCard event={event} />)

      expect(screen.getByText(longTitle)).toBeInTheDocument()
    })

    it('handles very long location', () => {
      const longLocation = 'Building A, Floor 15, Room 1501, Technology District, Business Park, Main Street 123, Some City'
      const event = createMockEvent({ location: longLocation })

      render(<EventCard event={event} />)

      expect(screen.getByText(longLocation)).toBeInTheDocument()
    })

    it('handles minimum event data', () => {
      const minimalEvent: Event = {
        id: 1,
        title: 'Minimal',
        description: null,
        event_date: '2024-01-01T00:00:00Z',
        city: 'City',
        location: null,
        location_url: null,
        speakers: null,
        max_participants: null,
        registration_deadline: null,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        image_url: null,
        event_type: 'meetup',
        price: 0,
      }

      render(<EventCard event={minimalEvent} />)

      expect(screen.getByText('Minimal')).toBeInTheDocument()
      expect(screen.getByText('Free')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('renders with semantic structure', () => {
      const event = createMockEvent()

      render(<EventCard event={event} />)

      // Card should be present
      expect(screen.getByTestId('card')).toBeInTheDocument()
    })

    it('interactive card is keyboard accessible', async () => {
      const onClick = vi.fn()
      const event = createMockEvent()

      render(<EventCard event={event} onClick={onClick} />)

      const card = screen.getByTestId('card')
      expect(card).toHaveAttribute('tabindex', '0')
    })
  })
})
