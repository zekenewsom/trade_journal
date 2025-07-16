# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands
- `pnpm install` - Install dependencies for all packages
- `pnpm dev` - Start both React frontend (Vite dev server) and Electron backend with hot reloading
- `pnpm lint` - Run ESLint for all packages
- `pnpm type-check` - Run TypeScript type checking for all packages

### Package-Specific Commands
- `pnpm start-electron` - Start only the Electron app
- `pnpm start-react` - Start only the React app's Vite dev server
- `pnpm build-react` - Build the React app for production

### Testing
- Backend tests: Run Jest from `packages/electron-app/` directory
- No specific test runner configured at root level

## Architecture Overview

This is a **pnpm monorepo** containing an **Electron desktop application** for trading journal management with:

### Package Structure
- **`packages/electron-app/`** - Electron backend (Node.js + SQLite)
- **`packages/react-app/`** - React frontend (TypeScript + Vite + Material-UI + Tailwind)

### Key Architecture Patterns

#### Database Layer (`packages/electron-app/src/database/`)
- **Facade Pattern**: `db.js` exports all database operations
- **Service Layer**: Separate services for different domains:
  - `tradeService.js` - Trade management, P&L calculations (FIFO-based)
  - `transactionService.js` - Transaction logging and trade state updates  
  - `analyticsService.js` - Performance metrics and analytics
  - `accountService.js` - Account management
  - `emotionService.js` - Emotion tagging
- **Migrations**: Schema evolution in `migrations/` directory with `migrationService.js`
- **Connection**: Centralized SQLite connection management in `connection.js`

#### IPC Communication
- **Main Process** (`main.js`): IPC handlers for database operations
- **Preload Script** (`preload.js`): Secure exposure of backend functions to renderer
- **Frontend Types** (`react-app/src/types/index.ts`): `ElectronAPIDefinition` interface for type-safe IPC

#### Frontend State Management
- **Zustand Store** (`react-app/src/stores/appStore.ts`): Global state management
- **Component Structure**: Feature-based organization (analytics, dashboard, trades, transactions)

### Critical Integration Points

When making changes that affect multiple layers:

1. **Database Schema Changes**: 
   - Create new migration in `packages/electron-app/src/database/migrations/`
   - Update relevant service files
   - Update TypeScript types in `react-app/src/types/index.ts`

2. **IPC Changes**:
   - Add/modify handlers in `main.js`
   - Update exposure in `preload.js` 
   - Update `ElectronAPIDefinition` interface
   - Update frontend calls to `window.electronAPI`

3. **P&L Calculations**: 
   - Handled in `tradeService.js` with FIFO methodology
   - State recalculation affects trade status and analytics
   - Changes impact both individual trade views and analytics aggregations

## Styling Conventions

- **Tailwind CSS**: For layout, spacing, colors, and utilities
- **Material-UI**: Use `sx` prop with theme tokens from `design-tokens.ts`
- **Theme System**: Centralized design tokens in `react-app/src/styles/design-tokens.ts`
- Avoid hardcoded styles - use theme tokens or Tailwind classes

## Native Dependencies

- Uses `better-sqlite3` for SQLite database
- Requires `electron-rebuild` after installation for native modules
- pnpm workspace configured to handle native dependencies properly