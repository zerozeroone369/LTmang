import { Router } from 'express';
import { academicController } from './academic.controller';

const router = Router();

router.get('/schools', academicController.getSchools.bind(academicController));
router.get('/faculties', academicController.getFaculties.bind(academicController));
router.get('/majors', academicController.getMajors.bind(academicController));
router.get('/courses', academicController.getCourses.bind(academicController));
router.get('/classes', academicController.getClasses.bind(academicController));

export const academicRoutes = router;
