import rateLimit from 'express-rate-limit';
import { env } from '../config/env';
import { ErrorCode } from '../constants/enums';

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.NODE_ENV === 'test',
  message: {
    success: false,
    error: {
      code: ErrorCode.RATE_LIMITED,
      message: 'Quá nhiều yêu cầu xác thực, vui lòng thử lại sau 15 phút',
    },
  },
});

export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.NODE_ENV === 'test',
  message: {
    success: false,
    error: {
      code: ErrorCode.RATE_LIMITED,
      message: 'Tần suất truy cập quá nhanh, vui lòng chậm lại',
    },
  },
});
