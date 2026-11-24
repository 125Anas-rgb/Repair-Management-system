const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const env = require('./config/env');
const prisma = require('./db');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const authRoutes = require('./modules/auth/auth.routes');

const app = express();

app.set('trust proxy', 1);
app.use(helmet());
// Web app origin is allowed; the mobile app sends no Origin header, so it passes too.
app.use(cors({ origin: [env.webAppUrl], credentials: false }));
app.use(express.json({ limit: '1mb' }));
if (env.nodeEnv !== 'test') app.use(morgan('dev'));

app.get('/api/v1/health', async (req, res) => {
  let database = 'down';
  try {
    await prisma.$queryRaw`SELECT 1`;
    database = 'up';
  } catch (err) {
    database = `down: ${err.message}`;
  }
  res.json({ status: 'ok', database, time: new Date().toISOString() });
});

app.use('/api/v1/auth', authRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
