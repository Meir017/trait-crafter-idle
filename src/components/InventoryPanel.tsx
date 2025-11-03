import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Package } from '@phosphor-icons/react'
import { CraftedItem, ITEM_DEFINITIONS, TRAIT_INFO } from '@/lib/types'

interface InventoryPanelProps {
  inventory: CraftedItem[]
}

export function InventoryPanel({ inventory }: InventoryPanelProps) {
  if (inventory.length === 0) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Inventory (0 / 50)</h2>
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
        Inventory ({inventory.length} / 50)
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {inventory.map(item => {
          const def = ITEM_DEFINITIONS[item.type]
          const totalTraits = Object.values(item.traits).reduce((sum, val) => sum + val, 0)
          const quality = totalTraits > 200 ? 'legendary' : totalTraits > 150 ? 'rare' : totalTraits > 100 ? 'uncommon' : 'common'
          
          const borderColor = {
            legendary: 'border-accent',
            rare: 'border-primary',
            uncommon: 'border-success',
            common: 'border-border'
          }[quality]

          return (
            <Card
              key={item.id}
              className={`p-3 ${borderColor} border-2 hover:shadow-lg transition-shadow cursor-pointer`}
            >
              <div className="text-center">
                <div className="text-3xl mb-1">{def.icon}</div>
                <div className="text-xs font-medium mb-2">{def.name}</div>
                <Badge variant="secondary" className="text-xs mb-2">
                  Lv {item.level}
                </Badge>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  {Object.entries(item.traits).map(([trait, value]) => (
                    <div key={trait} className="flex items-center gap-1">
                      <span>{TRAIT_INFO[trait as keyof typeof TRAIT_INFO].icon}</span>
                      <span className="font-mono text-[10px]">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </Card>
  )
}
