import { z } from 'zod';

export const createDocumentSchema = z.object({
  title: z.string().trim().min(3, 'Tiêu đề tài liệu tối thiểu 3 ký tự').max(255),
  description: z.string().trim().max(2000).optional(),
  fileUrl: z.string().min(1, 'Đường dẫn tệp không được để trống'),
  fileName: z.string().min(1, 'Tên tệp không được để trống').max(255),
  fileType: z.string().min(1, 'Loại tệp không được để trống').max(50),
  fileSize: z.number().int().positive('Dung lượng tệp phải lớn hơn 0'),
  docType: z.enum(['SLIDE', 'EXAM', 'SYLLABUS', 'EXERCISE', 'REFERENCE']).default('REFERENCE'),
  subjectId: z.coerce.number().int().positive('Môn học không hợp lệ'),
  schoolId: z.coerce.number().int().positive().optional(),
  facultyId: z.coerce.number().int().positive().optional(),
  courseId: z.coerce.number().int().positive().optional(),
  classId: z.coerce.number().int().positive().optional(),
});

export const updateDocumentSchema = z.object({
  title: z.string().trim().min(3).max(255).optional(),
  description: z.string().trim().max(2000).optional(),
  docType: z.enum(['SLIDE', 'EXAM', 'SYLLABUS', 'EXERCISE', 'REFERENCE']).optional(),
  subjectId: z.coerce.number().int().positive().optional(),
  status: z.enum(['ACTIVE', 'HIDDEN', 'DELETED']).optional(),
});

export const documentQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  subjectId: z.coerce.number().int().positive().optional(),
  docType: z.enum(['SLIDE', 'EXAM', 'SYLLABUS', 'EXERCISE', 'REFERENCE']).optional(),
  facultyId: z.coerce.number().int().positive().optional(),
  search: z.string().trim().optional(),
  sortBy: z.enum(['newest', 'downloads', 'rating']).default('newest'),
});

export const rateDocumentSchema = z.object({
  rating: z.coerce
    .number()
    .int()
    .min(1, 'Đánh giá tối thiểu 1 sao')
    .max(5, 'Đánh giá tối đa 5 sao'),
  comment: z.string().trim().max(500).optional(),
});

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
export type DocumentQueryInput = z.infer<typeof documentQuerySchema>;
export type RateDocumentInput = z.infer<typeof rateDocumentSchema>;
