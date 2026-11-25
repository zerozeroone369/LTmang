import { prisma } from '../../config/database';

export class CommunitiesRepository {
  async findUserWithAcademic(userId: number) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        studentCode: true,
        email: true,
        avatarUrl: true,
        school: {
          select: { id: true, code: true, name: true, shortName: true, address: true },
        },
        faculty: {
          select: { id: true, code: true, name: true },
        },
        major: {
          select: { id: true, code: true, name: true },
        },
        course: {
          select: { id: true, code: true, name: true, startYear: true, endYear: true },
        },
        class: {
          select: { id: true, code: true, name: true },
        },
      },
    });
  }

  async findClassmates(
    classId: number,
    excludeUserId: number,
    skip: number,
    take: number,
    search?: string,
  ) {
    return prisma.user.findMany({
      where: {
        classId,
        id: { not: excludeUserId },
        status: 'ACTIVE',
        ...(search
          ? {
              OR: [
                { fullName: { contains: search } },
                { studentCode: { contains: search } },
                { email: { contains: search } },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        studentCode: true,
        fullName: true,
        avatarUrl: true,
        bio: true,
      },
      orderBy: { fullName: 'asc' },
      skip,
      take,
    });
  }

  async countClassmates(classId: number, excludeUserId: number, search?: string) {
    return prisma.user.count({
      where: {
        classId,
        id: { not: excludeUserId },
        status: 'ACTIVE',
        ...(search
          ? {
              OR: [
                { fullName: { contains: search } },
                { studentCode: { contains: search } },
                { email: { contains: search } },
              ],
            }
          : {}),
      },
    });
  }

  async findFacultyStudents(facultyId: number, skip: number, take: number, search?: string) {
    return prisma.user.findMany({
      where: {
        facultyId,
        status: 'ACTIVE',
        ...(search
          ? {
              OR: [{ fullName: { contains: search } }, { studentCode: { contains: search } }],
            }
          : {}),
      },
      select: {
        id: true,
        studentCode: true,
        fullName: true,
        avatarUrl: true,
        class: { select: { id: true, code: true, name: true } },
        major: { select: { id: true, code: true, name: true } },
      },
      orderBy: { fullName: 'asc' },
      skip,
      take,
    });
  }

  async countFacultyStudents(facultyId: number, search?: string) {
    return prisma.user.count({
      where: {
        facultyId,
        status: 'ACTIVE',
        ...(search
          ? {
              OR: [{ fullName: { contains: search } }, { studentCode: { contains: search } }],
            }
          : {}),
      },
    });
  }

  async getCountsByAcademic(input: {
    schoolId?: number;
    facultyId?: number;
    majorId?: number;
    classId?: number;
  }) {
    const [
      totalStudentsInClass,
      totalStudentsInMajor,
      totalStudentsInFaculty,
      totalStudentsInSchool,
    ] = await Promise.all([
      input.classId
        ? prisma.user.count({ where: { classId: input.classId, status: 'ACTIVE' } })
        : 0,
      input.majorId
        ? prisma.user.count({ where: { majorId: input.majorId, status: 'ACTIVE' } })
        : 0,
      input.facultyId
        ? prisma.user.count({ where: { facultyId: input.facultyId, status: 'ACTIVE' } })
        : 0,
      input.schoolId
        ? prisma.user.count({ where: { schoolId: input.schoolId, status: 'ACTIVE' } })
        : 0,
    ]);

    return {
      totalStudentsInClass,
      totalStudentsInMajor,
      totalStudentsInFaculty,
      totalStudentsInSchool,
    };
  }

  async getOverview(schoolId?: number) {
    const schools = await prisma.school.findMany({
      where: schoolId ? { id: schoolId } : undefined,
      include: {
        faculties: {
          include: {
            majors: {
              include: {
                classes: {
                  include: {
                    course: true,
                    _count: { select: { users: true } },
                  },
                },
                _count: { select: { users: true } },
              },
            },
            _count: { select: { users: true } },
          },
        },
        _count: { select: { users: true } },
      },
    });
    return schools;
  }
}

export const communitiesRepository = new CommunitiesRepository();
