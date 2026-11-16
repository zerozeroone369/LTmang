import { ErrorCode } from '../constants/enums';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(statusCode: number, code: string, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }

  static badRequest(message: string, code: string = ErrorCode.BAD_REQUEST, details?: unknown) {
    return new AppError(400, code, message, details);
  }

  static unauthorized(message = 'Authentication required', code: string = ErrorCode.UNAUTHORIZED) {
    return new AppError(401, code, message);
  }

  static forbidden(message = 'Insufficient permissions', code: string = ErrorCode.FORBIDDEN) {
    return new AppError(403, code, message);
  }

  static notFound(message = 'Resource not found', code: string = ErrorCode.NOT_FOUND) {
    return new AppError(404, code, message);
  }

  static conflict(message: string, code: string = ErrorCode.CONFLICT, details?: unknown) {
    return new AppError(409, code, message, details);
  }

  static tooManyRequests(
    message = 'Too many requests, please try again later',
    code: string = ErrorCode.RATE_LIMITED,
  ) {
    return new AppError(429, code, message);
  }
}
