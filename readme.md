# Trade Journal Monorepo

## Description

The Trade Journal Monorepo is a desktop application designed for traders to log, review, and analyze their trading activities. It features an Electron-based backend for data management and a React-based frontend for user interaction, all managed within a pnpm monorepo structure. The application utilizes an SQLite database for storing trade data, account information, and analytics.

## Features

* **Trade Logging**: Comprehensive logging of individual transactions (buy/sell actions, quantity, price, fees, notes, strategy, emotions, and reflection fields).
* **Position Management**: Automatic grouping of transactions into trades/positions.
* **P&L Calculation**: FIFO-based Profit & Loss calculation for both realized and unrealized P&L.
* **Mark-to-Market**: Ability to update the current market price for open positions to see live unrealized P&L.
* **Account Management**: Create and manage multiple cash accounts, log deposits/withdrawals, and track account balances and time-series performance.
* **Advanced Analytics**:
    * Equity curve and drawdown curve visualization.
    * Performance statistics: win rate, average win/loss, largest win/loss, profit factor, average R-Multiple, Sharpe Ratio, Sortino Ratio.
    * Grouped performance analysis: by strategy, asset class, exchange, emotion, and asset.
    * Visualizations: P&L vs. Duration scatter plot, R-Multiple histogram, daily P&L heatmap calendar.
* **Data Management**:
    * Database backup and restore functionality.
    * Data export to CSV, JSON, and XLSX formats.
* **Reflection Fields**: Capture qualitative aspects of trades like conviction score, thesis validation, adherence to plan, and lessons learned.
* **Emotion Tagging**: Link emotions to trades and individual transactions.

## Tech Stack

* **Monorepo Management**: pnpm workspaces
* **Backend**:
    * Electron
    * Node.js
    * SQLite (via `better-sqlite3`)
    * `date-fns` for date utilities
* **Frontend**:
    * React
    * TypeScript
    * Vite
    * Zustand for state management
    * Material-UI (MUI) for UI components
    * Tailwind CSS for utility-first styling
    * Recharts for charting
    * `lucide-react` for icons
    * `framer-motion` for animations
* **Development Tools**:
    * ESLint
    * Nodemon
    * Concurrently
    * Wait-on

## Architecture

The application is divided into two main packages:

1.  **`packages/electron-app`**: This is the backend Electron application.
    * `main.js`: Entry point, manages app lifecycle, browser windows, and IPC handlers.
    * `preload.js`: Securely exposes IPC functions to the frontend.
    * `src/database/`: Contains all database-related logic:
        * `connection.js`: Manages SQLite connection.
        * `db.js`: Facade for all database services.
        * Service files (`accountService.js`, `analyticsService.js`, `emotionService.js`, `tradeService.js`, `transactionService.js`): Handle business logic for specific database entities.
        * `migrationService.js`: Manages schema migrations.
        * `migrations/`: SQL files for database schema evolution.
2.  **`packages/react-app`**: This is the frontend React application.
    * `vite.config.ts`: Vite build configuration.
    * `src/main.tsx`: React app entry point.
    * `src/App.tsx`: Root React component, handles view rendering.
    * `src/stores/appStore.ts`: Zustand global state management.
    * `src/types/`: TypeScript type definitions, including `ElectronAPIDefinition` for IPC.
    * `src/components/`: UI components organized by feature (analytics, dashboard, layout, trades, transactions, ui).
    * `src/views/`: Top-level page components.
    * `src/styles/`: Theming (`theme.ts` for MUI) and design tokens (`design-tokens.ts`).

**Communication**: The React frontend communicates with the Electron backend via IPC. `preload.js` exposes backend functions defined in `main.js` to the `window.electronAPI` object, which the React app can then call.

## Prerequisites

* Node.js (version specified in relevant `package.json` files, generally >=16)
* pnpm (Package manager)

## Getting Started

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd zekenewsom-trade_journal
    ```

2.  **Install dependencies**:
    Use pnpm to install dependencies for all packages from the monorepo root.
    ```bash
    pnpm install
    ```
    This will also trigger `electron-rebuild` if necessary for native dependencies like `better-sqlite3`.

3.  **Run the application in development mode**:
    From the root directory:
    ```bash
    pnpm dev
    ```
    This script uses `concurrently` to start the Vite dev server for the React app and the Electron application with Nodemon for hot reloading of the main process. It uses `wait-on` to ensure the Vite server is ready before Electron attempts to load the URL.

## Key Scripts

Located in the root `package.json`:

* `pnpm dev`: Starts both the React frontend (Vite dev server) and the Electron backend (with Nodemon) for development.
* `pnpm start-electron`: Starts only the Electron app.
* `pnpm start-react`: Starts only the React app's Vite dev server.
* `pnpm build-react`: Builds the React app for production.
* `pnpm lint`: Runs ESLint for all packages.
* `pnpm type-check`: Runs TypeScript type checking for all packages.

Scripts specific to `electron-app` (`packages/electron-app/package.json`):
* `pnpm start`: Starts the Electron app directly.
* `pnpm start:dev`: Starts the Electron app with Nodemon for main process hot reloading.

Scripts specific to `react-app` (`packages/react-app/package.json`):
* `pnpm dev`: Starts the Vite development server.
* `pnpm build`: Builds the React app using TypeScript and Vite.
* `pnpm lint`: Runs ESLint for the React app.
* `pnpm preview`: Serves the production build locally.

## Project Structure Overview

zekenewsom-trade_journal/
├── package.json            # Root project configuration and scripts
├── pnpm-lock.yaml          # Exact dependency versions
├── pnpm-workspace.yaml     # Monorepo package locations
├── .windsurfrules          # Project analysis and development guidelines
└── packages/
├── electron-app/       # Electron backend
│   ├── main.js         # Electron main process entry point
│   ├── preload.js      # Electron preload script for IPC
│   ├── package.json    # Backend dependencies and scripts
│   ├── scripts/
│   │   └── migrate_user_db.js # Standalone DB migration script
│   └── src/
│       └── database/   # Database services, connection, migrations
└── react-app/          # React frontend
├── vite.config.ts  # Vite configuration
├── index.html      # HTML entry point
├── package.json    # Frontend dependencies and scripts
├── tailwind.config.js # Tailwind CSS configuration
├── tsconfig.json   # TypeScript configuration
└── src/
├── App.tsx     # Root React component
├── main.tsx    # React app entry point
├── stores/
│   └── appStore.ts # Zustand global state
├── styles/
│   ├── design-tokens.ts # Shared design tokens
│   └── theme.ts    # MUI theme configuration
├── types/        # TypeScript definitions
├── components/   # UI Components
└── views/        # Page-level components


## Making Changes & Sensitive Areas

Please refer to the `.windsurfrules` file for detailed guidelines on making changes to the codebase. Key points include:

* **DB Schema Changes**: Create new SQL migration files in `packages/electron-app/src/database/migrations/`.
* **IPC Changes**: Consistently update `main.js` (handlers), `preload.js` (exposure), and `react-app/src/types/index.ts` (`ElectronAPIDefinition`).
* **Frontend State**: Modify `react-app/src/stores/appStore.ts`.
* **Styling**: Adhere to Tailwind CSS for layout and MUI `sx` prop with theme tokens for MUI components.

**Sensitive Areas (High Interdependency):**
* Database services in `packages/electron-app/src/database/`, especially `tradeService.js` (P&L calculation, state recalculation), `transactionService.js`, and `analyticsService.js`.
* Database schema (`packages/electron-app/src/database/migrations/`) and migration logic (`packages/electron-app/src/database/migrationService.js`).
* IPC Layer: `packages/electron-app/main.js` (ipcMain), `packages/electron-app/preload.js`, and frontend `window.electronAPI` calls.
* React global state: `packages/react-app/src/stores/appStore.ts`.
* Core type definitions: `packages/react-app/src/types/index.ts`.

## Testing

* **Backend**: Jest is configured for the Electron app (`packages/electron-app/jest.config.js`). Run tests related to backend services.
* **Frontend**: Visual and unit tests should be implemented for React components.
* **E2E Testing**: Recommended for testing integrated features across the Electron and React parts.

## Run linters and type checkers before committing:
* ```bash
* pnpm lint
* pnpm type-check

## Styling Conventions

* The project follows specific styling conventions as outlined in packages/react-app/README.md:

* Use Tailwind CSS for utilities and layout (margins, padding, flex/grid, colors, typography, etc.).
* Use MUI's sx prop with theme tokens (from design-tokens.ts via theme.ts) for MUI component-specific styling.
* Remove hardcoded styles; all colors, radii, and shadows should come from the MUI theme or Tailwind classes.
* For charts and third-party visualizations, use Tailwind for layout and theme tokens for colors where possible.