import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database';
import { userInclude } from '../users/user.repository';

export class AdminRepository {
  async createLog(data: {
    adminId: number;
    action: string;
    targetType: string;
    targetId?: string | null;
    details?: string | null;
    ipAddress?: string | null;
  }) {
    return prisma.adminLog.create({
      data,
    });
  }

  async getDashboardCounts() {
    const [
      totalUsers,
      activeUsers,
      lockedUsers,
      totalPosts,
      totalDocuments,
      totalQuestions,
      totalStudyGroups,
      totalCampusPosts,
      pendingReports,
      recentLogs,
      recentReports,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.user.count({ where: { status: 'LOCKED' } }),
      prisma.post.count({ where: { status: { not: 'DELETED' } } }),
      prisma.document.count({ where: { status: { not: 'DELETED' } } }),
      prisma.question.count({ where: { status: { not: 'DELETED' } } }),
      prisma.studyGroup.count(),
      prisma.campusPost.count(),
      prisma.postReport.count({ where: { status: 'PENDING' } }),
      prisma.adminLog.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: {
          admin: { select: { id: true, fullName: true, email: true } },
        },
      }),
      prisma.postReport.findMany({
        where: { status: 'PENDING' },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          reporter: { select: { id: true, fullName: true, email: true } },
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
      }),
    ]);

    return {
      stats: {
        totalUsers,
        activeUsers,
        lockedUsers,
        totalPosts,
        totalDocuments,
        totalQuestions,
        totalStudyGroups,
        totalCampusPosts,
        pendingReports,
      },
      recentLogs,
      recentReports,
    };
  }

  async listUsers(params: {
    search?: string;
    role?: string;
    status?: string;
    skip: number;
    take: number;
  }) {
    const where: Prisma.UserWhereInput = {
      ...(params.status ? { status: params.status } : {}),
      ...(params.role ? { role: { name: params.role } } : {}),
      ...(params.search
        ? {
            OR: [
              { fullName: { contains: params.search } },
              { email: { contains: params.search } },
              { studentCode: { contains: params.search } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: userInclude,
        orderBy: { createdAt: 'desc' },
        skip: params.skip,
        take: params.take,
      }),
      prisma.user.count({ where }),
    ]);

    return { items, total };
  }

  async listReports(params: { status?: string; skip: number; take: number }) {
    const where: Prisma.PostReportWhereInput = {
      ...(params.status ? { status: params.status } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.postReport.findMany({
        where,
        include: {
          reporter: { select: { id: true, fullName: true, email: true, studentCode: true } },
          handledBy: { select: { id: true, fullName: true, email: true } },
          post: {
            select: {
              id: true,
              title: true,
              content: true,
              category: true,
              status: true,
              createdAt: true,
              author: { select: { id: true, fullName: true, email: true, studentCode: true } },
            },
          },
        },
        orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
        skip: params.skip,
        take: params.take,
      }),
      prisma.postReport.count({ where }),
    ]);

    return { items, total };
  }

  async listPosts(params: {
    search?: string;
    status?: string;
    category?: string;
    skip: number;
    take: number;
  }) {
    const where: Prisma.PostWhereInput = {
      ...(params.status ? { status: params.status } : {}),
      ...(params.category ? { category: params.category } : {}),
      ...(params.search
        ? {
            OR: [{ title: { contains: params.search } }, { content: { contains: params.search } }],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: { select: { id: true, fullName: true, email: true, studentCode: true } },
          _count: { select: { reports: true, comments: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: params.skip,
        take: params.take,
      }),
      prisma.post.count({ where }),
    ]);

    return { items, total };
  }

  async listCampusPosts(params: {
    search?: string;
    category?: string;
    status?: string;
    skip: number;
    take: number;
  }) {
    const where: Prisma.CampusPostWhereInput = {
      ...(params.category ? { category: params.category } : {}),
      ...(params.status ? { status: params.status } : {}),
      ...(params.search
        ? {
            OR: [{ title: { contains: params.search } }, { content: { contains: params.search } }],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.campusPost.findMany({
        where,
        include: {
          author: { select: { id: true, fullName: true, email: true } },
        },
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        skip: params.skip,
        take: params.take,
      }),
      prisma.campusPost.count({ where }),
    ]);

    return { items, total };
  }

  async listLogs(params: { action?: string; targetType?: string; skip: number; take: number }) {
    const where: Prisma.AdminLogWhereInput = {
      ...(params.action ? { action: params.action } : {}),
      ...(params.targetType ? { targetType: params.targetType } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.adminLog.findMany({
        where,
        include: {
          admin: { select: { id: true, fullName: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: params.skip,
        take: params.take,
      }),
      prisma.adminLog.count({ where }),
    ]);

    return { items, total };
  }
}

export const adminRepository = new AdminRepository();
