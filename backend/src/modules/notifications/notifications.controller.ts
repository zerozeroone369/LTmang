import { NextFunction, Request, Response } from 'express';
import { buildPaginationMeta, sendSuccess } from '../../utils/apiResponse';
import { NotificationsQuery } from './notifications.validator';
import { notificationsService } from './notifications.service';

export class NotificationsController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await notificationsService.list(
        req.auth!.userId,
        req.query as unknown as NotificationsQuery,
      );
      return sendSuccess(
        res,
        { notifications: result.notifications, unreadCount: result.unreadCount },
        'Danh sách thông báo',
        200,
        buildPaginationMeta(result.page, result.limit, result.total),
      );
    } catch (error) {
      next(error);
    }
  }

  async markRead(req: Request, res: Response, next: NextFunction) {
    try {
      const notification = await notificationsService.markRead(
        req.auth!.userId,
        Number(req.params.id),
      );
      return sendSuccess(res, notification, 'Đã đánh dấu thông báo đã đọc');
    } catch (error) {
      next(error);
    }
  }
}

export const notificationsController = new NotificationsController();
