const mysql = require('mysql2/promise');

const validateDatabaseName = (dbName) => {
  if (!dbName || !/^[a-zA-Z0-9_]+$/.test(dbName)) {
    throw new Error('Invalid DB_NAME. Use only letters, numbers, and underscore.');
  }
};

const createDatabaseIfNotExists = async () => {
  const {
    DB_HOST,
    DB_PORT = 3306,
    DB_USER,
    DB_PASSWORD,
    DB_NAME,
  } = process.env;

  validateDatabaseName(DB_NAME);

  const connection = await mysql.createConnection({
    host: DB_HOST,
    port: Number(DB_PORT),
    user: DB_USER,
    password: DB_PASSWORD,
    multipleStatements: false,
  });

  try {
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  } finally {
    await connection.end();
  }
};

module.exports = { createDatabaseIfNotExists };
