# Design Guidelines: Chinese Card Game

## Design Approach

**Reference-Based: Professional Casino Poker/Card Gaming Platforms**

Draw inspiration from professional poker rooms, PokerStars, and modern card game interfaces. The design uses a **RED and BLACK casino aesthetic** with polished, professional poker table styling. Key visual references include red felt tables with leather rims and dark atmospheric backgrounds.

**Core Principles:**
- **Casino Aesthetic**: Red and black color scheme inspired by professional poker rooms
- **Instant Readability**: Game state, turn order, and card information must be immediately visible
- **Minimal Distraction**: UI supports gameplay without competing for attention
- **Professional Polish**: Refined, casino-quality visual treatment
- **Performance First**: Smooth 60fps animations even with multiple card movements

---

## Color Palette (RED & BLACK THEME)

### Primary Colors
- **Primary Red**: HSL(0, 72%, 45%) - Main brand color for buttons, accents
- **Primary Red (Dark Mode)**: HSL(0, 72%, 50%) - Slightly brighter for dark backgrounds

### Game Table Colors
- **Table Felt**: HSL(0, 45%, 32%) - Rich red felt surface
- **Table Felt (Dark)**: HSL(0, 45%, 25%) - Deeper red for dark mode
- **Table Rim**: HSL(0, 25%, 20%) - Dark leather rim color
- **Table Rim (Dark)**: HSL(0, 20%, 12%) - Nearly black rim

### Accent Colors
- **Gold**: HSL(45, 93%, 47%) - For highlights, winner effects, "Highest Rule"
- **Card Red**: RGB(220, 38, 38) - Hearts and Diamonds
- **Card Black**: RGB(23, 23, 23) - Spades and Clubs

### Background Colors
- **Light Mode Background**: Pure white HSL(0, 0%, 100%)
- **Dark Mode Background**: Deep black HSL(0, 0%, 6%)

---

## Logo Usage

**Custom Branding Assets:**
- `attached_assets/White_Bgrd_1765912843629.png` - White background logo for LIGHT mode
- `attached_assets/Black_Bgrd_1765912843629.png` - Black background logo for DARK mode

**Logo Component:**
- Located at `client/src/components/Logo.tsx`
- Automatically switches based on theme using MutationObserver
- Sizes: sm (h-8), md (h-12), lg (h-16), xl (h-24)
- Use in header (md) and hero sections (xl)

---

## Typography

**Primary Font**: Inter or Roboto (via Google Fonts CDN)
- **Game Text**: Medium weight (500) for clarity at all sizes
- **Card Values**: Bold (700) for instant recognition
- **Player Names**: Regular (400)
- **Stats/Numbers**: Tabular numerals for alignment

**Hierarchy:**
- **Hero/Titles**: text-3xl to text-4xl, font-bold
- **Player Names**: text-base, font-medium
- **Card Count Indicators**: text-sm, font-bold
- **Turn Timer**: text-2xl, font-bold (prominent)
- **Stats/History**: text-sm, font-normal

---

## Layout System

**Spacing Primitives**: Use Tailwind units of **2, 4, 8, 12, 16**
- **Component gaps**: gap-4
- **Card spacing**: gap-2 (tight clustering)
- **Section padding**: p-8 or p-12
- **Player area margins**: m-4
- **Button padding**: px-8 py-4

**Game Table Layout:**
- **Table Shape**: Oval with rounded corners (rounded-[40px])
- **Center Play Area**: Fixed central zone for played cards
- **Player Positions**: 4 fixed positions (bottom=you, top=opponent, left/right=sides)
- **Hand Display**: Bottom-anchored, always visible, horizontal card fan
- **No Dealer Position**: Table designed for 4 equal players only

---

## Component Library

### Core Game Components

**Playing Cards:**
- **Size**: Medium cards (w-16 h-24 for hand, w-20 h-28 for played cards)
- **Design**: Clean white background, large centered rank/suit, corner indicators
- **States**: Default, hovered (slight lift), selected (border highlight), disabled (opacity-50)
- **Back Design**: Dark pattern for face-down cards

**Game Table (Red Felt Design):**
- **Background**: Deep red felt texture with gradient lighting
- **Rim**: Dark leather-style border with subtle depth
- **Play Zone**: Central card area with soft shadow
- **Turn Indicator**: Glowing ring around active player's area
- **Atmospheric Background**: Dark gradient behind table for focus

**Player Areas:**
- **Avatar**: Circular with online status indicator
- **Name Plate**: Username + card count badge
- **Timer Ring**: Circular progress indicator (30s countdown)
- **Status**: "Thinking...", "Passed", "Winner!" overlays

### UI Controls

**Action Buttons:**
- **Play Hand**: Primary (red) action, large (px-12 py-4)
- **Pass**: Secondary style (muted)
- **Sort Hand**: Icon button in hand area
- **Leave Game**: Subtle, corner positioned

**Game Lobby:**
- **Room Code Display**: Large, copyable code (text-4xl, monospace)
- **Player Slots**: 4 slot grid showing filled/empty
- **Bot Difficulty Selector**: Segmented control (Easy/Medium/Hard)

---

## Animations

**Critical Animations:**

**Card Dealing:** Deck center, cards fly to each player (800ms per card)

**Card Playing:** Card lifts (scale-110, translateY: -20px), flies to center (500ms)

**Turn Transitions:** Active player area pulses (2s loop), timer depletes (30s)

**Highest Rule Activation:**
- Golden border glow around table
- "HIGHEST RULE!" banner with gold gradient
- Affected player highlighted

**Winner Celebration:**
- Confetti burst
- Victory banner
- Stats counter animation

---

## Special Features

**"Highest" Rule Visual Treatment:**
- Golden border-4 around table with animate-gold-glow
- Large "HIGHEST RULE!" text overlay with gold gradient
- Directional indicator to forced player

**Bot Indicators:**
- Robot icon next to bot names
- Difficulty badge (E/M/H)
- Faster animation for bot plays

---

**Key Files:**
- `client/src/index.css` - CSS custom properties for colors
- `tailwind.config.ts` - Theme configuration
- `client/src/components/Logo.tsx` - Theme-aware logo component
- `client/src/components/game/GameTable.tsx` - Red felt table design
- `client/src/pages/Landing.tsx` - Landing page with logo

This design creates a professional, casino-quality card game experience with the signature red and black poker aesthetic.
