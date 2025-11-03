import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { User, ShoppingBag } from '@phosphor-icons/react'
import { Customer, CraftedItem, ITEM_DEFINITIONS, TRAIT_INFO } from '@/lib/types'

interface CustomersPanelProps {
  customers: Customer[]
  inventory: CraftedItem[]
  onSell: (customerId: string, itemId: string) => void
}

export function CustomersPanel({ customers, inventory, onSell }: CustomersPanelProps) {
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
          const patiencePercent = (remaining / customer.maxPatience) * 100
          const isUrgent = patiencePercent < 30

          const matchingItems = inventory.filter(item => item.type === customer.itemType)
          const bestItem = matchingItems.reduce<CraftedItem | null>((best, item) => {
            const itemValue = item.traits[customer.preferredTrait]
            const bestValue = best ? best.traits[customer.preferredTrait] : -1
            return itemValue > bestValue ? item : best
          }, null)

          const canSell = bestItem && bestItem.traits[customer.preferredTrait] >= customer.minTraitValue

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
                    <h3 className="font-semibold">{customer.name}</h3>
                    <Badge variant="outline" className="bg-accent text-accent-foreground">
                      {customer.reward} 💰
                    </Badge>
                  </div>

                  <div className="text-sm mb-2">
                    Wants: <span className="font-medium">
                      {ITEM_DEFINITIONS[customer.itemType].icon}{' '}
                      {ITEM_DEFINITIONS[customer.itemType].name}
                    </span>
                  </div>

                  <div className="text-sm mb-3">
                    Prefers:{' '}
                    <span className="font-medium">
                      {TRAIT_INFO[customer.preferredTrait].icon}{' '}
                      {TRAIT_INFO[customer.preferredTrait].name}
                    </span>
                    {' '}(min {customer.minTraitValue})
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
                    <p className="text-xs text-muted-foreground italic">
                      No suitable items in stock
                    </p>
                  ) : canSell ? (
                    <Button
                      onClick={() => onSell(customer.id, bestItem.id)}
                      size="sm"
                      className="w-full"
                      variant="default"
                    >
                      <ShoppingBag size={16} />
                      Sell ({bestItem.traits[customer.preferredTrait]} {TRAIT_INFO[customer.preferredTrait].icon})
                    </Button>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">
                      Items don't meet requirements
                    </p>
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
