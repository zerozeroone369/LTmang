import { AppError } from '../../utils/errors';
import { communitiesRepository } from './communities.repository';
import { CommunityMembersQuery } from './communities.validator';

export class CommunitiesService {
  async getMyCommunity(userId: number) {
    const user = await communitiesRepository.findUserWithAcademic(userId);
    if (!user) {
      throw AppError.notFound('Không tìm thấy thông tin sinh viên');
    }

    if (!user.class) {
      return {
        user,
        message: 'Bạn chưa được xếp lớp. Vui lòng cập nhật lớp học trong hồ sơ cá nhân.',
        hierarchy: {
          school: user.school,
          faculty: user.faculty,
          major: user.major,
          course: user.course,
          class: null,
        },
        stats: {
          totalStudentsInClass: 0,
          totalStudentsInMajor: 0,
          totalStudentsInFaculty: 0,
          totalStudentsInSchool: 0,
        },
        classmates: [],
      };
    }

    const [stats, classmates] = await Promise.all([
      communitiesRepository.getCountsByAcademic({
        classId: user.class.id,
        majorId: user.major?.id,
        facultyId: user.faculty?.id,
        schoolId: user.school?.id,
      }),
      communitiesRepository.findClassmates(user.class.id, userId, 0, 10),
    ]);

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        studentCode: user.studentCode,
        avatarUrl: user.avatarUrl,
      },
      hierarchy: {
        school: user.school,
        faculty: user.faculty,
        major: user.major,
        course: user.course,
        class: user.class,
      },
      stats,
      classmates,
    };
  }

  async getClassMembers(classId: number, currentUserId: number, query: CommunityMembersQuery) {
    const skip = (query.page - 1) * query.limit;
    const [total, members] = await Promise.all([
      communitiesRepository.countClassmates(classId, currentUserId, query.search),
      communitiesRepository.findClassmates(classId, currentUserId, skip, query.limit, query.search),
    ]);

    return {
      members,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit) || 1,
      },
    };
  }

  async getFacultyMembers(facultyId: number, query: CommunityMembersQuery) {
    const skip = (query.page - 1) * query.limit;
    const [total, members] = await Promise.all([
      communitiesRepository.countFacultyStudents(facultyId, query.search),
      communitiesRepository.findFacultyStudents(facultyId, skip, query.limit, query.search),
    ]);

    return {
      members,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit) || 1,
      },
    };
  }

  async getOverview(schoolId?: number) {
    return communitiesRepository.getOverview(schoolId);
  }
}

export const communitiesService = new CommunitiesService();
