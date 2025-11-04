import { useState, useMemo, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Hammer, Lock, TrendUp, Clock } from '@phosphor-icons/react'
import { ItemType, TraitType, Traits, CraftingJob, ITEM_DEFINITIONS, TRAIT_INFO, CRAFT_SPEED_UPGRADES } from '@/lib/types'
import { getItemLevel, getNextLevelThreshold } from '@/lib/game-logic'

interface CraftingPanelProps {
  selectedItem: ItemType
  onSelectItem: (item: ItemType) => void
  craftCounts: Record<ItemType, number>
  resources: number
  craftingQueue: CraftingJob[]
  craftSpeedLevel: number
  onCraft: (itemType: ItemType, traits: Traits) => void
}

export function CraftingPanel({
  selectedItem,
  onSelectItem,
  craftCounts,
  resources,
  craftingQueue,
  craftSpeedLevel,
  onCraft
}: CraftingPanelProps) {
  const [traitValues, setTraitValues] = useState<Traits>({
    quality: 25,
    speed: 25,
    durability: 25,
    style: 25
  })
  const [, setTick] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1)
    }, 100)
    return () => clearInterval(interval)
  }, [])

  const totalResources = useMemo(() => {
    return Object.values(traitValues).reduce((sum, val) => sum + val, 0)
  }, [traitValues])

  const canCraft = totalResources <= resources

  const handleTraitChange = (trait: TraitType, value: number[]) => {
    const newValue = value[0]
    
    setTraitValues(prev => {
      const currentTotal = Object.values(prev).reduce((sum, val) => sum + val, 0)
      const diff = newValue - prev[trait]
      
      if (diff === 0) return prev
      
      const otherTraits = (Object.keys(prev) as TraitType[]).filter(t => t !== trait)
      
      if (diff > 0) {
        const totalOthers = otherTraits.reduce((sum, t) => sum + prev[t], 0)
        
        if (totalOthers === 0) {
          return { ...prev, [trait]: newValue }
        }
        
        const updated: Traits = { ...prev, [trait]: newValue }
        let remainingToReduce = diff
        
        otherTraits.forEach(t => {
          const proportion = prev[t] / totalOthers
          const reduction = Math.min(prev[t], Math.round(diff * proportion))
          updated[t] = prev[t] - reduction
          remainingToReduce -= reduction
        })
        
        while (remainingToReduce > 0) {
          const nonZeroTraits = otherTraits.filter(t => updated[t] > 0)
          if (nonZeroTraits.length === 0) break
          
          for (const t of nonZeroTraits) {
            if (remainingToReduce <= 0) break
            updated[t] = Math.max(0, updated[t] - 1)
            remainingToReduce--
          }
        }
        
        return updated
      } else {
        const updated: Traits = { ...prev, [trait]: newValue }
        const amountToDistribute = Math.abs(diff)
        
        const increasePerTrait = Math.floor(amountToDistribute / otherTraits.length)
        const remainder = amountToDistribute % otherTraits.length
        
        otherTraits.forEach((t, index) => {
          updated[t] = prev[t] + increasePerTrait + (index < remainder ? 1 : 0)
        })
        
        return updated
      }
    })
  }

  const handleCraft = () => {
    if (canCraft) {
      onCraft(selectedItem, traitValues)
    }
  }

  const itemTypes: ItemType[] = ['sword', 'potion', 'armor', 'ring', 'bow']
  const speedUpgrade = CRAFT_SPEED_UPGRADES.find(u => u.level === craftSpeedLevel)
  const speedBonus = speedUpgrade ? Math.round((1 - speedUpgrade.speedMultiplier) * 100) : 0

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Crafting</h2>
        {speedBonus > 0 && (
          <Badge variant="secondary" className="gap-1">
            <Clock size={14} />
            +{speedBonus}% Speed
          </Badge>
        )}
      </div>

      {craftingQueue.length > 0 && (
        <div className="mb-4 space-y-2">
          <div className="text-sm font-medium text-muted-foreground">Queue ({craftingQueue.length})</div>
          {craftingQueue.slice(0, 3).map((job, index) => {
            const now = Date.now()
            const elapsed = now - job.startTime
            const progress = Math.min(100, (elapsed / job.duration) * 100)
            const remaining = Math.max(0, (job.duration - elapsed) / 1000)
            const itemDef = ITEM_DEFINITIONS[job.type]
            
            return (
              <div key={job.id} className="p-2 bg-muted/50 rounded-lg space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{itemDef.icon}</span>
                    <span className="font-medium">{itemDef.name}</span>
                    {index === 0 && <Badge variant="outline" className="text-xs">Crafting</Badge>}
                  </div>
                  <span className="font-mono text-muted-foreground">
                    {remaining.toFixed(1)}s
                  </span>
                </div>
                <Progress value={progress} className="h-1.5" />
              </div>
            )
          })}
          {craftingQueue.length > 3 && (
            <div className="text-xs text-muted-foreground text-center">
              +{craftingQueue.length - 3} more in queue
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-5 gap-2 mb-6">
        {itemTypes.map(type => {
          const def = ITEM_DEFINITIONS[type]
          const count = craftCounts[type] || 0
          const level = getItemLevel(count)
          const isLocked = type !== 'sword' && level === 1 && count === 0

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
