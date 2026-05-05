require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function main() {
  console.log('🌱 Seeding database...');

  const prisma = new PrismaClient();

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
