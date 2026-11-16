import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import { swaggerDocument } from './config/swagger';
import { apiRateLimiter } from './middlewares/rateLimit.middleware';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';
import { academicRoutes } from './modules/academic/academic.routes';
import { adminRoutes } from './modules/admin/admin.routes';
import { authRoutes } from './modules/auth/auth.routes';
import { campusRoutes } from './modules/campus/campus.routes';
import { userRoutes } from './modules/users/user.routes';
import { sendSuccess } from './utils/apiResponse';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.corsOrigins,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use('/api', apiRateLimiter);

  app.get('/api/health', (_req, res) => {
    return sendSuccess(
      res,
      {
        service: 'uniconnect-backend',
        status: 'healthy',
        timestamp: new Date().toISOString(),
      },
      'UniConnect Backend is running',
    );
  });

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  app.get('/api-docs.json', (_req, res) => res.json(swaggerDocument));

  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/academic', academicRoutes);
  app.use('/api/campus', campusRoutes);
  app.use('/api/admin', adminRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
