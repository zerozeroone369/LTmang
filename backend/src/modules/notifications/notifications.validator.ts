import { z } from 'zod';

export const notificationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const notificationParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type NotificationsQuery = z.infer<typeof notificationsQuerySchema>;
