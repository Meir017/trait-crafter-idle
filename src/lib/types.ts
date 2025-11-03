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

export interface CraftingJob {
  id: string
  type: ItemType
  traits: Traits
  startTime: number
  duration: number
  level: number
}

export interface ItemDefinition {
  type: ItemType
  name: string
  icon: string
  baseValue: number
  levels: number[]
  baseCraftTime: number
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
  craftingQueue: CraftingJob[]
  craftCounts: Record<ItemType, number>
  lastUpdate: number
  resourceRegenRate: number
  resourceUpgradeLevel: number
  capacityUpgradeLevel: number
  craftSpeedUpgradeLevel: number
  inventoryUpgradeLevel: number
  maxInventorySlots: number
}

export const ITEM_DEFINITIONS: Record<ItemType, ItemDefinition> = {
  sword: {
    type: 'sword',
    name: 'Sword',
    icon: '⚔️',
    baseValue: 10,
    levels: [0, 10, 25, 50, 100],
    baseCraftTime: 5000
  },
  potion: {
    type: 'potion',
    name: 'Potion',
    icon: '🧪',
    baseValue: 8,
    levels: [0, 10, 25, 50, 100],
    baseCraftTime: 3000
  },
  armor: {
    type: 'armor',
    name: 'Armor',
    icon: '🛡️',
    baseValue: 15,
    levels: [0, 10, 25, 50, 100],
    baseCraftTime: 8000
  },
  ring: {
    type: 'ring',
    name: 'Ring',
    icon: '💍',
    baseValue: 12,
    levels: [0, 10, 25, 50, 100],
    baseCraftTime: 6000
  },
  bow: {
    type: 'bow',
    name: 'Bow',
    icon: '🏹',
    baseValue: 11,
    levels: [0, 10, 25, 50, 100],
    baseCraftTime: 7000
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

export const RESOURCE_UPGRADES = [
  { level: 1, regenRate: 1, cost: 0 },
  { level: 2, regenRate: 2, cost: 50 },
  { level: 3, regenRate: 3, cost: 150 },
  { level: 4, regenRate: 5, cost: 300 },
  { level: 5, regenRate: 8, cost: 600 },
  { level: 6, regenRate: 12, cost: 1200 },
  { level: 7, regenRate: 18, cost: 2500 },
  { level: 8, regenRate: 25, cost: 5000 }
]

export const CAPACITY_UPGRADES = [
  { level: 1, maxResources: 100, cost: 0 },
  { level: 2, maxResources: 150, cost: 40 },
  { level: 3, maxResources: 250, cost: 120 },
  { level: 4, maxResources: 400, cost: 250 },
  { level: 5, maxResources: 650, cost: 500 },
  { level: 6, maxResources: 1000, cost: 1000 },
  { level: 7, maxResources: 1500, cost: 2000 },
  { level: 8, maxResources: 2500, cost: 4000 }
]

export const CRAFT_SPEED_UPGRADES = [
  { level: 1, speedMultiplier: 1.0, cost: 0 },
  { level: 2, speedMultiplier: 0.9, cost: 60 },
  { level: 3, speedMultiplier: 0.8, cost: 180 },
  { level: 4, speedMultiplier: 0.7, cost: 400 },
  { level: 5, speedMultiplier: 0.6, cost: 800 },
  { level: 6, speedMultiplier: 0.5, cost: 1600 },
  { level: 7, speedMultiplier: 0.4, cost: 3200 },
  { level: 8, speedMultiplier: 0.3, cost: 6400 }
]

export const INVENTORY_UPGRADES = [
  { level: 1, maxSlots: 50, cost: 0 },
  { level: 2, maxSlots: 75, cost: 80 },
  { level: 3, maxSlots: 100, cost: 200 },
  { level: 4, maxSlots: 150, cost: 450 },
  { level: 5, maxSlots: 200, cost: 900 },
  { level: 6, maxSlots: 300, cost: 1800 },
  { level: 7, maxSlots: 500, cost: 3600 },
  { level: 8, maxSlots: 1000, cost: 7200 }
]
