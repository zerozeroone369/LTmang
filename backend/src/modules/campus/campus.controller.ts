import { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database';
import { CampusStatus } from '../../constants/enums';
import { buildPaginationMeta, parsePagination, sendSuccess } from '../../utils/apiResponse';
import { AppError } from '../../utils/errors';

export class CampusController {
  async listPublished(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, skip } = parsePagination(req.query as Record<string, unknown>);
      const category =
        typeof req.query.category === 'string' ? req.query.category.trim() : undefined;
      const search = typeof req.query.search === 'string' ? req.query.search.trim() : undefined;

      const where: Prisma.CampusPostWhereInput = {
        status: CampusStatus.PUBLISHED,
        ...(category ? { category } : {}),
        ...(search
          ? {
              OR: [{ title: { contains: search } }, { content: { contains: search } }],
            }
          : {}),
      };

      const [items, total] = await Promise.all([
        prisma.campusPost.findMany({
          where,
          include: {
            author: { select: { id: true, fullName: true, avatarUrl: true } },
          },
          orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
          skip,
          take: limit,
        }),
        prisma.campusPost.count({ where }),
      ]);

      return sendSuccess(
        res,
        items,
        'Lấy danh sách tin tức Campus thành công',
        200,
        buildPaginationMeta(page, limit, total),
      );
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        throw AppError.badRequest('ID bài viết Campus không hợp lệ');
      }

      const item = await prisma.campusPost.findFirst({
        where: { id, status: CampusStatus.PUBLISHED },
        include: {
          author: { select: { id: true, fullName: true, avatarUrl: true } },
        },
      });

      if (!item) {
        throw AppError.notFound('Không tìm thấy bài viết Campus');
      }

      return sendSuccess(res, item, 'Chi tiết bài viết Campus');
    } catch (error) {
      next(error);
    }
  }
}

export const campusController = new CampusController();
