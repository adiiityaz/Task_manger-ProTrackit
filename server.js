require('dotenv').config();
const app = require('./src/app');
const prisma = require('./src/config/prisma');

const PORT = process.env.PORT || 3000;

/**
 * Validates the database connection before starting the server.
 */
async function startServer() {
  try {
    console.log('⏳ Verifying Database Connection...');
    
    // Execute a simple query to verify the connection
    await prisma.$queryRaw`SELECT 1`;
    
    console.log('✅ DB Connected');

    // ── Auto-Seed Admin ──────────────────────────────────────────────────────
    const bcrypt = require('bcryptjs');
    const adminEmail = 'admin@protrackit.in';
    const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
    
    if (!existingAdmin) {
      console.log('👤 No admin found. Creating default production admin...');
      const hashedPassword = await bcrypt.hash('admin123', 12);
      await prisma.user.create({
        data: {
          name: 'System Admin',
          email: adminEmail,
          password: hashedPassword,
          role: 'ADMIN',
        },
      });
      console.log('✅ Default Admin created: admin@protrackit.in / admin123');
    }
  } catch (err) {
    console.error('❌ DB Connection Failed:', err.message);
    console.warn('⚠️ Server is starting in degraded mode (DB unavailable).');
  } finally {
    // Start the Express server regardless of DB status (prevents total crash)
    app.listen(PORT, () => {
      console.log(`🚀 ProTrackIt Server is LIVE on port ${PORT}`);
    });
  }
}


// Bootstrap the application
startServer();

// Keep the event loop active for specific environment compatibility
setInterval(() => {}, 60000);
