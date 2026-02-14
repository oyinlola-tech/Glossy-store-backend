require('dotenv').config();
const { createDatabaseIfNotExists } = require('../src/config/databaseBootstrap');

const run = async () => {
  try {
    await createDatabaseIfNotExists();
    console.log('Database is ready.');
  } catch (err) {
    console.error('Failed to create database:', err.message);
    process.exit(1);
  }
};

run();
