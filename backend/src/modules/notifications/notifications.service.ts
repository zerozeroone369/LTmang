import { AppError } from '../../utils/errors';
import { emitNotification } from '../../realtime/socket';
import { notificationsRepository } from './notifications.repository';
import { NotificationsQuery } from './notifications.validator';

export const notificationTypes = [
  'new_comment',
  'new_answer',
  'join_request',
  'campus_post',
] as const;

export type NotificationType = (typeof notificationTypes)[number];

export interface NotificationContent {
  title: string;
  message: string;
  referenceType?: string;
  referenceId?: number;
}

export async function sendNotification(
  userId: number,
  type: NotificationType,
  content: NotificationContent,
) {
  const notification = await notificationsRepository.create({
    userId,
    type,
    ...content,
  });
  emitNotification(userId, type, notification);
  return notification;
}

export class NotificationsService {
  async list(userId: number, query: NotificationsQuery) {
    const skip = (query.page - 1) * query.limit;
    const [notifications, total, unreadCount] = await Promise.all([
      notificationsRepository.listForUser(userId, skip, query.limit),
      notificationsRepository.countForUser(userId),
      notificationsRepository.countUnreadForUser(userId),
    ]);

    return {
      notifications,
      unreadCount,
      page: query.page,
      limit: query.limit,
      total,
    };
  }

  async markRead(userId: number, notificationId: number) {
    const notification = await notificationsRepository.markReadForUser(notificationId, userId);
    if (!notification) {
      throw AppError.notFound('Không tìm thấy thông báo.');
    }
    return notification;
  }

  async notifyCampusPost(input: {
    id: number;
    authorId: number;
    title: string;
    category: string;
    status: string;
  }) {
    if (input.status !== 'PUBLISHED') return;

    const userIds = await notificationsRepository.findActiveUserIds(input.authorId);
    const content: NotificationContent = {
      title: 'Tin mới từ Campus',
      message: input.title,
      referenceType: 'CAMPUS_POST',
      referenceId: input.id,
    };

    for (let index = 0; index < userIds.length; index += 50) {
      await Promise.all(
        userIds
          .slice(index, index + 50)
          .map((userId) => sendNotification(userId, 'campus_post', content)),
      );
    }
  }
}

export const notificationsService = new NotificationsService();
