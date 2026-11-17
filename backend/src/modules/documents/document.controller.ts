import { NextFunction, Request, Response } from 'express';
import { sendCreated, sendSuccess } from '../../utils/apiResponse';
import { documentService } from './document.service';
import {
  CreateDocumentInput,
  DocumentQueryInput,
  RateDocumentInput,
  UpdateDocumentInput,
} from './document.validator';

export class DocumentController {
  async uploadFile(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await documentService.handleUploadedFile(req.file);
      return sendSuccess(res, result, 'Tải tệp lên thành công', 201);
    } catch (error) {
      next(error);
    }
  }

  async createDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.auth!.userId;
      const input = req.body as CreateDocumentInput;
      const document = await documentService.createDocument(userId, input);
      return sendCreated(res, document, 'Đăng tài liệu học tập thành công');
    } catch (error) {
      next(error);
    }
  }

  async getDocuments(req: Request, res: Response, next: NextFunction) {
    try {
      const query = (req.query || {}) as unknown as DocumentQueryInput;
      const currentUserId = req.auth?.userId;
      const { documents, meta } = await documentService.getDocuments(query, currentUserId);
      return sendSuccess(res, documents, 'Danh sách tài liệu học tập', 200, meta);
    } catch (error) {
      next(error);
    }
  }

  async getDocumentById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const currentUserId = req.auth?.userId;
      const document = await documentService.getDocumentById(id, currentUserId);
      return sendSuccess(res, document, 'Chi tiết tài liệu học tập');
    } catch (error) {
      next(error);
    }
  }

  async downloadDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const result = await documentService.downloadDocument(id);
      return sendSuccess(res, result, 'Thông tin tải xuống tài liệu');
    } catch (error) {
      next(error);
    }
  }

  async updateDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const userId = req.auth!.userId;
      const userRole = req.auth!.role;
      const input = req.body as UpdateDocumentInput;
      const document = await documentService.updateDocument(id, userId, userRole, input);
      return sendSuccess(res, document, 'Cập nhật thông tin tài liệu thành công');
    } catch (error) {
      next(error);
    }
  }

  async deleteDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const userId = req.auth!.userId;
      const userRole = req.auth!.role;
      const result = await documentService.deleteDocument(id, userId, userRole);
      return sendSuccess(res, result, 'Xóa tài liệu thành công');
    } catch (error) {
      next(error);
    }
  }

  async rateDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const documentId = Number(req.params.id);
      const userId = req.auth!.userId;
      const input = req.body as RateDocumentInput;
      const result = await documentService.rateDocument(documentId, userId, input);
      return sendSuccess(res, result, 'Đánh giá tài liệu thành công');
    } catch (error) {
      next(error);
    }
  }

  async getSubjects(req: Request, res: Response, next: NextFunction) {
    try {
      const facultyId = req.query.facultyId ? Number(req.query.facultyId) : undefined;
      const search = req.query.search ? String(req.query.search) : undefined;
      const subjects = await documentService.getSubjects(facultyId, search);
      return sendSuccess(res, subjects, 'Danh sách môn học');
    } catch (error) {
      next(error);
    }
  }
}

export const documentController = new DocumentController();
