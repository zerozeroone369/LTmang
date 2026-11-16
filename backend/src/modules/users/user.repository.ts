import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database';
import { UserWithRelations } from './user.dto';

export const userInclude = {
  role: true,
  school: true,
  faculty: true,
  major: true,
  course: true,
  class: true,
} satisfies Prisma.UserInclude;

export class UserRepository {
  async findById(id: number): Promise<UserWithRelations | null> {
    return prisma.user.findUnique({
      where: { id },
      include: userInclude,
    });
  }

  async findByEmail(email: string): Promise<UserWithRelations | null> {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: userInclude,
    });
  }

  async findByStudentCode(studentCode: string): Promise<UserWithRelations | null> {
    return prisma.user.findUnique({
      where: { studentCode },
      include: userInclude,
    });
  }

  async findByIdentifier(identifier: string): Promise<UserWithRelations | null> {
    const normalized = identifier.trim();
    return prisma.user.findFirst({
      where: {
        OR: [{ email: normalized.toLowerCase() }, { studentCode: normalized }],
      },
      include: userInclude,
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<UserWithRelations> {
    return prisma.user.create({
      data,
      include: userInclude,
    });
  }

  async updateById(id: number, data: Prisma.UserUpdateInput): Promise<UserWithRelations> {
    return prisma.user.update({
      where: { id },
      data,
      include: userInclude,
    });
  }
}

export const userRepository = new UserRepository();
