import { describe, it, expect } from 'vitest'
import { calculateRank, calculateRankProgress } from '../store'
import { RANK_THRESHOLDS } from '@/types'

describe('calculateRank', () => {
  describe('basic rank calculations at exact thresholds', () => {
    it('returns "private" for 0 XP', () => {
      expect(calculateRank(0)).toBe('private')
    })

    it('returns "corporal" for exactly 100 XP', () => {
      expect(calculateRank(100)).toBe('corporal')
    })

    it('returns "sergeant" for exactly 300 XP', () => {
      expect(calculateRank(300)).toBe('sergeant')
    })

    it('returns "sergeant_major" for exactly 600 XP', () => {
      expect(calculateRank(600)).toBe('sergeant_major')
    })

    it('returns "lieutenant" for exactly 1000 XP', () => {
      expect(calculateRank(1000)).toBe('lieutenant')
    })

    it('returns "captain" for exactly 2000 XP', () => {
      expect(calculateRank(2000)).toBe('captain')
    })

    it('returns "major" for exactly 5000 XP', () => {
      expect(calculateRank(5000)).toBe('major')
    })

    it('returns "colonel" for exactly 10000 XP', () => {
      expect(calculateRank(10000)).toBe('colonel')
    })

    it('returns "general" for exactly 20000 XP', () => {
      expect(calculateRank(20000)).toBe('general')
    })
  })

  describe('boundary values (just below threshold)', () => {
    it('returns "private" for 99 XP (just below corporal)', () => {
      expect(calculateRank(99)).toBe('private')
    })

    it('returns "corporal" for 299 XP (just below sergeant)', () => {
      expect(calculateRank(299)).toBe('corporal')
    })

    it('returns "sergeant" for 599 XP (just below sergeant_major)', () => {
      expect(calculateRank(599)).toBe('sergeant')
    })

    it('returns "sergeant_major" for 999 XP (just below lieutenant)', () => {
      expect(calculateRank(999)).toBe('sergeant_major')
    })

    it('returns "lieutenant" for 1999 XP (just below captain)', () => {
      expect(calculateRank(1999)).toBe('lieutenant')
    })

    it('returns "captain" for 4999 XP (just below major)', () => {
      expect(calculateRank(4999)).toBe('captain')
    })

    it('returns "major" for 9999 XP (just below colonel)', () => {
      expect(calculateRank(9999)).toBe('major')
    })

    it('returns "colonel" for 19999 XP (just below general)', () => {
      expect(calculateRank(19999)).toBe('colonel')
    })
  })

  describe('mid-range values within ranks', () => {
    it('returns "private" for 50 XP', () => {
      expect(calculateRank(50)).toBe('private')
    })

    it('returns "corporal" for 200 XP', () => {
      expect(calculateRank(200)).toBe('corporal')
    })

    it('returns "sergeant" for 450 XP', () => {
      expect(calculateRank(450)).toBe('sergeant')
    })

    it('returns "captain" for 3500 XP', () => {
      expect(calculateRank(3500)).toBe('captain')
    })

    it('returns "major" for 7500 XP', () => {
      expect(calculateRank(7500)).toBe('major')
    })
  })

  describe('edge cases', () => {
    it('returns "private" for negative XP', () => {
      expect(calculateRank(-1)).toBe('private')
      expect(calculateRank(-100)).toBe('private')
      expect(calculateRank(-1000)).toBe('private')
    })

    it('returns "general" for very large XP values', () => {
      expect(calculateRank(100000)).toBe('general')
      expect(calculateRank(1000000)).toBe('general')
      expect(calculateRank(Number.MAX_SAFE_INTEGER)).toBe('general')
    })

    it('returns "general" for XP above general threshold', () => {
      expect(calculateRank(20001)).toBe('general')
      expect(calculateRank(25000)).toBe('general')
      expect(calculateRank(50000)).toBe('general')
    })

    it('returns "private" for XP value of 1', () => {
      expect(calculateRank(1)).toBe('private')
    })
  })

  describe('rank thresholds consistency', () => {
    it('correctly uses RANK_THRESHOLDS values', () => {
      // Verify the function uses the correct threshold values
      expect(calculateRank(RANK_THRESHOLDS.private)).toBe('private')
      expect(calculateRank(RANK_THRESHOLDS.corporal)).toBe('corporal')
      expect(calculateRank(RANK_THRESHOLDS.sergeant)).toBe('sergeant')
      expect(calculateRank(RANK_THRESHOLDS.sergeant_major)).toBe('sergeant_major')
      expect(calculateRank(RANK_THRESHOLDS.lieutenant)).toBe('lieutenant')
      expect(calculateRank(RANK_THRESHOLDS.captain)).toBe('captain')
      expect(calculateRank(RANK_THRESHOLDS.major)).toBe('major')
      expect(calculateRank(RANK_THRESHOLDS.colonel)).toBe('colonel')
      expect(calculateRank(RANK_THRESHOLDS.general)).toBe('general')
    })

    it('returns the correct rank at one XP above each threshold', () => {
      expect(calculateRank(RANK_THRESHOLDS.corporal + 1)).toBe('corporal')
      expect(calculateRank(RANK_THRESHOLDS.sergeant + 1)).toBe('sergeant')
      expect(calculateRank(RANK_THRESHOLDS.sergeant_major + 1)).toBe('sergeant_major')
      expect(calculateRank(RANK_THRESHOLDS.lieutenant + 1)).toBe('lieutenant')
      expect(calculateRank(RANK_THRESHOLDS.captain + 1)).toBe('captain')
      expect(calculateRank(RANK_THRESHOLDS.major + 1)).toBe('major')
      expect(calculateRank(RANK_THRESHOLDS.colonel + 1)).toBe('colonel')
      expect(calculateRank(RANK_THRESHOLDS.general + 1)).toBe('general')
    })
  })
})

describe('calculateRankProgress', () => {
  describe('basic progress calculations at exact thresholds', () => {
    it('returns 0% progress at start of private rank (0 XP)', () => {
      const result = calculateRankProgress(0)
      expect(result.current).toBe('private')
      expect(result.next).toBe('corporal')
      expect(result.progress).toBe(0)
    })

    it('returns 0% progress at start of corporal rank (100 XP)', () => {
      const result = calculateRankProgress(100)
      expect(result.current).toBe('corporal')
      expect(result.next).toBe('sergeant')
      expect(result.progress).toBe(0)
    })

    it('returns 0% progress at start of sergeant rank (300 XP)', () => {
      const result = calculateRankProgress(300)
      expect(result.current).toBe('sergeant')
      expect(result.next).toBe('sergeant_major')
      expect(result.progress).toBe(0)
    })

    it('returns 0% progress at start of sergeant_major rank (600 XP)', () => {
      const result = calculateRankProgress(600)
      expect(result.current).toBe('sergeant_major')
      expect(result.next).toBe('lieutenant')
      expect(result.progress).toBe(0)
    })

    it('returns 0% progress at start of lieutenant rank (1000 XP)', () => {
      const result = calculateRankProgress(1000)
      expect(result.current).toBe('lieutenant')
      expect(result.next).toBe('captain')
      expect(result.progress).toBe(0)
    })

    it('returns 0% progress at start of captain rank (2000 XP)', () => {
      const result = calculateRankProgress(2000)
      expect(result.current).toBe('captain')
      expect(result.next).toBe('major')
      expect(result.progress).toBe(0)
    })

    it('returns 0% progress at start of major rank (5000 XP)', () => {
      const result = calculateRankProgress(5000)
      expect(result.current).toBe('major')
      expect(result.next).toBe('colonel')
      expect(result.progress).toBe(0)
    })

    it('returns 0% progress at start of colonel rank (10000 XP)', () => {
      const result = calculateRankProgress(10000)
      expect(result.current).toBe('colonel')
      expect(result.next).toBe('general')
      expect(result.progress).toBe(0)
    })
  })

  describe('max rank (general) handling', () => {
    it('returns 100% progress and null next rank at general (20000 XP)', () => {
      const result = calculateRankProgress(20000)
      expect(result.current).toBe('general')
      expect(result.next).toBeNull()
      expect(result.progress).toBe(100)
    })

    it('returns 100% progress and null next rank for XP above general', () => {
      const result = calculateRankProgress(50000)
      expect(result.current).toBe('general')
      expect(result.next).toBeNull()
      expect(result.progress).toBe(100)
    })

    it('returns 100% progress and null next rank for very large XP', () => {
      const result = calculateRankProgress(Number.MAX_SAFE_INTEGER)
      expect(result.current).toBe('general')
      expect(result.next).toBeNull()
      expect(result.progress).toBe(100)
    })
  })

  describe('mid-range progress calculations', () => {
    it('returns 50% progress at midpoint of private rank (50 XP)', () => {
      // private: 0-100, midpoint = 50
      const result = calculateRankProgress(50)
      expect(result.current).toBe('private')
      expect(result.next).toBe('corporal')
      expect(result.progress).toBe(50)
    })

    it('returns 50% progress at midpoint of corporal rank (200 XP)', () => {
      // corporal: 100-300, midpoint = 200
      const result = calculateRankProgress(200)
      expect(result.current).toBe('corporal')
      expect(result.next).toBe('sergeant')
      expect(result.progress).toBe(50)
    })

    it('returns 50% progress at midpoint of sergeant rank (450 XP)', () => {
      // sergeant: 300-600, midpoint = 450
      const result = calculateRankProgress(450)
      expect(result.current).toBe('sergeant')
      expect(result.next).toBe('sergeant_major')
      expect(result.progress).toBe(50)
    })

    it('returns 50% progress at midpoint of sergeant_major rank (800 XP)', () => {
      // sergeant_major: 600-1000, midpoint = 800
      const result = calculateRankProgress(800)
      expect(result.current).toBe('sergeant_major')
      expect(result.next).toBe('lieutenant')
      expect(result.progress).toBe(50)
    })

    it('returns 50% progress at midpoint of lieutenant rank (1500 XP)', () => {
      // lieutenant: 1000-2000, midpoint = 1500
      const result = calculateRankProgress(1500)
      expect(result.current).toBe('lieutenant')
      expect(result.next).toBe('captain')
      expect(result.progress).toBe(50)
    })

    it('returns 50% progress at midpoint of captain rank (3500 XP)', () => {
      // captain: 2000-5000, midpoint = 3500
      const result = calculateRankProgress(3500)
      expect(result.current).toBe('captain')
      expect(result.next).toBe('major')
      expect(result.progress).toBe(50)
    })

    it('returns 50% progress at midpoint of major rank (7500 XP)', () => {
      // major: 5000-10000, midpoint = 7500
      const result = calculateRankProgress(7500)
      expect(result.current).toBe('major')
      expect(result.next).toBe('colonel')
      expect(result.progress).toBe(50)
    })

    it('returns 50% progress at midpoint of colonel rank (15000 XP)', () => {
      // colonel: 10000-20000, midpoint = 15000
      const result = calculateRankProgress(15000)
      expect(result.current).toBe('colonel')
      expect(result.next).toBe('general')
      expect(result.progress).toBe(50)
    })
  })

  describe('progress at arbitrary XP values', () => {
    it('returns correct progress for 25 XP (25% of private)', () => {
      const result = calculateRankProgress(25)
      expect(result.current).toBe('private')
      expect(result.next).toBe('corporal')
      expect(result.progress).toBe(25)
    })

    it('returns correct progress for 75 XP (75% of private)', () => {
      const result = calculateRankProgress(75)
      expect(result.current).toBe('private')
      expect(result.next).toBe('corporal')
      expect(result.progress).toBe(75)
    })

    it('returns correct progress for 150 XP (25% of corporal)', () => {
      // corporal: 100-300, (150-100)/(300-100) = 50/200 = 25%
      const result = calculateRankProgress(150)
      expect(result.current).toBe('corporal')
      expect(result.next).toBe('sergeant')
      expect(result.progress).toBe(25)
    })

    it('returns correct progress for 250 XP (75% of corporal)', () => {
      // corporal: 100-300, (250-100)/(300-100) = 150/200 = 75%
      const result = calculateRankProgress(250)
      expect(result.current).toBe('corporal')
      expect(result.next).toBe('sergeant')
      expect(result.progress).toBe(75)
    })

    it('returns correct progress for 8000 XP (60% of major)', () => {
      // major: 5000-10000, (8000-5000)/(10000-5000) = 3000/5000 = 60%
      const result = calculateRankProgress(8000)
      expect(result.current).toBe('major')
      expect(result.next).toBe('colonel')
      expect(result.progress).toBe(60)
    })
  })

  describe('boundary values (just below next threshold)', () => {
    it('returns near 100% progress just below corporal threshold (99 XP)', () => {
      // private: 0-100, (99-0)/(100-0) = 99%
      const result = calculateRankProgress(99)
      expect(result.current).toBe('private')
      expect(result.next).toBe('corporal')
      expect(result.progress).toBe(99)
    })

    it('returns near 100% progress just below sergeant threshold (299 XP)', () => {
      // corporal: 100-300, (299-100)/(300-100) = 199/200 = 99.5%
      const result = calculateRankProgress(299)
      expect(result.current).toBe('corporal')
      expect(result.next).toBe('sergeant')
      expect(result.progress).toBeCloseTo(99.5, 1)
    })

    it('returns near 100% progress just below general threshold (19999 XP)', () => {
      // colonel: 10000-20000, (19999-10000)/(20000-10000) = 9999/10000 = 99.99%
      const result = calculateRankProgress(19999)
      expect(result.current).toBe('colonel')
      expect(result.next).toBe('general')
      expect(result.progress).toBeCloseTo(99.99, 1)
    })
  })

  describe('edge cases', () => {
    it('returns 0% progress for negative XP', () => {
      const result = calculateRankProgress(-100)
      expect(result.current).toBe('private')
      expect(result.next).toBe('corporal')
      // Progress should be clamped to 0 (Math.max(0, ...))
      expect(result.progress).toBe(0)
    })

    it('clamps progress to 0 for very negative XP', () => {
      const result = calculateRankProgress(-10000)
      expect(result.current).toBe('private')
      expect(result.next).toBe('corporal')
      expect(result.progress).toBe(0)
    })

    it('returns 1% progress for XP value of 1', () => {
      // private: 0-100, 1/100 = 1%
      const result = calculateRankProgress(1)
      expect(result.current).toBe('private')
      expect(result.next).toBe('corporal')
      expect(result.progress).toBe(1)
    })
  })

  describe('return structure validation', () => {
    it('returns object with current, next, and progress properties', () => {
      const result = calculateRankProgress(500)
      expect(result).toHaveProperty('current')
      expect(result).toHaveProperty('next')
      expect(result).toHaveProperty('progress')
    })

    it('returns progress as a number between 0 and 100', () => {
      // Test various XP values
      const testValues = [0, 50, 100, 500, 1500, 5000, 15000, 20000, 50000]
      for (const xp of testValues) {
        const result = calculateRankProgress(xp)
        expect(result.progress).toBeGreaterThanOrEqual(0)
        expect(result.progress).toBeLessThanOrEqual(100)
      }
    })

    it('returns valid rank for current property', () => {
      const validRanks = ['private', 'corporal', 'sergeant', 'sergeant_major', 'lieutenant', 'captain', 'major', 'colonel', 'general']
      const result = calculateRankProgress(1500)
      expect(validRanks).toContain(result.current)
    })

    it('returns valid rank or null for next property', () => {
      const validRanks = ['private', 'corporal', 'sergeant', 'sergeant_major', 'lieutenant', 'captain', 'major', 'colonel', 'general']

      // Non-max rank should have next
      const midResult = calculateRankProgress(1500)
      expect(validRanks).toContain(midResult.next)

      // Max rank should have null next
      const maxResult = calculateRankProgress(20000)
      expect(maxResult.next).toBeNull()
    })
  })

  describe('correct next rank assignment', () => {
    it('assigns corporal as next rank for private', () => {
      const result = calculateRankProgress(50)
      expect(result.current).toBe('private')
      expect(result.next).toBe('corporal')
    })

    it('assigns sergeant as next rank for corporal', () => {
      const result = calculateRankProgress(200)
      expect(result.current).toBe('corporal')
      expect(result.next).toBe('sergeant')
    })

    it('assigns sergeant_major as next rank for sergeant', () => {
      const result = calculateRankProgress(450)
      expect(result.current).toBe('sergeant')
      expect(result.next).toBe('sergeant_major')
    })

    it('assigns lieutenant as next rank for sergeant_major', () => {
      const result = calculateRankProgress(800)
      expect(result.current).toBe('sergeant_major')
      expect(result.next).toBe('lieutenant')
    })

    it('assigns captain as next rank for lieutenant', () => {
      const result = calculateRankProgress(1500)
      expect(result.current).toBe('lieutenant')
      expect(result.next).toBe('captain')
    })

    it('assigns major as next rank for captain', () => {
      const result = calculateRankProgress(3500)
      expect(result.current).toBe('captain')
      expect(result.next).toBe('major')
    })

    it('assigns colonel as next rank for major', () => {
      const result = calculateRankProgress(7500)
      expect(result.current).toBe('major')
      expect(result.next).toBe('colonel')
    })

    it('assigns general as next rank for colonel', () => {
      const result = calculateRankProgress(15000)
      expect(result.current).toBe('colonel')
      expect(result.next).toBe('general')
    })

    it('assigns null as next rank for general', () => {
      const result = calculateRankProgress(25000)
      expect(result.current).toBe('general')
      expect(result.next).toBeNull()
    })
  })
})
