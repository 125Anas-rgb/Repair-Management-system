const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { databaseUrl } = require('./config/databaseUrl');

// One shared Prisma client for the whole API (Prisma 7 talks to PostgreSQL through the pg driver adapter).
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl() }),
});

module.exports = prisma;
