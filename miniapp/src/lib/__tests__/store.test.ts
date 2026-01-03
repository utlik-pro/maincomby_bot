import { describe, it, expect } from 'vitest'
import { calculateRank } from '../store'
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
