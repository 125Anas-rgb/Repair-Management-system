// Prisma 7 configuration: where the schema, migrations and seed script live,
// and how to reach the database.
const { defineConfig } = require('prisma/config');
const { databaseUrl } = require('./src/config/databaseUrl');

module.exports = defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'node prisma/seed.js',
  },
  datasource: {
    url: databaseUrl(),
  },
});
