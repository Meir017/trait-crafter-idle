import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { User, ShoppingBag, Hammer } from '@phosphor-icons/react'
import { Customer, CraftedItem, ITEM_DEFINITIONS, TRAIT_INFO } from '@/lib/types'
import { getQualityInfo } from '@/lib/game-logic'

interface CustomersPanelProps {
  customers: Customer[]
  inventory: CraftedItem[]
  resources: number
  onSell: (customerId: string, itemId: string) => void
  onCraftForCustomer: (customer: Customer) => void
}

export function CustomersPanel({ customers, inventory, resources, onSell, onCraftForCustomer }: CustomersPanelProps) {
  const [timeNow, setTimeNow] = useState(Date.now())

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeNow(Date.now())
    }, 100)
    return () => clearInterval(interval)
  }, [])

  if (customers.length === 0) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Customers</h2>
        <div className="text-center py-8 text-muted-foreground">
          <User size={48} className="mx-auto mb-2 opacity-50" />
          <p>No customers at the moment...</p>
          <p className="text-sm">They'll arrive soon!</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">
        Customers ({customers.length})
      </h2>
      <div className="space-y-4">
        {customers.map(customer => {
          const elapsed = timeNow - customer.arrivedAt
          const remaining = Math.max(0, customer.patience - elapsed)
          const patiencePercent = customer.maxPatience > 0 && isFinite(remaining)
            ? Math.max(0, Math.min(100, (remaining / customer.maxPatience) * 100))
            : 0
          const isUrgent = patiencePercent < 30

          const matchingItems = inventory.filter(item => item.type === customer.itemType)
          
          const bestItem = matchingItems.reduce<CraftedItem | null>((best, item) => {
            let meetsRequirements = item.traits[customer.preferredTrait] >= customer.minTraitValue
            
            if (customer.secondaryTraits && meetsRequirements) {
              for (const [trait, minValue] of Object.entries(customer.secondaryTraits)) {
                if (item.traits[trait as keyof typeof item.traits] < minValue) {
                  meetsRequirements = false
                  break
                }
              }
            }
            
            if (!meetsRequirements) return best
            
            const itemValue = item.traits[customer.preferredTrait]
            const bestValue = best ? best.traits[customer.preferredTrait] : -1
            return itemValue > bestValue ? item : best
          }, null)

          const canSell = bestItem !== null

          let optimalCost = (customer.minTraitValue || 0) * 1.5
          if (customer.secondaryTraits) {
            optimalCost += Object.values(customer.secondaryTraits).reduce((sum, val) => sum + (val || 0) * 1.2, 0)
          }
          optimalCost = isFinite(optimalCost) ? optimalCost : 0
          const canAffordOptimal = resources >= optimalCost

          const expPercent = customer.experienceToNextLevel > 0 && isFinite(customer.experience)
            ? Math.max(0, Math.min(100, (customer.experience / customer.experienceToNextLevel) * 100))
            : 0

          return (
            <Card 
              key={customer.id} 
              className={`p-4 ${isUrgent ? 'animate-pulse-glow border-destructive' : 'border-accent'}`}
            >
              <div className="flex items-start gap-3">
                <Avatar>
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {customer.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{customer.name}</h3>
                      <Badge variant="secondary" className="text-xs">
                        Lvl {customer.level}
                      </Badge>
                    </div>
                    <Badge variant="outline" className="bg-accent text-accent-foreground">
                      {customer.reward} 💰
                    </Badge>
                  </div>

                  {customer.level > 1 && (
                    <div className="mb-2">
                      <Progress value={expPercent} className="h-1" />
                    </div>
                  )}

                  <div className="text-sm mb-2">
                    Wants: <span className="font-medium">
                      {ITEM_DEFINITIONS[customer.itemType].icon}{' '}
                      {ITEM_DEFINITIONS[customer.itemType].name}
                    </span>
                  </div>

                  <div className="text-sm mb-2 space-y-1">
                    <div>
                      Prefers:{' '}
                      <span className="font-medium">
                        {TRAIT_INFO[customer.preferredTrait].icon}{' '}
                        {TRAIT_INFO[customer.preferredTrait].name}
                      </span>
                      {' '}(min {customer.minTraitValue})
                    </div>
                    {customer.secondaryTraits && Object.keys(customer.secondaryTraits).length > 0 && (
                      <div className="text-xs text-muted-foreground pl-2 space-y-0.5">
                        {Object.entries(customer.secondaryTraits).map(([trait, minValue]) => (
                          <div key={trait}>
                            + {TRAIT_INFO[trait as keyof typeof TRAIT_INFO].icon}{' '}
                            {TRAIT_INFO[trait as keyof typeof TRAIT_INFO].name} (min {minValue})
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mb-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className={isUrgent ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                        {isUrgent ? 'Leaving soon!' : 'Patience'}
                      </span>
                      <span className="font-mono">
                        {Math.ceil(remaining / 1000)}s
                      </span>
                    </div>
                    <Progress 
                      value={patiencePercent} 
                      className={`h-2 ${isUrgent ? 'bg-destructive/20' : ''}`}
                    />
                  </div>

                  {matchingItems.length === 0 ? (
                    <div className="space-y-2">
                      <Button
                        onClick={() => onCraftForCustomer(customer)}
                        size="sm"
                        className="w-full"
                        variant="secondary"
                        disabled={!canAffordOptimal}
                      >
                        <Hammer size={16} />
                        Craft Optimal ({Math.floor(optimalCost)} 🪵)
                      </Button>
                      {!canAffordOptimal && (
                        <p className="text-xs text-muted-foreground italic text-center">
                          Need {Math.floor(optimalCost - resources)} more resources
                        </p>
                      )}
                    </div>
                  ) : canSell ? (
                    <div className="space-y-1">
                      <Button
                        onClick={() => onSell(customer.id, bestItem.id)}
                        size="sm"
                        className="w-full"
                        variant="default"
                      >
                        <ShoppingBag size={16} />
                        Sell (Lv {bestItem.level}, {bestItem.traits[customer.preferredTrait]} {TRAIT_INFO[customer.preferredTrait].icon})
                      </Button>
                      <div className="text-xs text-center text-muted-foreground">
                        {(() => {
                          const totalTraits = Object.values(bestItem.traits).reduce((sum, val) => sum + val, 0)
                          const quality = getQualityInfo(totalTraits)
                          return <span className={quality.color}>{quality.label} Quality</span>
                        })()}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Button
                        onClick={() => onCraftForCustomer(customer)}
                        size="sm"
                        className="w-full"
                        variant="secondary"
                        disabled={!canAffordOptimal}
                      >
                        <Hammer size={16} />
                        Craft Optimal ({Math.floor(optimalCost)} 🪵)
                      </Button>
                      <p className="text-xs text-muted-foreground italic text-center">
                        Current items don't meet requirements
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </Card>
  )
}
