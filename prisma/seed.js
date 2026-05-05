require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error('DATABASE_URL is not defined.');
}

async function main() {
  console.log('🌱 Seeding database...');

  // Setup the adapter explicitly to satisfy Prisma 7's constructor
  const pool = new Pool({ connectionString: dbUrl });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    // 1. Clean existing data
    await prisma.task.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();

    // 2. Create Admin
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = await prisma.user.create({
      data: {
        name: 'System Admin',
        email: 'admin@protrackit.in',
        password: adminPassword,
        role: 'ADMIN',
      },
    });

    // 3. Create Sample Project
    const project1 = await prisma.project.create({
      data: {
        name: 'Production Launch',
        description: 'The final push to deploy ProTrackIt to the world.',
        ownerId: admin.id,
      },
    });

    console.log(`✅ Seeding complete!`);
    console.log(`Live Admin: admin@protrackit.in / admin123`);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
