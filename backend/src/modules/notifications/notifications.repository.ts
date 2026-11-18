import { prisma } from '../../config/database';

export class NotificationsRepository {
  create(data: {
    userId: number;
    type: string;
    title: string;
    message: string;
    referenceType?: string;
    referenceId?: number;
  }) {
    return prisma.notification.create({ data });
  }

  listForUser(userId: number, skip: number, take: number) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      skip,
      take,
    });
  }

  countForUser(userId: number) {
    return prisma.notification.count({ where: { userId } });
  }

  countUnreadForUser(userId: number) {
    return prisma.notification.count({ where: { userId, isRead: false } });
  }

  async markReadForUser(id: number, userId: number) {
    const notification = await prisma.notification.findFirst({ where: { id, userId } });
    if (!notification) return null;

    if (!notification.isRead) {
      await prisma.notification.update({
        where: { id },
        data: { isRead: true },
      });
    }

    return { ...notification, isRead: true };
  }

  markAllReadForUser(userId: number) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async findActiveUserIds(excludedUserId: number) {
    const users = await prisma.user.findMany({
      where: { status: 'ACTIVE', id: { not: excludedUserId } },
      select: { id: true },
    });
    return users.map(({ id }) => id);
  }
}

export const notificationsRepository = new NotificationsRepository();
