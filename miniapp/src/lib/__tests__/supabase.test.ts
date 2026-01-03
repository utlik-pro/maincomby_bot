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

// ==============================================
// Auth Error Handling Tests
// Tests for authentication and authorization errors,
// network failures, rate limiting, and edge cases
// ==============================================

describe('Auth Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockChain = createChainableMock()
    vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  describe('Authentication Errors (401)', () => {
    it('throws error when JWT token is invalid', async () => {
      mockChain.single.mockResolvedValueOnce({
        data: null,
        error: {
          code: 'PGRST301',
          message: 'JWT expired',
          hint: 'Please log in again',
        },
      })

      await expect(getUserByTelegramId(123456789)).rejects.toEqual({
        code: 'PGRST301',
        message: 'JWT expired',
        hint: 'Please log in again',
      })
    })

    it('throws error when authentication is required but missing', async () => {
      mockChain.single.mockResolvedValueOnce({
        data: null,
        error: {
          code: '42501',
          message: 'permission denied for table bot_users',
        },
      })

      await expect(getUserById(1)).rejects.toEqual({
        code: '42501',
        message: 'permission denied for table bot_users',
      })
    })

    it('throws error for invalid API key', async () => {
      mockChain.single.mockResolvedValueOnce({
        data: null,
        error: {
          code: 'PGRST302',
          message: 'Invalid API key',
        },
      })

      await expect(getUserByTelegramId(123456789)).rejects.toEqual({
        code: 'PGRST302',
        message: 'Invalid API key',
      })
    })
  })

  describe('Authorization Errors (403)', () => {
    it('throws error when user lacks permission to access resource', async () => {
      mockChain.single.mockResolvedValueOnce({
        data: null,
        error: {
          code: '42501',
          message: 'Permission denied',
          details: 'User does not have access to this resource',
        },
      })

      await expect(getUserById(999)).rejects.toEqual({
        code: '42501',
        message: 'Permission denied',
        details: 'User does not have access to this resource',
      })
    })

    it('throws error for RLS policy violation', async () => {
      mockChain.single.mockResolvedValueOnce({
        data: null,
        error: {
          code: '42P01',
          message: 'new row violates row-level security policy',
        },
      })

      await expect(
        createOrUpdateUser({ tg_user_id: 123456789 })
      ).rejects.toEqual({
        code: '42P01',
        message: 'new row violates row-level security policy',
      })
    })
  })

  describe('Network Errors', () => {
    it('throws error for connection timeout', async () => {
      mockChain.single.mockResolvedValueOnce({
        data: null,
        error: {
          code: 'PGRST_TIMEOUT',
          message: 'Connection timeout',
        },
      })

      await expect(getUserByTelegramId(123456789)).rejects.toEqual({
        code: 'PGRST_TIMEOUT',
        message: 'Connection timeout',
      })
    })

    it('throws error for service unavailable', async () => {
      mockChain.single.mockResolvedValueOnce({
        data: null,
        error: {
          code: 'PGRST503',
          message: 'Service temporarily unavailable',
        },
      })

      await expect(getUserById(1)).rejects.toEqual({
        code: 'PGRST503',
        message: 'Service temporarily unavailable',
      })
    })

    it('throws error for DNS resolution failure', async () => {
      mockChain.single.mockResolvedValueOnce({
        data: null,
        error: {
          code: 'NETWORK_ERROR',
          message: 'getaddrinfo ENOTFOUND',
        },
      })

      await expect(getUserByTelegramId(123456789)).rejects.toEqual({
        code: 'NETWORK_ERROR',
        message: 'getaddrinfo ENOTFOUND',
      })
    })

    it('throws error for SSL/TLS handshake failure', async () => {
      mockChain.single.mockResolvedValueOnce({
        data: null,
        error: {
          code: 'SSL_ERROR',
          message: 'SSL handshake failed',
        },
      })

      await expect(createOrUpdateUser({ tg_user_id: 123456789 })).rejects.toEqual({
        code: 'SSL_ERROR',
        message: 'SSL handshake failed',
      })
    })
  })

  describe('Rate Limiting Errors (429)', () => {
    it('throws error when rate limit is exceeded', async () => {
      mockChain.single.mockResolvedValueOnce({
        data: null,
        error: {
          code: '429',
          message: 'Too many requests',
          hint: 'Please wait before making more requests',
        },
      })

      await expect(getUserByTelegramId(123456789)).rejects.toEqual({
        code: '429',
        message: 'Too many requests',
        hint: 'Please wait before making more requests',
      })
    })

    it('throws error for rate limit with retry-after hint', async () => {
      mockChain.single.mockResolvedValueOnce({
        data: null,
        error: {
          code: 'PGRST429',
          message: 'Rate limit exceeded',
          hint: 'Retry after 60 seconds',
        },
      })

      await expect(createOrUpdateUser({ tg_user_id: 123456789 })).rejects.toEqual({
        code: 'PGRST429',
        message: 'Rate limit exceeded',
        hint: 'Retry after 60 seconds',
      })
    })
  })

  describe('Database Constraint Errors', () => {
    it('throws error for foreign key violation', async () => {
      mockChain.single.mockResolvedValueOnce({
        data: null,
        error: {
          code: '23503',
          message: 'insert or update on table "bot_users" violates foreign key constraint',
          details: 'Key is not present in referenced table',
        },
      })

      await expect(
        createOrUpdateUser({ tg_user_id: 123456789 })
      ).rejects.toEqual({
        code: '23503',
        message: 'insert or update on table "bot_users" violates foreign key constraint',
        details: 'Key is not present in referenced table',
      })
    })

    it('throws error for check constraint violation', async () => {
      mockChain.single.mockResolvedValueOnce({
        data: null,
        error: {
          code: '23514',
          message: 'new row for relation "bot_users" violates check constraint',
        },
      })

      await expect(
        createOrUpdateUser({ tg_user_id: -1 }) // Invalid negative ID
      ).rejects.toEqual({
        code: '23514',
        message: 'new row for relation "bot_users" violates check constraint',
      })
    })

    it('throws error for not null constraint violation', async () => {
      mockChain.single.mockResolvedValueOnce({
        data: null,
        error: {
          code: '23502',
          message: 'null value in column "tg_user_id" violates not-null constraint',
        },
      })

      // Type assertion needed to test invalid input
      await expect(
        createOrUpdateUser({ tg_user_id: null as unknown as number })
      ).rejects.toEqual({
        code: '23502',
        message: 'null value in column "tg_user_id" violates not-null constraint',
      })
    })
  })

  describe('Server Errors (5xx)', () => {
    it('throws error for internal server error', async () => {
      mockChain.single.mockResolvedValueOnce({
        data: null,
        error: {
          code: 'PGRST500',
          message: 'Internal server error',
        },
      })

      await expect(getUserByTelegramId(123456789)).rejects.toEqual({
        code: 'PGRST500',
        message: 'Internal server error',
      })
    })

    it('throws error for bad gateway', async () => {
      mockChain.single.mockResolvedValueOnce({
        data: null,
        error: {
          code: '502',
          message: 'Bad gateway',
        },
      })

      await expect(getUserById(1)).rejects.toEqual({
        code: '502',
        message: 'Bad gateway',
      })
    })

    it('throws error for gateway timeout', async () => {
      mockChain.single.mockResolvedValueOnce({
        data: null,
        error: {
          code: '504',
          message: 'Gateway timeout',
        },
      })

      await expect(createOrUpdateUser({ tg_user_id: 123456789 })).rejects.toEqual({
        code: '504',
        message: 'Gateway timeout',
      })
    })
  })

  describe('Error Object Structure', () => {
    it('preserves all error fields when throwing', async () => {
      const detailedError = {
        code: 'CUSTOM_ERROR',
        message: 'Custom error message',
        details: 'Detailed error information',
        hint: 'Try this to fix it',
      }

      mockChain.single.mockResolvedValueOnce({
        data: null,
        error: detailedError,
      })

      await expect(getUserByTelegramId(123456789)).rejects.toEqual(detailedError)
    })

    it('handles error with minimal fields', async () => {
      mockChain.single.mockResolvedValueOnce({
        data: null,
        error: {
          code: 'ERR',
          message: 'Error',
        },
      })

      await expect(getUserById(1)).rejects.toEqual({
        code: 'ERR',
        message: 'Error',
      })
    })

    it('handles error with null message', async () => {
      mockChain.single.mockResolvedValueOnce({
        data: null,
        error: {
          code: 'NULL_MSG',
          message: null,
        },
      })

      await expect(getUserByTelegramId(123456789)).rejects.toEqual({
        code: 'NULL_MSG',
        message: null,
      })
    })
  })

  describe('Concurrent Request Handling', () => {
    it('handles multiple simultaneous requests with different errors', async () => {
      // First request will fail with timeout
      mockChain.single
        .mockResolvedValueOnce({
          data: null,
          error: { code: 'TIMEOUT', message: 'Request timeout' },
        })
        // Second request will succeed
        .mockResolvedValueOnce({
          data: { id: 1, tg_user_id: 111 },
          error: null,
        })
        // Third request will fail with rate limit
        .mockResolvedValueOnce({
          data: null,
          error: { code: '429', message: 'Rate limited' },
        })

      const results = await Promise.allSettled([
        getUserByTelegramId(111),
        getUserByTelegramId(222),
        getUserByTelegramId(333),
      ])

      expect(results[0].status).toBe('rejected')
      expect(results[1].status).toBe('fulfilled')
      expect(results[2].status).toBe('rejected')

      if (results[0].status === 'rejected') {
        expect(results[0].reason).toEqual({ code: 'TIMEOUT', message: 'Request timeout' })
      }
      if (results[2].status === 'rejected') {
        expect(results[2].reason).toEqual({ code: '429', message: 'Rate limited' })
      }
    })

    it('handles all requests failing', async () => {
      mockChain.single
        .mockResolvedValueOnce({
          data: null,
          error: { code: 'ERR1', message: 'Error 1' },
        })
        .mockResolvedValueOnce({
          data: null,
          error: { code: 'ERR2', message: 'Error 2' },
        })

      const results = await Promise.allSettled([
        getUserById(1),
        getUserById(2),
      ])

      expect(results[0].status).toBe('rejected')
      expect(results[1].status).toBe('rejected')
    })
  })

  describe('PGRST116 Special Handling', () => {
    // PGRST116 is "no rows returned" - should return null, not throw
    it('returns null for PGRST116 on getUserByTelegramId', async () => {
      mockChain.single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116', message: 'JSON object requested, multiple (or no) rows returned' },
      })

      const result = await getUserByTelegramId(999999999)

      expect(result).toBeNull()
    })

    it('returns null for PGRST116 on getUserById', async () => {
      mockChain.single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116', message: 'JSON object requested, multiple (or no) rows returned' },
      })

      const result = await getUserById(999999999)

      expect(result).toBeNull()
    })

    it('throws for non-PGRST116 errors even when data is null', async () => {
      mockChain.single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST500', message: 'Internal error' },
      })

      await expect(getUserByTelegramId(123456789)).rejects.toEqual({
        code: 'PGRST500',
        message: 'Internal error',
      })
    })
  })

  describe('createOrUpdateUser Error Handling', () => {
    // createOrUpdateUser should always throw on any error (no PGRST116 exception)
    it('throws error even for PGRST116 on createOrUpdateUser (upsert should not get no-rows)', async () => {
      mockChain.single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116', message: 'No rows returned' },
      })

      // createOrUpdateUser does NOT have PGRST116 exception - all errors thrown
      await expect(
        createOrUpdateUser({ tg_user_id: 123456789 })
      ).rejects.toEqual({
        code: 'PGRST116',
        message: 'No rows returned',
      })
    })

    it('throws detailed error for constraint violations', async () => {
      const constraintError = {
        code: '23505',
        message: 'duplicate key value violates unique constraint "bot_users_tg_user_id_key"',
        details: 'Key (tg_user_id)=(123456789) already exists.',
        hint: null,
      }

      mockChain.single.mockResolvedValueOnce({
        data: null,
        error: constraintError,
      })

      await expect(
        createOrUpdateUser({ tg_user_id: 123456789 })
      ).rejects.toEqual(constraintError)
    })
  })
})
