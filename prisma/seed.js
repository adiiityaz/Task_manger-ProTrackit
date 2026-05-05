require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Standard PrismaClient (no adapter needed for local seeding)
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

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

  // 4. Create Sample Tasks
  await prisma.task.create({
    data: {
      title: 'Setup PostgreSQL Database',
      description: 'Successfully migrate from SQLite to Postgres on Railway.',
      status: 'DONE',
      projectId: project1.id,
      assignedTo: admin.id,
      dueDate: new Date(),
    },
  });

  console.log(`✅ Seeding complete!`);
  console.log(`Live Admin: admin@protrackit.in / admin123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
