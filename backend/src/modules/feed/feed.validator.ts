import { z } from 'zod';

export const feedCategorySchema = z.enum(['STUDY', 'COMMUNITY', 'ACTIVITY', 'OPPORTUNITY']);

export const feedScopeSchema = z.enum(['CLASS', 'COURSE', 'MAJOR', 'FACULTY', 'SCHOOL', 'GLOBAL']);

export const feedQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  category: feedCategorySchema.optional(),
  scope: feedScopeSchema.optional(),
  search: z.string().trim().max(200).optional(),
});

export const updateFeedPreferencesSchema = z.object({
  categories: z.union([
    z.literal('ALL'),
    z
      .array(feedCategorySchema)
      .min(1)
      .max(4)
      .refine((categories) => new Set(categories).size === categories.length, {
        message: 'Danh mục không được trùng lặp',
      }),
  ]),
  scope: feedScopeSchema,
});

export type FeedQueryInput = z.infer<typeof feedQuerySchema>;
export type UpdateFeedPreferencesInput = z.infer<typeof updateFeedPreferencesSchema>;
export type FeedCategory = z.infer<typeof feedCategorySchema>;
