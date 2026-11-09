import { NextFunction, Request, Response } from 'express';
import { prisma } from '../../config/database';
import { sendSuccess } from '../../utils/apiResponse';

export class AcademicController {
  async getSchools(_req: Request, res: Response, next: NextFunction) {
    try {
      const schools = await prisma.school.findMany({
        orderBy: { name: 'asc' },
      });
      return sendSuccess(res, schools, 'Danh sách trường học');
    } catch (error) {
      next(error);
    }
  }

  async getFaculties(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.query.schoolId ? Number(req.query.schoolId) : undefined;
      const faculties = await prisma.faculty.findMany({
        where: schoolId ? { schoolId } : undefined,
        include: { school: { select: { id: true, code: true, name: true } } },
        orderBy: { name: 'asc' },
      });
      return sendSuccess(res, faculties, 'Danh sách khoa');
    } catch (error) {
      next(error);
    }
  }

  async getMajors(req: Request, res: Response, next: NextFunction) {
    try {
      const facultyId = req.query.facultyId ? Number(req.query.facultyId) : undefined;
      const majors = await prisma.major.findMany({
        where: facultyId ? { facultyId } : undefined,
        include: { faculty: { select: { id: true, code: true, name: true, schoolId: true } } },
        orderBy: { name: 'asc' },
      });
      return sendSuccess(res, majors, 'Danh sách ngành học');
    } catch (error) {
      next(error);
    }
  }

  async getCourses(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.query.schoolId ? Number(req.query.schoolId) : undefined;
      const courses = await prisma.course.findMany({
        where: schoolId ? { schoolId } : undefined,
        include: { school: { select: { id: true, code: true, name: true } } },
        orderBy: { code: 'desc' },
      });
      return sendSuccess(res, courses, 'Danh sách khóa học');
    } catch (error) {
      next(error);
    }
  }

  async getClasses(req: Request, res: Response, next: NextFunction) {
    try {
      const majorId = req.query.majorId ? Number(req.query.majorId) : undefined;
      const courseId = req.query.courseId ? Number(req.query.courseId) : undefined;
      const classes = await prisma.class.findMany({
        where: {
          ...(majorId ? { majorId } : {}),
          ...(courseId ? { courseId } : {}),
        },
        include: {
          major: { select: { id: true, code: true, name: true } },
          course: { select: { id: true, code: true, name: true } },
        },
        orderBy: { name: 'asc' },
      });
      return sendSuccess(res, classes, 'Danh sách lớp học');
    } catch (error) {
      next(error);
    }
  }
}

export const academicController = new AcademicController();
