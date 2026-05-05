require('dotenv').config();
const app = require('./src/app');
const prisma = require('./src/config/prisma');
const bcrypt = require('bcryptjs');

const PORT = process.env.PORT || 3000;

// Catch unhandled rejections to prevent silent hangs
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

async function startServer() {
  try {
    console.log('⏳ [Startup] Verifying Database Connection...');
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ [Startup] DB Connected Successfully');

    const adminEmail = 'admin@protrackit.in';
    console.log(`⏳ [Startup] Verifying Admin Account: ${adminEmail}`);
    
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    // Use a more explicit check and update
    const user = await prisma.user.findUnique({ where: { email: adminEmail } });
    
    if (!user) {
      console.log('👤 [Startup] No admin found. Creating default...');
      await prisma.user.create({
        data: {
          name: 'System Admin',
          email: adminEmail,
          password: hashedPassword,
          role: 'ADMIN',
        },
      });
      console.log('✅ [Startup] Admin Created.');
    } else {
      console.log('👤 [Startup] Admin exists. Updating password...');
      await prisma.user.update({
        where: { email: adminEmail },
        data: { password: hashedPassword },
      });
      console.log('✅ [Startup] Admin Updated.');
    }

  } catch (err) {
    console.error('❌ [Startup] Critical Error:', err.message);
    if (err.stack) console.error(err.stack);
  } finally {
    app.listen(PORT, () => {
      console.log(`🚀 [Startup] ProTrackIt Server is LIVE on port ${PORT}`);
    });
  }
}

startServer();

// Keep alive
setInterval(() => {}, 60000);
