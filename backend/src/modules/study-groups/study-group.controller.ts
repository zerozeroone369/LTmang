import { NextFunction, Request, Response } from 'express';
import { sendCreated, sendSuccess } from '../../utils/apiResponse';
import { studyGroupService } from './study-group.service';
import { CreateStudyGroupInput, StudyGroupSearchInput } from './study-group.validator';

export class StudyGroupController {
  async listSubjects(_req: Request, res: Response, next: NextFunction) {
    try {
      const subjects = await studyGroupService.listSubjects();
      return sendSuccess(res, subjects, 'Danh sách môn học cho nhóm học');
    } catch (error) {
      next(error);
    }
  }

  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as unknown as StudyGroupSearchInput;
      const { items, meta } = await studyGroupService.search(query, req.auth?.userId);
      return sendSuccess(res, items, 'Danh sách nhóm học', 200, meta);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const group = await studyGroupService.getById(Number(req.params.id), req.auth?.userId);
      return sendSuccess(res, group, 'Chi tiết nhóm học');
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const group = await studyGroupService.create(
        req.auth!.userId,
        req.body as CreateStudyGroupInput,
      );
      return sendCreated(res, group, 'Tạo nhóm học thành công');
    } catch (error) {
      next(error);
    }
  }

  async listJoinRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const requests = await studyGroupService.listJoinRequests(
        Number(req.params.id),
        req.auth!.userId,
      );
      return sendSuccess(res, requests, 'Danh sách yêu cầu tham gia nhóm');
    } catch (error) {
      next(error);
    }
  }

  async requestToJoin(req: Request, res: Response, next: NextFunction) {
    try {
      const request = await studyGroupService.requestToJoin(
        Number(req.params.id),
        req.auth!.userId,
        req.body.message,
      );
      return sendCreated(res, request, 'Đã gửi yêu cầu tham gia nhóm');
    } catch (error) {
      next(error);
    }
  }

  async reviewJoinRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await studyGroupService.reviewJoinRequest(
        Number(req.params.requestId),
        req.auth!.userId,
        req.body.status,
      );
      const message =
        req.body.status === 'APPROVED' ? 'Đã chấp nhận thành viên' : 'Đã từ chối yêu cầu';
      return sendSuccess(res, result, message);
    } catch (error) {
      next(error);
    }
  }

  async leave(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await studyGroupService.leave(Number(req.params.id), req.auth!.userId);
      return sendSuccess(res, result, 'Đã rời nhóm học');
    } catch (error) {
      next(error);
    }
  }

  async removeMember(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await studyGroupService.removeMember(
        Number(req.params.id),
        req.auth!.userId,
        Number(req.params.memberId),
      );
      return sendSuccess(res, result, 'Đã xóa thành viên khỏi nhóm');
    } catch (error) {
      next(error);
    }
  }
}

export const studyGroupController = new StudyGroupController();
