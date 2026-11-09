import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { userController } from './user.controller';
import { updateProfileSchema } from './user.validator';

const router = Router();

router.get('/profile', authenticate, userController.getProfile.bind(userController));
router.put(
  '/profile',
  authenticate,
  validate({ body: updateProfileSchema }),
  userController.updateProfile.bind(userController),
);

export const userRoutes = router;
