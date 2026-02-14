const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const rateLimit = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const routes = require('./routes');
const sequelize = require('./config/database');
const passport = require('./config/passport');
const { mountSwagger } = require('./config/swagger');
const { createDatabaseIfNotExists } = require('./config/databaseBootstrap');
const { seedSuperAdminFromEnv } = require('./services/adminBootstrapService');
const { runMigrations } = require('./services/migrationService');

const app = express();

// Middleware
app.use(helmet());
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(cors({
  origin: (process.env.CORS_ALLOWED_ORIGINS || '').split(',').map((v) => v.trim()).filter(Boolean).length
    ? (process.env.CORS_ALLOWED_ORIGINS || '').split(',').map((v) => v.trim())
    : true,
  credentials: true,
}));
app.use(express.json({
  limit: process.env.JSON_BODY_LIMIT || '1mb',
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
  },
}));
app.use(express.urlencoded({ extended: true, limit: process.env.JSON_BODY_LIMIT || '1mb' }));
app.use(rateLimit);
app.use(passport.initialize());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'glossy-store-backend' });
});

// Routes
app.use('/api', routes);
mountSwagger(app);

// Error handling
app.use(errorHandler);

const initializeDatabase = async () => {
  await createDatabaseIfNotExists();
  await sequelize.authenticate();
  const autoSync = String(process.env.AUTO_SYNC_MODELS || 'true').toLowerCase() === 'true';
  if (autoSync) {
    await sequelize.sync();
  }
  const autoMigrate = String(process.env.AUTO_RUN_MIGRATIONS || 'true').toLowerCase() === 'true';
  if (autoMigrate) {
    await runMigrations();
  }
  await seedSuperAdminFromEnv();
};

module.exports = { app, initializeDatabase };
