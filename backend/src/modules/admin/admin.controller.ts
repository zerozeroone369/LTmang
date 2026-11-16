import { NextFunction, Request, Response } from 'express';
import { PostStatus } from '../../constants/enums';
import {
  buildPaginationMeta,
  parsePagination,
  sendCreated,
  sendSuccess,
} from '../../utils/apiResponse';
import { adminService } from './admin.service';

export class AdminController {
  async getDashboard(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await adminService.getDashboard();
      return sendSuccess(res, data, 'Lấy thống kê Admin Dashboard thành công');
    } catch (error) {
      next(error);
    }
  }

  async listUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, skip } = parsePagination(req.query as Record<string, unknown>);
      const search = typeof req.query.search === 'string' ? req.query.search.trim() : undefined;
      const role = typeof req.query.role === 'string' ? req.query.role.trim() : undefined;
      const status = typeof req.query.status === 'string' ? req.query.status.trim() : undefined;

      const { items, total } = await adminService.listUsers({
        search,
        role,
        status,
        skip,
        take: limit,
      });

      return sendSuccess(
        res,
        items,
        'Danh sách người dùng',
        200,
        buildPaginationMeta(page, limit, total),
      );
    } catch (error) {
      next(error);
    }
  }

  async lockUser(req: Request, res: Response, next: NextFunction) {
    try {
      const targetUserId = Number(req.params.id);
      const { reason } = req.body as { reason: string };
      const updated = await adminService.lockUser(req.auth!.userId, targetUserId, reason, req.ip);
      return sendSuccess(res, updated, 'Khóa tài khoản người dùng thành công');
    } catch (error) {
      next(error);
    }
  }

  async unlockUser(req: Request, res: Response, next: NextFunction) {
    try {
      const targetUserId = Number(req.params.id);
      const updated = await adminService.unlockUser(req.auth!.userId, targetUserId, req.ip);
      return sendSuccess(res, updated, 'Mở khóa tài khoản người dùng thành công');
    } catch (error) {
      next(error);
    }
  }

  async updateUserRole(req: Request, res: Response, next: NextFunction) {
    try {
      const targetUserId = Number(req.params.id);
      const { role } = req.body as { role: string };
      const updated = await adminService.updateUserRole(
        req.auth!.userId,
        targetUserId,
        role,
        req.ip,
      );
      return sendSuccess(res, updated, 'Cập nhật phân quyền thành công');
    } catch (error) {
      next(error);
    }
  }

  async listReports(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, skip } = parsePagination(req.query as Record<string, unknown>);
      const status = typeof req.query.status === 'string' ? req.query.status.trim() : undefined;

      const { items, total } = await adminService.listReports({ status, skip, take: limit });
      return sendSuccess(
        res,
        items,
        'Danh sách báo cáo vi phạm',
        200,
        buildPaginationMeta(page, limit, total),
      );
    } catch (error) {
      next(error);
    }
  }

  async resolveReport(req: Request, res: Response, next: NextFunction) {
    try {
      const reportId = Number(req.params.id);
      const { action, note } = req.body as {
        action: 'HIDE_POST' | 'DELETE_POST' | 'DISMISS';
        note?: string;
      };
      const updated = await adminService.resolveReport(
        req.auth!.userId,
        reportId,
        action,
        note,
        req.ip,
      );
      return sendSuccess(res, updated, 'Xử lý báo cáo vi phạm thành công');
    } catch (error) {
      next(error);
    }
  }

  async listPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, skip } = parsePagination(req.query as Record<string, unknown>);
      const search = typeof req.query.search === 'string' ? req.query.search.trim() : undefined;
      const status = typeof req.query.status === 'string' ? req.query.status.trim() : undefined;
      const category =
        typeof req.query.category === 'string' ? req.query.category.trim() : undefined;

      const { items, total } = await adminService.listPosts({
        search,
        status,
        category,
        skip,
        take: limit,
      });

      return sendSuccess(
        res,
        items,
        'Danh sách bài viết kiểm duyệt',
        200,
        buildPaginationMeta(page, limit, total),
      );
    } catch (error) {
      next(error);
    }
  }

  async hidePost(req: Request, res: Response, next: NextFunction) {
    try {
      const postId = Number(req.params.id);
      const updated = await adminService.updatePostStatus(
        req.auth!.userId,
        postId,
        PostStatus.HIDDEN,
        'HIDE_POST',
        req.ip,
      );
      return sendSuccess(res, updated, 'Đã ẩn bài viết');
    } catch (error) {
      next(error);
    }
  }

  async restorePost(req: Request, res: Response, next: NextFunction) {
    try {
      const postId = Number(req.params.id);
      const updated = await adminService.updatePostStatus(
        req.auth!.userId,
        postId,
        PostStatus.ACTIVE,
        'RESTORE_POST',
        req.ip,
      );
      return sendSuccess(res, updated, 'Đã khôi phục bài viết');
    } catch (error) {
      next(error);
    }
  }

  async deletePost(req: Request, res: Response, next: NextFunction) {
    try {
      const postId = Number(req.params.id);
      const updated = await adminService.updatePostStatus(
        req.auth!.userId,
        postId,
        PostStatus.DELETED,
        'DELETE_POST',
        req.ip,
      );
      return sendSuccess(res, updated, 'Đã xóa bài viết vi phạm');
    } catch (error) {
      next(error);
    }
  }

  async listCampusPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, skip } = parsePagination(req.query as Record<string, unknown>);
      const search = typeof req.query.search === 'string' ? req.query.search.trim() : undefined;
      const category =
        typeof req.query.category === 'string' ? req.query.category.trim() : undefined;
      const status = typeof req.query.status === 'string' ? req.query.status.trim() : undefined;

      const { items, total } = await adminService.listCampusPosts({
        search,
        category,
        status,
        skip,
        take: limit,
      });

      return sendSuccess(
        res,
        items,
        'Danh sách tin Campus',
        200,
        buildPaginationMeta(page, limit, total),
      );
    } catch (error) {
      next(error);
    }
  }

  async createCampusPost(req: Request, res: Response, next: NextFunction) {
    try {
      const created = await adminService.createCampusPost(req.auth!.userId, req.body, req.ip);
      return sendCreated(res, created, 'Đăng tin Campus thành công');
    } catch (error) {
      next(error);
    }
  }

  async updateCampusPost(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const updated = await adminService.updateCampusPost(req.auth!.userId, id, req.body, req.ip);
      return sendSuccess(res, updated, 'Cập nhật tin Campus thành công');
    } catch (error) {
      next(error);
    }
  }

  async deleteCampusPost(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      await adminService.deleteCampusPost(req.auth!.userId, id, req.ip);
      return sendSuccess(res, { deleted: true }, 'Xóa tin Campus thành công');
    } catch (error) {
      next(error);
    }
  }

  async createSchool(req: Request, res: Response, next: NextFunction) {
    try {
      const created = await adminService.createSchool(req.auth!.userId, req.body, req.ip);
      return sendCreated(res, created, 'Thêm trường học thành công');
    } catch (error) {
      next(error);
    }
  }

  async deleteSchool(req: Request, res: Response, next: NextFunction) {
    try {
      await adminService.deleteSchool(req.auth!.userId, Number(req.params.id), req.ip);
      return sendSuccess(res, { deleted: true }, 'Xóa trường học thành công');
    } catch (error) {
      next(error);
    }
  }

  async createFaculty(req: Request, res: Response, next: NextFunction) {
    try {
      const created = await adminService.createFaculty(req.auth!.userId, req.body, req.ip);
      return sendCreated(res, created, 'Thêm khoa thành công');
    } catch (error) {
      next(error);
    }
  }

  async deleteFaculty(req: Request, res: Response, next: NextFunction) {
    try {
      await adminService.deleteFaculty(req.auth!.userId, Number(req.params.id), req.ip);
      return sendSuccess(res, { deleted: true }, 'Xóa khoa thành công');
    } catch (error) {
      next(error);
    }
  }

  async createMajor(req: Request, res: Response, next: NextFunction) {
    try {
      const created = await adminService.createMajor(req.auth!.userId, req.body, req.ip);
      return sendCreated(res, created, 'Thêm ngành học thành công');
    } catch (error) {
      next(error);
    }
  }

  async deleteMajor(req: Request, res: Response, next: NextFunction) {
    try {
      await adminService.deleteMajor(req.auth!.userId, Number(req.params.id), req.ip);
      return sendSuccess(res, { deleted: true }, 'Xóa ngành học thành công');
    } catch (error) {
      next(error);
    }
  }

  async createCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const created = await adminService.createCourse(req.auth!.userId, req.body, req.ip);
      return sendCreated(res, created, 'Thêm khóa học thành công');
    } catch (error) {
      next(error);
    }
  }

  async deleteCourse(req: Request, res: Response, next: NextFunction) {
    try {
      await adminService.deleteCourse(req.auth!.userId, Number(req.params.id), req.ip);
      return sendSuccess(res, { deleted: true }, 'Xóa khóa học thành công');
    } catch (error) {
      next(error);
    }
  }

  async createClass(req: Request, res: Response, next: NextFunction) {
    try {
      const created = await adminService.createClass(req.auth!.userId, req.body, req.ip);
      return sendCreated(res, created, 'Thêm lớp học thành công');
    } catch (error) {
      next(error);
    }
  }

  async deleteClass(req: Request, res: Response, next: NextFunction) {
    try {
      await adminService.deleteClass(req.auth!.userId, Number(req.params.id), req.ip);
      return sendSuccess(res, { deleted: true }, 'Xóa lớp học thành công');
    } catch (error) {
      next(error);
    }
  }

  async listLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, skip } = parsePagination(req.query as Record<string, unknown>);
      const action = typeof req.query.action === 'string' ? req.query.action.trim() : undefined;
      const targetType =
        typeof req.query.targetType === 'string' ? req.query.targetType.trim() : undefined;

      const { items, total } = await adminService.listLogs({
        action,
        targetType,
        skip,
        take: limit,
      });

      return sendSuccess(
        res,
        items,
        'Lấy nhật ký quản trị thành công',
        200,
        buildPaginationMeta(page, limit, total),
      );
    } catch (error) {
      next(error);
    }
  }

  async listSettings(_req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await adminService.listSettings();
      return sendSuccess(res, settings, 'Lấy cấu hình hệ thống thành công');
    } catch (error) {
      next(error);
    }
  }

  async updateSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const { settings } = req.body as {
        settings: Array<{ key: string; value: string; description?: string; group?: string }>;
      };
      const updated = await adminService.updateSettings(req.auth!.userId, settings, req.ip);
      return sendSuccess(res, updated, 'Cập nhật cấu hình hệ thống thành công');
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
