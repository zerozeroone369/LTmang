import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database';

const GROUP_INCLUDE = {
  subject: { select: { id: true, code: true, name: true } },
  creator: { select: { id: true, fullName: true, avatarUrl: true } },
  members: {
    include: { user: { select: { id: true, fullName: true, avatarUrl: true } } },
    orderBy: { joinedAt: 'asc' as const },
  },
  _count: { select: { members: true, joinRequests: true } },
} satisfies Prisma.StudyGroupInclude;

export class StudyGroupRepository {
  async listSubjects() {
    return prisma.subject.findMany({
      select: { id: true, code: true, name: true, faculty: { select: { name: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async search(params: {
    skip: number;
    take: number;
    q?: string;
    subjectId?: number;
    location?: string;
    currentUserId?: number;
  }) {
    const where: Prisma.StudyGroupWhereInput = {
      status: 'OPEN',
      ...(params.subjectId ? { subjectId: params.subjectId } : {}),
      ...(params.location ? { location: { contains: params.location } } : {}),
      ...(params.q
        ? {
            OR: [
              { name: { contains: params.q } },
              { description: { contains: params.q } },
              { goal: { contains: params.q } },
              { location: { contains: params.q } },
              { subject: { name: { contains: params.q } } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.studyGroup.findMany({
        where,
        include: {
          ...GROUP_INCLUDE,
          ...(params.currentUserId
            ? {
                joinRequests: {
                  where: { userId: params.currentUserId },
                  orderBy: { createdAt: 'desc' as const },
                  take: 1,
                  select: { id: true, status: true },
                },
              }
            : {}),
        },
        orderBy: [{ createdAt: 'desc' }],
        skip: params.skip,
        take: params.take,
      }),
      prisma.studyGroup.count({ where }),
    ]);

    return { items, total };
  }

  async findById(id: number, currentUserId?: number) {
    return prisma.studyGroup.findUnique({
      where: { id },
      include: {
        ...GROUP_INCLUDE,
        joinRequests: currentUserId
          ? {
              where: { userId: currentUserId },
              orderBy: { createdAt: 'desc' },
              take: 1,
              select: { id: true, status: true, userId: true },
            }
          : false,
      },
    });
  }

  async findBasicById(id: number) {
    const group = await prisma.studyGroup.findUnique({
      where: { id },
      include: { _count: { select: { members: true } } },
    });
    return group ? { ...group, memberCount: group._count.members } : null;
  }

  async subjectExists(subjectId: number) {
    return (await prisma.subject.count({ where: { id: subjectId } })) > 0;
  }

  async findMember(groupId: number, userId: number) {
    return prisma.groupMember.findUnique({ where: { groupId_userId: { groupId, userId } } });
  }

  async findPendingRequest(groupId: number, userId: number) {
    return prisma.joinRequest.findFirst({
      where: { groupId, userId, status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(
    creatorId: number,
    input: {
      name: string;
      description?: string | null;
      subjectId?: number | null;
      goal?: string | null;
      scheduleText?: string | null;
      location?: string | null;
      maxMembers?: number;
    },
  ) {
    return prisma.$transaction(async (tx) => {
      const group = await tx.studyGroup.create({
        data: {
          name: input.name,
          description: input.description ?? null,
          subjectId: input.subjectId ?? null,
          creatorId,
          goal: input.goal ?? null,
          scheduleText: input.scheduleText ?? null,
          location: input.location ?? null,
          maxMembers: input.maxMembers ?? 10,
          members: { create: { userId: creatorId, role: 'LEADER' } },
        },
        include: GROUP_INCLUDE,
      });
      return group;
    });
  }

  async createJoinRequest(groupId: number, userId: number, message?: string) {
    return prisma.joinRequest.create({ data: { groupId, userId, message: message ?? null } });
  }

  async listJoinRequests(groupId: number) {
    return prisma.joinRequest.findMany({
      where: { groupId, status: 'PENDING' },
      include: {
        user: {
          select: { id: true, fullName: true, avatarUrl: true, class: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async reviewJoinRequest(requestId: number, leaderId: number, status: 'APPROVED' | 'REJECTED') {
    return prisma.$transaction(async (tx) => {
      const request = await tx.joinRequest.findUnique({
        where: { id: requestId },
        include: { group: { include: { members: true } } },
      });
      if (!request) return null;

      if (request.group.creatorId !== leaderId) {
        return { forbidden: true as const };
      }
      if (request.status !== 'PENDING') {
        return { alreadyReviewed: true as const };
      }

      if (status === 'APPROVED') {
        if (request.group.status !== 'OPEN') return { groupClosed: true as const };
        const existingMember = request.group.members.some(
          (member) => member.userId === request.userId,
        );
        if (!existingMember && request.group.members.length >= request.group.maxMembers) {
          return { groupFull: true as const };
        }
        if (!existingMember) {
          await tx.groupMember.create({
            data: { groupId: request.groupId, userId: request.userId, role: 'MEMBER' },
          });
        }
      }

      return tx.joinRequest.update({
        where: { id: requestId },
        data: { status, reviewedById: leaderId, reviewedAt: new Date() },
        include: {
          user: { select: { id: true, fullName: true } },
          group: { select: { id: true, name: true } },
        },
      });
    });
  }

  async leaveGroup(groupId: number, userId: number) {
    return prisma.$transaction(async (tx) => {
      const member = await tx.groupMember.findUnique({
        where: { groupId_userId: { groupId, userId } },
      });
      if (!member) return { notMember: true as const };

      if (member.role === 'LEADER') {
        const successor = await tx.groupMember.findFirst({
          where: { groupId, userId: { not: userId } },
          orderBy: { joinedAt: 'asc' },
        });
        if (successor) {
          await tx.groupMember.update({ where: { id: successor.id }, data: { role: 'LEADER' } });
          await tx.studyGroup.update({
            where: { id: groupId },
            data: { creatorId: successor.userId },
          });
        } else {
          await tx.studyGroup.update({ where: { id: groupId }, data: { status: 'CLOSED' } });
        }
      }

      await tx.groupMember.delete({ where: { id: member.id } });
      return { left: true as const };
    });
  }

  async removeMember(groupId: number, userId: number) {
    const member = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });
    if (!member) return false;

    await prisma.groupMember.delete({ where: { id: member.id } });
    return true;
  }
}

export const studyGroupRepository = new StudyGroupRepository();
