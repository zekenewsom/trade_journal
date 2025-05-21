// Migration runner for SQLite using better-sqlite3
const fs = require('fs');
const path = require('path');

function runMigrations(currentDbInstance) {
  console.log('Checking for database migrations...');
  const migrationsDir = path.join(__dirname, 'migrations');
  try {
    // 1. Ensure migrations table exists
    currentDbInstance.exec(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version TEXT PRIMARY KEY NOT NULL,
        applied_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);
    // 2. Get applied migrations
    const appliedMigrations = currentDbInstance.prepare('SELECT version FROM schema_migrations').all().map(row => row.version);
    console.log('Applied migrations:', appliedMigrations);
    // 3. Get available migration files
    const availableMigrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
    // 4. Determine and run pending migrations
    let migrationsRunThisSession = 0;
    for (const fileName of availableMigrationFiles) {
      const version = fileName;
      if (!appliedMigrations.includes(version)) {
        console.log(`Applying migration: ${version}`);
        const scriptContent = fs.readFileSync(path.join(migrationsDir, fileName), 'utf-8');
        const runMigrationTx = currentDbInstance.transaction(() => {
          currentDbInstance.exec(scriptContent);
          currentDbInstance.prepare('INSERT INTO schema_migrations (version) VALUES (?)').run(version);
        });
        try {
          runMigrationTx();
          console.log(`Successfully applied migration: ${version}`);
          migrationsRunThisSession++;
        } catch (migrationError) {
          console.error(`Failed to apply migration ${version}:`, migrationError);
          throw new Error(`Migration ${version} failed: ${migrationError.message}`);
        }
      }
    }
    if (migrationsRunThisSession > 0) {
      console.log(`${migrationsRunThisSession} migration(s) applied successfully.`);
    } else {
      console.log('Database schema is up to date.');
    }
  } catch (error) {
    console.error('Error during migration process:', error);
    throw error;
  }
}

module.exports = { runMigrations };
