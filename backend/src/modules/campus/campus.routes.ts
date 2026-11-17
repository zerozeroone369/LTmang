import { Router } from 'express';
import { validate } from '../../middlewares/validate.middleware';
import { campusController } from './campus.controller';
import { campusIdSchema, campusQuerySchema } from './campus.validator';

const router = Router();

router.get(
  '/',
  validate({ query: campusQuerySchema }),
  campusController.listPublished.bind(campusController),
);
router.get(
  '/:id',
  validate({ params: campusIdSchema }),
  campusController.getById.bind(campusController),
);

export const campusRoutes = router;
