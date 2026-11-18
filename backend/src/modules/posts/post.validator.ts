import { z } from 'zod';

export const createPostSchema = z.object({
  title: z.string().trim().max(255).optional(),
  content: z.string().trim().min(1, 'Nội dung bài viết không được để trống').max(5000),
  category: z.enum(['STUDY', 'COMMUNITY', 'ACTIVITY', 'OPPORTUNITY']).default('COMMUNITY'),
  scope: z.enum(['CLASS', 'COURSE', 'MAJOR', 'FACULTY', 'SCHOOL', 'PUBLIC']).default('SCHOOL'),
  mediaUrls: z.array(z.string().url()).optional(),
  classId: z.number().int().positive().optional(),
  courseId: z.number().int().positive().optional(),
  majorId: z.number().int().positive().optional(),
  facultyId: z.number().int().positive().optional(),
  schoolId: z.number().int().positive().optional(),
});

export const updatePostSchema = z.object({
  title: z.string().trim().max(255).optional(),
  content: z.string().trim().min(1, 'Nội dung không được để trống').max(5000).optional(),
  category: z.enum(['STUDY', 'COMMUNITY', 'ACTIVITY', 'OPPORTUNITY']).optional(),
  scope: z.enum(['CLASS', 'COURSE', 'MAJOR', 'FACULTY', 'SCHOOL', 'PUBLIC']).optional(),
  mediaUrls: z.array(z.string().url()).optional(),
});

export const createCommentSchema = z.object({
  content: z.string().trim().min(1, 'Nội dung bình luận không được để trống').max(1000),
  parentId: z.number().int().positive().optional(),
});

export const reportPostSchema = z.object({
  reason: z.string().trim().min(3, 'Lý do báo cáo tối thiểu 3 ký tự').max(100),
  description: z.string().trim().max(500).optional(),
});

export const postQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  category: z.enum(['STUDY', 'COMMUNITY', 'ACTIVITY', 'OPPORTUNITY']).optional(),
  scope: z.enum(['CLASS', 'COURSE', 'MAJOR', 'FACULTY', 'SCHOOL', 'PUBLIC']).optional(),
  classId: z.coerce.number().int().positive().optional(),
  facultyId: z.coerce.number().int().positive().optional(),
  authorId: z.coerce.number().int().positive().optional(),
  search: z.string().trim().optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type ReportPostInput = z.infer<typeof reportPostSchema>;
export type PostQueryInput = z.infer<typeof postQuerySchema>;
