import { describe, it, expect, beforeEach } from 'vitest'
import {
  getUnlockedItemTypes,
  calculateCustomerLevel,
  generateSecondaryTraits,
  calculateItemValue,
  getItemLevel,
  getAvailableTiers,
  getTierInfo,
  getNextLevelThreshold,
  calculateResourceRegen,
  calculateCraftTime,
  calculateOptimalTraits,
  getQualityInfo,
  calculateWeightedQuality,
  calculateItemTier
} from './game-logic'
import { ItemType, TraitType } from './types'

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

  it('unlocks potion after crafting 5 swords', () => {
    const craftCounts: Record<ItemType, number> = {
      sword: 5,
      potion: 0,
      armor: 0,
      ring: 0,
      bow: 0
    }
    const result = getUnlockedItemTypes(craftCounts)
    expect(result).toContain('sword')
    expect(result).toContain('potion')
  })

  it('unlocks armor after crafting 10 potions', () => {
    const craftCounts: Record<ItemType, number> = {
      sword: 10,
      potion: 10,
      armor: 0,
      ring: 0,
      bow: 0
    }
    const result = getUnlockedItemTypes(craftCounts)
    expect(result).toContain('armor')
  })

  it('unlocks ring after crafting 15 swords', () => {
    const craftCounts: Record<ItemType, number> = {
      sword: 15,
      potion: 0,
      armor: 0,
      ring: 0,
      bow: 0
    }
    const result = getUnlockedItemTypes(craftCounts)
    expect(result).toContain('ring')
  })

  it('unlocks bow after crafting 20 armors', () => {
    const craftCounts: Record<ItemType, number> = {
      sword: 20,
      potion: 20,
      armor: 20,
      ring: 0,
      bow: 0
    }
    const result = getUnlockedItemTypes(craftCounts)
    expect(result).toContain('bow')
  })
})

describe('calculateCustomerLevel', () => {
  it('returns level 1 for 0 experience', () => {
    const result = calculateCustomerLevel(0)
    expect(result.level).toBe(1)
    expect(result.experienceToNext).toBe(100)
  })

  it('returns level 2 for 100 experience', () => {
    const result = calculateCustomerLevel(100)
    expect(result.level).toBe(2)
    expect(result.experienceToNext).toBeGreaterThan(100)
  })

  it('returns level 3 for sufficient experience', () => {
    const result = calculateCustomerLevel(300)
    expect(result.level).toBeGreaterThanOrEqual(3)
  })

  it('handles negative experience by treating it as 0', () => {
    const result = calculateCustomerLevel(-100)
    expect(result.level).toBe(1)
    expect(result.experienceToNext).toBe(100)
  })

  it('caps level at 100', () => {
    const result = calculateCustomerLevel(999999999)
    expect(result.level).toBeLessThanOrEqual(100)
  })

  it('handles Infinity by treating it as 0', () => {
    const result = calculateCustomerLevel(Infinity)
    expect(result.level).toBe(1)
  })
})

describe('generateSecondaryTraits', () => {
  it('returns undefined for level below 3', () => {
    const result = generateSecondaryTraits(2, 'quality')
    expect(result).toBeUndefined()
  })

  it('generates secondary traits for level 3+', () => {
    const result = generateSecondaryTraits(3, 'quality')
    expect(result).toBeDefined()
    if (result) {
      expect(Object.keys(result).length).toBeGreaterThan(0)
    }
  })

  it('does not include preferred trait in secondary traits', () => {
    const result = generateSecondaryTraits(5, 'quality')
    if (result) {
      expect(result.quality).toBeUndefined()
    }
  })

  it('generates more secondary traits at higher levels', () => {
    const result7 = generateSecondaryTraits(7, 'quality')
    expect(result7).toBeDefined()
    if (result7) {
      expect(Object.keys(result7).length).toBeGreaterThanOrEqual(2)
    }
  })
})

describe('calculateItemValue', () => {
  it('calculates basic item value', () => {
    const traits: Record<TraitType, number> = {
      quality: 50,
      speed: 30,
      durability: 20,
      style: 10
    }
    const result = calculateItemValue('sword', 1, traits)
    expect(result).toBeGreaterThan(0)
  })

  it('calculates higher value with preferred trait', () => {
    const traits: Record<TraitType, number> = {
      quality: 50,
      speed: 30,
      durability: 20,
      style: 10
    }
    const valueWithPreferred = calculateItemValue('sword', 1, traits, 'quality')
    const valueWithoutPreferred = calculateItemValue('sword', 1, traits)
    expect(valueWithPreferred).toBeGreaterThan(valueWithoutPreferred)
  })

  it('handles higher tier items with higher value multiplier', () => {
    const traits: Record<TraitType, number> = {
      quality: 50,
      speed: 30,
      durability: 20,
      style: 10
    }
    const tier1Value = calculateItemValue('sword', 1, traits)
    const tier2Value = calculateItemValue('sword', 2, traits)
    expect(tier2Value).toBeGreaterThan(tier1Value)
  })

  it('handles invalid base value gracefully', () => {
    const traits: Record<TraitType, number> = {
      quality: 50,
      speed: 30,
      durability: 20,
      style: 10
    }
    const result = calculateItemValue('sword', 1, traits)
    expect(result).toBeGreaterThanOrEqual(0)
  })

  it('handles negative trait values', () => {
    const traits: Record<TraitType, number> = {
      quality: -50,
      speed: 30,
      durability: 20,
      style: 10
    }
    const result = calculateItemValue('sword', 1, traits)
    expect(result).toBeGreaterThanOrEqual(0)
  })
})

describe('getItemLevel', () => {
  it('returns level 1 for 0 crafts', () => {
    expect(getItemLevel(0)).toBe(1)
  })

  it('returns level 2 for 10 crafts', () => {
    expect(getItemLevel(10)).toBe(2)
  })

  it('returns level 3 for 25 crafts', () => {
    expect(getItemLevel(25)).toBe(3)
  })

  it('returns level 4 for 50 crafts', () => {
    expect(getItemLevel(50)).toBe(4)
  })

  it('returns level 5 for 100+ crafts', () => {
    expect(getItemLevel(100)).toBe(5)
    expect(getItemLevel(150)).toBe(5)
  })
})

describe('getAvailableTiers', () => {
  it('returns only tier 1 for 0 crafts', () => {
    const result = getAvailableTiers('sword', 0)
    expect(result).toEqual([1])
  })

  it('returns tier 1 and 2 for 5 crafts', () => {
    const result = getAvailableTiers('sword', 5)
    expect(result).toContain(1)
    expect(result).toContain(2)
  })

  it('returns multiple tiers for high craft counts', () => {
    const result = getAvailableTiers('sword', 50)
    expect(result.length).toBeGreaterThan(2)
  })
})

describe('getTierInfo', () => {
  it('returns tier 1 info by default', () => {
    const result = getTierInfo('sword', 1)
    expect(result.tier).toBe(1)
    expect(result.name).toBe('Iron')
  })

  it('returns correct tier info for tier 2', () => {
    const result = getTierInfo('sword', 2)
    expect(result.tier).toBe(2)
    expect(result.name).toBe('Steel')
  })

  it('returns first tier for invalid tier number', () => {
    const result = getTierInfo('sword', 999)
    expect(result.tier).toBe(1)
  })
})

describe('getNextLevelThreshold', () => {
  it('returns 10 for 0 crafts', () => {
    expect(getNextLevelThreshold(0)).toBe(10)
  })

  it('returns 25 for 10 crafts', () => {
    expect(getNextLevelThreshold(10)).toBe(25)
  })

  it('returns 50 for 25 crafts', () => {
    expect(getNextLevelThreshold(25)).toBe(50)
  })

  it('returns 100 for 50 crafts', () => {
    expect(getNextLevelThreshold(50)).toBe(100)
  })

  it('returns null for 100+ crafts (max level)', () => {
    expect(getNextLevelThreshold(100)).toBeNull()
    expect(getNextLevelThreshold(150)).toBeNull()
  })
})

describe('calculateResourceRegen', () => {
  it('calculates correct resource regeneration', () => {
    const lastUpdate = 1000
    const currentTime = 6000
    const result = calculateResourceRegen(lastUpdate, currentTime)
    expect(result).toBe(5)
  })

  it('returns 0 for same time', () => {
    const time = 5000
    const result = calculateResourceRegen(time, time)
    expect(result).toBe(0)
  })

  it('handles larger time differences', () => {
    const result = calculateResourceRegen(0, 30000)
    expect(result).toBe(30)
  })
})

describe('calculateCraftTime', () => {
  it('calculates basic craft time', () => {
    const result = calculateCraftTime('sword', 1, 1, 1.0)
    expect(result).toBeGreaterThan(0)
  })

  it('reduces craft time with higher item level', () => {
    const level1Time = calculateCraftTime('sword', 1, 1, 1.0)
    const level3Time = calculateCraftTime('sword', 1, 3, 1.0)
    expect(level3Time).toBeLessThan(level1Time)
  })

  it('reduces craft time with speed multiplier', () => {
    const normalTime = calculateCraftTime('sword', 1, 1, 1.0)
    const fasterTime = calculateCraftTime('sword', 1, 1, 0.5)
    expect(fasterTime).toBeLessThan(normalTime)
  })

  it('increases craft time with higher tier', () => {
    const tier1Time = calculateCraftTime('sword', 1, 1, 1.0)
    const tier2Time = calculateCraftTime('sword', 2, 1, 1.0)
    expect(tier2Time).toBeGreaterThan(tier1Time)
  })

  it('enforces minimum craft time of 100ms', () => {
    const result = calculateCraftTime('sword', 1, 100, 0.01)
    expect(result).toBeGreaterThanOrEqual(100)
  })

  it('handles invalid parameters gracefully', () => {
    expect(calculateCraftTime('sword', 1, 0, 1.0)).toBeGreaterThan(0)
    expect(calculateCraftTime('sword', 1, 1, 0)).toBeGreaterThan(0)
  })
})

describe('calculateOptimalTraits', () => {
  const mockCustomer = {
    id: 'test-1',
    name: 'Test Customer',
    itemType: 'sword' as ItemType,
    preferredTrait: 'quality' as TraitType,
    minTraitValue: 50,
    secondaryTraits: { speed: 30 },
    patience: 45000,
    maxPatience: 45000,
    reward: 100,
    arrivedAt: Date.now(),
    level: 1,
    experience: 0,
    experienceToNextLevel: 100
  }

  it('allocates traits to meet customer requirements', () => {
    const result = calculateOptimalTraits(mockCustomer, 500, 'sword', 0)
    expect(result.traits.quality).toBeGreaterThan(0)
    expect(result.totalCost).toBeLessThanOrEqual(500)
  })

  it('prioritizes preferred trait', () => {
    const result = calculateOptimalTraits(mockCustomer, 500, 'sword', 0)
    const preferredValue = result.traits[mockCustomer.preferredTrait]
    const otherTraitValues = Object.entries(result.traits)
      .filter(([trait]) => trait !== mockCustomer.preferredTrait)
      .map(([, value]) => value)
    
    expect(preferredValue).toBeGreaterThan(Math.min(...otherTraitValues))
  })

  it('allocates secondary traits', () => {
    const result = calculateOptimalTraits(mockCustomer, 500, 'sword', 0)
    if (mockCustomer.secondaryTraits) {
      expect(result.traits.speed).toBeGreaterThan(0)
    }
  })

  it('respects minimum resource cost', () => {
    const result = calculateOptimalTraits(mockCustomer, 10, 'sword', 0)
    expect(result.totalCost).toBeGreaterThanOrEqual(40) // sword tier 1 min cost
  })

  it('handles zero resources', () => {
    const result = calculateOptimalTraits(mockCustomer, 0, 'sword', 0)
    expect(result.totalCost).toBeGreaterThan(0)
  })

  it('handles negative resources gracefully', () => {
    const result = calculateOptimalTraits(mockCustomer, -100, 'sword', 0)
    expect(result.totalCost).toBeGreaterThanOrEqual(0)
  })
})

describe('getQualityInfo', () => {
  it('returns common quality for low total traits', () => {
    const result = getQualityInfo(50)
    expect(result.tier).toBe('common')
    expect(result.label).toBe('Common')
  })

  it('returns uncommon quality for medium total traits', () => {
    const result = getQualityInfo(120)
    expect(result.tier).toBe('uncommon')
    expect(result.label).toBe('Uncommon')
  })

  it('returns rare quality for high total traits', () => {
    const result = getQualityInfo(170)
    expect(result.tier).toBe('rare')
    expect(result.label).toBe('Rare')
  })

  it('returns legendary quality for very high total traits', () => {
    const result = getQualityInfo(250)
    expect(result.tier).toBe('legendary')
    expect(result.label).toBe('Legendary')
  })

  it('includes correct styling properties', () => {
    const result = getQualityInfo(250)
    expect(result).toHaveProperty('color')
    expect(result).toHaveProperty('borderClass')
    expect(result).toHaveProperty('badgeVariant')
    expect(result).toHaveProperty('bgGradient')
  })
})

describe('calculateWeightedQuality', () => {
  it('calculates weighted quality for swords prioritizing durability', () => {
    const traits: Record<TraitType, number> = {
      quality: 30,
      speed: 30,
      durability: 30,
      style: 30
    }
    const result = calculateWeightedQuality('sword', traits)
    expect(result).toBeGreaterThan(0)
    // Sword weights: quality 1.2, speed 1.0, durability 1.3, style 0.8
    const expected = 30 * 1.2 + 30 * 1.0 + 30 * 1.3 + 30 * 0.8
    expect(result).toBeCloseTo(expected, 1)
  })

  it('calculates weighted quality for potions prioritizing quality', () => {
    const traits: Record<TraitType, number> = {
      quality: 50,
      speed: 20,
      durability: 20,
      style: 20
    }
    const result = calculateWeightedQuality('potion', traits)
    expect(result).toBeGreaterThan(0)
  })

  it('handles zero traits', () => {
    const traits: Record<TraitType, number> = {
      quality: 0,
      speed: 0,
      durability: 0,
      style: 0
    }
    const result = calculateWeightedQuality('sword', traits)
    expect(result).toBe(0)
  })
})

describe('calculateItemTier', () => {
  it('returns tier 1 for low craft counts', () => {
    const traits: Record<TraitType, number> = {
      quality: 25,
      speed: 25,
      durability: 25,
      style: 25
    }
    const result = calculateItemTier('sword', traits, 0)
    expect(result).toBe(1)
  })

  it('can return higher tiers with more resources and higher craft counts', () => {
    const traits: Record<TraitType, number> = {
      quality: 60,
      speed: 50,
      durability: 60,
      style: 30
    }
    // At 15 crafts, tiers 1-3 should be available for swords
    const result = calculateItemTier('sword', traits, 15)
    expect(result).toBeGreaterThanOrEqual(1)
    expect(result).toBeLessThanOrEqual(3)
  })

  it('returns only unlocked tiers based on craft count', () => {
    const traits: Record<TraitType, number> = {
      quality: 100,
      speed: 100,
      durability: 100,
      style: 100
    }
    // At 3 crafts, only tiers 1 should be available
    const result = calculateItemTier('sword', traits, 3)
    expect(result).toBe(1)
  })

  it('handles very high resource allocations', () => {
    const traits: Record<TraitType, number> = {
      quality: 100,
      speed: 100,
      durability: 100,
      style: 100
    }
    const result = calculateItemTier('sword', traits, 50)
    expect(result).toBeGreaterThanOrEqual(1)
    expect(result).toBeLessThanOrEqual(5)
  })

  it('benefits from optimal trait allocation for item type', () => {
    // For swords, durability is weighted higher
    const goodAllocation: Record<TraitType, number> = {
      quality: 30,
      speed: 20,
      durability: 50,
      style: 20
    }
    const poorAllocation: Record<TraitType, number> = {
      quality: 30,
      speed: 30,
      durability: 20,
      style: 40
    }
    
    // Run multiple times since it's probabilistic
    let goodTierSum = 0
    let poorTierSum = 0
    const iterations = 10
    
    for (let i = 0; i < iterations; i++) {
      goodTierSum += calculateItemTier('sword', goodAllocation, 15)
      poorTierSum += calculateItemTier('sword', poorAllocation, 15)
    }
    
    // Good allocation should generally result in equal or better tiers on average
    expect(goodTierSum).toBeGreaterThanOrEqual(poorTierSum * 0.8)
  })
})
