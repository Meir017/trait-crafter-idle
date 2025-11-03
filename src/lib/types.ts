export type TraitType = 'quality' | 'speed' | 'durability' | 'style'

export type ItemType = 'sword' | 'potion' | 'armor' | 'ring' | 'bow'

export interface Traits {
  quality: number
  speed: number
  durability: number
  style: number
}

export interface CraftedItem {
  id: string
  type: ItemType
  traits: Traits
  craftedAt: number
  level: number
}

export interface ItemDefinition {
  type: ItemType
  name: string
  icon: string
  baseValue: number
  levels: number[]
}

export interface Customer {
  id: string
  name: string
  itemType: ItemType
  preferredTrait: TraitType
  minTraitValue: number
  patience: number
  maxPatience: number
  reward: number
  arrivedAt: number
}

export interface GameState {
  resources: number
  maxResources: number
  coins: number
  inventory: CraftedItem[]
  craftCounts: Record<ItemType, number>
  lastUpdate: number
}

export const ITEM_DEFINITIONS: Record<ItemType, ItemDefinition> = {
  sword: {
    type: 'sword',
    name: 'Sword',
    icon: '⚔️',
    baseValue: 10,
    levels: [0, 10, 25, 50, 100]
  },
  potion: {
    type: 'potion',
    name: 'Potion',
    icon: '🧪',
    baseValue: 8,
    levels: [0, 10, 25, 50, 100]
  },
  armor: {
    type: 'armor',
    name: 'Armor',
    icon: '🛡️',
    baseValue: 15,
    levels: [0, 10, 25, 50, 100]
  },
  ring: {
    type: 'ring',
    name: 'Ring',
    icon: '💍',
    baseValue: 12,
    levels: [0, 10, 25, 50, 100]
  },
  bow: {
    type: 'bow',
    name: 'Bow',
    icon: '🏹',
    baseValue: 11,
    levels: [0, 10, 25, 50, 100]
  }
}

export const TRAIT_INFO: Record<TraitType, { name: string; color: string; icon: string }> = {
  quality: { name: 'Quality', color: 'oklch(0.45 0.15 300)', icon: '✨' },
  speed: { name: 'Speed', color: 'oklch(0.70 0.15 70)', icon: '⚡' },
  durability: { name: 'Durability', color: 'oklch(0.55 0.12 150)', icon: '🛡️' },
  style: { name: 'Style', color: 'oklch(0.80 0.15 85)', icon: '🎨' }
}

export const CUSTOMER_NAMES = [
  'Sir Roland', 'Lady Elara', 'Grimm the Bold', 'Mystic Maven',
  'Captain Ironbeard', 'Sage Willowbrook', 'Baron Ashford', 'Princess Celestia',
  'Throg the Mighty', 'Enchantress Luna', 'Duke Silverhand', 'Ranger Swift',
  'Alchemist Zara', 'Knight Valor', 'Merchant Goldwyn'
]

export const RESOURCE_REGEN_RATE = 1
export const RESOURCE_COST_PER_TRAIT_POINT = 1
export const MAX_INVENTORY = 50
export const CUSTOMER_SPAWN_MIN = 20000
export const CUSTOMER_SPAWN_MAX = 40000
export const CUSTOMER_PATIENCE = 45000
export const MAX_CUSTOMERS = 3
