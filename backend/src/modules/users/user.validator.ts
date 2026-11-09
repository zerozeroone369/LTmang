import { z } from 'zod';

export const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2, 'Họ tên tối thiểu 2 ký tự').max(100).optional(),
  avatarUrl: z.string().trim().url('URL ảnh đại diện không hợp lệ').nullable().optional(),
  bio: z.string().trim().max(500).nullable().optional(),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s]{8,15}$/, 'Số điện thoại không hợp lệ')
    .nullable()
    .optional(),
  schoolId: z.number().int().positive().nullable().optional(),
  facultyId: z.number().int().positive().nullable().optional(),
  majorId: z.number().int().positive().nullable().optional(),
  courseId: z.number().int().positive().nullable().optional(),
  classId: z.number().int().positive().nullable().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
