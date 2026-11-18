import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { notificationsController } from './notifications.controller';
import { notificationParamsSchema, notificationsQuerySchema } from './notifications.validator';

const router = Router();

router.get(
  '/',
  authenticate,
  validate({ query: notificationsQuerySchema }),
  notificationsController.list.bind(notificationsController),
);
router.put(
  '/read-all',
  authenticate,
  notificationsController.markAllRead.bind(notificationsController),
);
router.put(
  '/:id/read',
  authenticate,
  validate({ params: notificationParamsSchema }),
  notificationsController.markRead.bind(notificationsController),
);

export const notificationsRoutes = router;
