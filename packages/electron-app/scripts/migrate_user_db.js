// Usage: node migrate_user_db.js
// This script finds the Electron userData database file and applies all migrations from the migrations directory.

const path = require('path');
const fs = require('fs');
const child_process = require('child_process');

function getUserDataPath() {
  // Try to mimic Electron's default userData path
  const homedir = require('os').homedir();
  const productName = require(path.join(__dirname, '../package.json')).name || 'electron-app';
  if (process.platform === 'darwin') {
    return path.join(homedir, 'Library', 'Application Support', productName);
  } else if (process.platform === 'win32') {
    return path.join(process.env.APPDATA || path.join(homedir, 'AppData', 'Roaming'), productName);
  } else {
    return path.join(homedir, '.config', productName);
  }
}

function runSqliteMigration(dbPath, migrationPath) {
  if (!fs.existsSync(dbPath)) {
    console.error(`Database file not found: ${dbPath}`);
    return false;
  }
  if (!fs.existsSync(migrationPath)) {
    console.error(`Migration file not found: ${migrationPath}`);
    return false;
  }
  try {
    child_process.execSync(`sqlite3 '${dbPath}' < '${migrationPath}'`, { stdio: 'inherit' });
    console.log(`Applied migration: ${migrationPath}`);
    return true;
  } catch (err) {
    console.error(`Failed to apply migration ${migrationPath}:`, err.message);
    return false;
  }
}

function main() {
  const userDataPath = getUserDataPath();
  const dbPath = path.join(userDataPath, 'trade_journal.sqlite3');
  const migrationsDir = path.join(__dirname, '../src/database/migrations');
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();
  if (!fs.existsSync(dbPath)) {
    console.error(`User DB not found: ${dbPath}`);
    process.exit(1);
  }
  for (const file of migrationFiles) {
    const migrationPath = path.join(migrationsDir, file);
    runSqliteMigration(dbPath, migrationPath);
  }
  console.log('All migrations applied to user database:', dbPath);
}

main();
