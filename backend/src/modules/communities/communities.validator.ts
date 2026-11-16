import { z } from 'zod';

export const communityMembersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  search: z.string().trim().optional(),
});

export type CommunityMembersQuery = z.infer<typeof communityMembersQuerySchema>;
