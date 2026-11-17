import http from 'http';
import { createApp } from './app';
import { prisma } from './config/database';
import { env } from './config/env';
import { initializeSocket } from './realtime/socket';

async function bootstrap() {
  await prisma.$connect();

  const app = createApp();
  const server = http.createServer(app);
  const io = initializeSocket(server);

  server.listen(env.PORT, () => {
    console.log(`UniConnect Backend API running at http://localhost:${env.PORT}`);
    console.log(`Swagger Docs available at http://localhost:${env.PORT}/api-docs`);
  });

  const shutdown = async () => {
    console.log('Shutting down gracefully...');
    io.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

bootstrap().catch(async (error) => {
  console.error('Failed to start server:', error);
  await prisma.$disconnect();
  process.exit(1);
});
