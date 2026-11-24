const { HttpError } = require('../utils/http');
const env = require('../config/env');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: { code: err.code, message: err.message, details: err.details } });
  }

  // Unique violation (Prisma P2002 or raw PostgreSQL 23505), in case a race slips past the service checks.
  if (err.code === 'P2002' || err.code === '23505') {
    return res.status(409).json({ error: { code: 'CONFLICT', message: 'This record already exists.' } });
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Request body is not valid JSON.' } });
  }

  console.error(err);
  return res.status(500).json({
    error: {
      code: 'SERVER_ERROR',
      message: 'Something went wrong on the server.',
      ...(env.nodeEnv === 'development' ? { details: err.message } : {}),
    },
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: `No route for ${req.method} ${req.originalUrl}` } });
}

module.exports = { errorHandler, notFoundHandler };
