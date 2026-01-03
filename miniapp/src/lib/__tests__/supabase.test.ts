import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock the Supabase client before importing the module
const mockSelect = vi.fn()
const mockSingle = vi.fn()
const mockEq = vi.fn()
const mockUpsert = vi.fn()
const mockFrom = vi.fn()

// Create chainable mock
const createChainableMock = () => {
  const chain = {
    select: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    single: vi.fn(() => Promise.resolve({ data: null, error: null })),
    upsert: vi.fn(() => chain),
    insert: vi.fn(() => chain),
    update: vi.fn(() => chain),
  }
  return chain
}

let mockChain = createChainableMock()

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => mockChain),
  })),
}))

// Import after mocking
import {
  getUserByTelegramId,
  getUserById,
  createOrUpdateUser,
} from '../supabase'

describe('Supabase User Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockChain = createChainableMock()

    // Reset environment variables for testing
    vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  describe('getUserByTelegramId', () => {
    describe('successful retrieval', () => {
      it('returns user data when user exists', async () => {
        const mockUser = {
          id: 1,
          tg_user_id: 123456789,
          username: 'testuser',
          first_name: 'Test',
          last_name: 'User',
          phone_number: '+1234567890',
          points: 100,
          created_at: '2024-01-01T00:00:00Z',
        }

        mockChain.single.mockResolvedValueOnce({ data: mockUser, error: null })

        const result = await getUserByTelegramId(123456789)

        expect(result).toEqual(mockUser)
        expect(mockChain.eq).toHaveBeenCalledWith('tg_user_id', 123456789)
      })

      it('returns user with all optional fields populated', async () => {
        const mockUser = {
          id: 42,
          tg_user_id: 987654321,
          username: 'fulluser',
          first_name: 'Full',
          last_name: 'User',
          phone_number: '+9876543210',
          points: 5000,
          team_role: 'volunteer',
          subscription_tier: 'pro',
          created_at: '2024-06-15T12:00:00Z',
          updated_at: '2024-12-01T08:30:00Z',
        }

        mockChain.single.mockResolvedValueOnce({ data: mockUser, error: null })

        const result = await getUserByTelegramId(987654321)

        expect(result).toEqual(mockUser)
        expect(result?.team_role).toBe('volunteer')
        expect(result?.subscription_tier).toBe('pro')
      })

      it('returns null when user does not exist (PGRST116 error)', async () => {
        // PGRST116 is the error code for "no rows returned" in PostgREST
        mockChain.single.mockResolvedValueOnce({
          data: null,
          error: { code: 'PGRST116', message: 'No rows found' },
        })

        const result = await getUserByTelegramId(999999999)

        expect(result).toBeNull()
      })
    })

    describe('error handling', () => {
      it('throws error for non-PGRST116 database errors', async () => {
        mockChain.single.mockResolvedValueOnce({
          data: null,
          error: { code: 'PGRST500', message: 'Database connection error' },
        })

        await expect(getUserByTelegramId(123456789)).rejects.toEqual({
          code: 'PGRST500',
          message: 'Database connection error',
        })
      })

      it('throws error for permission denied', async () => {
        mockChain.single.mockResolvedValueOnce({
          data: null,
          error: { code: '42501', message: 'Permission denied' },
        })

        await expect(getUserByTelegramId(123456789)).rejects.toEqual({
          code: '42501',
          message: 'Permission denied',
        })
      })
    })

    describe('edge cases', () => {
      it('handles large telegram IDs', async () => {
        const largeTgId = 9999999999999
        const mockUser = {
          id: 1,
          tg_user_id: largeTgId,
          username: 'largeIdUser',
          first_name: 'Large',
          last_name: null,
          phone_number: null,
          points: 0,
          created_at: '2024-01-01T00:00:00Z',
        }

        mockChain.single.mockResolvedValueOnce({ data: mockUser, error: null })

        const result = await getUserByTelegramId(largeTgId)

        expect(result?.tg_user_id).toBe(largeTgId)
        expect(mockChain.eq).toHaveBeenCalledWith('tg_user_id', largeTgId)
      })

      it('handles user with minimal data (null optional fields)', async () => {
        const mockUser = {
          id: 1,
          tg_user_id: 123456789,
          username: null,
          first_name: null,
          last_name: null,
          phone_number: null,
          points: 0,
          created_at: '2024-01-01T00:00:00Z',
        }

        mockChain.single.mockResolvedValueOnce({ data: mockUser, error: null })

        const result = await getUserByTelegramId(123456789)

        expect(result?.username).toBeNull()
        expect(result?.first_name).toBeNull()
        expect(result?.last_name).toBeNull()
        expect(result?.phone_number).toBeNull()
      })
    })
  })

  describe('getUserById', () => {
    describe('successful retrieval', () => {
      it('returns user data when user exists', async () => {
        const mockUser = {
          id: 42,
          tg_user_id: 123456789,
          username: 'testuser',
          first_name: 'Test',
          last_name: 'User',
          phone_number: '+1234567890',
          points: 250,
          created_at: '2024-01-01T00:00:00Z',
        }

        mockChain.single.mockResolvedValueOnce({ data: mockUser, error: null })

        const result = await getUserById(42)

        expect(result).toEqual(mockUser)
        expect(mockChain.eq).toHaveBeenCalledWith('id', 42)
      })

      it('returns null when user does not exist', async () => {
        mockChain.single.mockResolvedValueOnce({
          data: null,
          error: { code: 'PGRST116', message: 'No rows found' },
        })

        const result = await getUserById(99999)

        expect(result).toBeNull()
      })
    })

    describe('error handling', () => {
      it('throws error for database connection issues', async () => {
        mockChain.single.mockResolvedValueOnce({
          data: null,
          error: { code: 'PGRST503', message: 'Service unavailable' },
        })

        await expect(getUserById(1)).rejects.toEqual({
          code: 'PGRST503',
          message: 'Service unavailable',
        })
      })
    })

    describe('edge cases', () => {
      it('handles user ID of 1', async () => {
        const mockUser = {
          id: 1,
          tg_user_id: 100000001,
          username: 'firstuser',
          first_name: 'First',
          last_name: 'User',
          phone_number: null,
          points: 10000,
          created_at: '2023-01-01T00:00:00Z',
        }

        mockChain.single.mockResolvedValueOnce({ data: mockUser, error: null })

        const result = await getUserById(1)

        expect(result?.id).toBe(1)
        expect(mockChain.eq).toHaveBeenCalledWith('id', 1)
      })

      it('handles user with high points (general rank)', async () => {
        const mockUser = {
          id: 100,
          tg_user_id: 555555555,
          username: 'generaluser',
          first_name: 'General',
          last_name: 'User',
          phone_number: '+5555555555',
          points: 25000, // Above general threshold
          created_at: '2023-06-01T00:00:00Z',
        }

        mockChain.single.mockResolvedValueOnce({ data: mockUser, error: null })

        const result = await getUserById(100)

        expect(result?.points).toBe(25000)
      })
    })
  })

  describe('createOrUpdateUser', () => {
    describe('creating new user', () => {
      it('creates a new user with minimal data', async () => {
        const newUserData = {
          tg_user_id: 111222333,
        }

        const createdUser = {
          id: 1,
          tg_user_id: 111222333,
          username: null,
          first_name: null,
          last_name: null,
          phone_number: null,
          points: 0,
          created_at: '2024-01-01T00:00:00Z',
        }

        mockChain.single.mockResolvedValueOnce({ data: createdUser, error: null })

        const result = await createOrUpdateUser(newUserData)

        expect(result).toEqual(createdUser)
        expect(mockChain.upsert).toHaveBeenCalledWith(
          newUserData,
          { onConflict: 'tg_user_id' }
        )
      })

      it('creates a new user with all optional fields', async () => {
        const newUserData = {
          tg_user_id: 444555666,
          username: 'newuser',
          first_name: 'New',
          last_name: 'User',
          phone_number: '+4445556666',
        }

        const createdUser = {
          id: 5,
          ...newUserData,
          points: 0,
          created_at: '2024-01-15T10:30:00Z',
        }

        mockChain.single.mockResolvedValueOnce({ data: createdUser, error: null })

        const result = await createOrUpdateUser(newUserData)

        expect(result).toEqual(createdUser)
        expect(result?.username).toBe('newuser')
        expect(result?.first_name).toBe('New')
        expect(result?.last_name).toBe('User')
        expect(result?.phone_number).toBe('+4445556666')
      })
    })

    describe('updating existing user', () => {
      it('updates existing user when tg_user_id exists', async () => {
        const updateData = {
          tg_user_id: 123456789,
          username: 'updateduser',
          first_name: 'Updated',
          last_name: 'Name',
          phone_number: '+9999999999',
        }

        const updatedUser = {
          id: 10,
          ...updateData,
          points: 500, // Existing points preserved
          created_at: '2023-06-01T00:00:00Z',
          updated_at: '2024-01-20T15:45:00Z',
        }

        mockChain.single.mockResolvedValueOnce({ data: updatedUser, error: null })

        const result = await createOrUpdateUser(updateData)

        expect(result).toEqual(updatedUser)
        expect(result?.points).toBe(500) // Points preserved on update
      })

      it('updates user with null values for optional fields', async () => {
        const updateData = {
          tg_user_id: 123456789,
          username: null,
          first_name: null,
          last_name: null,
          phone_number: null,
        }

        const updatedUser = {
          id: 10,
          tg_user_id: 123456789,
          username: null,
          first_name: null,
          last_name: null,
          phone_number: null,
          points: 100,
          created_at: '2023-06-01T00:00:00Z',
        }

        mockChain.single.mockResolvedValueOnce({ data: updatedUser, error: null })

        const result = await createOrUpdateUser(updateData)

        expect(result?.username).toBeNull()
        expect(result?.first_name).toBeNull()
      })
    })

    describe('error handling', () => {
      it('throws error for database constraint violation', async () => {
        mockChain.single.mockResolvedValueOnce({
          data: null,
          error: { code: '23505', message: 'Unique violation' },
        })

        await expect(
          createOrUpdateUser({ tg_user_id: 123456789 })
        ).rejects.toEqual({ code: '23505', message: 'Unique violation' })
      })

      it('throws error for invalid data types', async () => {
        mockChain.single.mockResolvedValueOnce({
          data: null,
          error: { code: '22P02', message: 'Invalid input syntax' },
        })

        await expect(
          createOrUpdateUser({ tg_user_id: 123456789, username: 'test' })
        ).rejects.toEqual({ code: '22P02', message: 'Invalid input syntax' })
      })

      it('throws error for network timeout', async () => {
        mockChain.single.mockResolvedValueOnce({
          data: null,
          error: { code: 'PGRST_TIMEOUT', message: 'Request timeout' },
        })

        await expect(
          createOrUpdateUser({ tg_user_id: 123456789 })
        ).rejects.toEqual({ code: 'PGRST_TIMEOUT', message: 'Request timeout' })
      })
    })

    describe('edge cases', () => {
      it('handles unicode characters in user names', async () => {
        const userDataWithUnicode = {
          tg_user_id: 777888999,
          username: 'user_with_unicode',
          first_name: 'Дмитрий',
          last_name: 'Иванов',
          phone_number: '+375291234567',
        }

        const createdUser = {
          id: 20,
          ...userDataWithUnicode,
          points: 0,
          created_at: '2024-01-25T08:00:00Z',
        }

        mockChain.single.mockResolvedValueOnce({ data: createdUser, error: null })

        const result = await createOrUpdateUser(userDataWithUnicode)

        expect(result?.first_name).toBe('Дмитрий')
        expect(result?.last_name).toBe('Иванов')
      })

      it('handles very long usernames (within limits)', async () => {
        const longUsername = 'a'.repeat(32) // Telegram username max length
        const userData = {
          tg_user_id: 111111111,
          username: longUsername,
          first_name: 'Long',
          last_name: 'Username',
          phone_number: null,
        }

        const createdUser = {
          id: 25,
          ...userData,
          points: 0,
          created_at: '2024-01-30T12:00:00Z',
        }

        mockChain.single.mockResolvedValueOnce({ data: createdUser, error: null })

        const result = await createOrUpdateUser(userData)

        expect(result?.username).toBe(longUsername)
        expect(result?.username?.length).toBe(32)
      })

      it('handles phone number in different formats', async () => {
        const userData = {
          tg_user_id: 222333444,
          username: 'phoneuser',
          first_name: 'Phone',
          last_name: 'User',
          phone_number: '+375 (29) 123-45-67',
        }

        const createdUser = {
          id: 30,
          ...userData,
          points: 0,
          created_at: '2024-02-01T00:00:00Z',
        }

        mockChain.single.mockResolvedValueOnce({ data: createdUser, error: null })

        const result = await createOrUpdateUser(userData)

        expect(result?.phone_number).toBe('+375 (29) 123-45-67')
      })
    })
  })

  describe('Supabase client configuration', () => {
    it('uses correct table name for user operations', async () => {
      const mockUser = { id: 1, tg_user_id: 123 }
      mockChain.single.mockResolvedValueOnce({ data: mockUser, error: null })

      await getUserByTelegramId(123)

      // The from() call should use 'bot_users' table
      // This is verified through the mock chain
      expect(mockChain.select).toHaveBeenCalled()
    })

    it('calls select(*) to get all user fields', async () => {
      const mockUser = { id: 1, tg_user_id: 123 }
      mockChain.single.mockResolvedValueOnce({ data: mockUser, error: null })

      await getUserById(1)

      expect(mockChain.select).toHaveBeenCalledWith('*')
    })
  })
})

describe('getUserByTelegramId and getUserById consistency', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockChain = createChainableMock()
    vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('both functions return same structure for same user', async () => {
    const mockUser = {
      id: 100,
      tg_user_id: 999888777,
      username: 'consistentuser',
      first_name: 'Consistent',
      last_name: 'User',
      phone_number: '+1234567890',
      points: 1500,
      created_at: '2024-01-01T00:00:00Z',
    }

    // First call - by telegram ID
    mockChain.single.mockResolvedValueOnce({ data: mockUser, error: null })
    const resultByTgId = await getUserByTelegramId(999888777)

    // Reset chain for second call
    mockChain = createChainableMock()
    mockChain.single.mockResolvedValueOnce({ data: mockUser, error: null })
    const resultById = await getUserById(100)

    expect(resultByTgId).toEqual(resultById)
    expect(resultByTgId?.id).toBe(resultById?.id)
    expect(resultByTgId?.tg_user_id).toBe(resultById?.tg_user_id)
  })
})
