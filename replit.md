# Chinese Card Game

## Overview

A real-time multiplayer Chinese card game (likely Big Two/Tien Len style) built with React frontend and Express backend. The application supports both online multiplayer with WebSocket connections and local play against AI bots with three difficulty levels. Players can track their stats, view game history, and level up through XP progression.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state, local React state for UI
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **Animations**: Framer Motion for card animations and transitions
- **Build Tool**: Vite with custom plugins for Replit integration

The frontend follows a page-based structure with three main routes:
- Landing page (`/`) - Game mode selection and authentication
- Game page (`/play`) - Main gameplay with lobby and table views
- Profile page (`/profile`) - Player stats and game history

Game components are organized under `client/src/components/game/` with clear separation of concerns (PlayingCard, PlayerHand, GameTable, GameControls, etc.).

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Real-time**: WebSocket server (ws library) for game state synchronization
- **Authentication**: Replit Auth integration with OpenID Connect
- **Session Management**: PostgreSQL-backed sessions via connect-pg-simple

The server uses a modular architecture:
- `server/routes.ts` - REST API endpoints
- `server/game/` - Game logic (engine, bot AI, WebSocket handler, manager)
- `server/replit_integrations/auth/` - Authentication layer
- `server/storage.ts` - Data access layer with interface abstraction

### Game Engine Design
- Card game logic separated into `gameEngine.ts` (deck, dealing, hand detection, card comparison)
- Bot AI in `botAI.ts` with three difficulty strategies (easy, medium, hard)
- `gameManager.ts` handles room state, player management, and game flow
- WebSocket messages follow a typed message protocol defined in `shared/types/game.ts`

### Data Storage
- **ORM**: Drizzle ORM with PostgreSQL
- **Schema Location**: `shared/schema.ts`
- **Tables**: 
  - `sessions` - Auth session storage (required for Replit Auth)
  - `users` - User profiles (required for Replit Auth)
  - `player_stats` - Cumulative player statistics (games played, wins, level, XP)
  - `game_history` - Individual game records

### Shared Code
The `shared/` directory contains code used by both frontend and backend:
- `schema.ts` - Database schema and Zod validation schemas
- `types/game.ts` - TypeScript types for game entities (Card, Player, GameRoom, etc.)
- `models/auth.ts` - Auth-related database models

## External Dependencies

### Database
- **PostgreSQL** - Primary database accessed via `DATABASE_URL` environment variable
- Drizzle ORM handles migrations and schema management (`drizzle-kit push`)

### Authentication
- **Replit Auth** - OAuth/OIDC integration via `@replit/replit-auth` patterns
- Requires `ISSUER_URL`, `REPL_ID`, and `SESSION_SECRET` environment variables

### Real-time Communication
- **WebSocket** - Native `ws` library for game state synchronization
- Endpoint at `/ws` path

### UI Components
- **Radix UI** - Headless component primitives (dialogs, dropdowns, tooltips, etc.)
- **shadcn/ui** - Pre-styled components built on Radix
- **Lucide React** - Icon library

### Key Runtime Dependencies
- `express` - HTTP server
- `passport` + `openid-client` - Auth flow
- `drizzle-orm` + `pg` - Database access
- `ws` - WebSocket server
- `framer-motion` - Animations
- `@tanstack/react-query` - Data fetching

### Development/Build
- Vite for frontend bundling
- esbuild for server bundling (production)
- TypeScript throughout with path aliases (`@/`, `@shared/`)