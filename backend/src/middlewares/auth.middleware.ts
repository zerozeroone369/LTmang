import { NextFunction, Request, Response } from 'express';
import { prisma } from '../config/database';
import { ErrorCode, UserStatus } from '../constants/enums';
import { AppError } from '../utils/errors';
import { verifyAccessToken } from '../utils/jwt';

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw AppError.unauthorized('Thiếu hoặc sai định dạng Authorization Bearer token');
    }

    const token = authHeader.slice(7).trim();
    if (!token) {
      throw AppError.unauthorized('Token không hợp lệ');
    }

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch {
      throw AppError.unauthorized('Token không hợp lệ hoặc đã hết hạn');
    }

    const userId = Number(payload.sub);
    if (!Number.isInteger(userId) || !payload.jti) {
      throw AppError.unauthorized('Payload token không hợp lệ');
    }

    const revoked = await prisma.revokedToken.findUnique({
      where: { jti: payload.jti },
    });

    if (revoked) {
      throw AppError.unauthorized('Phiên đăng nhập đã được đăng xuất', ErrorCode.TOKEN_REVOKED);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user) {
      throw AppError.unauthorized('Tài khoản không tồn tại');
    }

    if (user.status === UserStatus.LOCKED) {
      throw new AppError(
        403,
        ErrorCode.ACCOUNT_LOCKED,
        user.lockedReason
          ? `Tài khoản đã bị khóa: ${user.lockedReason}`
          : 'Tài khoản của bạn đã bị khóa bởi quản trị viên',
      );
    }

    req.auth = {
      userId: user.id,
      role: user.role.name,
      jti: payload.jti,
      exp: payload.exp,
    };

    next();
  } catch (error) {
    next(error);
  }
}

export function requireRole(...allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth) {
      return next(AppError.unauthorized('Yêu cầu xác thực người dùng'));
    }

    if (!allowedRoles.includes(req.auth.role)) {
      return next(
        AppError.forbidden('Bạn không có quyền truy cập chức năng này', ErrorCode.FORBIDDEN),
      );
    }

    next();
  };
}
