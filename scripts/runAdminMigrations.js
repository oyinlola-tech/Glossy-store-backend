require('dotenv').config();
const sequelize = require('../src/config/database');
const { createDatabaseIfNotExists } = require('../src/config/databaseBootstrap');
const { runMigrations } = require('../src/services/migrationService');

const run = async () => {
  try {
    await createDatabaseIfNotExists();
    await sequelize.authenticate();
    await runMigrations();
    await sequelize.close();
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
};

run();
