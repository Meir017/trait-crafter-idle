import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Coins } from '@phosphor-icons/react'

interface ResourcePanelProps {
  resources: number
  maxResources: number
  coins: number
}

export function ResourcePanel({ resources, maxResources, coins }: ResourcePanelProps) {
  const percentage = (resources / maxResources) * 100

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
