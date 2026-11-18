import { prisma } from '../../config/database';

export class PostRepository {
  async create(data: {
    authorId: number;
    title?: string;
    content: string;
    category?: string;
    scope?: string;
    mediaUrls?: string;
    schoolId?: number | null;
    facultyId?: number | null;
    majorId?: number | null;
    courseId?: number | null;
    classId?: number | null;
  }) {
    return prisma.post.create({
      data,
      include: {
        author: {
          select: { id: true, fullName: true, studentCode: true, avatarUrl: true },
        },
        school: { select: { id: true, code: true, name: true } },
        faculty: { select: { id: true, code: true, name: true } },
        class: { select: { id: true, code: true, name: true } },
      },
    });
  }

  async findById(id: number) {
    return prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, fullName: true, studentCode: true, avatarUrl: true },
        },
        school: { select: { id: true, code: true, name: true } },
        faculty: { select: { id: true, code: true, name: true } },
        major: { select: { id: true, code: true, name: true } },
        course: { select: { id: true, code: true, name: true } },
        class: { select: { id: true, code: true, name: true } },
        reactions: { select: { userId: true, type: true } },
      },
    });
  }

  async findMany(filters: {
    where: Record<string, unknown>;
    skip: number;
    take: number;
    orderBy?: Record<string, 'asc' | 'desc'>;
  }) {
    return prisma.post.findMany({
      where: filters.where,
      include: {
        author: {
          select: { id: true, fullName: true, studentCode: true, avatarUrl: true },
        },
        school: { select: { id: true, code: true, name: true } },
        faculty: { select: { id: true, code: true, name: true } },
        class: { select: { id: true, code: true, name: true } },
        reactions: { select: { userId: true } },
      },
      orderBy: filters.orderBy || { createdAt: 'desc' },
      skip: filters.skip,
      take: filters.take,
    });
  }

  async count(where: Record<string, unknown>) {
    return prisma.post.count({ where });
  }

  async update(
    id: number,
    data: {
      title?: string;
      content?: string;
      category?: string;
      scope?: string;
      mediaUrls?: string;
    },
  ) {
    return prisma.post.update({
      where: { id },
      data,
      include: {
        author: {
          select: { id: true, fullName: true, studentCode: true, avatarUrl: true },
        },
      },
    });
  }

  async delete(id: number) {
    return prisma.post.delete({ where: { id } });
  }

  // Reactions
  async findReaction(postId: number, userId: number) {
    return prisma.reaction.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });
  }

  async createReaction(postId: number, userId: number, type = 'LIKE') {
    return prisma.$transaction(async (tx) => {
      const reaction = await tx.reaction.create({
        data: { postId, userId, type },
      });
      await tx.post.update({
        where: { id: postId },
        data: { likesCount: { increment: 1 } },
      });
      return reaction;
    });
  }

  async deleteReaction(postId: number, userId: number) {
    return prisma.$transaction(async (tx) => {
      const reaction = await tx.reaction.delete({
        where: {
          postId_userId: {
            postId,
            userId,
          },
        },
      });
      await tx.post.update({
        where: { id: postId },
        data: { likesCount: { decrement: 1 } },
      });
      return reaction;
    });
  }

  // Comments
  async createComment(data: {
    postId: number;
    authorId: number;
    content: string;
    parentId?: number;
  }) {
    return prisma.$transaction(async (tx) => {
      const comment = await tx.comment.create({
        data,
        include: {
          author: {
            select: { id: true, fullName: true, studentCode: true, avatarUrl: true },
          },
        },
      });
      await tx.post.update({
        where: { id: data.postId },
        data: { commentsCount: { increment: 1 } },
      });
      return comment;
    });
  }

  async findComments(postId: number, skip: number, take: number) {
    return prisma.comment.findMany({
      where: { postId },
      include: {
        author: {
          select: { id: true, fullName: true, studentCode: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: 'asc' },
      skip,
      take,
    });
  }

  async countComments(postId: number) {
    return prisma.comment.count({
      where: { postId },
    });
  }

  async findCommentById(id: number) {
    return prisma.comment.findUnique({
      where: { id },
    });
  }

  async deleteComment(id: number, postId: number) {
    return prisma.$transaction(async (tx) => {
      await tx.comment.delete({ where: { id } });
      await tx.post.update({
        where: { id: postId },
        data: { commentsCount: { decrement: 1 } },
      });
    });
  }

  // Reports
  async createReport(data: {
    postId: number;
    reporterId: number;
    reason: string;
    description?: string;
  }) {
    return prisma.postReport.create({
      data: {
        postId: data.postId,
        reporterId: data.reporterId,
        reason: data.reason,
        description: data.description,
        status: 'PENDING',
      },
    });
  }
}

export const postRepository = new PostRepository();
