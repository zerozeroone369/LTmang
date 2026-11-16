import { prisma } from '../../config/database';
import { PostStatus, ReportStatus, UserStatus } from '../../constants/enums';
import { AppError } from '../../utils/errors';
import { toUserDTO } from '../users/user.dto';
import { userRepository } from '../users/user.repository';
import { adminRepository } from './admin.repository';

export class AdminService {
  async getDashboard() {
    return adminRepository.getDashboardCounts();
  }

  async listUsers(params: {
    search?: string;
    role?: string;
    status?: string;
    skip: number;
    take: number;
  }) {
    const { items, total } = await adminRepository.listUsers(params);
    return {
      items: items.map(toUserDTO),
      total,
    };
  }

  async lockUser(adminId: number, targetUserId: number, reason: string, ipAddress?: string) {
    if (adminId === targetUserId) {
      throw AppError.badRequest('Không thể tự khóa tài khoản của chính mình');
    }

    const user = await userRepository.findById(targetUserId);
    if (!user) {
      throw AppError.notFound('Không tìm thấy tài khoản người dùng');
    }

    if (user.status === UserStatus.LOCKED) {
      throw AppError.badRequest('Tài khoản này đã ở trạng thái bị khóa');
    }

    const updated = await prisma.$transaction(async (tx) => {
      const lockedUser = await tx.user.update({
        where: { id: targetUserId },
        data: {
          status: UserStatus.LOCKED,
          lockedReason: reason,
          lockedAt: new Date(),
        },
        include: {
          role: true,
          school: true,
          faculty: true,
          major: true,
          course: true,
          class: true,
        },
      });

      await tx.adminLog.create({
        data: {
          adminId,
          action: 'LOCK_USER',
          targetType: 'USER',
          targetId: String(targetUserId),
          details: JSON.stringify({ email: user.email, reason }),
          ipAddress,
        },
      });

      return lockedUser;
    });

    return toUserDTO(updated);
  }

  async unlockUser(adminId: number, targetUserId: number, ipAddress?: string) {
    const user = await userRepository.findById(targetUserId);
    if (!user) {
      throw AppError.notFound('Không tìm thấy tài khoản người dùng');
    }

    const updated = await prisma.$transaction(async (tx) => {
      const unlockedUser = await tx.user.update({
        where: { id: targetUserId },
        data: {
          status: UserStatus.ACTIVE,
          lockedReason: null,
          lockedAt: null,
          failedLoginAttempts: 0,
          lockUntil: null,
        },
        include: {
          role: true,
          school: true,
          faculty: true,
          major: true,
          course: true,
          class: true,
        },
      });

      await tx.adminLog.create({
        data: {
          adminId,
          action: 'UNLOCK_USER',
          targetType: 'USER',
          targetId: String(targetUserId),
          details: JSON.stringify({ email: user.email }),
          ipAddress,
        },
      });

      return unlockedUser;
    });

    return toUserDTO(updated);
  }

  async updateUserRole(
    adminId: number,
    targetUserId: number,
    roleName: string,
    ipAddress?: string,
  ) {
    if (adminId === targetUserId) {
      throw AppError.badRequest('Không thể tự thay đổi vai trò của chính mình');
    }

    const [user, role] = await Promise.all([
      userRepository.findById(targetUserId),
      prisma.role.findUnique({ where: { name: roleName } }),
    ]);

    if (!user) {
      throw AppError.notFound('Không tìm thấy người dùng');
    }
    if (!role) {
      throw AppError.badRequest('Vai trò không hợp lệ');
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: targetUserId },
        data: { roleId: role.id },
        include: {
          role: true,
          school: true,
          faculty: true,
          major: true,
          course: true,
          class: true,
        },
      });

      await tx.adminLog.create({
        data: {
          adminId,
          action: 'CHANGE_ROLE',
          targetType: 'USER',
          targetId: String(targetUserId),
          details: JSON.stringify({ from: user.role.name, to: roleName }),
          ipAddress,
        },
      });

      return updatedUser;
    });

    return toUserDTO(updated);
  }

  async listReports(params: { status?: string; skip: number; take: number }) {
    return adminRepository.listReports(params);
  }

  async resolveReport(
    adminId: number,
    reportId: number,
    action: 'HIDE_POST' | 'DELETE_POST' | 'DISMISS',
    note?: string,
    ipAddress?: string,
  ) {
    const report = await prisma.postReport.findUnique({
      where: { id: reportId },
      include: { post: true },
    });

    if (!report) {
      throw AppError.notFound('Không tìm thấy báo cáo vi phạm');
    }

    const nextReportStatus =
      action === 'HIDE_POST'
        ? ReportStatus.RESOLVED_HIDDEN
        : action === 'DELETE_POST'
          ? ReportStatus.RESOLVED_DELETED
          : ReportStatus.DISMISSED;

    return prisma.$transaction(async (tx) => {
      if (action === 'HIDE_POST') {
        await tx.post.update({
          where: { id: report.postId },
          data: { status: PostStatus.HIDDEN },
        });
      } else if (action === 'DELETE_POST') {
        await tx.post.update({
          where: { id: report.postId },
          data: { status: PostStatus.DELETED },
        });
      }

      const updatedReport = await tx.postReport.update({
        where: { id: reportId },
        data: {
          status: nextReportStatus,
          handledById: adminId,
          handledNote: note ?? null,
          handledAt: new Date(),
        },
        include: {
          reporter: { select: { id: true, fullName: true, email: true } },
          handledBy: { select: { id: true, fullName: true, email: true } },
          post: {
            select: {
              id: true,
              title: true,
              content: true,
              status: true,
              author: { select: { id: true, fullName: true, email: true } },
            },
          },
        },
      });

      await tx.adminLog.create({
        data: {
          adminId,
          action: `RESOLVE_REPORT_${action}`,
          targetType: 'REPORT',
          targetId: String(reportId),
          details: JSON.stringify({ postId: report.postId, note }),
          ipAddress,
        },
      });

      return updatedReport;
    });
  }

  async listPosts(params: {
    search?: string;
    status?: string;
    category?: string;
    skip: number;
    take: number;
  }) {
    return adminRepository.listPosts(params);
  }

  async updatePostStatus(
    adminId: number,
    postId: number,
    status: string,
    actionName: string,
    ipAddress?: string,
  ) {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      throw AppError.notFound('Không tìm thấy bài viết');
    }

    return prisma.$transaction(async (tx) => {
      const updated = await tx.post.update({
        where: { id: postId },
        data: { status },
      });

      await tx.adminLog.create({
        data: {
          adminId,
          action: actionName,
          targetType: 'POST',
          targetId: String(postId),
          details: JSON.stringify({ title: post.title, previousStatus: post.status, status }),
          ipAddress,
        },
      });

      return updated;
    });
  }

  async listCampusPosts(params: {
    search?: string;
    category?: string;
    status?: string;
    skip: number;
    take: number;
  }) {
    return adminRepository.listCampusPosts(params);
  }

  async createCampusPost(
    adminId: number,
    input: {
      title: string;
      content: string;
      category: string;
      thumbnailUrl?: string | null;
      location?: string | null;
      eventDate?: string | null;
      deadline?: string | null;
      isPinned?: boolean;
      status?: string;
    },
    ipAddress?: string,
  ) {
    return prisma.$transaction(async (tx) => {
      const created = await tx.campusPost.create({
        data: {
          authorId: adminId,
          title: input.title,
          content: input.content,
          category: input.category,
          thumbnailUrl: input.thumbnailUrl ?? null,
          location: input.location ?? null,
          eventDate: input.eventDate ? new Date(input.eventDate) : null,
          deadline: input.deadline ? new Date(input.deadline) : null,
          isPinned: input.isPinned ?? false,
          status: input.status ?? 'PUBLISHED',
        },
        include: {
          author: { select: { id: true, fullName: true, email: true } },
        },
      });

      await tx.adminLog.create({
        data: {
          adminId,
          action: 'CREATE_CAMPUS_POST',
          targetType: 'CAMPUS_POST',
          targetId: String(created.id),
          details: JSON.stringify({ title: created.title, category: created.category }),
          ipAddress,
        },
      });

      return created;
    });
  }

  async updateCampusPost(
    adminId: number,
    id: number,
    input: {
      title?: string;
      content?: string;
      category?: string;
      thumbnailUrl?: string | null;
      location?: string | null;
      eventDate?: string | null;
      deadline?: string | null;
      isPinned?: boolean;
      status?: string;
    },
    ipAddress?: string,
  ) {
    const existing = await prisma.campusPost.findUnique({ where: { id } });
    if (!existing) {
      throw AppError.notFound('Không tìm thấy bài viết Campus');
    }

    return prisma.$transaction(async (tx) => {
      const updated = await tx.campusPost.update({
        where: { id },
        data: {
          ...(input.title !== undefined ? { title: input.title } : {}),
          ...(input.content !== undefined ? { content: input.content } : {}),
          ...(input.category !== undefined ? { category: input.category } : {}),
          ...(input.thumbnailUrl !== undefined ? { thumbnailUrl: input.thumbnailUrl } : {}),
          ...(input.location !== undefined ? { location: input.location } : {}),
          ...(input.eventDate !== undefined
            ? { eventDate: input.eventDate ? new Date(input.eventDate) : null }
            : {}),
          ...(input.deadline !== undefined
            ? { deadline: input.deadline ? new Date(input.deadline) : null }
            : {}),
          ...(input.isPinned !== undefined ? { isPinned: input.isPinned } : {}),
          ...(input.status !== undefined ? { status: input.status } : {}),
        },
        include: {
          author: { select: { id: true, fullName: true, email: true } },
        },
      });

      await tx.adminLog.create({
        data: {
          adminId,
          action: 'UPDATE_CAMPUS_POST',
          targetType: 'CAMPUS_POST',
          targetId: String(id),
          details: JSON.stringify({ title: updated.title, status: updated.status }),
          ipAddress,
        },
      });

      return updated;
    });
  }

  async deleteCampusPost(adminId: number, id: number, ipAddress?: string) {
    const existing = await prisma.campusPost.findUnique({ where: { id } });
    if (!existing) {
      throw AppError.notFound('Không tìm thấy bài viết Campus');
    }

    await prisma.$transaction(async (tx) => {
      await tx.campusPost.delete({ where: { id } });
      await tx.adminLog.create({
        data: {
          adminId,
          action: 'DELETE_CAMPUS_POST',
          targetType: 'CAMPUS_POST',
          targetId: String(id),
          details: JSON.stringify({ title: existing.title }),
          ipAddress,
        },
      });
    });
  }

  async createSchool(
    adminId: number,
    input: { code: string; name: string; shortName?: string; address?: string },
    ipAddress?: string,
  ) {
    const created = await prisma.school.create({ data: input });
    await adminRepository.createLog({
      adminId,
      action: 'CREATE_SCHOOL',
      targetType: 'ACADEMIC',
      targetId: String(created.id),
      details: JSON.stringify(input),
      ipAddress,
    });
    return created;
  }

  async deleteSchool(adminId: number, id: number, ipAddress?: string) {
    const existing = await prisma.school.findUnique({ where: { id } });
    if (!existing) throw AppError.notFound('Không tìm thấy trường học');
    await prisma.school.delete({ where: { id } });
    await adminRepository.createLog({
      adminId,
      action: 'DELETE_SCHOOL',
      targetType: 'ACADEMIC',
      targetId: String(id),
      details: JSON.stringify({ code: existing.code, name: existing.name }),
      ipAddress,
    });
  }

  async createFaculty(
    adminId: number,
    input: { schoolId: number; code: string; name: string },
    ipAddress?: string,
  ) {
    const school = await prisma.school.findUnique({ where: { id: input.schoolId } });
    if (!school) throw AppError.badRequest('Trường học không tồn tại');
    const created = await prisma.faculty.create({ data: input });
    await adminRepository.createLog({
      adminId,
      action: 'CREATE_FACULTY',
      targetType: 'ACADEMIC',
      targetId: String(created.id),
      details: JSON.stringify(input),
      ipAddress,
    });
    return created;
  }

  async deleteFaculty(adminId: number, id: number, ipAddress?: string) {
    const existing = await prisma.faculty.findUnique({ where: { id } });
    if (!existing) throw AppError.notFound('Không tìm thấy khoa');
    await prisma.faculty.delete({ where: { id } });
    await adminRepository.createLog({
      adminId,
      action: 'DELETE_FACULTY',
      targetType: 'ACADEMIC',
      targetId: String(id),
      details: JSON.stringify({ code: existing.code, name: existing.name }),
      ipAddress,
    });
  }

  async createMajor(
    adminId: number,
    input: { facultyId: number; code: string; name: string },
    ipAddress?: string,
  ) {
    const faculty = await prisma.faculty.findUnique({ where: { id: input.facultyId } });
    if (!faculty) throw AppError.badRequest('Khoa không tồn tại');
    const created = await prisma.major.create({ data: input });
    await adminRepository.createLog({
      adminId,
      action: 'CREATE_MAJOR',
      targetType: 'ACADEMIC',
      targetId: String(created.id),
      details: JSON.stringify(input),
      ipAddress,
    });
    return created;
  }

  async deleteMajor(adminId: number, id: number, ipAddress?: string) {
    const existing = await prisma.major.findUnique({ where: { id } });
    if (!existing) throw AppError.notFound('Không tìm thấy ngành học');
    await prisma.major.delete({ where: { id } });
    await adminRepository.createLog({
      adminId,
      action: 'DELETE_MAJOR',
      targetType: 'ACADEMIC',
      targetId: String(id),
      details: JSON.stringify({ code: existing.code, name: existing.name }),
      ipAddress,
    });
  }

  async createCourse(
    adminId: number,
    input: { schoolId: number; code: string; name: string; startYear?: number; endYear?: number },
    ipAddress?: string,
  ) {
    const school = await prisma.school.findUnique({ where: { id: input.schoolId } });
    if (!school) throw AppError.badRequest('Trường học không tồn tại');
    const created = await prisma.course.create({ data: input });
    await adminRepository.createLog({
      adminId,
      action: 'CREATE_COURSE',
      targetType: 'ACADEMIC',
      targetId: String(created.id),
      details: JSON.stringify(input),
      ipAddress,
    });
    return created;
  }

  async deleteCourse(adminId: number, id: number, ipAddress?: string) {
    const existing = await prisma.course.findUnique({ where: { id } });
    if (!existing) throw AppError.notFound('Không tìm thấy khóa học');
    await prisma.course.delete({ where: { id } });
    await adminRepository.createLog({
      adminId,
      action: 'DELETE_COURSE',
      targetType: 'ACADEMIC',
      targetId: String(id),
      details: JSON.stringify({ code: existing.code, name: existing.name }),
      ipAddress,
    });
  }

  async createClass(
    adminId: number,
    input: { majorId: number; courseId: number; code: string; name: string },
    ipAddress?: string,
  ) {
    const [major, course] = await Promise.all([
      prisma.major.findUnique({ where: { id: input.majorId } }),
      prisma.course.findUnique({ where: { id: input.courseId } }),
    ]);
    if (!major) throw AppError.badRequest('Ngành học không tồn tại');
    if (!course) throw AppError.badRequest('Khóa học không tồn tại');
    const created = await prisma.class.create({ data: input });
    await adminRepository.createLog({
      adminId,
      action: 'CREATE_CLASS',
      targetType: 'ACADEMIC',
      targetId: String(created.id),
      details: JSON.stringify(input),
      ipAddress,
    });
    return created;
  }

  async deleteClass(adminId: number, id: number, ipAddress?: string) {
    const existing = await prisma.class.findUnique({ where: { id } });
    if (!existing) throw AppError.notFound('Không tìm thấy lớp học');
    await prisma.class.delete({ where: { id } });
    await adminRepository.createLog({
      adminId,
      action: 'DELETE_CLASS',
      targetType: 'ACADEMIC',
      targetId: String(id),
      details: JSON.stringify({ code: existing.code, name: existing.name }),
      ipAddress,
    });
  }

  async listLogs(params: { action?: string; targetType?: string; skip: number; take: number }) {
    return adminRepository.listLogs(params);
  }

  async listSettings() {
    return prisma.systemSetting.findMany({
      include: {
        updatedBy: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: [{ group: 'asc' }, { key: 'asc' }],
    });
  }

  async updateSettings(
    adminId: number,
    settings: Array<{ key: string; value: string; description?: string; group?: string }>,
    ipAddress?: string,
  ) {
    return prisma.$transaction(async (tx) => {
      const updatedList = [];
      for (const item of settings) {
        const upserted = await tx.systemSetting.upsert({
          where: { key: item.key },
          update: {
            value: item.value,
            ...(item.description !== undefined ? { description: item.description } : {}),
            ...(item.group !== undefined ? { group: item.group } : {}),
            updatedById: adminId,
          },
          create: {
            key: item.key,
            value: item.value,
            description: item.description ?? null,
            group: item.group ?? 'GENERAL',
            updatedById: adminId,
          },
        });
        updatedList.push(upserted);
      }

      await tx.adminLog.create({
        data: {
          adminId,
          action: 'UPDATE_SETTINGS',
          targetType: 'SYSTEM_SETTING',
          details: JSON.stringify(settings.map((s) => ({ key: s.key, value: s.value }))),
          ipAddress,
        },
      });

      return updatedList;
    });
  }
}

export const adminService = new AdminService();
