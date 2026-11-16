import { NextFunction, Request, Response } from 'express';
import { sendSuccess } from '../../utils/apiResponse';
import { communitiesService } from './communities.service';
import { CommunityMembersQuery } from './communities.validator';

export class CommunitiesController {
  async getMyCommunity(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.auth!.userId;
      const data = await communitiesService.getMyCommunity(userId);
      return sendSuccess(res, data, 'Thông tin cộng đồng của tôi');
    } catch (error) {
      next(error);
    }
  }

  async getClassMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const classId = Number(req.params.id);
      const currentUserId = req.auth!.userId;
      const query = (req.query || {}) as unknown as CommunityMembersQuery;
      const { members, meta } = await communitiesService.getClassMembers(classId, currentUserId, query);
      return sendSuccess(res, members, 'Danh sách thành viên lớp học', 200, meta);
    } catch (error) {
      next(error);
    }
  }

  async getFacultyMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const facultyId = Number(req.params.id);
      const query = (req.query || {}) as unknown as CommunityMembersQuery;
      const { members, meta } = await communitiesService.getFacultyMembers(facultyId, query);
      return sendSuccess(res, members, 'Danh sách sinh viên khoa', 200, meta);
    } catch (error) {
      next(error);
    }
  }

  async getOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.query.schoolId ? Number(req.query.schoolId) : undefined;
      const data = await communitiesService.getOverview(schoolId);
      return sendSuccess(res, data, 'Tổng quan cấu trúc cộng đồng trường học');
    } catch (error) {
      next(error);
    }
  }
}

export const communitiesController = new CommunitiesController();
