import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Package, Sparkle } from '@phosphor-icons/react'
import { CraftedItem, ITEM_DEFINITIONS, TRAIT_INFO } from '@/lib/types'
import { getQualityInfo } from '@/lib/game-logic'

interface InventoryPanelProps {
  inventory: CraftedItem[]
  maxSlots: number
  queueLength: number
}

export function InventoryPanel({ inventory, maxSlots, queueLength }: InventoryPanelProps) {
  const totalUsed = inventory.length + queueLength

  if (inventory.length === 0) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">
          Inventory ({totalUsed} / {maxSlots})
          {queueLength > 0 && (
            <span className="text-sm text-muted-foreground ml-2">
              ({queueLength} crafting)
            </span>
          )}
        </h2>
        <div className="text-center py-8 text-muted-foreground">
          <Package size={48} className="mx-auto mb-2 opacity-50" />
          <p>Your inventory is empty</p>
          <p className="text-sm">Craft some items to get started!</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">
        Inventory ({totalUsed} / {maxSlots})
        {queueLength > 0 && (
          <span className="text-sm text-muted-foreground ml-2">
            ({queueLength} crafting)
          </span>
        )}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {inventory.map(item => {
          const def = ITEM_DEFINITIONS[item.type]
          const totalTraits = Object.values(item.traits).reduce((sum, val) => {
            const safeVal = isFinite(val) && val >= 0 ? val : 0
            return sum + safeVal
          }, 0)
          
          const quality = getQualityInfo(totalTraits)

          return (
            <Card
              key={item.id}
              className={`p-3 ${quality.borderClass} ${quality.bgGradient} border-2 hover:shadow-xl transition-all cursor-pointer relative overflow-hidden`}
            >
              {quality.tier === 'legendary' && (
                <div className="absolute top-1 right-1">
                  <Sparkle size={16} className="text-accent animate-pulse" weight="fill" />
                </div>
              )}
              <div className="text-center">
                <div className="text-3xl mb-1">{def.icon}</div>
                <div className="text-xs font-medium mb-2">{def.name}</div>
                <div className="flex gap-1 justify-center mb-2">
                  <Badge variant="secondary" className="text-xs">
                    Lv {item.level}
                  </Badge>
                  <Badge variant={quality.badgeVariant} className="text-xs">
                    {quality.label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  {Object.entries(item.traits).map(([trait, value]) => {
                    const safeValue = isFinite(value) && value >= 0 ? value : 0
                    return (
                      <div key={trait} className="flex items-center gap-1 justify-center">
                        <span>{TRAIT_INFO[trait as keyof typeof TRAIT_INFO].icon}</span>
                        <span className="font-mono text-[10px]">{safeValue}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </Card>
  )
}
