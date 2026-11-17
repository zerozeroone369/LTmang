import { Router } from 'express';
import { RoleName } from '../../constants/enums';
import { authenticate, requireRole } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { studyGroupController } from './study-group.controller';
import {
  createJoinRequestSchema,
  createStudyGroupSchema,
  joinRequestIdSchema,
  removeGroupMemberParamsSchema,
  reviewJoinRequestSchema,
  studyGroupIdSchema,
  studyGroupSearchSchema,
} from './study-group.validator';

const router = Router();

router.get('/subjects', studyGroupController.listSubjects.bind(studyGroupController));
router.get(
  '/search',
  authenticate,
  requireRole(RoleName.STUDENT),
  validate({ query: studyGroupSearchSchema }),
  studyGroupController.search.bind(studyGroupController),
);
router.get(
  '/',
  authenticate,
  requireRole(RoleName.STUDENT),
  validate({ query: studyGroupSearchSchema }),
  studyGroupController.search.bind(studyGroupController),
);
router.get(
  '/:id',
  authenticate,
  requireRole(RoleName.STUDENT),
  validate({ params: studyGroupIdSchema }),
  studyGroupController.getById.bind(studyGroupController),
);
router.post(
  '/',
  authenticate,
  requireRole(RoleName.STUDENT),
  validate({ body: createStudyGroupSchema }),
  studyGroupController.create.bind(studyGroupController),
);
router.get(
  '/:id/join-requests',
  authenticate,
  validate({ params: studyGroupIdSchema }),
  studyGroupController.listJoinRequests.bind(studyGroupController),
);
router.post(
  '/:id/join',
  authenticate,
  requireRole(RoleName.STUDENT),
  validate({ params: studyGroupIdSchema, body: createJoinRequestSchema }),
  studyGroupController.requestToJoin.bind(studyGroupController),
);
router.put(
  '/join-requests/:requestId',
  authenticate,
  requireRole(RoleName.STUDENT),
  validate({ params: joinRequestIdSchema, body: reviewJoinRequestSchema }),
  studyGroupController.reviewJoinRequest.bind(studyGroupController),
);
router.delete(
  '/:id/leave',
  authenticate,
  requireRole(RoleName.STUDENT),
  validate({ params: studyGroupIdSchema }),
  studyGroupController.leave.bind(studyGroupController),
);
router.delete(
  '/:id/members/:memberId',
  authenticate,
  requireRole(RoleName.STUDENT),
  validate({ params: removeGroupMemberParamsSchema }),
  studyGroupController.removeMember.bind(studyGroupController),
);

export const studyGroupRoutes = router;
