import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { env } from '../config/env';
import { prisma } from '../config/database';
import { verifyAccessToken } from '../utils/jwt';

let socketServer: Server | null = null;

export function initializeSocket(server: HttpServer) {
  if (socketServer) {
    throw new Error('Socket.IO has already been initialized.');
  }

  const io = new Server(server, {
    cors: {
      origin: env.corsOrigins,
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    const authToken = socket.handshake.auth.token;
    const authorization = socket.handshake.headers.authorization;
    const token =
      typeof authToken === 'string'
        ? authToken
        : authorization?.startsWith('Bearer ')
          ? authorization.slice(7)
          : undefined;

    if (!token) {
      next(new Error('Unauthorized'));
      return;
    }

    try {
      const payload = verifyAccessToken(token);
      const userId = Number(payload.sub);
      if (!Number.isInteger(userId) || !payload.jti) {
        next(new Error('Unauthorized'));
        return;
      }

      const [revoked, user] = await Promise.all([
        prisma.revokedToken.findUnique({ where: { jti: payload.jti } }),
        prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, status: true },
        }),
      ]);

      if (revoked || !user || user.status !== 'ACTIVE') {
        next(new Error('Unauthorized'));
        return;
      }

      socket.data.userId = user.id;
      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(`user:${String(socket.data.userId)}`);
  });

  socketServer = io;
  return io;
}

export function emitNotification(userId: number, type: string, notification: unknown) {
  socketServer?.to(`user:${userId}`).emit('notification', notification);
  socketServer?.to(`user:${userId}`).emit(type, notification);
}

export function closeSocket() {
  if (!socketServer) return Promise.resolve();

  const activeServer = socketServer;
  socketServer = null;
  return new Promise<void>((resolve) => activeServer.close(() => resolve()));
}
