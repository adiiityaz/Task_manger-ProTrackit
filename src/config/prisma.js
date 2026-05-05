const { PrismaClient } = require('@prisma/client');

let prisma;
const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error('DATABASE_URL is not defined. Please set it in your environment variables.');
}

// PostgreSQL Initialization
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const pool = new Pool({ connectionString: dbUrl });
const adapter = new PrismaPg(pool);

prisma = new PrismaClient({
  adapter,
  log: ['error']
});

module.exports = prisma;
