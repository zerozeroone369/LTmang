import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { authRateLimiter } from '../../middlewares/rateLimit.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { authController } from './auth.controller';
import { changePasswordSchema, loginSchema, registerSchema } from './auth.validator';

const router = Router();

router.post(
  '/register',
  authRateLimiter,
  validate({ body: registerSchema }),
  authController.register.bind(authController),
);

router.post(
  '/login',
  authRateLimiter,
  validate({ body: loginSchema }),
  authController.login.bind(authController),
);

router.post('/logout', authenticate, authController.logout.bind(authController));

router.put(
  '/change-password',
  authenticate,
  validate({ body: changePasswordSchema }),
  authController.changePassword.bind(authController),
);

router.get('/me', authenticate, authController.me.bind(authController));

export const authRoutes = router;
