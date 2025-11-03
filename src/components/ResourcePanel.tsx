import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Coins, ArrowUp } from '@phosphor-icons/react'
import { RESOURCE_UPGRADES } from '@/lib/types'

interface ResourcePanelProps {
  resources: number
  maxResources: number
  coins: number
  resourceRegenRate: number
  resourceUpgradeLevel: number
  onUpgrade: () => void
}

export function ResourcePanel({ 
  resources, 
  maxResources, 
  coins, 
  resourceRegenRate, 
  resourceUpgradeLevel,
  onUpgrade 
}: ResourcePanelProps) {
  const percentage = (resources / maxResources) * 100
  const nextUpgrade = RESOURCE_UPGRADES.find(u => u.level === resourceUpgradeLevel + 1)
  const canUpgrade = nextUpgrade && coins >= nextUpgrade.cost

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
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">
              +{resourceRegenRate}/s
            </span>
            {nextUpgrade && (
              <Button
                size="sm"
                variant={canUpgrade ? "default" : "outline"}
                onClick={onUpgrade}
                disabled={!canUpgrade}
                className="h-7 text-xs gap-1"
              >
                <ArrowUp size={14} />
                Upgrade ({nextUpgrade.cost} <Coins size={14} weight="fill" />)
              </Button>
            )}
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
      </div>
    </Card>
  )
}
