const { PrismaClient } = require('@prisma/client');

let prisma;
const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error('DATABASE_URL is not defined. Please set it in your environment variables.');
}

// In Prisma 6, we can use the native engine and it handles the connection URL directly.
// No driver adapters needed for standard local SQLite or production PostgreSQL.
prisma = new PrismaClient({
  datasources: {
    db: {
      url: dbUrl,
    },
  },
  log: ['error', 'warn'],
});

if (dbUrl.startsWith('file:') || dbUrl.includes('.db')) {
  console.log('📦 Using SQLite (Local) Database');
} else {
  console.log('🐘 Using PostgreSQL (Production) Database');
}

module.exports = prisma;
