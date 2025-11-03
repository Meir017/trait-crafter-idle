import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Hammer, Lock, TrendUp } from '@phosphor-icons/react'
import { ItemType, TraitType, Traits, ITEM_DEFINITIONS, TRAIT_INFO } from '@/lib/types'
import { getItemLevel, getNextLevelThreshold } from '@/lib/game-logic'

interface CraftingPanelProps {
  selectedItem: ItemType
  onSelectItem: (item: ItemType) => void
  craftCounts: Record<ItemType, number>
  resources: number
  onCraft: (itemType: ItemType, traits: Traits) => void
}

export function CraftingPanel({
  selectedItem,
  onSelectItem,
  craftCounts,
  resources,
  onCraft
}: CraftingPanelProps) {
  const [traitValues, setTraitValues] = useState<Traits>({
    quality: 25,
    speed: 25,
    durability: 25,
    style: 25
  })

  const totalResources = useMemo(() => {
    return Object.values(traitValues).reduce((sum, val) => sum + val, 0)
  }, [traitValues])

  const canCraft = totalResources <= resources

  const handleTraitChange = (trait: TraitType, value: number[]) => {
    setTraitValues(prev => ({
      ...prev,
      [trait]: value[0]
    }))
  }

  const handleCraft = () => {
    if (canCraft) {
      onCraft(selectedItem, traitValues)
    }
  }

  const itemTypes: ItemType[] = ['sword', 'potion', 'armor', 'ring', 'bow']

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Crafting</h2>

      <div className="grid grid-cols-5 gap-2 mb-6">
        {itemTypes.map(type => {
          const def = ITEM_DEFINITIONS[type]
          const count = craftCounts[type] || 0
          const level = getItemLevel(count)
          const isLocked = level === 1 && count === 0

          return (
            <button
              key={type}
              onClick={() => onSelectItem(type)}
              disabled={isLocked}
              className={`
                relative p-3 rounded-lg border-2 transition-all
                ${selectedItem === type 
                  ? 'border-primary bg-primary/10 shadow-md' 
                  : 'border-border hover:border-primary/50 hover:shadow-sm'
                }
                ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                disabled:hover:border-border disabled:hover:shadow-none
              `}
            >
              <div className="text-3xl mb-1">{def.icon}</div>
              <div className="text-xs font-medium">{def.name}</div>
              {!isLocked && (
                <Badge variant="secondary" className="absolute -top-2 -right-2 text-xs">
                  {level}
                </Badge>
              )}
              {isLocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-card/80 rounded-lg">
                  <Lock size={20} />
                </div>
              )}
            </button>
          )
        })}
      </div>

      <Separator className="my-4" />

      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium uppercase tracking-wide">
            Allocate Resources
          </span>
          <span className={`font-mono text-sm ${!canCraft ? 'text-destructive' : ''}`}>
            {totalResources} / {Math.floor(resources)}
          </span>
        </div>

        {(Object.keys(TRAIT_INFO) as TraitType[]).map(trait => {
          const info = TRAIT_INFO[trait]
          return (
            <div key={trait} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{info.icon}</span>
                  <span className="text-sm font-medium">{info.name}</span>
                </div>
                <span className="font-mono text-sm font-medium">
                  {traitValues[trait]}
                </span>
              </div>
              <Slider
                value={[traitValues[trait]]}
                onValueChange={(value) => handleTraitChange(trait, value)}
                max={100}
                step={1}
                className="relative"
              />
            </div>
          )
        })}
      </div>

      <Button
        onClick={handleCraft}
        disabled={!canCraft}
        className="w-full"
        size="lg"
      >
        <Hammer size={20} />
        Craft {ITEM_DEFINITIONS[selectedItem].name}
      </Button>

      <div className="mt-4 text-sm text-muted-foreground">
        <div className="flex items-center justify-between">
          <span>Crafted: {craftCounts[selectedItem] || 0}</span>
          {(() => {
            const next = getNextLevelThreshold(craftCounts[selectedItem] || 0)
            return next ? (
              <span className="flex items-center gap-1">
                <TrendUp size={14} />
                Next level: {next}
              </span>
            ) : (
              <span className="text-accent">Max level!</span>
            )
          })()}
        </div>
      </div>
    </Card>
  )
}
