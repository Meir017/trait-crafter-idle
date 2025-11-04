# Planning Guide

An idle crafting game where players craft items with customizable traits using a shared resource pool, sell to demanding customers, and unlock new item tiers through progression.

**Experience Qualities**:
1. **Engaging** - The resource allocation system creates meaningful decisions where players must balance multiple traits on each crafted item
2. **Rewarding** - Steady progression through item levels and successful customer transactions provides constant feedback and achievement
3. **Strategic** - Customers with specific trait preferences require players to craft items intelligently rather than mindlessly produce

**Complexity Level**: Light Application (multiple features with basic state)
The game involves crafting, customer management, and resource allocation with persistent progression, but remains focused on core idle mechanics without account systems or complex multiplayer features.

## Essential Features

### Resource Pool Management
- **Functionality**: Single unified resource pool that players allocate across different traits when crafting items
- **Purpose**: Creates strategic depth - players must decide how to distribute limited resources to strengthen different aspects of items
- **Trigger**: Players interact with sliders/controls when crafting an item
- **Progression**: Select item to craft → Adjust resource sliders for traits (Quality, Speed, Durability, Style) → Confirm craft → Resources consumed → Item produced with weighted traits
- **Success criteria**: Resource pool depletes based on allocation, items reflect the trait distribution, resources regenerate over time

### Item Crafting & Progression
- **Functionality**: Multiple craftable item types (Sword, Potion, Armor, Ring, Bow) each with 5 levels that unlock based on total crafted count. Items unlock progressively - Sword is available at start, Potion unlocks after 5 swords, Armor after 10 potions, Ring after 15 swords, Bow after 20 armor. Progress bars show unlock progress. Crafting takes time based on item type and level, with animations showing progress.
- **Purpose**: Provides long-term progression goals, natural gating to prevent overwhelming new players, and variety in gameplay with engaging crafting animations
- **Trigger**: Player selects an item and clicks craft after allocating resources
- **Progression**: View available/locked items with unlock requirements → Craft prerequisite items → Progress bar fills toward unlock → Item becomes available → Select item → Adjust trait resources → Click craft → Job added to queue → Progress bar shows completion → Item added to inventory → Craft count increases → Level unlocks at thresholds
- **Success criteria**: Items show unlock requirements with progress bars, locked items cannot be crafted, unlocks trigger when requirements met, levels unlock at milestones (10, 25, 50, 100 crafted), higher levels craft faster and provide better base stats, crafting times feel balanced (3-8 seconds base)

### Customer System
- **Functionality**: Customers arrive periodically with specific item requests and trait preferences, offering coins for successful trades. Customers only request items that the player has unlocked by crafting at least one of that item type. Customer arrival time is shown with a countdown timer and progress bar. Customers have persistent identities, gaining experience and levels with each successful purchase. Higher level customers request stronger items with minimum requirements in multiple traits (level 3+ adds 1 secondary trait, level 5+ can have 1-2 secondary traits, level 7+ always has 2 secondary traits).
- **Purpose**: Creates time pressure and strategic crafting decisions - players must craft items that match customer demands. Limiting requests to unlocked items provides natural progression gates. Customer leveling adds long-term relationship building and progressively harder challenges. The arrival timer with upgrades gives players control over customer flow.
- **Trigger**: Customers arrive based on timer (default 20-40 seconds, upgradeable to 6-12 seconds at max level). Timer shows countdown to next arrival.
- **Progression**: Timer counts down → Customer arrives → Displays wanted item (from unlocked types), level, experience, and preferred traits (primary + optional secondary traits) → Player selects matching item from inventory → Transaction completes → Customer gains experience → May level up → Earn coins → Customer leaves
- **Success criteria**: Customers display clear preferences with primary and secondary trait requirements, only request unlocked item types, successful trades award coins and experience, customers level up and become more demanding, customers leave after timeout or purchase, better trait matches yield bonus coins, arrival timer shows time until next customer with upgradeable spawn rate

### Resource Production Upgrades
- **Functionality**: Players can spend coins to permanently upgrade their resource regeneration rate through 8 upgrade levels (1/s → 25/s)
- **Purpose**: Provides meaningful coin sink and progression path that accelerates gameplay as players advance
- **Trigger**: Player clicks upgrade button in resource panel when they have sufficient coins
- **Progression**: Earn coins from sales → Spend coins on upgrade → Resource generation rate increases permanently → Can craft more frequently
- **Success criteria**: Each upgrade level costs more coins (50, 150, 300, 600, 1200, 2500, 5000), regeneration rate increases appropriately (2/s, 3/s, 5/s, 8/s, 12/s, 18/s, 25/s), upgrade persists between sessions

### Resource Capacity Upgrades
- **Functionality**: Upgradeable maximum resource storage capacity from 100 to 2500 across 8 levels
- **Purpose**: Allows players to store resources for bigger crafting sessions and reduces need to constantly monitor resources
- **Trigger**: Player clicks capacity upgrade button when they have sufficient coins
- **Progression**: Earn coins → Purchase upgrade → Max resource cap increases → Can accumulate more resources during idle periods
- **Success criteria**: Capacity upgrades persist, costs scale appropriately (40, 120, 250, 500, 1000, 2000, 4000), capacities increase (150, 250, 400, 650, 1000, 1500, 2500)

### Craft Speed Upgrades
- **Functionality**: Reduce crafting time by up to 70% through 8 upgrade levels
- **Purpose**: Makes gameplay feel faster and more responsive as players progress, rewards investment in efficiency
- **Trigger**: Player purchases craft speed upgrade from resource panel
- **Progression**: Earn coins → Buy speed upgrade → All future crafts complete faster → Can produce items more rapidly for customers
- **Success criteria**: Speed multipliers apply correctly (1.0x down to 0.3x), costs scale (60, 180, 400, 800, 1600, 3200, 6400), upgrades persist, visual feedback shows current speed bonus

### Crafting Slots Upgrades
- **Functionality**: Increase number of simultaneous crafting slots from 1 to 10 across 8 upgrade levels
- **Purpose**: Allows players to craft multiple items simultaneously, dramatically accelerating production and enabling better customer service
- **Trigger**: Player purchases crafting slots upgrade from resource panel
- **Progression**: Start with 1 slot → Buy upgrade → Can queue multiple items that craft in parallel → More efficient production
- **Success criteria**: Only active slots show crafting progress, queued items wait until slot opens, slot count displayed clearly (e.g., "3 / 5 slots"), costs scale appropriately (100, 300, 700, 1500, 3000, 6000, 12000), unlocks 2, 3, 4, 5, 6, 8, 10 slots

### Inventory Size Upgrades
- **Functionality**: Expand inventory capacity from 50 slots to 1000 slots across 8 levels
- **Purpose**: Removes storage bottleneck as players craft more frequently and allows stockpiling diverse items for customers
- **Trigger**: Player purchases inventory upgrade when needed
- **Progression**: Hit inventory limit → Buy upgrade → Can store more items → Continue crafting without selling immediately
- **Success criteria**: Inventory counts include queued items, upgrades increase cap (75, 100, 150, 200, 300, 500, 1000), costs scale (80, 200, 450, 900, 1800, 3600, 7200)

### Customer Arrival Rate Upgrades
- **Functionality**: Reduce time between customer arrivals from 20-40 seconds (base) to 6-12 seconds (max level) across 8 upgrade levels. Progress bar shows countdown to next customer arrival.
- **Purpose**: Accelerates gameplay and increases sales opportunities as players progress, giving them more frequent chances to trade items
- **Trigger**: Player purchases customer spawn rate upgrade from resource panel
- **Progression**: Earn coins → Buy arrival rate upgrade → Customers arrive more frequently → More trading opportunities → Faster coin generation
- **Success criteria**: Timer accurately shows time until next customer, spawn rate multipliers apply correctly (1.0x down to 0.3x), costs scale (80, 200, 450, 900, 1800, 3600, 7200), upgrades persist, visual timer shows countdown and fills as arrival approaches

### Customer Experience & Leveling
- **Functionality**: Customers have persistent identities that gain experience points with each successful trade, leveling up to request increasingly difficult items with multi-trait requirements
- **Purpose**: Creates long-term progression and relationship building, rewards players for serving the same customers repeatedly, adds complexity as customers grow more demanding
- **Trigger**: Successful sale to customer awards experience (10 base + 5 per customer level + 20 bonus for perfect match)
- **Progression**: Sell item to customer → Customer gains experience → Progress bar fills → Customer levels up → Returns with harder requests (higher trait minimums + secondary trait requirements) → Higher rewards for success
- **Success criteria**: Customer data persists between visits, experience bars show progress, level-ups trigger celebration toast, higher level customers request items with 1-2 secondary trait requirements in addition to primary trait, rewards scale with customer level and difficulty

### Inventory & Storage
- **Functionality**: Grid display of crafted items showing their trait values and item type, with upgradeable capacity
- **Purpose**: Visual feedback of crafting results and strategic choice in which items to sell to which customers
- **Trigger**: Automatically updates when items crafted or sold
- **Progression**: Item crafted → Appears in inventory with trait breakdown → Customer arrives → Player selects best match → Item removed on sale
- **Success criteria**: Inventory persists between sessions, displays all relevant item info including queued items, allows easy selection for sales, shows current capacity vs max

### Idle Resource Generation
- **Functionality**: Resources passively regenerate over time even when player is away
- **Purpose**: Core idle game mechanic that rewards returning players and reduces grind
- **Trigger**: Automatic time-based regeneration
- **Progression**: Resources deplete from crafting → Regenerate at fixed rate → Cap at maximum → Player returns to full resources
- **Success criteria**: Resources regenerate while app is closed, respects maximum cap, rate feels balanced for gameplay loop

## Edge Case Handling

- **No matching inventory items** - Customer shows "No suitable items in stock" message and leaves after shorter timeout
- **Resource depletion during craft** - Craft button disabled when insufficient resources, shows warning tooltip
- **Full inventory/queue** - Prevent crafting when inventory + queue reaches capacity, show clear message with inventory upgrade suggestion
- **All crafting slots busy** - Prevent new crafts when all slots occupied, items queue for next available slot, clear slot status shown (e.g., "3 / 3 slots busy")
- **Multiple customers waiting** - Queue customers with max 3 visible, oldest leaves first if not served within time limit
- **Page closed during customer visit** - Customers don't persist, only resources and inventory/progression save, customer database (levels/experience) persists
- **Page closed during crafting** - Crafting jobs continue progressing based on timestamp, complete when player returns
- **First-time player** - Tutorial tooltip overlay explaining resource allocation and customer system
- **Crafting queue full** - Show queue status in inventory count, prevent new crafts when at capacity
- **Customer multi-trait requirements** - Higher level customers (3+) require items to meet secondary trait minimums in addition to primary trait, craft optimal button calculates correct allocation, items in inventory must meet all requirements to be sellable
- **Returning customers** - Same customer names can appear multiple times with their saved level and experience, experience persists across sessions

## Design Direction

The design should feel like a cozy fantasy workshop - warm, inviting, and slightly whimsical with a touch of medieval charm. The interface should be rich enough to feel like a living crafting shop with character portraits and item details, while maintaining clean readability for the strategic resource allocation mechanics.

## Color Selection

Triadic color scheme evoking a magical workshop with warm crafting fires, mystical potions, and rich materials. Colors should feel fantasy-themed but remain readable and pleasant for extended play sessions.

- **Primary Color**: Deep Purple `oklch(0.45 0.15 300)` - Represents magical crafting energy and mystical workshop atmosphere
- **Secondary Colors**: Warm Amber `oklch(0.70 0.15 70)` for crafting/active states and Forest Green `oklch(0.55 0.12 150)` for success/completion
- **Accent Color**: Bright Gold `oklch(0.80 0.15 85)` - Eye-catching highlight for customer requests, important actions, and rare unlocks
- **Foreground/Background Pairings**:
  - Background (Warm Cream `oklch(0.95 0.02 80)`): Dark Text `oklch(0.25 0.02 280)` - Ratio 12.8:1 ✓
  - Card (Off-White `oklch(0.97 0.01 80)`): Dark Text `oklch(0.25 0.02 280)` - Ratio 13.5:1 ✓
  - Primary (Deep Purple `oklch(0.45 0.15 300)`): White Text `oklch(0.98 0 0)` - Ratio 8.2:1 ✓
  - Secondary (Warm Amber `oklch(0.70 0.15 70)`): Dark Text `oklch(0.25 0.02 280)` - Ratio 6.5:1 ✓
  - Accent (Bright Gold `oklch(0.80 0.15 85)`): Dark Text `oklch(0.25 0.02 280)` - Ratio 8.9:1 ✓
  - Muted (Light Tan `oklch(0.90 0.02 75)`): Medium Text `oklch(0.50 0.02 280)` - Ratio 5.2:1 ✓

## Font Selection

Typography should feel approachable and fantasy-inspired without being overly ornate - clear readability for numbers and stats is essential while maintaining thematic character.

- **Typographic Hierarchy**:
  - H1 (Game Title): Cinzel Bold/32px/tight letter spacing - Decorative serif for fantasy workshop branding
  - H2 (Section Headers): Inter Semibold/20px/normal - Clean sans-serif for "Crafting", "Customers", "Inventory"
  - H3 (Item Names): Inter Medium/16px/normal - Clear item identification
  - Body (Stats/Descriptions): Inter Regular/14px/relaxed line-height 1.6 - Readable trait values and descriptions
  - Labels (UI Controls): Inter Medium/12px/wide letter spacing - Uppercase labels for resource sliders
  - Numbers (Resources/Counts): JetBrains Mono Medium/14px - Monospace for easy scanning of quantities

## Animations

Animations should enhance the feeling of a living workshop with items being crafted, customers arriving, and resources flowing. Motion should be snappy enough for an idle game (not delay actions) while adding personality and visual feedback.

- **Purposeful Meaning**: Crafting animations feel like magical assembly, customer arrivals feel like visitors entering a shop, resource allocation flows like liquid into molds
- **Hierarchy of Movement**: 
  - Primary: Item craft completion (pop in with sparkle effect), crafting queue progress (smooth progress bar fills)
  - Secondary: Customer arrival/departure (slide in from right, fade out)
  - Tertiary: Resource changes (smooth number counting, bar fills)
  - Subtle: Hover states on craftable items (gentle lift/glow), upgrade button pulses when affordable

## Component Selection

- **Components**:
  - **Card** - Item display in inventory grid and customer request panels (add subtle shadows, rounded corners with --radius-lg)
  - **Progress** - Resource pool bar and customer patience timer (custom gradient fills based on trait type)
  - **Slider** - Resource allocation controls (styled with gradient fills matching trait colors)
  - **Button** - Primary craft button, sell action (use variant="default" for craft, variant="outline" for secondary)
  - **Badge** - Item level indicators and trait value displays (use variant="secondary" for levels, custom colors for traits)
  - **Separator** - Visual breaks between sections (subtle, matches border color)
  - **Tooltip** - Hover details on items and locked content (quick delay, clear explanations)
  - **Avatar** - Customer portraits (circular with fantasy character illustrations)
  - **Tabs** - Switch between different item categories if needed (styled minimally to not distract)
  
- **Customizations**:
  - **Resource Sliders** - Custom gradient backgrounds that match trait colors (Quality=purple, Speed=amber, Durability=green, Style=gold)
  - **Item Cards** - Hover state with subtle lift and glow effect, click feedback with scale down
  - **Customer Request Card** - Pulsing border animation to draw attention, countdown timer visualization
  - **Craft Button** - Disabled state with resource icon showing what's missing, success animation on complete
  - **Inventory Grid** - Custom layout with CSS Grid, items have rarity-based border colors based on trait totals

- **States**:
  - Buttons: Default (solid with shadow), Hover (slight lift + brightness increase), Active (scale 0.98), Disabled (opacity 0.5 + cursor-not-allowed)
  - Sliders: Dragging (thumb enlarges slightly, gradient brightens), Disabled (grayscale)
  - Item Cards: Default (subtle shadow), Hover (lifted shadow + glow), Selected (border highlight in accent color), Locked (grayscale + lock icon overlay)
  - Customer Cards: Active (pulsing animation), Timeout Warning (border turns red in last 10 seconds), Leaving (fade out animation)

- **Icon Selection**:
  - Hammer/Wrench (Craft action)
  - ShoppingBag (Customer/sell action)
  - TrendUp (Level up indication)
  - Sparkle (Quality trait)
  - Lightning (Speed trait)
  - Shield (Durability trait)
  - Palette (Style trait)
  - Coin/CurrencyDollar (Currency display)
  - Lock (Locked items)
  - User (Customer icon)
  - Timer/Clock (Craft speed upgrades)
  - Package (Inventory upgrades)
  - ArrowUp (Speed upgrades)
  - Database (Capacity upgrades)
  - Factory (Crafting slots upgrades)

- **Spacing**: 
  - Section gaps: gap-8 (2rem) between major areas (Crafting/Customers/Inventory)
  - Card padding: p-6 for customer cards, p-4 for item cards
  - Grid gaps: gap-4 for inventory grid
  - Button spacing: gap-2 for icon+text buttons
  - Stat rows: gap-3 between trait displays

- **Mobile**: 
  - Stack layout vertically: Resources → Crafting → Customers → Inventory (single column on <768px)
  - Inventory grid: 2 columns mobile, 4 columns tablet, 6 columns desktop
  - Customer cards: Full width on mobile with scrollable queue
  - Resource sliders: Larger touch targets (min 44px height), labels above instead of inline
  - Sticky craft button at bottom on mobile for easy access
  - Collapsible sections with expand/collapse for Customers and Inventory to save screen space
