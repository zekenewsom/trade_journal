# Gemini Project Analysis

## Project Overview

This project is a monorepo containing a desktop application for trade journaling. It consists of two main packages: an `electron-app` for the backend and a `react-app` for the frontend. The application uses a SQLite database for data storage.

## Technologies Used

### Backend (`electron-app`)

*   **Framework:** Electron
*   **Database:** better-sqlite3
*   **Language:** JavaScript
*   **Key Libraries:**
    *   `date-fns`: For date manipulation.
    *   `decimal.js`: For precise decimal arithmetic.

### Frontend (`react-app`)

*   **Framework:** React
*   **Bundler:** Vite
*   **UI Libraries:**
    *   Material-UI (MUI)
    *   Tailwind CSS
    *   Radix UI
*   **Routing:** React Router
*   **State Management:** Zustand
*   **Charting:** Recharts
*   **Language:** TypeScript
*   **Key Libraries:**
    *   `date-fns`: For date manipulation.
    *   `framer-motion`: For animations.
    *   `lucide-react`: For icons.
    *   `uuid`: For generating unique IDs.

## Project Structure

The project is organized as a monorepo with the following structure:

*   `packages/electron-app`: Contains the main Electron application, including the database connection, services, and migrations.
*   `packages/react-app`: Contains the React frontend, including components, views, and state management.

## How to Run the Application

To run the application in development mode, use the following command from the root directory:

```bash
pnpm dev
```

This command will concurrently start the Vite development server for the React app and the Electron application.

## Entry Points for Modification

### Backend

*   `packages/electron-app/main.js`: The main entry point for the Electron application.
*   `packages/electron-app/src/database/`: This directory contains the database-related services, including:
    *   `tradeService.js`: For managing trades.
    *   `accountService.js`: For managing accounts.
    *   `transactionService.js`: For managing transactions.
    *   `analyticsService.js`: For calculating analytics.
*   `packages/electron-app/src/database/migrations/`: This directory contains the SQL migration files for the database schema.

### Frontend

*   `packages/react-app/src/App.tsx`: The main entry point for the React application.
*   `packages/react-app/src/views/`: This directory contains the main pages of the application.
*   `packages/react-app/src/components/`: This directory contains the reusable UI components.
*   `packages/react-app/src/stores/appStore.ts`: The Zustand store for managing application state.
*   `packages/react-app/src/api/`: This directory contains the functions for communicating with the backend.
