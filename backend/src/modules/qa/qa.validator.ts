import { z } from 'zod';

export const createQuestionSchema = z.object({
  title: z.string().trim().min(5, 'Tiêu đề câu hỏi tối thiểu 5 ký tự').max(255),
  content: z.string().trim().min(10, 'Nội dung câu hỏi tối thiểu 10 ký tự').max(10000),
  subjectId: z.coerce.number().int().positive('Môn học không hợp lệ'),
  tags: z.string().trim().max(100).optional(),
});

export const updateQuestionSchema = z.object({
  title: z.string().trim().min(5).max(255).optional(),
  content: z.string().trim().min(10).max(10000).optional(),
  subjectId: z.coerce.number().int().positive().optional(),
  tags: z.string().trim().max(100).optional(),
  isSolved: z.boolean().optional(),
  status: z.enum(['ACTIVE', 'HIDDEN', 'DELETED']).optional(),
});

export const questionQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  subjectId: z.coerce.number().int().positive().optional(),
  isSolved: z
    .enum(['true', 'false'])
    .optional()
    .transform((val) => (val === undefined ? undefined : val === 'true')),
  search: z.string().trim().optional(),
  sortBy: z.enum(['newest', 'unanswered', 'views']).default('newest'),
});

export const createAnswerSchema = z.object({
  content: z.string().trim().min(5, 'Nội dung câu trả lời tối thiểu 5 ký tự').max(10000),
});

export const updateAnswerSchema = z.object({
  content: z.string().trim().min(5, 'Nội dung câu trả lời tối thiểu 5 ký tự').max(10000),
});

export const voteAnswerSchema = z.object({
  value: z.union([z.literal(1), z.literal(-1)], {
    errorMap: () => ({ message: 'Giá trị vote phải là 1 (upvote) hoặc -1 (downvote)' }),
  }),
});

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;
export type QuestionQueryInput = z.infer<typeof questionQuerySchema>;
export type CreateAnswerInput = z.infer<typeof createAnswerSchema>;
export type UpdateAnswerInput = z.infer<typeof updateAnswerSchema>;
export type VoteAnswerInput = z.infer<typeof voteAnswerSchema>;
