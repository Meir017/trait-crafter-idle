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
  MAX_INVENTORY,
  CUSTOMER_SPAWN_MIN,
  CUSTOMER_SPAWN_MAX,
  MAX_CUSTOMERS,
  ITEM_DEFINITIONS
} from '@/lib/types'
import { generateCustomer, calculateItemValue, getItemLevel } from '@/lib/game-logic'

const INITIAL_STATE: GameState = {
  resources: 100,
  maxResources: 100,
  coins: 0,
  inventory: [],
  craftCounts: {
    sword: 0,
    potion: 0,
    armor: 0,
    ring: 0,
    bow: 0
  },
  lastUpdate: Date.now()
}

function App() {
  const [gameState, setGameState] = useKV<GameState>('game-state', INITIAL_STATE)
  const [selectedItem, setSelectedItem] = useState<ItemType>('sword')
  const [customers, setCustomers] = useState<Customer[]>([])

  useEffect(() => {
    if (!gameState) return

    const now = Date.now()
    const timeDiff = now - gameState.lastUpdate
    const regenAmount = Math.floor(timeDiff / 1000)
    
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
      setGameState(prev => {
        if (!prev) return INITIAL_STATE
        const newResources = Math.min(prev.maxResources, prev.resources + 1)
        return {
          ...prev,
          resources: newResources,
          lastUpdate: Date.now()
        }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [setGameState])

  useEffect(() => {
    const spawnCustomer = () => {
      setCustomers(prev => {
        if (prev.length >= MAX_CUSTOMERS) return prev
        return [...prev, generateCustomer()]
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
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
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
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleCraft = useCallback((itemType: ItemType, traits: Traits) => {
    if (!gameState) return

    const totalCost = Object.values(traits).reduce((sum, val) => sum + val, 0)
    
    if (totalCost > gameState.resources) {
      toast.error('Not enough resources!')
      return
    }

    if (gameState.inventory.length >= MAX_INVENTORY) {
      toast.error('Inventory is full!')
      return
    }

    const craftCount = gameState.craftCounts[itemType] || 0
    const level = getItemLevel(craftCount)

    const newItem: CraftedItem = {
      id: `item-${Date.now()}-${Math.random()}`,
      type: itemType,
      traits,
      craftedAt: Date.now(),
      level
    }

    setGameState(prev => ({
      ...prev!,
      resources: prev!.resources - totalCost,
      inventory: [...prev!.inventory, newItem],
      craftCounts: {
        ...prev!.craftCounts,
        [itemType]: (prev!.craftCounts[itemType] || 0) + 1
      },
      lastUpdate: Date.now()
    }))

    const newCraftCount = craftCount + 1
    const newLevel = getItemLevel(newCraftCount)
    
    if (newLevel > level) {
      toast.success(`${ITEM_DEFINITIONS[itemType].name} reached level ${newLevel}!`)
    } else {
      toast.success(`Crafted ${ITEM_DEFINITIONS[itemType].name}!`)
    }
  }, [gameState, setGameState])

  const handleSell = useCallback((customerId: string, itemId: string) => {
    if (!gameState) return

    const customer = customers.find(c => c.id === customerId)
    const item = gameState.inventory.find(i => i.id === itemId)

    if (!customer || !item) return

    const value = calculateItemValue(
      ITEM_DEFINITIONS[item.type].baseValue,
      item.traits,
      customer.preferredTrait
    )

    const bonus = item.traits[customer.preferredTrait] >= customer.minTraitValue * 1.5 ? 
      Math.floor(customer.reward * 0.5) : 0

    const totalReward = customer.reward + bonus

    setGameState(prev => ({
      ...prev!,
      coins: prev!.coins + totalReward,
      inventory: prev!.inventory.filter(i => i.id !== itemId),
      lastUpdate: Date.now()
    }))

    setCustomers(prev => prev.filter(c => c.id !== customerId))

    if (bonus > 0) {
      toast.success(`Sold to ${customer.name} for ${totalReward} coins! (+${bonus} bonus!)`)
    } else {
      toast.success(`Sold to ${customer.name} for ${totalReward} coins!`)
    }
  }, [gameState, customers, setGameState])

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
              />
              <CraftingPanel
                selectedItem={selectedItem}
                onSelectItem={setSelectedItem}
                craftCounts={gameState.craftCounts}
                resources={gameState.resources}
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

        <InventoryPanel inventory={gameState.inventory} />
      </div>
    </div>
  )
}

export default App