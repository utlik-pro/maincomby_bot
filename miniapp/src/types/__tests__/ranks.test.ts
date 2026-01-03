import { describe, it, expect } from 'vitest'
import {
  RANK_THRESHOLDS,
  RANK_LABELS,
  XP_REWARDS,
  type UserRank,
} from '../index'

describe('RANK_THRESHOLDS', () => {
  const rankOrder: UserRank[] = [
    'private',
    'corporal',
    'sergeant',
    'sergeant_major',
    'lieutenant',
    'captain',
    'major',
    'colonel',
    'general',
  ]

  describe('structure and completeness', () => {
    it('defines thresholds for all 9 ranks', () => {
      expect(Object.keys(RANK_THRESHOLDS)).toHaveLength(9)
    })

    it('has entry for each rank in the expected order', () => {
      for (const rank of rankOrder) {
        expect(RANK_THRESHOLDS).toHaveProperty(rank)
      }
    })

    it('has private rank starting at 0 XP', () => {
      expect(RANK_THRESHOLDS.private).toBe(0)
    })

    it('has corporal rank at 100 XP', () => {
      expect(RANK_THRESHOLDS.corporal).toBe(100)
    })

    it('has sergeant rank at 300 XP', () => {
      expect(RANK_THRESHOLDS.sergeant).toBe(300)
    })

    it('has sergeant_major rank at 600 XP', () => {
      expect(RANK_THRESHOLDS.sergeant_major).toBe(600)
    })

    it('has lieutenant rank at 1000 XP', () => {
      expect(RANK_THRESHOLDS.lieutenant).toBe(1000)
    })

    it('has captain rank at 2000 XP', () => {
      expect(RANK_THRESHOLDS.captain).toBe(2000)
    })

    it('has major rank at 5000 XP', () => {
      expect(RANK_THRESHOLDS.major).toBe(5000)
    })

    it('has colonel rank at 10000 XP', () => {
      expect(RANK_THRESHOLDS.colonel).toBe(10000)
    })

    it('has general rank at 20000 XP', () => {
      expect(RANK_THRESHOLDS.general).toBe(20000)
    })
  })

  describe('ordering and progression', () => {
    it('thresholds are in strictly ascending order', () => {
      const thresholds = rankOrder.map((rank) => RANK_THRESHOLDS[rank])
      for (let i = 1; i < thresholds.length; i++) {
        expect(thresholds[i]).toBeGreaterThan(thresholds[i - 1])
      }
    })

    it('all thresholds are non-negative integers', () => {
      for (const rank of rankOrder) {
        const threshold = RANK_THRESHOLDS[rank]
        expect(threshold).toBeGreaterThanOrEqual(0)
        expect(Number.isInteger(threshold)).toBe(true)
      }
    })

    it('first rank starts at 0', () => {
      const firstRank = rankOrder[0]
      expect(RANK_THRESHOLDS[firstRank]).toBe(0)
    })

    it('highest rank (general) has threshold of 20000', () => {
      const lastRank = rankOrder[rankOrder.length - 1]
      expect(lastRank).toBe('general')
      expect(RANK_THRESHOLDS[lastRank]).toBe(20000)
    })
  })

  describe('rank gaps (XP needed to reach next rank)', () => {
    it('private to corporal requires 100 XP', () => {
      const gap = RANK_THRESHOLDS.corporal - RANK_THRESHOLDS.private
      expect(gap).toBe(100)
    })

    it('corporal to sergeant requires 200 XP', () => {
      const gap = RANK_THRESHOLDS.sergeant - RANK_THRESHOLDS.corporal
      expect(gap).toBe(200)
    })

    it('sergeant to sergeant_major requires 300 XP', () => {
      const gap = RANK_THRESHOLDS.sergeant_major - RANK_THRESHOLDS.sergeant
      expect(gap).toBe(300)
    })

    it('sergeant_major to lieutenant requires 400 XP', () => {
      const gap = RANK_THRESHOLDS.lieutenant - RANK_THRESHOLDS.sergeant_major
      expect(gap).toBe(400)
    })

    it('lieutenant to captain requires 1000 XP', () => {
      const gap = RANK_THRESHOLDS.captain - RANK_THRESHOLDS.lieutenant
      expect(gap).toBe(1000)
    })

    it('captain to major requires 3000 XP', () => {
      const gap = RANK_THRESHOLDS.major - RANK_THRESHOLDS.captain
      expect(gap).toBe(3000)
    })

    it('major to colonel requires 5000 XP', () => {
      const gap = RANK_THRESHOLDS.colonel - RANK_THRESHOLDS.major
      expect(gap).toBe(5000)
    })

    it('colonel to general requires 10000 XP', () => {
      const gap = RANK_THRESHOLDS.general - RANK_THRESHOLDS.colonel
      expect(gap).toBe(10000)
    })

    it('gaps increase progressively (harder to advance at higher ranks)', () => {
      const gaps: number[] = []
      for (let i = 1; i < rankOrder.length; i++) {
        const gap = RANK_THRESHOLDS[rankOrder[i]] - RANK_THRESHOLDS[rankOrder[i - 1]]
        gaps.push(gap)
      }
      // Verify gaps generally increase (progressive difficulty)
      // Note: gaps are [100, 200, 300, 400, 1000, 3000, 5000, 10000]
      for (let i = 1; i < gaps.length; i++) {
        expect(gaps[i]).toBeGreaterThanOrEqual(gaps[i - 1])
      }
    })
  })
})

describe('RANK_LABELS', () => {
  const allRanks: UserRank[] = [
    'private',
    'corporal',
    'sergeant',
    'sergeant_major',
    'lieutenant',
    'captain',
    'major',
    'colonel',
    'general',
  ]

  describe('structure and completeness', () => {
    it('defines labels for all 9 ranks', () => {
      expect(Object.keys(RANK_LABELS)).toHaveLength(9)
    })

    it('has entry for each rank', () => {
      for (const rank of allRanks) {
        expect(RANK_LABELS).toHaveProperty(rank)
      }
    })

    it('each rank has ru (Russian) label property', () => {
      for (const rank of allRanks) {
        expect(RANK_LABELS[rank]).toHaveProperty('ru')
        expect(typeof RANK_LABELS[rank].ru).toBe('string')
        expect(RANK_LABELS[rank].ru.length).toBeGreaterThan(0)
      }
    })

    it('each rank has emoji property', () => {
      for (const rank of allRanks) {
        expect(RANK_LABELS[rank]).toHaveProperty('emoji')
        expect(typeof RANK_LABELS[rank].emoji).toBe('string')
        expect(RANK_LABELS[rank].emoji.length).toBeGreaterThan(0)
      }
    })
  })

  describe('Russian labels', () => {
    it('private has Russian label "Рядовой"', () => {
      expect(RANK_LABELS.private.ru).toBe('Рядовой')
    })

    it('corporal has Russian label "Ефрейтор"', () => {
      expect(RANK_LABELS.corporal.ru).toBe('Ефрейтор')
    })

    it('sergeant has Russian label "Сержант"', () => {
      expect(RANK_LABELS.sergeant.ru).toBe('Сержант')
    })

    it('sergeant_major has Russian label "Старшина"', () => {
      expect(RANK_LABELS.sergeant_major.ru).toBe('Старшина')
    })

    it('lieutenant has Russian label "Лейтенант"', () => {
      expect(RANK_LABELS.lieutenant.ru).toBe('Лейтенант')
    })

    it('captain has Russian label "Капитан"', () => {
      expect(RANK_LABELS.captain.ru).toBe('Капитан')
    })

    it('major has Russian label "Майор"', () => {
      expect(RANK_LABELS.major.ru).toBe('Майор')
    })

    it('colonel has Russian label "Полковник"', () => {
      expect(RANK_LABELS.colonel.ru).toBe('Полковник')
    })

    it('general has Russian label "Генерал"', () => {
      expect(RANK_LABELS.general.ru).toBe('Генерал')
    })
  })

  describe('emojis', () => {
    it('private has beginner emoji', () => {
      expect(RANK_LABELS.private.emoji).toBe('🔰')
    })

    it('corporal has single star emoji', () => {
      expect(RANK_LABELS.corporal.emoji).toBe('⭐')
    })

    it('sergeant has double star emoji', () => {
      expect(RANK_LABELS.sergeant.emoji).toBe('⭐⭐')
    })

    it('sergeant_major has medal emoji', () => {
      expect(RANK_LABELS.sergeant_major.emoji).toBe('🎖️')
    })

    it('lieutenant has sports medal emoji', () => {
      expect(RANK_LABELS.lieutenant.emoji).toBe('🏅')
    })

    it('captain has ribbon emoji', () => {
      expect(RANK_LABELS.captain.emoji).toBe('🎗️')
    })

    it('major has crown emoji', () => {
      expect(RANK_LABELS.major.emoji).toBe('👑')
    })

    it('colonel has triple star emoji', () => {
      expect(RANK_LABELS.colonel.emoji).toBe('⭐⭐⭐')
    })

    it('general has medal and crown combo emoji', () => {
      expect(RANK_LABELS.general.emoji).toBe('🎖️👑')
    })
  })

  describe('consistency with RANK_THRESHOLDS', () => {
    it('RANK_LABELS has same keys as RANK_THRESHOLDS', () => {
      const labelKeys = Object.keys(RANK_LABELS).sort()
      const thresholdKeys = Object.keys(RANK_THRESHOLDS).sort()
      expect(labelKeys).toEqual(thresholdKeys)
    })
  })
})

describe('XP_REWARDS', () => {
  describe('structure and completeness', () => {
    it('defines rewards for all 7 action types', () => {
      expect(Object.keys(XP_REWARDS)).toHaveLength(7)
    })

    it('has EVENT_REGISTER reward', () => {
      expect(XP_REWARDS).toHaveProperty('EVENT_REGISTER')
    })

    it('has EVENT_CHECKIN reward', () => {
      expect(XP_REWARDS).toHaveProperty('EVENT_CHECKIN')
    })

    it('has FEEDBACK_SUBMIT reward', () => {
      expect(XP_REWARDS).toHaveProperty('FEEDBACK_SUBMIT')
    })

    it('has MATCH_RECEIVED reward', () => {
      expect(XP_REWARDS).toHaveProperty('MATCH_RECEIVED')
    })

    it('has FRIEND_INVITE reward', () => {
      expect(XP_REWARDS).toHaveProperty('FRIEND_INVITE')
    })

    it('has PROFILE_COMPLETE reward', () => {
      expect(XP_REWARDS).toHaveProperty('PROFILE_COMPLETE')
    })

    it('has FIRST_SWIPE reward', () => {
      expect(XP_REWARDS).toHaveProperty('FIRST_SWIPE')
    })
  })

  describe('reward values', () => {
    it('EVENT_REGISTER gives 10 XP', () => {
      expect(XP_REWARDS.EVENT_REGISTER).toBe(10)
    })

    it('EVENT_CHECKIN gives 50 XP', () => {
      expect(XP_REWARDS.EVENT_CHECKIN).toBe(50)
    })

    it('FEEDBACK_SUBMIT gives 20 XP', () => {
      expect(XP_REWARDS.FEEDBACK_SUBMIT).toBe(20)
    })

    it('MATCH_RECEIVED gives 15 XP', () => {
      expect(XP_REWARDS.MATCH_RECEIVED).toBe(15)
    })

    it('FRIEND_INVITE gives 30 XP', () => {
      expect(XP_REWARDS.FRIEND_INVITE).toBe(30)
    })

    it('PROFILE_COMPLETE gives 25 XP', () => {
      expect(XP_REWARDS.PROFILE_COMPLETE).toBe(25)
    })

    it('FIRST_SWIPE gives 5 XP', () => {
      expect(XP_REWARDS.FIRST_SWIPE).toBe(5)
    })
  })

  describe('value constraints', () => {
    it('all rewards are positive integers', () => {
      for (const [action, reward] of Object.entries(XP_REWARDS)) {
        expect(reward).toBeGreaterThan(0)
        expect(Number.isInteger(reward)).toBe(true)
      }
    })

    it('all rewards are reasonable (between 1 and 1000)', () => {
      for (const [action, reward] of Object.entries(XP_REWARDS)) {
        expect(reward).toBeGreaterThanOrEqual(1)
        expect(reward).toBeLessThanOrEqual(1000)
      }
    })

    it('EVENT_CHECKIN reward is greater than EVENT_REGISTER (attending > registering)', () => {
      expect(XP_REWARDS.EVENT_CHECKIN).toBeGreaterThan(XP_REWARDS.EVENT_REGISTER)
    })

    it('FIRST_SWIPE is the smallest reward (simple action)', () => {
      const allRewards = Object.values(XP_REWARDS)
      const minReward = Math.min(...allRewards)
      expect(XP_REWARDS.FIRST_SWIPE).toBe(minReward)
    })

    it('EVENT_CHECKIN is the largest reward (most valuable action)', () => {
      const allRewards = Object.values(XP_REWARDS)
      const maxReward = Math.max(...allRewards)
      expect(XP_REWARDS.EVENT_CHECKIN).toBe(maxReward)
    })
  })

  describe('XP reward ranking', () => {
    it('rewards are ordered from smallest to largest correctly', () => {
      const sortedRewards = Object.entries(XP_REWARDS)
        .map(([action, reward]) => ({ action, reward }))
        .sort((a, b) => a.reward - b.reward)

      // Expected order: FIRST_SWIPE(5) < EVENT_REGISTER(10) < MATCH_RECEIVED(15) < FEEDBACK_SUBMIT(20) < PROFILE_COMPLETE(25) < FRIEND_INVITE(30) < EVENT_CHECKIN(50)
      expect(sortedRewards[0].action).toBe('FIRST_SWIPE')
      expect(sortedRewards[0].reward).toBe(5)

      expect(sortedRewards[1].action).toBe('EVENT_REGISTER')
      expect(sortedRewards[1].reward).toBe(10)

      expect(sortedRewards[2].action).toBe('MATCH_RECEIVED')
      expect(sortedRewards[2].reward).toBe(15)

      expect(sortedRewards[3].action).toBe('FEEDBACK_SUBMIT')
      expect(sortedRewards[3].reward).toBe(20)

      expect(sortedRewards[4].action).toBe('PROFILE_COMPLETE')
      expect(sortedRewards[4].reward).toBe(25)

      expect(sortedRewards[5].action).toBe('FRIEND_INVITE')
      expect(sortedRewards[5].reward).toBe(30)

      expect(sortedRewards[6].action).toBe('EVENT_CHECKIN')
      expect(sortedRewards[6].reward).toBe(50)
    })
  })

  describe('XP progression scenarios', () => {
    it('registering for 10 events reaches corporal threshold (100 XP)', () => {
      const eventsNeeded = RANK_THRESHOLDS.corporal / XP_REWARDS.EVENT_REGISTER
      expect(eventsNeeded).toBe(10)
    })

    it('checking into 2 events reaches corporal threshold (100 XP)', () => {
      const checkinsNeeded = RANK_THRESHOLDS.corporal / XP_REWARDS.EVENT_CHECKIN
      expect(checkinsNeeded).toBe(2)
    })

    it('submitting 5 feedbacks reaches corporal threshold (100 XP)', () => {
      const feedbacksNeeded = RANK_THRESHOLDS.corporal / XP_REWARDS.FEEDBACK_SUBMIT
      expect(feedbacksNeeded).toBe(5)
    })

    it('receiving 20 matches reaches sergeant threshold (300 XP)', () => {
      const matchesNeeded = RANK_THRESHOLDS.sergeant / XP_REWARDS.MATCH_RECEIVED
      expect(matchesNeeded).toBe(20)
    })

    it('combined actions can reach general rank', () => {
      // Calculate a realistic path to general (20000 XP)
      const xpFromEvents = 50 * XP_REWARDS.EVENT_CHECKIN // 50 events attended = 2500 XP
      const xpFromFeedback = 50 * XP_REWARDS.FEEDBACK_SUBMIT // 50 feedbacks = 1000 XP
      const xpFromMatches = 100 * XP_REWARDS.MATCH_RECEIVED // 100 matches = 1500 XP
      const xpFromInvites = 200 * XP_REWARDS.FRIEND_INVITE // 200 invites = 6000 XP
      const xpFromRegistrations = 300 * XP_REWARDS.EVENT_REGISTER // 300 registrations = 3000 XP
      const oneTimeXp = XP_REWARDS.PROFILE_COMPLETE + XP_REWARDS.FIRST_SWIPE // 30 XP

      const totalXp = xpFromEvents + xpFromFeedback + xpFromMatches + xpFromInvites + xpFromRegistrations + oneTimeXp

      expect(totalXp).toBeGreaterThanOrEqual(RANK_THRESHOLDS.general)
    })
  })
})
