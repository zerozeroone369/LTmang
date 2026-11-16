import { NextFunction, Request, Response } from 'express';
import { sendCreated, sendSuccess } from '../../utils/apiResponse';
import { authService } from './auth.service';
import { ChangePasswordInput, LoginInput, RegisterInput } from './auth.validator';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body as RegisterInput);
      return sendCreated(res, result, 'Đăng ký tài khoản thành công');
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body as LoginInput);
      return sendSuccess(res, result, 'Đăng nhập thành công');
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.logout(req.auth!.jti, req.auth!.userId, req.auth!.exp);
      return sendSuccess(res, { loggedOut: true }, 'Đăng xuất thành công');
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.changePassword(req.auth!.userId, req.body as ChangePasswordInput);
      return sendSuccess(res, { changed: true }, 'Đổi mật khẩu thành công');
    } catch (error) {
      next(error);
    }
  }

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.getMe(req.auth!.userId);
      return sendSuccess(res, user, 'Lấy thông tin tài khoản thành công');
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
