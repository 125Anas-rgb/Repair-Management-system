require('dotenv').config({ quiet: true });

/**
 * Builds the PostgreSQL URL from the separate DB_* values in .env.
 * The password is URL-encoded, so characters like @ # % in it are safe.
 * You can also set DATABASE_URL directly; it then wins.
 */
function databaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const {
    DB_HOST = 'localhost',
    DB_PORT = '5432',
    DB_USER = 'postgres',
    DB_PASSWORD,
    DB_NAME = 'repair_tracking',
  } = process.env;
  if (!DB_PASSWORD) {
    throw new Error('Missing DB_PASSWORD. Copy .env.example to .env and put your PostgreSQL password in it.');
  }
  return `postgresql://${encodeURIComponent(DB_USER)}:${encodeURIComponent(DB_PASSWORD)}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
}

module.exports = { databaseUrl };
