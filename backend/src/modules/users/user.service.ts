import { prisma } from '../../config/database';
import { AppError } from '../../utils/errors';
import { toUserDTO, UserDTO } from './user.dto';
import { userRepository } from './user.repository';
import { UpdateProfileInput } from './user.validator';

export interface AcademicIdsInput {
  schoolId?: number | null;
  facultyId?: number | null;
  majorId?: number | null;
  courseId?: number | null;
  classId?: number | null;
}

export async function validateAndResolveAcademicIds(input: AcademicIdsInput) {
  const { classId } = input;
  let { schoolId, facultyId, majorId, courseId } = input;

  if (classId !== undefined && classId !== null) {
    const classRecord = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        major: { include: { faculty: true } },
        course: true,
      },
    });
    if (!classRecord) {
      throw AppError.badRequest('Lớp học không tồn tại');
    }
    if (majorId && majorId !== classRecord.majorId) {
      throw AppError.badRequest('Lớp học không thuộc ngành đã chọn');
    }
    if (courseId && courseId !== classRecord.courseId) {
      throw AppError.badRequest('Lớp học không thuộc khóa đã chọn');
    }
    majorId = classRecord.majorId;
    courseId = classRecord.courseId;
    if (facultyId && facultyId !== classRecord.major.facultyId) {
      throw AppError.badRequest('Lớp học không thuộc khoa đã chọn');
    }
    facultyId = classRecord.major.facultyId;
    if (schoolId && schoolId !== classRecord.major.faculty.schoolId) {
      throw AppError.badRequest('Lớp học không thuộc trường đã chọn');
    }
    schoolId = classRecord.major.faculty.schoolId;
  }

  if (majorId !== undefined && majorId !== null) {
    const major = await prisma.major.findUnique({
      where: { id: majorId },
      include: { faculty: true },
    });
    if (!major) {
      throw AppError.badRequest('Ngành học không tồn tại');
    }
    if (facultyId && facultyId !== major.facultyId) {
      throw AppError.badRequest('Ngành học không thuộc khoa đã chọn');
    }
    facultyId = major.facultyId;
    if (schoolId && schoolId !== major.faculty.schoolId) {
      throw AppError.badRequest('Ngành học không thuộc trường đã chọn');
    }
    schoolId = major.faculty.schoolId;
  }

  if (facultyId !== undefined && facultyId !== null) {
    const faculty = await prisma.faculty.findUnique({ where: { id: facultyId } });
    if (!faculty) {
      throw AppError.badRequest('Khoa không tồn tại');
    }
    if (schoolId && schoolId !== faculty.schoolId) {
      throw AppError.badRequest('Khoa không thuộc trường đã chọn');
    }
    schoolId = faculty.schoolId;
  }

  if (courseId !== undefined && courseId !== null) {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      throw AppError.badRequest('Khóa học không tồn tại');
    }
    if (schoolId && schoolId !== course.schoolId) {
      throw AppError.badRequest('Khóa học không thuộc trường đã chọn');
    }
    schoolId = course.schoolId;
  }

  if (schoolId !== undefined && schoolId !== null) {
    const school = await prisma.school.findUnique({ where: { id: schoolId } });
    if (!school) {
      throw AppError.badRequest('Trường học không tồn tại');
    }
  }

  return { schoolId, facultyId, majorId, courseId, classId };
}

export class UserService {
  async getProfile(userId: number): Promise<UserDTO> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw AppError.notFound('Không tìm thấy thông tin người dùng');
    }
    return toUserDTO(user);
  }

  async updateProfile(userId: number, input: UpdateProfileInput): Promise<UserDTO> {
    const existing = await userRepository.findById(userId);
    if (!existing) {
      throw AppError.notFound('Không tìm thấy thông tin người dùng');
    }

    const hasAcademicUpdate =
      input.schoolId !== undefined ||
      input.facultyId !== undefined ||
      input.majorId !== undefined ||
      input.courseId !== undefined ||
      input.classId !== undefined;

    const academicResolved: AcademicIdsInput = hasAcademicUpdate
      ? await validateAndResolveAcademicIds({
          schoolId: input.schoolId,
          facultyId: input.facultyId,
          majorId: input.majorId,
          courseId: input.courseId,
          classId: input.classId,
        })
      : {};

    const updated = await userRepository.updateById(userId, {
      ...(input.fullName !== undefined ? { fullName: input.fullName } : {}),
      ...(input.avatarUrl !== undefined ? { avatarUrl: input.avatarUrl } : {}),
      ...(input.bio !== undefined ? { bio: input.bio } : {}),
      ...(input.phone !== undefined ? { phone: input.phone } : {}),
      ...(academicResolved.schoolId !== undefined
        ? {
            school:
              academicResolved.schoolId === null
                ? { disconnect: true }
                : { connect: { id: academicResolved.schoolId } },
          }
        : {}),
      ...(academicResolved.facultyId !== undefined
        ? {
            faculty:
              academicResolved.facultyId === null
                ? { disconnect: true }
                : { connect: { id: academicResolved.facultyId } },
          }
        : {}),
      ...(academicResolved.majorId !== undefined
        ? {
            major:
              academicResolved.majorId === null
                ? { disconnect: true }
                : { connect: { id: academicResolved.majorId } },
          }
        : {}),
      ...(academicResolved.courseId !== undefined
        ? {
            course:
              academicResolved.courseId === null
                ? { disconnect: true }
                : { connect: { id: academicResolved.courseId } },
          }
        : {}),
      ...(academicResolved.classId !== undefined
        ? {
            class:
              academicResolved.classId === null
                ? { disconnect: true }
                : { connect: { id: academicResolved.classId } },
          }
        : {}),
    });

    return toUserDTO(updated);
  }
}

export const userService = new UserService();
