import { NextFunction, Request, Response } from 'express';
import { sendSuccess } from '../../utils/apiResponse';
import { userService } from './user.service';
import { UpdateProfileInput } from './user.validator';

export class UserController {
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await userService.getProfile(req.auth!.userId);
      return sendSuccess(res, profile, 'Lấy hồ sơ cá nhân thành công');
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const input = req.body as UpdateProfileInput;
      const updated = await userService.updateProfile(req.auth!.userId, input);
      return sendSuccess(res, updated, 'Cập nhật hồ sơ cá nhân thành công');
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
