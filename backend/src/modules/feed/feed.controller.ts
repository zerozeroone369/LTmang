import { NextFunction, Request, Response } from 'express';
import { buildPaginationMeta, sendSuccess } from '../../utils/apiResponse';
import { feedService } from './feed.service';
import { FeedQueryInput, UpdateFeedPreferencesInput } from './feed.validator';

export class FeedController {
  async getFeed(req: Request, res: Response, next: NextFunction) {
    try {
      const query = (req.query || {}) as unknown as FeedQueryInput;
      const result = await feedService.getFeed(req.auth!.userId, query);
      return sendSuccess(
        res,
        {
          items: result.items,
          preferences: result.preferences,
          unavailableSources: result.unavailableSources,
        },
        'Danh sách Smart News Feed',
        200,
        buildPaginationMeta(result.page, result.limit, result.total),
      );
    } catch (error) {
      next(error);
    }
  }

  async updatePreferences(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.auth!.userId;
      const input = req.body as UpdateFeedPreferencesInput;
      const preference = await feedService.getFeedPreferences(userId, input);
      return sendSuccess(res, preference, 'Lưu tùy chọn bảng tin thành công');
    } catch (error) {
      next(error);
    }
  }
}

export const feedController = new FeedController();
