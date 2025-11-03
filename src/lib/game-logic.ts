import { ItemType, TraitType, ITEM_DEFINITIONS, CUSTOMER_NAMES, Customer } from './types'

export function generateCustomer(): Customer {
  const itemTypes: ItemType[] = ['sword', 'potion', 'armor', 'ring', 'bow']
  const traitTypes: TraitType[] = ['quality', 'speed', 'durability', 'style']
  
  const itemType = itemTypes[Math.floor(Math.random() * itemTypes.length)]
  const preferredTrait = traitTypes[Math.floor(Math.random() * traitTypes.length)]
  const name = CUSTOMER_NAMES[Math.floor(Math.random() * CUSTOMER_NAMES.length)]
  
  const minTraitValue = Math.floor(Math.random() * 30) + 20
  const baseReward = ITEM_DEFINITIONS[itemType].baseValue
  const reward = Math.floor(baseReward * (1 + minTraitValue / 50))
  
  return {
    id: `customer-${Date.now()}-${Math.random()}`,
    name,
    itemType,
    preferredTrait,
    minTraitValue,
    patience: 45000,
    maxPatience: 45000,
    reward,
    arrivedAt: Date.now()
  }
}

export function calculateItemValue(
  baseValue: number,
  traits: Record<TraitType, number>,
  preferredTrait?: TraitType
): number {
  const totalTraits = Object.values(traits).reduce((sum, val) => sum + val, 0)
  let value = baseValue + totalTraits * 0.5
  
  if (preferredTrait && traits[preferredTrait]) {
    value += traits[preferredTrait] * 0.3
  }
  
  return Math.floor(value)
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
