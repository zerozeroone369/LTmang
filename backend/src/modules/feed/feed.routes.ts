import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { feedController } from './feed.controller';
import { feedQuerySchema, updateFeedPreferencesSchema } from './feed.validator';

const router = Router();

router.get(
  '/',
  authenticate,
  validate({ query: feedQuerySchema }),
  feedController.getFeed.bind(feedController),
);

router.put(
  '/preferences',
  authenticate,
  validate({ body: updateFeedPreferencesSchema }),
  feedController.updatePreferences.bind(feedController),
);

export const feedRoutes = router;
