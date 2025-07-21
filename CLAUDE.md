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
- TypeScript checking: `cd packages/react-app && npx tsc --noEmit`

## Architecture Overview

This is a **pnpm monorepo** containing an **Electron desktop application** for trading journal management with:

### Package Structure
- **`packages/electron-app/`** - Electron backend (Node.js + SQLite)
- **`packages/react-app/`** - React frontend (TypeScript + Vite + Material-UI + Tailwind)

### Frontend Codebase State
- **TypeScript Migration Complete**: All React components now use `.tsx` extensions
- **71 TypeScript React Files**: Fully typed component architecture
- **Single Remaining JS File**: `components/analytics/riskMetricsConfig.jsx` (configuration file)
- **Cleanup History**: 44 duplicate `.js`/`.jsx` files removed in December 2024

### Key Architecture Patterns

#### Database Layer (`packages/electron-app/src/database/`)
- **Facade Pattern**: `db.js` exports all database operations
- **Service Layer**: Separate services for different domains:
  - `tradeService.js` - Trade management, P&L calculations (FIFO-based with Decimal.js precision)
  - `transactionService.js` - Transaction logging and trade state updates  
  - `analyticsService.js` - Performance metrics and analytics (optimized with JOIN queries)
  - `accountService.js` - Account management
  - `emotionService.js` - Emotion tagging
- **Migrations**: Schema evolution in `migrations/` directory with `migrationService.js`
- **Connection**: Centralized SQLite connection management with maintenance mode support in `connection.js`
- **Financial Precision**: `financialUtils.js` with Decimal.js for precise financial calculations
- **Input Validation**: `validationUtils.js` with comprehensive validation system and ValidationError class
- **Performance**: Database indexes for optimal query performance in `migrations/009_add_performance_indexes.sql`

#### IPC Communication
- **Main Process** (`main.js`): IPC handlers with comprehensive input validation and maintenance mode checking
- **Preload Script** (`preload.js`): Secure exposure of backend functions to renderer
- **Frontend Types** (`react-app/src/types/index.ts`): `ElectronAPIDefinition` interface for type-safe IPC
- **Security**: All 18 IPC handlers validate inputs using ValidationError system

#### Frontend State Management
- **Zustand Store** (`react-app/src/stores/appStore.ts`): Global state management
- **Component Structure**: Feature-based organization (analytics, dashboard, trades, transactions)
- **TypeScript Integration**: All components use proper TypeScript interfaces and type definitions
- **Module Resolution**: `.tsx` files take precedence; avoid mixing `.js`/`.jsx` with `.tsx` equivalents

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
   - Handled in `tradeService.js` with FIFO methodology using Decimal.js for precision
   - State recalculation affects trade status and analytics
   - Changes impact both individual trade views and analytics aggregations
   - Financial precision eliminates floating-point arithmetic errors

## Styling Conventions

- **Tailwind CSS**: For layout, spacing, colors, and utilities
- **Material-UI**: Use `sx` prop with theme tokens from `design-tokens.ts`
- **Theme System**: Centralized design tokens in `react-app/src/styles/design-tokens.ts`
- Avoid hardcoded styles - use theme tokens or Tailwind classes

## Native Dependencies

- Uses `better-sqlite3` for SQLite database
- `decimal.js` for precise financial arithmetic
- Requires `electron-rebuild` after installation for native modules
- pnpm workspace configured to handle native dependencies properly

## Recent Critical Improvements

### Performance Optimizations (Fix #1)
- **N+1 Query Problem Resolved**: Converted individual database queries to efficient JOIN operations
- **60-80% Query Reduction**: Analytics and trade list operations now use single queries instead of multiple
- **Database Indexes**: Added comprehensive indexes in `migrations/009_add_performance_indexes.sql`
- **Location**: `analyticsService.js:fetchAnalyticsDataOptimized()`, `tradeService.js:fetchTradesForListView()`

### Financial Precision (Fix #2) 
- **Decimal.js Integration**: Eliminated JavaScript floating-point arithmetic errors
- **20-Decimal Precision**: Configured for financial accuracy with proper rounding
- **FIFO P&L Calculations**: Precise profit/loss calculations using decimal arithmetic
- **Location**: `financialUtils.js`, `tradeService.js:calculateTradePnlFifoEnhanced()`

### Race Condition Prevention (Fix #3)
- **Maintenance Mode System**: Prevents concurrent database access during critical operations
- **Backup/Restore Safety**: Automatic pre-restore backups with rollback capability
- **IPC Protection**: All handlers check maintenance mode before processing
- **Location**: `connection.js:setMaintenanceMode()`, `main.js:checkMaintenanceMode()`

### Input Validation & Security (Fix #4)
- **ValidationError Class**: Consistent error handling across all operations
- **Comprehensive Validation**: String, integer, financial number, datetime, and array validators
- **18 IPC Handlers Protected**: All user inputs validated before database operations
- **Domain-Specific Validation**: Account, transaction, and trade data validators
- **Location**: `validationUtils.js`, validation integrated throughout `main.js`

### Codebase Cleanup & TypeScript Migration (Fix #5)
- **Duplicate File Elimination**: Removed 44 duplicate `.js`/`.jsx` files in favor of `.tsx` versions
- **TypeScript Consistency**: All React components now use TypeScript with proper type definitions
- **50% File Reduction**: Eliminated redundant React component files for cleaner codebase
- **Module Resolution Optimization**: Predictable import paths with TypeScript-first architecture
- **Location**: `packages/react-app/src/` - all components, views, and utilities now TypeScript

## Development Best Practices

### Financial Calculations
- **Always use Decimal.js** for monetary calculations, never JavaScript number arithmetic
- Import functions from `financialUtils.js`: `add()`, `subtract()`, `multiply()`, `divide()`
- Use `isValidFinancialNumber()` for input validation

### Database Operations
- **Use the facade pattern**: Import operations from `db.js`, not individual services
- **Check maintenance mode**: Use `checkMaintenanceMode()` before critical operations
- **Validate inputs**: Use `validationUtils.js` functions for all user inputs
- **Handle ValidationError**: Catch and return appropriate error messages

### Performance Considerations
- **Avoid N+1 queries**: Use JOIN operations to fetch related data in single queries
- **Use prepared statements**: All database operations use better-sqlite3 prepared statements
- **Leverage indexes**: Query patterns are optimized with database indexes

### TypeScript Development
- **Always use `.tsx` extensions** for React components (migration complete)
- **Proper type definitions**: Import types from `src/types/index.ts`
- **Component interfaces**: Use React.FC or explicit prop interfaces
- **Avoid JavaScript files**: All new React components must be TypeScript
- **Type-safe IPC**: Use `ElectronAPIDefinition` interface for backend communication

### File Organization
- **No duplicate extensions**: Never create both `.js`/`.jsx` and `.tsx` versions of the same component
- **TypeScript-first**: All React code should be TypeScript unless there's a specific configuration reason
- **Clean imports**: Use relative imports and avoid file extensions in import statements
- **Feature-based structure**: Organize components by feature (analytics, dashboard, trades, etc.)