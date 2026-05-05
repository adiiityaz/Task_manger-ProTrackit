const { PGlite } = require('@electric-sql/pglite');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

async function seed() {
  console.log('🌱 Initializing and Seeding PGLite database...');
  const db = new PGlite('./pglite_data');
  
  const hash = await bcrypt.hash('admin123', 12);
  const adminId = crypto.randomUUID();
  const projectId = crypto.randomUUID();

  try {
    // 1. Create Tables
    console.log('📝 Creating tables...');
    await db.exec(`
      -- CreateTable
      CREATE TABLE IF NOT EXISTS "User" (
          "id" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "email" TEXT NOT NULL,
          "password" TEXT NOT NULL,
          "role" TEXT NOT NULL DEFAULT 'MEMBER',
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "User_pkey" PRIMARY KEY ("id")
      );

      -- CreateTable
      CREATE TABLE IF NOT EXISTS "Project" (
          "id" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "description" TEXT,
          "ownerId" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
      );

      -- CreateTable
      CREATE TABLE IF NOT EXISTS "Task" (
          "id" TEXT NOT NULL,
          "title" TEXT NOT NULL,
          "description" TEXT,
          "status" TEXT NOT NULL DEFAULT 'TODO',
          "projectId" TEXT NOT NULL,
          "assignedTo" TEXT,
          "dueDate" TIMESTAMP(3),
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
      );

      -- CreateIndex
      CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
    `);

    // 2. Insert Data
    console.log('👤 Creating admin account...');
    await db.exec(`
      INSERT INTO "User" (id, name, email, password, role, "createdAt") 
      VALUES ('${adminId}', 'System Admin', 'admin@protrackit.in', '${hash}', 'ADMIN', NOW())
      ON CONFLICT (email) DO NOTHING;

      INSERT INTO "Project" (id, name, description, "ownerId", "createdAt")
      VALUES ('${projectId}', 'Production Launch', 'The final push to deploy ProTrackIt.', '${adminId}', NOW())
      ON CONFLICT (id) DO NOTHING;
    `);

    console.log('✅ Seeding complete!');
    console.log('Live Admin: admin@protrackit.in / admin123');
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
  } finally {
    await db.close();
  }
}

seed();
