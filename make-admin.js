require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const dbUrl = process.env.DATABASE_URL;

async function run() {
  const pool = new Pool({ 
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    console.log('⏳ Creating admin user...');

    // Simplified SQL: Let the database handle the IDs and Timestamps automatically
    await pool.query(`
      INSERT INTO "User" (name, email, password, role)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO UPDATE 
      SET role = 'ADMIN', password = $3
    `, ['System Admin', 'admin@protrackit.in', hashedPassword, 'ADMIN']);

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
