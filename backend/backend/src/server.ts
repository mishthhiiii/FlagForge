import app from './app';
import { env } from './config/env';
import { connectDatabase } from './config/database';

async function startServer() {
  // Connect to PostgreSQL DB via Prisma
  await connectDatabase();

  const PORT = env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`🚀 FlagForge Backend running in ${env.NODE_ENV} mode on port ${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('❌ Failed to start the server:', error);
  process.exit(1);
});
