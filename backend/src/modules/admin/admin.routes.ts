import { Router } from 'express';
import { RoleName } from '../../constants/enums';
import { authenticate, requireRole } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { adminController } from './admin.controller';
import {
  createCampusPostSchema,
  createClassSchema,
  createCourseSchema,
  createFacultySchema,
  createMajorSchema,
  createSchoolSchema,
  idParamSchema,
  lockUserSchema,
  resolveReportSchema,
  updateCampusPostSchema,
  updateSettingsSchema,
  updateUserRoleSchema,
} from './admin.validator';

const router = Router();

router.use(authenticate, requireRole(RoleName.ADMIN));

router.get('/dashboard', adminController.getDashboard.bind(adminController));

// User Management
router.get('/users', adminController.listUsers.bind(adminController));
router.patch(
  '/users/:id/lock',
  validate({ params: idParamSchema, body: lockUserSchema }),
  adminController.lockUser.bind(adminController),
);
router.patch(
  '/users/:id/unlock',
  validate({ params: idParamSchema }),
  adminController.unlockUser.bind(adminController),
);
router.patch(
  '/users/:id/role',
  validate({ params: idParamSchema, body: updateUserRoleSchema }),
  adminController.updateUserRole.bind(adminController),
);

// Content Moderation & Reports
router.get('/reports', adminController.listReports.bind(adminController));
router.patch(
  '/reports/:id/resolve',
  validate({ params: idParamSchema, body: resolveReportSchema }),
  adminController.resolveReport.bind(adminController),
);
router.get('/posts', adminController.listPosts.bind(adminController));
router.patch(
  '/posts/:id/hide',
  validate({ params: idParamSchema }),
  adminController.hidePost.bind(adminController),
);
router.patch(
  '/posts/:id/restore',
  validate({ params: idParamSchema }),
  adminController.restorePost.bind(adminController),
);
router.delete(
  '/posts/:id',
  validate({ params: idParamSchema }),
  adminController.deletePost.bind(adminController),
);

// Campus Management
router.get('/campus', adminController.listCampusPosts.bind(adminController));
router.post(
  '/campus',
  validate({ body: createCampusPostSchema }),
  adminController.createCampusPost.bind(adminController),
);
router.put(
  '/campus/:id',
  validate({ params: idParamSchema, body: updateCampusPostSchema }),
  adminController.updateCampusPost.bind(adminController),
);
router.delete(
  '/campus/:id',
  validate({ params: idParamSchema }),
  adminController.deleteCampusPost.bind(adminController),
);

// Academic Structure Management
router.post(
  '/academic/schools',
  validate({ body: createSchoolSchema }),
  adminController.createSchool.bind(adminController),
);
router.delete(
  '/academic/schools/:id',
  validate({ params: idParamSchema }),
  adminController.deleteSchool.bind(adminController),
);
router.post(
  '/academic/faculties',
  validate({ body: createFacultySchema }),
  adminController.createFaculty.bind(adminController),
);
router.delete(
  '/academic/faculties/:id',
  validate({ params: idParamSchema }),
  adminController.deleteFaculty.bind(adminController),
);
router.post(
  '/academic/majors',
  validate({ body: createMajorSchema }),
  adminController.createMajor.bind(adminController),
);
router.delete(
  '/academic/majors/:id',
  validate({ params: idParamSchema }),
  adminController.deleteMajor.bind(adminController),
);
router.post(
  '/academic/courses',
  validate({ body: createCourseSchema }),
  adminController.createCourse.bind(adminController),
);
router.delete(
  '/academic/courses/:id',
  validate({ params: idParamSchema }),
  adminController.deleteCourse.bind(adminController),
);
router.post(
  '/academic/classes',
  validate({ body: createClassSchema }),
  adminController.createClass.bind(adminController),
);
router.delete(
  '/academic/classes/:id',
  validate({ params: idParamSchema }),
  adminController.deleteClass.bind(adminController),
);

// Admin Logs & System Settings
router.get('/logs', adminController.listLogs.bind(adminController));
router.get('/settings', adminController.listSettings.bind(adminController));
router.put(
  '/settings',
  validate({ body: updateSettingsSchema }),
  adminController.updateSettings.bind(adminController),
);

export const adminRoutes = router;
