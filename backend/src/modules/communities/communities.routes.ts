import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { communitiesController } from './communities.controller';
import { communityMembersQuerySchema } from './communities.validator';

const router = Router();

router.get('/overview', communitiesController.getOverview.bind(communitiesController));
router.get('/me', authenticate, communitiesController.getMyCommunity.bind(communitiesController));

router.get(
  '/classes/:id/members',
  authenticate,
  validate({ query: communityMembersQuerySchema }),
  communitiesController.getClassMembers.bind(communitiesController),
);

router.get(
  '/faculties/:id/members',
  authenticate,
  validate({ query: communityMembersQuerySchema }),
  communitiesController.getFacultyMembers.bind(communitiesController),
);

export const communityRoutes = router;
