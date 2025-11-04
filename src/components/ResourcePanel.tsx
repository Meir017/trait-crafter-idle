import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Coins, ArrowUp, Database, Timer, Package, Factory } from '@phosphor-icons/react'
import { RESOURCE_UPGRADES, CAPACITY_UPGRADES, CRAFT_SPEED_UPGRADES, INVENTORY_UPGRADES, CRAFTING_SLOTS_UPGRADES } from '@/lib/types'

interface ResourcePanelProps {
  resources: number
  maxResources: number
  coins: number
  resourceRegenRate: number
  resourceUpgradeLevel: number
  capacityUpgradeLevel: number
  craftSpeedUpgradeLevel: number
  inventoryUpgradeLevel: number
  craftingSlotsUpgradeLevel: number
  onUpgrade: () => void
  onUpgradeCapacity: () => void
  onUpgradeCraftSpeed: () => void
  onUpgradeInventory: () => void
  onUpgradeCraftingSlots: () => void
}

export function ResourcePanel({ 
  resources, 
  maxResources, 
  coins, 
  resourceRegenRate, 
  resourceUpgradeLevel,
  capacityUpgradeLevel,
  craftSpeedUpgradeLevel,
  inventoryUpgradeLevel,
  craftingSlotsUpgradeLevel,
  onUpgrade,
  onUpgradeCapacity,
  onUpgradeCraftSpeed,
  onUpgradeInventory,
  onUpgradeCraftingSlots
}: ResourcePanelProps) {
  const percentage = (resources / maxResources) * 100
  const nextUpgrade = RESOURCE_UPGRADES.find(u => u.level === resourceUpgradeLevel + 1)
  const canUpgrade = nextUpgrade && coins >= nextUpgrade.cost
  
  const nextCapacityUpgrade = CAPACITY_UPGRADES.find(u => u.level === capacityUpgradeLevel + 1)
  const canUpgradeCapacity = nextCapacityUpgrade && coins >= nextCapacityUpgrade.cost

  const nextCraftSpeedUpgrade = CRAFT_SPEED_UPGRADES.find(u => u.level === craftSpeedUpgradeLevel + 1)
  const canUpgradeCraftSpeed = nextCraftSpeedUpgrade && coins >= nextCraftSpeedUpgrade.cost

  const nextInventoryUpgrade = INVENTORY_UPGRADES.find(u => u.level === inventoryUpgradeLevel + 1)
  const canUpgradeInventory = nextInventoryUpgrade && coins >= nextInventoryUpgrade.cost

  const nextCraftingSlotsUpgrade = CRAFTING_SLOTS_UPGRADES.find(u => u.level === craftingSlotsUpgradeLevel + 1)
  const canUpgradeCraftingSlots = nextCraftingSlotsUpgrade && coins >= nextCraftingSlotsUpgrade.cost

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Resources
            </span>
            <span className="font-mono text-lg font-medium">
              {Math.floor(resources)} / {maxResources}
            </span>
          </div>
          <Progress value={percentage} className="h-3" />
          <div className="flex items-center justify-between mt-2 gap-2">
            <span className="text-xs text-muted-foreground">
              +{resourceRegenRate}/s
            </span>
            <div className="flex gap-2 flex-wrap">
              {nextUpgrade && (
                <Button
                  size="sm"
                  variant={canUpgrade ? "default" : "outline"}
                  onClick={onUpgrade}
                  disabled={!canUpgrade}
                  className="h-7 text-xs gap-1"
                >
                  <ArrowUp size={14} />
                  Speed ({nextUpgrade.cost} <Coins size={14} weight="fill" />)
                </Button>
              )}
              {nextCapacityUpgrade && (
                <Button
                  size="sm"
                  variant={canUpgradeCapacity ? "secondary" : "outline"}
                  onClick={onUpgradeCapacity}
                  disabled={!canUpgradeCapacity}
                  className="h-7 text-xs gap-1"
                >
                  <Database size={14} />
                  Capacity ({nextCapacityUpgrade.cost} <Coins size={14} weight="fill" />)
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Coins
          </span>
          <div className="flex items-center gap-2">
            <Coins weight="fill" className="text-accent" size={20} />
            <span className="font-mono text-lg font-medium text-accent-foreground">
              {coins}
            </span>
          </div>
        </div>

        <div className="pt-2 border-t space-y-2">
          <div className="text-sm font-medium uppercase tracking-wide text-muted-foreground mb-2">
            Upgrades
          </div>
          <div className="grid grid-cols-2 gap-2">
            {nextCraftSpeedUpgrade && (
              <Button
                size="sm"
                variant={canUpgradeCraftSpeed ? "default" : "outline"}
                onClick={onUpgradeCraftSpeed}
                disabled={!canUpgradeCraftSpeed}
                className="h-9 text-xs gap-1 flex-col py-1"
              >
                <div className="flex items-center gap-1">
                  <Timer size={14} />
                  <span>Craft Speed</span>
                </div>
                <div className="text-xs opacity-70">
                  {nextCraftSpeedUpgrade.cost} <Coins size={12} weight="fill" className="inline" />
                </div>
              </Button>
            )}
            {nextInventoryUpgrade && (
              <Button
                size="sm"
                variant={canUpgradeInventory ? "secondary" : "outline"}
                onClick={onUpgradeInventory}
                disabled={!canUpgradeInventory}
                className="h-9 text-xs gap-1 flex-col py-1"
              >
                <div className="flex items-center gap-1">
                  <Package size={14} />
                  <span>Inventory</span>
                </div>
                <div className="text-xs opacity-70">
                  {nextInventoryUpgrade.cost} <Coins size={12} weight="fill" className="inline" />
                </div>
              </Button>
            )}
            {nextCraftingSlotsUpgrade && (
              <Button
                size="sm"
                variant={canUpgradeCraftingSlots ? "default" : "outline"}
                onClick={onUpgradeCraftingSlots}
                disabled={!canUpgradeCraftingSlots}
                className="h-9 text-xs gap-1 flex-col py-1 col-span-2"
              >
                <div className="flex items-center gap-1">
                  <Factory size={14} />
                  <span>Crafting Slots</span>
                </div>
                <div className="text-xs opacity-70">
                  {nextCraftingSlotsUpgrade.cost} <Coins size={12} weight="fill" className="inline" />
                </div>
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
