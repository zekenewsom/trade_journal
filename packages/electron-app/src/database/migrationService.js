// packages/electron-app/src/database/migrationService.js
const fs = require('fs');
const path = require('path');

function runMigrations(currentDbInstance) {
  console.log('[MIGRATION_SERVICE] Checking for database migrations...');
  const migrationsDir = path.join(__dirname, 'migrations');
  try {
    currentDbInstance.exec(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version TEXT PRIMARY KEY NOT NULL,
        applied_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);
    const appliedMigrations = currentDbInstance.prepare('SELECT version FROM schema_migrations').all().map(row => row.version);
    console.log('[MIGRATION_SERVICE] Applied migrations:', appliedMigrations);
    
    const availableMigrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
      
    let migrationsRunThisSession = 0;
    for (const fileName of availableMigrationFiles) {
      const version = fileName;
      if (!appliedMigrations.includes(version)) {
        console.log(`[MIGRATION_SERVICE] Applying migration: ${version}`);
        const scriptContent = fs.readFileSync(path.join(migrationsDir, fileName), 'utf-8');
        const runMigrationTx = currentDbInstance.transaction(() => {
          currentDbInstance.exec(scriptContent);
          currentDbInstance.prepare('INSERT INTO schema_migrations (version) VALUES (?)').run(version);
        });
        try {
          runMigrationTx();
          console.log(`[MIGRATION_SERVICE] Successfully applied migration: ${version}`);
          migrationsRunThisSession++;
        } catch (migrationError) {
          console.error(`[MIGRATION_SERVICE] Failed to apply migration ${version}:`, migrationError);
          throw new Error(`Migration ${version} failed: ${(migrationError instanceof Error ? migrationError.message : String(migrationError))}`);
        }
      }
    }
    if (migrationsRunThisSession > 0) {
      console.log(`[MIGRATION_SERVICE] ${migrationsRunThisSession} migration(s) applied successfully.`);
    } else {
      console.log('[MIGRATION_SERVICE] Database schema is up to date.');
    }
  } catch (error) {
    console.error('[MIGRATION_SERVICE] Error during migration process:', error);
    throw error;
  }
}

module.exports = { runMigrations };