import { z } from 'zod';

export const studyGroupIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const removeGroupMemberParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
  memberId: z.coerce.number().int().positive(),
});

export const joinRequestIdSchema = z.object({
  requestId: z.coerce.number().int().positive(),
});

export const createStudyGroupSchema = z.object({
  name: z.string().trim().min(3, 'Tên nhóm cần có ít nhất 3 ký tự').max(120),
  description: z.string().trim().max(2000).optional().nullable(),
  subjectId: z.number().int().positive().optional().nullable(),
  goal: z.string().trim().max(500).optional().nullable(),
  scheduleText: z.string().trim().max(200).optional().nullable(),
  location: z.string().trim().max(200).optional().nullable(),
  maxMembers: z.number().int().min(2).max(100).optional().default(10),
});

export const updateStudyGroupSchema = createStudyGroupSchema.partial();

export const studyGroupSearchSchema = z.object({
  q: z.string().trim().max(100).optional(),
  subjectId: z.coerce.number().int().positive().optional(),
  location: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(50).optional().default(12),
});

export const createJoinRequestSchema = z.object({
  message: z.string().trim().max(500).optional(),
});

export const reviewJoinRequestSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
});

export type CreateStudyGroupInput = z.infer<typeof createStudyGroupSchema>;
export type UpdateStudyGroupInput = z.infer<typeof updateStudyGroupSchema>;
export type StudyGroupSearchInput = z.infer<typeof studyGroupSearchSchema>;
