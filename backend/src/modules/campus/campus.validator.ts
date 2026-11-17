import { z } from 'zod';
import { CampusCategory } from '../../constants/enums';

export const campusQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(50).optional().default(12),
  category: z
    .enum([
      CampusCategory.ANNOUNCEMENT,
      CampusCategory.EVENT,
      CampusCategory.SCHOLARSHIP,
      CampusCategory.CLUB,
      CampusCategory.JOB_INTERNSHIP,
    ])
    .optional(),
  search: z.string().trim().max(100).optional(),
});

export const campusIdSchema = z.object({ id: z.coerce.number().int().positive() });
