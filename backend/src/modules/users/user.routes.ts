import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { authController } from '../auth/auth.controller';
import { changePasswordSchema } from '../auth/auth.validator';
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
router.put(
  '/password',
  authenticate,
  validate({ body: changePasswordSchema }),
  authController.changePassword.bind(authController),
);

export const userRoutes = router;
