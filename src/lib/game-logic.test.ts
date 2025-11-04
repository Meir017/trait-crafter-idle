import { describe, it, expect } from 'vitest'
import {
  getUnlockedItemTypes,
  calculateCustomerLevel,
  getItemLevel,
} from './game-logic'
import { ItemType } from './types'

describe('getUnlockedItemTypes', () => {
  it('returns sword when no items have been crafted', () => {
    const craftCounts: Record<ItemType, number> = {
      sword: 0,
      potion: 0,
      armor: 0,
      ring: 0,
      bow: 0
    }
    const result = getUnlockedItemTypes(craftCounts)
    expect(result).toContain('sword')
  })
})

describe('calculateCustomerLevel', () => {
  it('returns level 1 for 0 experience', () => {
    const result = calculateCustomerLevel(0)
    expect(result.level).toBe(1)
    expect(result.experienceToNext).toBe(100)
  })
})

describe('getItemLevel', () => {
  it('returns level 1 for 0 crafts', () => {
    expect(getItemLevel(0)).toBe(1)
  })
})
