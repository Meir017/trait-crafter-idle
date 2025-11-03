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
- **Functionality**: Multiple craftable item types (Sword, Potion, Armor, Ring, Bow) each with 5 levels that unlock based on total crafted count
- **Purpose**: Provides long-term progression goals and variety in gameplay
- **Trigger**: Player selects an item and clicks craft after allocating resources
- **Progression**: View available items → Select item → Adjust trait resources → Craft → Item added to inventory → Craft count increases → Level unlocks at thresholds
- **Success criteria**: Items track individual craft counts, levels unlock at milestones (10, 25, 50, 100 crafted), higher levels provide better base stats

### Customer System
- **Functionality**: Customers arrive periodically with specific item requests and trait preferences, offering coins for successful trades
- **Purpose**: Creates time pressure and strategic crafting decisions - players must craft items that match customer demands
- **Trigger**: Random customer arrival after time interval (20-40 seconds)
- **Progression**: Customer arrives → Displays wanted item and preferred traits → Player selects matching item from inventory → Transaction completes → Earn coins → Customer leaves
- **Success criteria**: Customers display clear preferences, successful trades award coins, customers leave after timeout or purchase, better trait matches yield bonus coins

### Inventory & Storage
- **Functionality**: Grid display of crafted items showing their trait values and item type
- **Purpose**: Visual feedback of crafting results and strategic choice in which items to sell to which customers
- **Trigger**: Automatically updates when items crafted or sold
- **Progression**: Item crafted → Appears in inventory with trait breakdown → Customer arrives → Player selects best match → Item removed on sale
- **Success criteria**: Inventory persists between sessions, displays all relevant item info, allows easy selection for sales

### Idle Resource Generation
- **Functionality**: Resources passively regenerate over time even when player is away
- **Purpose**: Core idle game mechanic that rewards returning players and reduces grind
- **Trigger**: Automatic time-based regeneration
- **Progression**: Resources deplete from crafting → Regenerate at fixed rate → Cap at maximum → Player returns to full resources
- **Success criteria**: Resources regenerate while app is closed, respects maximum cap, rate feels balanced for gameplay loop

## Edge Case Handling

- **No matching inventory items** - Customer shows "No suitable items in stock" message and leaves after shorter timeout
- **Resource depletion during craft** - Craft button disabled when insufficient resources, shows warning tooltip
- **Full inventory** - Either auto-sell oldest items or prevent crafting with clear message (implement 50 item cap)
- **Multiple customers waiting** - Queue customers with max 3 visible, oldest leaves first if not served within time limit
- **Page closed during customer visit** - Customers don't persist, only resources and inventory/progression save
- **First-time player** - Tutorial tooltip overlay explaining resource allocation and customer system

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
  - Primary: Item craft completion (pop in with sparkle effect)
  - Secondary: Customer arrival/departure (slide in from right, fade out)
  - Tertiary: Resource changes (smooth number counting, bar fills)
  - Subtle: Hover states on craftable items (gentle lift/glow)

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
