import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database';
import { RoleName } from '../../constants/enums';
import { AppError } from '../../utils/errors';
import { documentRepository } from './document.repository';
import {
  CreateDocumentInput,
  DocumentQueryInput,
  RateDocumentInput,
  UpdateDocumentInput,
} from './document.validator';

export class DocumentService {
  async handleUploadedFile(file?: Express.Multer.File) {
    if (!file) {
      throw AppError.badRequest('Vui lòng chọn tệp tài liệu để tải lên');
    }

    const fileUrl = `/uploads/documents/${file.filename}`;
    return {
      fileUrl,
      fileName: file.originalname,
      fileType: file.mimetype,
      fileSize: file.size,
    };
  }

  async createDocument(userId: number, input: CreateDocumentInput) {
    const subject = await documentRepository.findSubjectById(input.subjectId);
    if (!subject) {
      throw AppError.notFound('Môn học không tồn tại trong hệ thống');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        schoolId: true,
        facultyId: true,
        courseId: true,
        classId: true,
      },
    });

    const schoolId = input.schoolId ?? user?.schoolId ?? undefined;
    const facultyId = input.facultyId ?? subject.facultyId ?? user?.facultyId ?? undefined;
    const courseId = input.courseId ?? user?.courseId ?? undefined;
    const classId = input.classId ?? user?.classId ?? undefined;

    const document = await documentRepository.create({
      title: input.title,
      description: input.description,
      fileUrl: input.fileUrl,
      fileName: input.fileName,
      fileType: input.fileType,
      fileSize: input.fileSize,
      docType: input.docType,
      subjectId: input.subjectId,
      uploaderId: userId,
      schoolId,
      facultyId,
      courseId,
      classId,
      status: 'ACTIVE',
    });

    return document;
  }

  async getDocuments(query: DocumentQueryInput, currentUserId?: number) {
    const skip = (query.page - 1) * query.limit;
    const where: Prisma.DocumentWhereInput = {
      status: 'ACTIVE',
    };

    if (query.subjectId) where.subjectId = query.subjectId;
    if (query.docType) where.docType = query.docType;
    if (query.facultyId) where.facultyId = query.facultyId;
    if (query.search) {
      where.OR = [
        { title: { contains: query.search } },
        { description: { contains: query.search } },
        { fileName: { contains: query.search } },
      ];
    }

    let orderBy: Prisma.DocumentOrderByWithRelationInput = { createdAt: 'desc' };
    if (query.sortBy === 'downloads') {
      orderBy = { downloadsCount: 'desc' };
    } else if (query.sortBy === 'rating') {
      orderBy = { avgRating: 'desc' };
    }

    const [total, rawDocuments] = await Promise.all([
      documentRepository.count(where),
      documentRepository.findMany({
        where,
        skip,
        take: query.limit,
        orderBy,
      }),
    ]);

    const documents = await Promise.all(
      rawDocuments.map(async (doc) => {
        let myRating: number | null = null;
        if (currentUserId) {
          const userRating = await documentRepository.findRatingByUser(doc.id, currentUserId);
          myRating = userRating ? userRating.rating : null;
        }

        return {
          ...doc,
          myRating,
          ratingsCount: doc._count.ratings,
        };
      }),
    );

    return {
      documents,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit) || 1,
      },
    };
  }

  async getDocumentById(id: number, currentUserId?: number) {
    const document = await documentRepository.findById(id);
    if (!document || document.status === 'DELETED') {
      throw AppError.notFound('Không tìm thấy tài liệu');
    }

    let myRating: number | null = null;
    if (currentUserId) {
      const userRating = await documentRepository.findRatingByUser(document.id, currentUserId);
      myRating = userRating ? userRating.rating : null;
    }

    return {
      ...document,
      myRating,
      ratingsCount: document.ratings.length,
    };
  }

  async downloadDocument(id: number) {
    const document = await documentRepository.findById(id);
    if (!document || document.status === 'DELETED') {
      throw AppError.notFound('Không tìm thấy tài liệu');
    }

    const updated = await documentRepository.incrementDownloads(id);
    return {
      fileUrl: document.fileUrl,
      fileName: document.fileName,
      downloadsCount: updated.downloadsCount,
    };
  }

  async updateDocument(id: number, userId: number, userRole: string, input: UpdateDocumentInput) {
    const document = await documentRepository.findById(id);
    if (!document || document.status === 'DELETED') {
      throw AppError.notFound('Không tìm thấy tài liệu');
    }

    if (document.uploaderId !== userId && userRole !== RoleName.ADMIN) {
      throw AppError.forbidden('Bạn không có quyền chỉnh sửa tài liệu này');
    }

    if (input.subjectId) {
      const subject = await documentRepository.findSubjectById(input.subjectId);
      if (!subject) {
        throw AppError.notFound('Môn học không tồn tại');
      }
    }

    const updated = await documentRepository.update(id, input);
    return updated;
  }

  async deleteDocument(id: number, userId: number, userRole: string) {
    const document = await documentRepository.findById(id);
    if (!document || document.status === 'DELETED') {
      throw AppError.notFound('Không tìm thấy tài liệu');
    }

    if (document.uploaderId !== userId && userRole !== RoleName.ADMIN) {
      throw AppError.forbidden('Bạn không có quyền xóa tài liệu này');
    }

    await documentRepository.delete(id);
    return { success: true, message: 'Đã xóa tài liệu thành công' };
  }

  async rateDocument(documentId: number, userId: number, input: RateDocumentInput) {
    const document = await documentRepository.findById(documentId);
    if (!document || document.status !== 'ACTIVE') {
      throw AppError.notFound('Không tìm thấy tài liệu để đánh giá');
    }

    const ratingRecord = await documentRepository.upsertRating(
      documentId,
      userId,
      input.rating,
      input.comment,
    );

    const { avgRating, count } = await documentRepository.calculateAvgRating(documentId);

    return {
      rating: ratingRecord,
      avgRating,
      ratingsCount: count,
    };
  }

  async getSubjects(facultyId?: number, search?: string) {
    return documentRepository.findSubjects(facultyId, search);
  }
}

export const documentService = new DocumentService();
