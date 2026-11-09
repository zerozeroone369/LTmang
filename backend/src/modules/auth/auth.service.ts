import { env } from '../../config/env';
import { ErrorCode, RoleName, UserStatus } from '../../constants/enums';
import { AppError } from '../../utils/errors';
import { signAccessToken } from '../../utils/jwt';
import { comparePassword, hashPassword, validatePasswordStrength } from '../../utils/password';
import { toUserDTO, UserDTO } from '../users/user.dto';
import { userRepository } from '../users/user.repository';
import { validateAndResolveAcademicIds } from '../users/user.service';
import { authRepository } from './auth.repository';
import { ChangePasswordInput, LoginInput, RegisterInput } from './auth.validator';

export interface AuthResponseDTO {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: string;
  user: UserDTO;
}

export class AuthService {
  async register(input: RegisterInput): Promise<AuthResponseDTO> {
    const strength = validatePasswordStrength(input.password);
    if (!strength.valid) {
      throw AppError.badRequest(strength.errors[0], ErrorCode.VALIDATION_ERROR, {
        issues: strength.errors,
      });
    }

    const existingEmail = await userRepository.findByEmail(input.email);
    if (existingEmail) {
      throw AppError.conflict('Email đã được đăng ký trong hệ thống');
    }

    if (input.studentCode) {
      const existingCode = await userRepository.findByStudentCode(input.studentCode);
      if (existingCode) {
        throw AppError.conflict('Mã sinh viên đã tồn tại trong hệ thống');
      }
    }

    const academicResolved = await validateAndResolveAcademicIds({
      schoolId: input.schoolId,
      facultyId: input.facultyId,
      majorId: input.majorId,
      courseId: input.courseId,
      classId: input.classId,
    });

    const studentRole = await authRepository.ensureRole(
      RoleName.STUDENT,
      'Sinh viên sử dụng mạng xã hội',
    );
    const passwordHash = await hashPassword(input.password);

    const user = await userRepository.create({
      fullName: input.fullName,
      email: input.email.toLowerCase(),
      studentCode: input.studentCode ?? null,
      passwordHash,
      phone: input.phone ?? null,
      role: { connect: { id: studentRole.id } },
      ...(academicResolved.schoolId
        ? { school: { connect: { id: academicResolved.schoolId } } }
        : {}),
      ...(academicResolved.facultyId
        ? { faculty: { connect: { id: academicResolved.facultyId } } }
        : {}),
      ...(academicResolved.majorId ? { major: { connect: { id: academicResolved.majorId } } } : {}),
      ...(academicResolved.courseId
        ? { course: { connect: { id: academicResolved.courseId } } }
        : {}),
      ...(academicResolved.classId ? { class: { connect: { id: academicResolved.classId } } } : {}),
      lastLoginAt: new Date(),
    });

    const { token, expiresIn } = signAccessToken(user.id, user.role.name);

    return {
      accessToken: token,
      tokenType: 'Bearer',
      expiresIn,
      user: toUserDTO(user),
    };
  }

  async login(input: LoginInput): Promise<AuthResponseDTO> {
    const user = await userRepository.findByIdentifier(input.identifier);
    if (!user) {
      throw new AppError(
        401,
        ErrorCode.INVALID_CREDENTIALS,
        'Email/Mã sinh viên hoặc mật khẩu không chính xác',
      );
    }

    if (user.status === UserStatus.LOCKED) {
      throw new AppError(
        403,
        ErrorCode.ACCOUNT_LOCKED,
        user.lockedReason
          ? `Tài khoản đã bị khóa: ${user.lockedReason}`
          : 'Tài khoản của bạn đã bị quản trị viên khóa',
      );
    }

    const now = new Date();
    if (user.lockUntil && user.lockUntil > now) {
      const remainingMinutes = Math.ceil((user.lockUntil.getTime() - now.getTime()) / 60000);
      throw new AppError(
        429,
        ErrorCode.TOO_MANY_ATTEMPTS,
        `Đăng nhập sai quá nhiều lần. Vui lòng thử lại sau ${remainingMinutes} phút`,
      );
    }

    const passwordValid = await comparePassword(input.password, user.passwordHash);
    if (!passwordValid) {
      const maxAttempts = await authRepository.getSystemSettingNumber(
        'MAX_LOGIN_ATTEMPTS',
        env.MAX_LOGIN_ATTEMPTS,
      );
      const lockMinutes = await authRepository.getSystemSettingNumber(
        'LOGIN_LOCK_MINUTES',
        env.LOGIN_LOCK_MINUTES,
      );

      const nextAttempts = user.failedLoginAttempts + 1;
      const shouldTempLock = nextAttempts >= maxAttempts;

      await userRepository.updateById(user.id, {
        failedLoginAttempts: shouldTempLock ? 0 : nextAttempts,
        lockUntil: shouldTempLock ? new Date(now.getTime() + lockMinutes * 60000) : null,
      });

      if (shouldTempLock) {
        throw new AppError(
          429,
          ErrorCode.TOO_MANY_ATTEMPTS,
          `Bạn đã nhập sai mật khẩu ${maxAttempts} lần. Tài khoản tạm khóa ${lockMinutes} phút`,
        );
      }

      throw new AppError(
        401,
        ErrorCode.INVALID_CREDENTIALS,
        'Email/Mã sinh viên hoặc mật khẩu không chính xác',
      );
    }

    const updatedUser = await userRepository.updateById(user.id, {
      failedLoginAttempts: 0,
      lockUntil: null,
      lastLoginAt: now,
    });

    const { token, expiresIn } = signAccessToken(updatedUser.id, updatedUser.role.name);

    return {
      accessToken: token,
      tokenType: 'Bearer',
      expiresIn,
      user: toUserDTO(updatedUser),
    };
  }

  async logout(jti: string, userId: number, exp?: number): Promise<void> {
    const expiresAt = exp ? new Date(exp * 1000) : new Date(Date.now() + 24 * 60 * 60 * 1000);
    await authRepository.revokeToken(jti, userId, expiresAt);
  }

  async changePassword(userId: number, input: ChangePasswordInput): Promise<void> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw AppError.notFound('Không tìm thấy tài khoản');
    }

    const isCurrentValid = await comparePassword(input.currentPassword, user.passwordHash);
    if (!isCurrentValid) {
      throw AppError.badRequest('Mật khẩu hiện tại không chính xác', ErrorCode.INVALID_CREDENTIALS);
    }

    if (input.currentPassword === input.newPassword) {
      throw AppError.badRequest('Mật khẩu mới phải khác mật khẩu hiện tại');
    }

    const strength = validatePasswordStrength(input.newPassword);
    if (!strength.valid) {
      throw AppError.badRequest(strength.errors[0], ErrorCode.VALIDATION_ERROR, {
        issues: strength.errors,
      });
    }

    const newHash = await hashPassword(input.newPassword);
    await userRepository.updateById(userId, { passwordHash: newHash });
  }

  async getMe(userId: number): Promise<UserDTO> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw AppError.notFound('Không tìm thấy người dùng');
    }
    return toUserDTO(user);
  }
}

export const authService = new AuthService();
