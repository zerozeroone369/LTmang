import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database';

export class DocumentRepository {
  async create(data: Prisma.DocumentUncheckedCreateInput) {
    return prisma.document.create({
      data,
      include: {
        subject: true,
        uploader: {
          select: {
            id: true,
            fullName: true,
            studentCode: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async findById(id: number) {
    return prisma.document.findUnique({
      where: { id },
      include: {
        subject: true,
        uploader: {
          select: {
            id: true,
            fullName: true,
            studentCode: true,
            avatarUrl: true,
          },
        },
        ratings: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async findMany(params: {
    where: Prisma.DocumentWhereInput;
    skip: number;
    take: number;
    orderBy: Prisma.DocumentOrderByWithRelationInput;
  }) {
    return prisma.document.findMany({
      where: params.where,
      skip: params.skip,
      take: params.take,
      orderBy: params.orderBy,
      include: {
        subject: true,
        uploader: {
          select: {
            id: true,
            fullName: true,
            studentCode: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: { ratings: true },
        },
      },
    });
  }

  async count(where: Prisma.DocumentWhereInput) {
    return prisma.document.count({ where });
  }

  async update(id: number, data: Prisma.DocumentUpdateInput) {
    return prisma.document.update({
      where: { id },
      data,
      include: {
        subject: true,
        uploader: {
          select: {
            id: true,
            fullName: true,
            studentCode: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async delete(id: number) {
    return prisma.document.delete({ where: { id } });
  }

  async incrementDownloads(id: number) {
    return prisma.document.update({
      where: { id },
      data: {
        downloadsCount: { increment: 1 },
      },
    });
  }

  async upsertRating(documentId: number, userId: number, rating: number, comment?: string) {
    return prisma.documentRating.upsert({
      where: {
        documentId_userId: { documentId, userId },
      },
      create: {
        documentId,
        userId,
        rating,
        comment,
      },
      update: {
        rating,
        comment,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async findRatingByUser(documentId: number, userId: number) {
    return prisma.documentRating.findUnique({
      where: {
        documentId_userId: { documentId, userId },
      },
    });
  }

  async calculateAvgRating(documentId: number): Promise<{ avgRating: number; count: number }> {
    const aggregate = await prisma.documentRating.aggregate({
      where: { documentId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const avgRating = aggregate._avg.rating ? Number(aggregate._avg.rating.toFixed(1)) : 0;
    const count = aggregate._count.rating || 0;

    await prisma.document.update({
      where: { id: documentId },
      data: { avgRating },
    });

    return { avgRating, count };
  }

  async findSubjects(facultyId?: number, search?: string) {
    const where: Prisma.SubjectWhereInput = {};
    if (facultyId) where.facultyId = facultyId;
    if (search) {
      where.OR = [{ code: { contains: search } }, { name: { contains: search } }];
    }

    return prisma.subject.findMany({
      where,
      orderBy: { code: 'asc' },
      include: {
        _count: {
          select: {
            documents: true,
            questions: true,
          },
        },
      },
    });
  }

  async findSubjectById(id: number) {
    return prisma.subject.findUnique({
      where: { id },
    });
  }
}

export const documentRepository = new DocumentRepository();
