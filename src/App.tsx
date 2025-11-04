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
  INVENTORY_UPGRADES
} from '@/lib/types'
import { generateCustomer, calculateItemValue, getItemLevel, calculateCraftTime } from '@/lib/game-logic'

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
  maxInventorySlots: 50
}

function App() {
  const [gameState, setGameState] = useKV<GameState>('game-state', INITIAL_STATE)
  const [selectedItem, setSelectedItem] = useState<ItemType>('sword')
  const [customers, setCustomers] = useState<Customer[]>([])

  useEffect(() => {
    if (!gameState) return

    const now = Date.now()
    const timeDiff = now - gameState.lastUpdate
    const regenAmount = Math.floor((timeDiff / 1000) * gameState.resourceRegenRate)
    
    if (regenAmount > 0) {
      setGameState(prev => ({
        ...prev!,
        resources: Math.min(prev!.maxResources, prev!.resources + regenAmount),
        lastUpdate: now
      }))
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      
      setGameState(prev => {
        if (!prev) return INITIAL_STATE
        
        const newResources = Math.min(prev.maxResources, prev.resources + prev.resourceRegenRate)
        
        const completedJobs: CraftingJob[] = []
        const remainingJobs: CraftingJob[] = []
        
        prev.craftingQueue.forEach(job => {
          const elapsed = now - job.startTime
          if (elapsed >= job.duration) {
            completedJobs.push(job)
          } else {
            remainingJobs.push(job)
          }
        })
        
        const newItems: CraftedItem[] = completedJobs.map(job => ({
          id: job.id,
          type: job.type,
          traits: job.traits,
          craftedAt: now,
          level: job.level
        }))
        
        let updatedState = {
          ...prev,
          resources: newResources,
          craftingQueue: remainingJobs,
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
    const spawnCustomer = () => {
      setCustomers(prev => {
        if (prev.length >= MAX_CUSTOMERS) return prev
        return [...prev, generateCustomer(gameState?.craftCounts)]
      })
    }

    const scheduleNext = () => {
      const delay = Math.random() * (CUSTOMER_SPAWN_MAX - CUSTOMER_SPAWN_MIN) + CUSTOMER_SPAWN_MIN
      return setTimeout(() => {
        spawnCustomer()
        timeoutRef = scheduleNext()
      }, delay)
    }

    let timeoutRef = scheduleNext()

    return () => clearTimeout(timeoutRef)
  }, [gameState?.craftCounts])

  const handleCraft = useCallback((itemType: ItemType, traits: Traits) => {
    setGameState(prev => {
      if (!prev) return INITIAL_STATE

      const totalCost = Object.values(traits).reduce((sum, val) => sum + val, 0)
      
      if (totalCost > prev.resources) {
        toast.error('Not enough resources!')
        return prev
      }

      if (prev.inventory.length + prev.craftingQueue.length >= prev.maxInventorySlots) {
        toast.error('Inventory and queue are full!')
        return prev
      }

      const craftCount = prev.craftCounts[itemType] || 0
      const level = getItemLevel(craftCount)
      const itemDef = ITEM_DEFINITIONS[itemType]
      
      const speedUpgrade = CRAFT_SPEED_UPGRADES.find(u => u.level === prev.craftSpeedUpgradeLevel)
      const speedMultiplier = speedUpgrade?.speedMultiplier || 1.0
      
      const craftTime = calculateCraftTime(itemDef.baseCraftTime, level, speedMultiplier)

      const newJob: CraftingJob = {
        id: `job-${Date.now()}-${Math.random()}`,
        type: itemType,
        traits,
        startTime: Date.now(),
        duration: craftTime,
        level
      }

      toast.success(`Started crafting ${itemDef.name}! (${(craftTime / 1000).toFixed(1)}s)`)

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
        ITEM_DEFINITIONS[item.type].baseValue,
        item.traits,
        customer.preferredTrait
      )

      const bonus = item.traits[customer.preferredTrait] >= customer.minTraitValue * 1.5 ? 
        Math.floor(customer.reward * 0.5) : 0

      const totalReward = customer.reward + bonus

      setCustomers(prevCustomers => prevCustomers.filter(c => c.id !== customerId))

      if (bonus > 0) {
        toast.success(`Sold to ${customer.name} for ${totalReward} coins! (+${bonus} bonus!)`)
      } else {
        toast.success(`Sold to ${customer.name} for ${totalReward} coins!`)
      }

      return {
        ...prev,
        coins: prev.coins + totalReward,
        inventory: prev.inventory.filter(i => i.id !== itemId),
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
                onUpgrade={handleUpgradeResources}
                onUpgradeCapacity={handleUpgradeCapacity}
                onUpgradeCraftSpeed={handleUpgradeCraftSpeed}
                onUpgradeInventory={handleUpgradeInventory}
              />
              <CraftingPanel
                selectedItem={selectedItem}
                onSelectItem={setSelectedItem}
                craftCounts={gameState.craftCounts}
                resources={gameState.resources}
                craftingQueue={gameState.craftingQueue}
                craftSpeedLevel={gameState.craftSpeedUpgradeLevel}
                onCraft={handleCraft}
              />
            </div>
          </div>

          <div>
            <CustomersPanel
              customers={customers}
              inventory={gameState.inventory}
              onSell={handleSell}
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