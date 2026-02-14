const fs = require('fs');
const path = require('path');
const sequelize = require('../config/database');

const migrationsRootDir = path.join(__dirname, '..', 'migrations');

const collectMigrationFiles = (rootDir) => {
  const entries = [];
  const walk = (dir, relativeBase = '') => {
    if (!fs.existsSync(dir)) return;
    const names = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of names) {
      const fullPath = path.join(dir, item.name);
      const relativePath = path.join(relativeBase, item.name);
      if (item.isDirectory()) {
        walk(fullPath, relativePath);
      } else if (item.isFile() && item.name.endsWith('.js')) {
        entries.push({ fullPath, migrationName: relativePath.replace(/\\/g, '/') });
      }
    }
  };
  walk(rootDir);
  return entries.sort((a, b) => a.migrationName.localeCompare(b.migrationName));
};

const ensureMetaTable = async () => {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

const getAppliedMigrations = async () => {
  const [rows] = await sequelize.query('SELECT name FROM schema_migrations');
  return new Set(rows.map((row) => row.name));
};

const runMigrations = async () => {
  await ensureMetaTable();
  const files = collectMigrationFiles(migrationsRootDir);
  const applied = await getAppliedMigrations();
  for (const file of files) {
    if (applied.has(file.migrationName)) continue;
    // eslint-disable-next-line global-require, import/no-dynamic-require
    const migration = require(file.fullPath);
    if (typeof migration.up !== 'function') {
      throw new Error(`Migration ${file.migrationName} is missing an up() function`);
    }
    try {
      await migration.up(sequelize.getQueryInterface(), sequelize.Sequelize);
    } catch (err) {
      if (err?.original?.code === 'ER_NO_SUCH_TABLE') {
        throw new Error(
          `Migration ${file.migrationName} requires base tables. ` +
          `Set AUTO_SYNC_MODELS=true for first startup, then restart.`
        );
      }
      throw err;
    }
    await sequelize.query('INSERT INTO schema_migrations (name) VALUES (?)', {
      replacements: [file.migrationName],
    });
    console.log(`Applied migration: ${file.migrationName}`);
  }
  console.log('Migrations are up to date.');
};

module.exports = { runMigrations };
