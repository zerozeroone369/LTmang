import { z } from 'zod';

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, 'Họ tên tối thiểu 2 ký tự').max(100),
  email: z.string().trim().email('Email không đúng định dạng').toLowerCase(),
  studentCode: z.string().trim().min(4, 'Mã sinh viên tối thiểu 4 ký tự').max(30).optional(),
  password: z.string().min(8, 'Mật khẩu tối thiểu 8 ký tự').max(100),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s]{8,15}$/, 'Số điện thoại không hợp lệ')
    .optional(),
  schoolId: z.number().int().positive().optional(),
  facultyId: z.number().int().positive().optional(),
  majorId: z.number().int().positive().optional(),
  courseId: z.number().int().positive().optional(),
  classId: z.number().int().positive().optional(),
});

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, 'Vui lòng nhập email hoặc mã sinh viên'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
  newPassword: z.string().min(8, 'Mật khẩu mới tối thiểu 8 ký tự').max(100),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
