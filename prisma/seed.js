require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');

const rawUrl = process.env.DATABASE_URL || 'file:./dev.db';
const adapter = new PrismaBetterSqlite3({ url: rawUrl });

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Clean existing data
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // 3. Create Admin
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@protrackit.in',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  // 4. Create Projects
  const project1 = await prisma.project.create({
    data: {
      name: 'Alpha Mobile App',
      description: 'Development of the core mobile application for the Alpha project.',
      ownerId: admin.id,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Beta API Integration',
      description: 'Connecting third-party services to our main API infrastructure.',
      ownerId: admin.id,
    },
  });

  // 5. Create Tasks
  await prisma.task.createMany({
    data: [
      {
        title: 'Setup PostgreSQL Database',
        description: 'Configure Railway database and migrate schema.',
        status: 'TODO',
        projectId: project2.id,
        assignedTo: admin.id,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      },
    ],
  });

  console.log(`✅ Seeding complete!`);
  console.log(`Admin User: admin@protrackit.in / admin123`);
  console.log(`Members should sign up via the frontend UI.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
