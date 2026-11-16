import { z } from 'zod';
import { CampusCategory, CampusStatus, RoleName } from '../../constants/enums';

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive('ID phải là số nguyên dương'),
});

export const lockUserSchema = z.object({
  reason: z.string().trim().min(3, 'Vui lòng nhập lý do khóa tối thiểu 3 ký tự').max(300),
});

export const updateUserRoleSchema = z.object({
  role: z.enum([RoleName.ADMIN, RoleName.STUDENT]),
});

export const resolveReportSchema = z.object({
  action: z.enum(['HIDE_POST', 'DELETE_POST', 'DISMISS']),
  note: z.string().trim().max(500).optional(),
});

export const createCampusPostSchema = z.object({
  title: z.string().trim().min(3, 'Tiêu đề tối thiểu 3 ký tự').max(200),
  content: z.string().trim().min(10, 'Nội dung tối thiểu 10 ký tự'),
  category: z.enum([
    CampusCategory.ANNOUNCEMENT,
    CampusCategory.EVENT,
    CampusCategory.SCHOLARSHIP,
    CampusCategory.CLUB,
    CampusCategory.JOB_INTERNSHIP,
  ]),
  thumbnailUrl: z.string().trim().url().nullable().optional(),
  location: z.string().trim().max(200).nullable().optional(),
  eventDate: z.string().datetime().nullable().optional(),
  deadline: z.string().datetime().nullable().optional(),
  isPinned: z.boolean().optional().default(false),
  status: z
    .enum([CampusStatus.PUBLISHED, CampusStatus.HIDDEN, CampusStatus.DRAFT])
    .optional()
    .default(CampusStatus.PUBLISHED),
});

export const updateCampusPostSchema = createCampusPostSchema.partial();

export const updateSettingsSchema = z.object({
  settings: z
    .array(
      z.object({
        key: z.string().trim().min(1),
        value: z.string(),
        description: z.string().optional(),
        group: z.string().optional(),
      }),
    )
    .min(1, 'Cần ít nhất 1 cấu hình để cập nhật'),
});

export const createSchoolSchema = z.object({
  code: z.string().trim().min(2).max(20).toUpperCase(),
  name: z.string().trim().min(2).max(200),
  shortName: z.string().trim().max(50).optional(),
  address: z.string().trim().max(300).optional(),
});

export const createFacultySchema = z.object({
  schoolId: z.number().int().positive(),
  code: z.string().trim().min(2).max(20).toUpperCase(),
  name: z.string().trim().min(2).max(200),
});

export const createMajorSchema = z.object({
  facultyId: z.number().int().positive(),
  code: z.string().trim().min(2).max(20).toUpperCase(),
  name: z.string().trim().min(2).max(200),
});

export const createCourseSchema = z.object({
  schoolId: z.number().int().positive(),
  code: z.string().trim().min(2).max(20).toUpperCase(),
  name: z.string().trim().min(2).max(100),
  startYear: z.number().int().min(2000).max(2100).optional(),
  endYear: z.number().int().min(2000).max(2100).optional(),
});

export const createClassSchema = z.object({
  majorId: z.number().int().positive(),
  courseId: z.number().int().positive(),
  code: z.string().trim().min(2).max(30).toUpperCase(),
  name: z.string().trim().min(2).max(150),
});
