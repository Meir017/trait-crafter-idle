import { useEffect, useState, useCallback } from 'react'
import { useKV } from '@github/spark/hooks'
import { Toaster, toast } from 'sonner'
import { ResourcePanel } from '@/components/ResourcePanel'
import { CraftingPanel } from '@/components/CraftingPanel'
import { CustomersPanel } from '@/components/CustomersPanel'
import { InventoryPanel } from '@/components/InventoryPanel'
import {
  ItemType,
  Traits,
  TraitType,
  CraftedItem,
  Customer,
  GameState,
  CraftingJob,
  MAX_INVENTORY,
  CUSTOMER_SPAWN_MIN,
  CUSTOMER_SPAWN_MAX,
  MAX_CUSTOMERS,
  ITEM_DEFINITIONS,
  RESOURCE_UPGRADES,
  CAPACITY_UPGRADES,
  CRAFT_SPEED_UPGRADES,
  INVENTORY_UPGRADES,
  CRAFTING_SLOTS_UPGRADES,
  CUSTOMER_SPAWN_UPGRADES
} from '@/lib/types'
import { generateCustomer, calculateItemValue, getItemLevel, calculateCraftTime, calculateOptimalTraits, calculateCustomerLevel, getAvailableTiers, getTierInfo } from '@/lib/game-logic'

const INITIAL_STATE: GameState = {
  resources: 100,
  maxResources: 100,
  coins: 0,
  inventory: [],
  craftingQueue: [],
  craftCounts: {
    sword: 0,
    potion: 0,
    armor: 0,
    ring: 0,
    bow: 0
  },
  lastUpdate: Date.now(),
  resourceRegenRate: 1,
  resourceUpgradeLevel: 1,
  capacityUpgradeLevel: 1,
  craftSpeedUpgradeLevel: 1,
  inventoryUpgradeLevel: 1,
  maxInventorySlots: 50,
  maxCraftingSlots: 1,
  craftingSlotsUpgradeLevel: 1,
  customerSpawnRate: 1.0,
  customerSpawnUpgradeLevel: 1,
  nextCustomerArrival: Date.now() + 20000,
  customerDatabase: {}
}

function App() {
  const [gameState, setGameState] = useKV<GameState>('game-state', INITIAL_STATE)
  const [selectedItem, setSelectedItem] = useState<ItemType>('sword')
  const [customers, setCustomers] = useState<Customer[]>([])

  useEffect(() => {
    if (!gameState) return

    const now = Date.now()
    const timeDiff = now - gameState.lastUpdate
    const safeTimeDiff = isFinite(timeDiff) && timeDiff > 0 ? timeDiff : 0
    const safeRegenRate = isFinite(gameState.resourceRegenRate) && gameState.resourceRegenRate > 0 
      ? gameState.resourceRegenRate 
      : 1
    const regenAmount = Math.floor((safeTimeDiff / 1000) * safeRegenRate)
    
    if (regenAmount > 0) {
      setGameState(prev => {
        if (!prev) return INITIAL_STATE
        const safeResources = isFinite(prev.resources) && prev.resources >= 0 ? prev.resources : 0
        const safeMaxResources = isFinite(prev.maxResources) && prev.maxResources > 0 ? prev.maxResources : 100
        return {
          ...prev,
          resources: Math.min(safeMaxResources, safeResources + regenAmount),
          lastUpdate: now
        }
      })
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      
      setGameState(prev => {
        if (!prev) return INITIAL_STATE
        
        const safeResources = isFinite(prev.resources) && prev.resources >= 0 ? prev.resources : 0
        const safeMaxResources = isFinite(prev.maxResources) && prev.maxResources > 0 ? prev.maxResources : 100
        const safeRegenRate = isFinite(prev.resourceRegenRate) && prev.resourceRegenRate > 0 ? prev.resourceRegenRate : 1
        const newResources = Math.min(safeMaxResources, safeResources + safeRegenRate)
        
        const completedJobs: CraftingJob[] = []
        const remainingJobs: CraftingJob[] = []
        
        prev.craftingQueue.forEach((job, index) => {
          if (index < prev.maxCraftingSlots) {
            const elapsed = now - job.startTime
            if (elapsed >= job.duration) {
              completedJobs.push(job)
            } else {
              remainingJobs.push(job)
            }
          } else {
            remainingJobs.push(job)
          }
        })
        
        const startedJobs: CraftingJob[] = []
        remainingJobs.forEach((job, index) => {
          if (index < prev.maxCraftingSlots && !job.startTime) {
            startedJobs.push({ ...job, startTime: now })
          } else if (index < prev.maxCraftingSlots && completedJobs.length > 0) {
            startedJobs.push({ ...job, startTime: job.startTime || now })
          } else {
            startedJobs.push(job)
          }
        })
        
        const newItems: CraftedItem[] = completedJobs.map(job => ({
          id: job.id,
          type: job.type,
          traits: job.traits,
          craftedAt: now,
          level: job.level,
          tier: job.tier
        }))
        
        let updatedState = {
          ...prev,
          resources: newResources,
          craftingQueue: startedJobs,
          inventory: [...prev.inventory, ...newItems],
          lastUpdate: now
        }
        
        completedJobs.forEach(job => {
          updatedState.craftCounts = {
            ...updatedState.craftCounts,
            [job.type]: (updatedState.craftCounts[job.type] || 0) + 1
          }
        })
        
        return updatedState
      })
      
      setCustomers(prev => 
        prev.filter(customer => {
          const elapsed = now - customer.arrivedAt
          if (elapsed >= customer.patience) {
            toast.error(`${customer.name} left without buying`)
            return false
          }
          return true
        })
      )
    }, 100)

    return () => clearInterval(interval)
  }, [setGameState])

  useEffect(() => {
    if (!gameState) return

    const checkCustomerSpawn = () => {
      const now = Date.now()
      
      if (now >= gameState.nextCustomerArrival && customers.length < MAX_CUSTOMERS) {
        const newCustomer = generateCustomer(gameState.craftCounts, gameState.customerDatabase)
        setCustomers(prev => [...prev, newCustomer])
        
        const spawnUpgrade = CUSTOMER_SPAWN_UPGRADES.find(u => u.level === gameState.customerSpawnUpgradeLevel)
        const minTime = spawnUpgrade?.minTime || 20000
        const maxTime = spawnUpgrade?.maxTime || 40000
        const nextArrival = now + Math.random() * (maxTime - minTime) + minTime
        
        setGameState(prev => prev ? { ...prev, nextCustomerArrival: nextArrival } : INITIAL_STATE)
      }
    }

    const interval = setInterval(checkCustomerSpawn, 100)
    return () => clearInterval(interval)
  }, [gameState, customers.length, setGameState])

  const handleCraft = useCallback((itemType: ItemType, traits: Traits, craftLevel?: number, craftTier?: number) => {
    setGameState(prev => {
      if (!prev) return INITIAL_STATE

      const totalCost = Object.values(traits).reduce((sum, val) => sum + val, 0)
      
      const craftCount = prev.craftCounts[itemType] || 0
      const tier = craftTier || 1
      const tierInfo = getTierInfo(itemType, tier)
      
      if (totalCost < tierInfo.minResourceCost) {
        toast.error(`Minimum ${tierInfo.minResourceCost} resources required for ${tierInfo.name} tier!`)
        return prev
      }
      
      if (totalCost > prev.resources) {
        toast.error('Not enough resources!')
        return prev
      }

      if (prev.craftingQueue.length >= prev.maxCraftingSlots) {
        toast.error('All crafting slots are busy!')
        return prev
      }

      if (prev.inventory.length + prev.craftingQueue.length >= prev.maxInventorySlots) {
        toast.error('Inventory and queue are full!')
        return prev
      }

      const maxLevel = getItemLevel(craftCount)
      const level = craftLevel && craftLevel <= maxLevel ? craftLevel : maxLevel
      const itemDef = ITEM_DEFINITIONS[itemType]
      
      const speedUpgrade = CRAFT_SPEED_UPGRADES.find(u => u.level === prev.craftSpeedUpgradeLevel)
      const speedMultiplier = speedUpgrade?.speedMultiplier || 1.0
      
      const craftTime = calculateCraftTime(itemType, tier, level, speedMultiplier)

      const newJob: CraftingJob = {
        id: `job-${Date.now()}-${Math.random()}`,
        type: itemType,
        traits,
        startTime: Date.now(),
        duration: craftTime,
        level,
        tier
      }

      toast.success(`Started crafting ${tierInfo.name} ${itemDef.name} Lv${level}! (${(craftTime / 1000).toFixed(1)}s)`)

      return {
        ...prev,
        resources: prev.resources - totalCost,
        craftingQueue: [...prev.craftingQueue, newJob],
        lastUpdate: Date.now()
      }
    })
  }, [setGameState])

  const handleSell = useCallback((customerId: string, itemId: string) => {
    const customer = customers.find(c => c.id === customerId)
    if (!customer) return

    setGameState(prev => {
      if (!prev) return INITIAL_STATE

      const item = prev.inventory.find(i => i.id === itemId)
      if (!item) return prev

      const value = calculateItemValue(
        item.type,
        item.tier,
        item.traits,
        customer.preferredTrait
      )

      const preferredTraitMatch = item.traits[customer.preferredTrait] >= customer.minTraitValue * 1.5
      let allSecondaryTraitsMet = true
      
      if (customer.secondaryTraits) {
        for (const [trait, minValue] of Object.entries(customer.secondaryTraits)) {
          if (item.traits[trait as TraitType] < minValue) {
            allSecondaryTraitsMet = false
            break
          }
        }
      }

      const bonus = preferredTraitMatch && allSecondaryTraitsMet ? 
        Math.floor(customer.reward * 0.5) : 0

      const totalReward = customer.reward + bonus
      
      const experienceGained = 10 + (customer.level * 5) + (bonus > 0 ? 20 : 0)
      const newExperience = customer.experience + experienceGained
      const levelData = calculateCustomerLevel(newExperience)

      const customerKey = `customer-${customer.name}`
      const updatedCustomerData = {
        id: customerKey,
        name: customer.name,
        level: levelData.level,
        experience: newExperience,
        experienceToNextLevel: levelData.experienceToNext,
        totalPurchases: (prev.customerDatabase[customerKey]?.totalPurchases || 0) + 1
      }

      setCustomers(prevCustomers => prevCustomers.filter(c => c.id !== customerId))

      if (levelData.level > customer.level) {
        toast.success(`${customer.name} leveled up to level ${levelData.level}! 🎉`)
      } else if (bonus > 0) {
        toast.success(`Sold to ${customer.name} for ${totalReward} coins! (+${bonus} bonus!)`)
      } else {
        toast.success(`Sold to ${customer.name} for ${totalReward} coins!`)
      }

      return {
        ...prev,
        coins: prev.coins + totalReward,
        inventory: prev.inventory.filter(i => i.id !== itemId),
        customerDatabase: {
          ...prev.customerDatabase,
          [customerKey]: updatedCustomerData
        },
        lastUpdate: Date.now()
      }
    })
  }, [customers, setGameState])

  const handleUpgradeResources = useCallback(() => {
    setGameState(prev => {
      if (!prev) return INITIAL_STATE

      const nextUpgrade = RESOURCE_UPGRADES.find(u => u.level === prev.resourceUpgradeLevel + 1)
      
      if (!nextUpgrade || prev.coins < nextUpgrade.cost) {
        toast.error('Not enough coins!')
        return prev
      }

      toast.success(`Resource production upgraded to level ${nextUpgrade.level}! (+${nextUpgrade.regenRate}/s)`)

      return {
        ...prev,
        coins: prev.coins - nextUpgrade.cost,
        resourceRegenRate: nextUpgrade.regenRate,
        resourceUpgradeLevel: nextUpgrade.level,
        lastUpdate: Date.now()
      }
    })
  }, [setGameState])

  const handleUpgradeCapacity = useCallback(() => {
    setGameState(prev => {
      if (!prev) return INITIAL_STATE

      const nextUpgrade = CAPACITY_UPGRADES.find(u => u.level === prev.capacityUpgradeLevel + 1)
      
      if (!nextUpgrade || prev.coins < nextUpgrade.cost) {
        toast.error('Not enough coins!')
        return prev
      }

      toast.success(`Resource capacity upgraded to level ${nextUpgrade.level}! (${nextUpgrade.maxResources} max)`)

      return {
        ...prev,
        coins: prev.coins - nextUpgrade.cost,
        maxResources: nextUpgrade.maxResources,
        capacityUpgradeLevel: nextUpgrade.level,
        lastUpdate: Date.now()
      }
    })
  }, [setGameState])

  const handleUpgradeCraftSpeed = useCallback(() => {
    setGameState(prev => {
      if (!prev) return INITIAL_STATE

      const nextUpgrade = CRAFT_SPEED_UPGRADES.find(u => u.level === prev.craftSpeedUpgradeLevel + 1)
      
      if (!nextUpgrade || prev.coins < nextUpgrade.cost) {
        toast.error('Not enough coins!')
        return prev
      }

      toast.success(`Craft speed upgraded to level ${nextUpgrade.level}! (${Math.round((1 - nextUpgrade.speedMultiplier) * 100)}% faster)`)

      return {
        ...prev,
        coins: prev.coins - nextUpgrade.cost,
        craftSpeedUpgradeLevel: nextUpgrade.level,
        lastUpdate: Date.now()
      }
    })
  }, [setGameState])

  const handleUpgradeInventory = useCallback(() => {
    setGameState(prev => {
      if (!prev) return INITIAL_STATE

      const nextUpgrade = INVENTORY_UPGRADES.find(u => u.level === prev.inventoryUpgradeLevel + 1)
      
      if (!nextUpgrade || prev.coins < nextUpgrade.cost) {
        toast.error('Not enough coins!')
        return prev
      }

      toast.success(`Inventory upgraded to level ${nextUpgrade.level}! (${nextUpgrade.maxSlots} slots)`)

      return {
        ...prev,
        coins: prev.coins - nextUpgrade.cost,
        maxInventorySlots: nextUpgrade.maxSlots,
        inventoryUpgradeLevel: nextUpgrade.level,
        lastUpdate: Date.now()
      }
    })
  }, [setGameState])

  const handleUpgradeCraftingSlots = useCallback(() => {
    setGameState(prev => {
      if (!prev) return INITIAL_STATE

      const nextUpgrade = CRAFTING_SLOTS_UPGRADES.find(u => u.level === prev.craftingSlotsUpgradeLevel + 1)
      
      if (!nextUpgrade || prev.coins < nextUpgrade.cost) {
        toast.error('Not enough coins!')
        return prev
      }

      toast.success(`Crafting slots upgraded to level ${nextUpgrade.level}! (${nextUpgrade.maxSlots} slots)`)

      return {
        ...prev,
        coins: prev.coins - nextUpgrade.cost,
        maxCraftingSlots: nextUpgrade.maxSlots,
        craftingSlotsUpgradeLevel: nextUpgrade.level,
        lastUpdate: Date.now()
      }
    })
  }, [setGameState])

  const handleUpgradeCustomerSpawn = useCallback(() => {
    setGameState(prev => {
      if (!prev) return INITIAL_STATE

      const nextUpgrade = CUSTOMER_SPAWN_UPGRADES.find(u => u.level === prev.customerSpawnUpgradeLevel + 1)
      
      if (!nextUpgrade || prev.coins < nextUpgrade.cost) {
        toast.error('Not enough coins!')
        return prev
      }

      toast.success(`Customer arrival rate upgraded to level ${nextUpgrade.level}! (${Math.round((1 - nextUpgrade.spawnRate) * 100)}% faster)`)

      return {
        ...prev,
        coins: prev.coins - nextUpgrade.cost,
        customerSpawnRate: nextUpgrade.spawnRate,
        customerSpawnUpgradeLevel: nextUpgrade.level,
        lastUpdate: Date.now()
      }
    })
  }, [setGameState])

  const handleCraftForCustomer = useCallback((customer: Customer) => {
    setGameState(prev => {
      if (!prev) return INITIAL_STATE

      const craftCount = prev.craftCounts[customer.itemType] || 0
      const availableTiers = getAvailableTiers(customer.itemType, craftCount)
      const tier = availableTiers[availableTiers.length - 1] || 1

      const { traits, totalCost } = calculateOptimalTraits(customer, prev.resources, customer.itemType, tier)

      if (totalCost > prev.resources) {
        toast.error('Not enough resources!')
        return prev
      }

      if (prev.craftingQueue.length >= prev.maxCraftingSlots) {
        toast.error('All crafting slots are busy!')
        return prev
      }

      if (prev.inventory.length + prev.craftingQueue.length >= prev.maxInventorySlots) {
        toast.error('Inventory and queue are full!')
        return prev
      }

      const level = getItemLevel(craftCount)
      const itemDef = ITEM_DEFINITIONS[customer.itemType]
      const tierInfo = getTierInfo(customer.itemType, tier)
      
      const speedUpgrade = CRAFT_SPEED_UPGRADES.find(u => u.level === prev.craftSpeedUpgradeLevel)
      const speedMultiplier = speedUpgrade?.speedMultiplier || 1.0
      
      const craftTime = calculateCraftTime(customer.itemType, tier, level, speedMultiplier)

      const newJob: CraftingJob = {
        id: `job-${Date.now()}-${Math.random()}`,
        type: customer.itemType,
        traits,
        startTime: Date.now(),
        duration: craftTime,
        level,
        tier
      }

      toast.success(`Crafting ${tierInfo.name} ${itemDef.name} for ${customer.name}! (${(craftTime / 1000).toFixed(1)}s)`)

      return {
        ...prev,
        resources: prev.resources - totalCost,
        craftingQueue: [...prev.craftingQueue, newJob],
        lastUpdate: Date.now()
      }
    })
  }, [setGameState])

  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⚒️</div>
          <div className="text-lg text-muted-foreground">Loading workshop...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 text-primary">Mystic Forge</h1>
          <p className="text-muted-foreground">Craft magical items and serve your customers</p>
        </header>

        <div className="grid gap-6 lg:grid-cols-3 mb-6">
          <div className="lg:col-span-2">
            <div className="space-y-6">
              <ResourcePanel
                resources={gameState.resources}
                maxResources={gameState.maxResources}
                coins={gameState.coins}
                resourceRegenRate={gameState.resourceRegenRate}
                resourceUpgradeLevel={gameState.resourceUpgradeLevel}
                capacityUpgradeLevel={gameState.capacityUpgradeLevel}
                craftSpeedUpgradeLevel={gameState.craftSpeedUpgradeLevel}
                inventoryUpgradeLevel={gameState.inventoryUpgradeLevel}
                craftingSlotsUpgradeLevel={gameState.craftingSlotsUpgradeLevel}
                customerSpawnUpgradeLevel={gameState.customerSpawnUpgradeLevel}
                nextCustomerArrival={gameState.nextCustomerArrival}
                onUpgrade={handleUpgradeResources}
                onUpgradeCapacity={handleUpgradeCapacity}
                onUpgradeCraftSpeed={handleUpgradeCraftSpeed}
                onUpgradeInventory={handleUpgradeInventory}
                onUpgradeCraftingSlots={handleUpgradeCraftingSlots}
                onUpgradeCustomerSpawn={handleUpgradeCustomerSpawn}
              />
              <CraftingPanel
                selectedItem={selectedItem}
                onSelectItem={setSelectedItem}
                craftCounts={gameState.craftCounts}
                resources={gameState.resources}
                craftingQueue={gameState.craftingQueue}
                craftSpeedLevel={gameState.craftSpeedUpgradeLevel}
                maxCraftingSlots={gameState.maxCraftingSlots}
                onCraft={handleCraft}
              />
            </div>
          </div>

          <div>
            <CustomersPanel
              customers={customers}
              inventory={gameState.inventory}
              resources={gameState.resources}
              onSell={handleSell}
              onCraftForCustomer={handleCraftForCustomer}
            />
          </div>
        </div>

        <InventoryPanel 
          inventory={gameState.inventory} 
          maxSlots={gameState.maxInventorySlots}
          queueLength={gameState.craftingQueue.length}
        />
      </div>
    </div>
  )
}

export default App