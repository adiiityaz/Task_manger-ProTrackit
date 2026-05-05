const { PrismaClient } = require('@prisma/client');

let prisma;
const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error('DATABASE_URL is not defined. Please set it in your environment variables.');
}

// PostgreSQL Initialization
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

// Railway often needs SSL for external connections, but not always for internal.
// We'll configure it to be flexible.
const pool = new Pool({ 
  connectionString: dbUrl,
  ssl: dbUrl.includes('proxy.rlwy.net') ? { rejectUnauthorized: false } : false
});

const adapter = new PrismaPg(pool);

prisma = new PrismaClient({
  adapter,
  log: ['error', 'warn']
});

// Test connection on startup
pool.query('SELECT 1').catch(err => {
  console.error('❌ Database Connection Error:', err.message);
});

module.exports = prisma;
