import { ItemType, TraitType, ITEM_DEFINITIONS, CUSTOMER_NAMES, Customer, CustomerData } from './types'

export function getUnlockedItemTypes(craftCounts: Record<ItemType, number>): ItemType[] {
  const allItemTypes: ItemType[] = ['sword', 'potion', 'armor', 'ring', 'bow']
  return allItemTypes.filter(itemType => {
    const itemDef = ITEM_DEFINITIONS[itemType]
    if (!itemDef.unlockRequirement) return true
    
    const requiredItemType = itemDef.unlockRequirement.itemType
    const requiredCount = itemDef.unlockRequirement.count
    return craftCounts[requiredItemType] >= requiredCount
  })
}

export function calculateCustomerLevel(experience: number): { level: number; experienceToNext: number } {
  if (!isFinite(experience) || experience < 0) {
    experience = 0
  }
  
  let level = 1
  let totalExpNeeded = 0
  let expForNextLevel = 100
  
  while (experience >= totalExpNeeded + expForNextLevel && level < 100) {
    totalExpNeeded += expForNextLevel
    level++
    expForNextLevel = Math.floor(100 * Math.pow(1.5, level - 1))
  }
  
  return {
    level,
    experienceToNext: Math.max(1, expForNextLevel)
  }
}

export function generateSecondaryTraits(level: number, preferredTrait: TraitType): Partial<Record<TraitType, number>> | undefined {
  if (level < 3) return undefined
  
  const allTraits: TraitType[] = ['quality', 'speed', 'durability', 'style']
  const otherTraits = allTraits.filter(t => t !== preferredTrait)
  
  const numSecondaryTraits = level >= 7 ? 2 : level >= 5 ? 1 : level >= 3 ? 1 : 0
  
  if (numSecondaryTraits === 0) return undefined
  
  const secondaryTraits: Partial<Record<TraitType, number>> = {}
  const selectedTraits = otherTraits.sort(() => Math.random() - 0.5).slice(0, numSecondaryTraits)
  
  selectedTraits.forEach(trait => {
    const baseValue = 15 + (level * 3)
    const variance = Math.floor(Math.random() * 10)
    secondaryTraits[trait] = baseValue + variance
  })
  
  return secondaryTraits
}

export function generateCustomer(
  craftCounts: Record<ItemType, number> | undefined,
  customerDatabase: Record<string, CustomerData>
): Customer {
  const traitTypes: TraitType[] = ['quality', 'speed', 'durability', 'style']
  
  let itemTypes: ItemType[] = ['sword', 'potion', 'armor', 'ring', 'bow']
  
  if (craftCounts) {
    const unlockedItems = getUnlockedItemTypes(craftCounts)
    if (unlockedItems.length > 0) {
      itemTypes = unlockedItems
    }
  }
  
  const itemType = itemTypes[Math.floor(Math.random() * itemTypes.length)]
  const preferredTrait = traitTypes[Math.floor(Math.random() * traitTypes.length)]
  
  const availableNames = CUSTOMER_NAMES.filter(name => 
    !Object.values(customerDatabase).some(c => c.name === name) || 
    Math.random() < 0.3
  )
  
  const name = availableNames.length > 0 
    ? availableNames[Math.floor(Math.random() * availableNames.length)]
    : CUSTOMER_NAMES[Math.floor(Math.random() * CUSTOMER_NAMES.length)]
  
  const existingCustomer = Object.values(customerDatabase).find(c => c.name === name)
  
  let level = 1
  let experience = 0
  let experienceToNextLevel = 100
  
  if (existingCustomer) {
    level = existingCustomer.level
    experience = existingCustomer.experience
    experienceToNextLevel = existingCustomer.experienceToNextLevel
  }
  
  const minTraitValue = Math.floor(20 + (level * 5) + Math.random() * (10 + level * 2))
  
  const secondaryTraits = generateSecondaryTraits(level, preferredTrait)
  
  const baseReward = ITEM_DEFINITIONS[itemType].baseValue
  const levelMultiplier = 1 + (level * 0.2)
  const traitMultiplier = 1 + minTraitValue / 50
  const secondaryBonus = secondaryTraits ? Object.keys(secondaryTraits).length * 0.3 : 0
  
  const reward = Math.max(1, Math.floor(baseReward * levelMultiplier * traitMultiplier * (1 + secondaryBonus)))
  
  return {
    id: `customer-${Date.now()}-${Math.random()}`,
    name,
    itemType,
    preferredTrait,
    minTraitValue,
    secondaryTraits,
    patience: 45000,
    maxPatience: 45000,
    reward,
    arrivedAt: Date.now(),
    level,
    experience,
    experienceToNextLevel
  }
}

export function calculateItemValue(
  baseValue: number,
  traits: Record<TraitType, number>,
  preferredTrait?: TraitType
): number {
  if (!isFinite(baseValue) || baseValue < 0) baseValue = 0
  
  const totalTraits = Object.values(traits).reduce((sum, val) => {
    const safeVal = isFinite(val) && val >= 0 ? val : 0
    return sum + safeVal
  }, 0)
  
  let value = baseValue + totalTraits * 0.5
  
  if (preferredTrait && traits[preferredTrait]) {
    const traitVal = isFinite(traits[preferredTrait]) && traits[preferredTrait] >= 0 
      ? traits[preferredTrait] 
      : 0
    value += traitVal * 0.3
  }
  
  return Math.max(0, Math.floor(value))
}

export function getItemLevel(craftCount: number): number {
  const levels = [0, 10, 25, 50, 100]
  for (let i = levels.length - 1; i >= 0; i--) {
    if (craftCount >= levels[i]) {
      return i + 1
    }
  }
  return 1
}

export function getNextLevelThreshold(craftCount: number): number | null {
  const levels = [10, 25, 50, 100]
  for (const threshold of levels) {
    if (craftCount < threshold) {
      return threshold
    }
  }
  return null
}

export function calculateResourceRegen(lastUpdate: number, currentTime: number): number {
  const timeDiff = currentTime - lastUpdate
  return Math.floor(timeDiff / 1000)
}

export function calculateCraftTime(
  baseTime: number,
  itemLevel: number,
  speedMultiplier: number
): number {
  if (!isFinite(baseTime) || baseTime <= 0) baseTime = 1000
  if (!isFinite(itemLevel) || itemLevel < 1) itemLevel = 1
  if (!isFinite(speedMultiplier) || speedMultiplier <= 0) speedMultiplier = 1
  
  const levelBonus = Math.max(0.5, 1 - (itemLevel - 1) * 0.1)
  const result = Math.floor(baseTime * speedMultiplier * levelBonus)
  return Math.max(100, result)
}

export function calculateOptimalTraits(
  customer: Customer,
  availableResources: number
): { traits: Record<TraitType, number>; totalCost: number } {
  const preferredTrait = customer.preferredTrait
  const minValue = isFinite(customer.minTraitValue) && customer.minTraitValue > 0 
    ? customer.minTraitValue 
    : 20
  
  if (!isFinite(availableResources) || availableResources < 0) {
    availableResources = 0
  }
  
  let primaryAmount = Math.floor(minValue * 1.5)
  
  const traits: Record<TraitType, number> = {
    quality: 0,
    speed: 0,
    durability: 0,
    style: 0
  }
  
  traits[preferredTrait] = primaryAmount
  
  let totalCost = primaryAmount
  
  if (customer.secondaryTraits) {
    for (const [trait, value] of Object.entries(customer.secondaryTraits)) {
      const traitKey = trait as TraitType
      const safeValue = isFinite(value) && value > 0 ? value : 0
      const requiredAmount = Math.floor(safeValue * 1.2)
      traits[traitKey] = requiredAmount
      totalCost += requiredAmount
    }
  }
  
  const remainingResources = Math.max(0, availableResources - totalCost)
  
  if (remainingResources > 0) {
    const allTraits: TraitType[] = ['quality', 'speed', 'durability', 'style']
    const unallocatedTraits = allTraits.filter(t => 
      t !== preferredTrait && (!customer.secondaryTraits || !(t in customer.secondaryTraits))
    )
    
    if (unallocatedTraits.length > 0) {
      const perOtherTrait = Math.floor(remainingResources / unallocatedTraits.length)
      unallocatedTraits.forEach(trait => {
        traits[trait] = perOtherTrait
      })
      totalCost += perOtherTrait * unallocatedTraits.length
    }
  }
  
  return { traits, totalCost: Math.max(0, totalCost) }
}

export function getQualityInfo(totalTraits: number): { 
  tier: 'legendary' | 'rare' | 'uncommon' | 'common'
  label: string
  color: string
  borderClass: string
  badgeVariant: 'default' | 'secondary' | 'outline'
  bgGradient: string
} {
  if (totalTraits > 200) {
    return {
      tier: 'legendary',
      label: 'Legendary',
      color: 'text-accent',
      borderClass: 'border-accent shadow-lg shadow-accent/20',
      badgeVariant: 'default',
      bgGradient: 'bg-gradient-to-br from-accent/10 to-accent/5'
    }
  }
  if (totalTraits > 150) {
    return {
      tier: 'rare',
      label: 'Rare',
      color: 'text-primary',
      borderClass: 'border-primary shadow-md shadow-primary/20',
      badgeVariant: 'default',
      bgGradient: 'bg-gradient-to-br from-primary/10 to-primary/5'
    }
  }
  if (totalTraits > 100) {
    return {
      tier: 'uncommon',
      label: 'Uncommon',
      color: 'text-success',
      borderClass: 'border-success shadow-sm shadow-success/10',
      badgeVariant: 'secondary',
      bgGradient: 'bg-gradient-to-br from-success/10 to-success/5'
    }
  }
  return {
    tier: 'common',
    label: 'Common',
    color: 'text-muted-foreground',
    borderClass: 'border-border',
    badgeVariant: 'outline',
    bgGradient: 'bg-card'
  }
}
