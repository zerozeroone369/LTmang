import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { ErrorCode } from '../constants/enums';
import { AppError } from '../utils/errors';
import { sendError } from '../utils/apiResponse';
import { env } from '../config/env';

export function notFoundHandler(req: Request, res: Response) {
  return sendError(
    res,
    404,
    ErrorCode.NOT_FOUND,
    `Endpoint ${req.method} ${req.originalUrl} does not exist`,
  );
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return sendError(res, err.statusCode, err.code, err.message, err.details);
  }

  if (err instanceof ZodError) {
    return sendError(res, 400, ErrorCode.VALIDATION_ERROR, 'Dữ liệu đầu vào không hợp lệ', {
      issues: err.errors.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return sendError(
        res,
        409,
        ErrorCode.CONFLICT,
        'Dữ liệu bị trùng lặp với bản ghi đã tồn tại',
        err.meta,
      );
    }
    if (err.code === 'P2025') {
      return sendError(res, 404, ErrorCode.NOT_FOUND, 'Không tìm thấy bản ghi yêu cầu');
    }
  }

  if (env.NODE_ENV !== 'test') {
    console.error('Unhandled error:', err);
  }

  return sendError(
    res,
    500,
    ErrorCode.INTERNAL_ERROR,
    env.NODE_ENV === 'production'
      ? 'Đã xảy ra lỗi hệ thống, vui lòng thử lại sau'
      : err instanceof Error
        ? err.message
        : 'Unknown server error',
  );
}
