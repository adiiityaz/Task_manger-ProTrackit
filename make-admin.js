require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const dbUrl = process.env.DATABASE_URL;

async function run() {
  const pool = new Pool({ 
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    const hashedPassword = await bcrypt.hash('admin123', 12);
    const userId = crypto.randomUUID(); // Provide the ID that Prisma expects
    
    console.log('⏳ Creating admin user...');

    await pool.query(`
      INSERT INTO "User" (id, name, email, password, role, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      ON CONFLICT (email) DO UPDATE 
      SET role = 'ADMIN', password = $4
    `, [userId, 'System Admin', 'admin@protrackit.in', hashedPassword, 'ADMIN']);

    console.log('✅ ADMIN CREATED SUCCESSFULLY!');
    console.log('Email: admin@protrackit.in');
    console.log('Pass: admin123');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await pool.end();
  }
}

run();
