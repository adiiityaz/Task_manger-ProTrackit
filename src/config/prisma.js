const { PrismaClient } = require('@prisma/client');

let prisma;
const dbUrl = process.env.DATABASE_URL || 'file:./dev.db';

if (dbUrl.startsWith('file:')) {
  // SQLite Local Development (Prisma 7 style)
  const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
  const adapter = new PrismaBetterSqlite3({ url: dbUrl });
  
  prisma = new PrismaClient({ 
    adapter,
    log: ['error', 'warn'] 
  });
} else {
  // PostgreSQL Production (Railway)
  // Note: For production with Prisma 7, use @prisma/adapter-pg
  prisma = new PrismaClient({
    datasourceUrl: dbUrl,
    log: ['error']
  }); 
}

module.exports = prisma;
