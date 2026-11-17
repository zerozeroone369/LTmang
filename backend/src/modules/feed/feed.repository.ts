import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database';

export const feedPostScopes = ['CLASS', 'COURSE', 'MAJOR', 'FACULTY', 'SCHOOL', 'PUBLIC'] as const;
export type FeedPostScope = (typeof feedPostScopes)[number];

export interface FeedAcademicProfile {
  classId: number | null;
  courseId: number | null;
  majorId: number | null;
  facultyId: number | null;
  schoolId: number | null;
}

export class FeedRepository {
  async findUserAcademicProfile(userId: number): Promise<FeedAcademicProfile | null> {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        classId: true,
        courseId: true,
        majorId: true,
        facultyId: true,
        schoolId: true,
      },
    });
  }

  async findPreferences(userId: number) {
    return prisma.userFeedPreference.findUnique({ where: { userId } });
  }

  async upsertPreferences(userId: number, categories: string, scope: string) {
    return prisma.userFeedPreference.upsert({
      where: { userId },
      create: { userId, categories, scope },
      update: { categories, scope },
      select: {
        id: true,
        userId: true,
        categories: true,
        scope: true,
        updatedAt: true,
      },
    });
  }

  async findPosts(
    scope: FeedPostScope,
    academicProfile: FeedAcademicProfile,
    search: string | undefined,
    take: number,
  ) {
    const where = this.buildPostWhere(scope, academicProfile, search);
    if (!where) return [];

    return prisma.post.findMany({
      where,
      include: {
        author: { select: { id: true, fullName: true, avatarUrl: true } },
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
      take,
    });
  }

  async countPosts(scope: FeedPostScope, academicProfile: FeedAcademicProfile, search?: string) {
    const where = this.buildPostWhere(scope, academicProfile, search);
    if (!where) return 0;

    return prisma.post.count({
      where,
    });
  }

  async findCampusPosts(categories: string[], search: string | undefined, take: number) {
    return prisma.campusPost.findMany({
      where: this.buildCampusPostWhere(categories, search),
      include: {
        author: { select: { id: true, fullName: true, avatarUrl: true } },
      },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }, { id: 'asc' }],
      take,
    });
  }

  async countCampusPosts(categories: string[], search?: string) {
    return prisma.campusPost.count({
      where: this.buildCampusPostWhere(categories, search),
    });
  }

  private buildPostWhere(
    scope: FeedPostScope,
    academicProfile: FeedAcademicProfile,
    search?: string,
  ): Prisma.PostWhereInput | null {
    const academicIdField = {
      CLASS: 'classId',
      COURSE: 'courseId',
      MAJOR: 'majorId',
      FACULTY: 'facultyId',
      SCHOOL: 'schoolId',
    } as const;
    const targetId = scope === 'PUBLIC' ? null : academicProfile[academicIdField[scope]];
    if (scope !== 'PUBLIC' && targetId === null) return null;

    return {
      status: 'ACTIVE',
      scope,
      ...(scope === 'PUBLIC' ? {} : { [academicIdField[scope]]: targetId }),
      ...(search
        ? {
            OR: [{ title: { contains: search } }, { content: { contains: search } }],
          }
        : {}),
    };
  }

  private buildCampusPostWhere(categories: string[], search?: string): Prisma.CampusPostWhereInput {
    return {
      status: 'PUBLISHED',
      category: { in: categories },
      ...(search
        ? {
            OR: [{ title: { contains: search } }, { content: { contains: search } }],
          }
        : {}),
    };
  }
}

export const feedRepository = new FeedRepository();
