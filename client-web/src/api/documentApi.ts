import { ApiResponse } from '../types/auth';
import { CreateDocumentPayload, DocumentItem, SubjectItem } from '../types/document';
import { apiClient } from './client';

export const documentApi = {
  async getSubjects(facultyId?: number, search?: string) {
    const params = new URLSearchParams();
    if (facultyId) params.append('facultyId', String(facultyId));
    if (search) params.append('search', search);

    const res = await apiClient.get<ApiResponse<SubjectItem[]>>(
      `/documents/subjects?${params.toString()}`,
    );
    return res.data.data;
  },

  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await apiClient.post<
      ApiResponse<{
        fileUrl: string;
        fileName: string;
        fileType: string;
        fileSize: number;
      }>
    >('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data.data;
  },

  async createDocument(payload: CreateDocumentPayload) {
    const res = await apiClient.post<ApiResponse<DocumentItem>>('/documents', payload);
    return res.data.data;
  },

  async getDocuments(params?: {
    page?: number;
    limit?: number;
    subjectId?: number;
    docType?: string;
    search?: string;
    sortBy?: 'newest' | 'downloads' | 'rating';
  }) {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.subjectId) query.append('subjectId', String(params.subjectId));
    if (params?.docType) query.append('docType', params.docType);
    if (params?.search) query.append('search', params.search);
    if (params?.sortBy) query.append('sortBy', params.sortBy);

    const res = await apiClient.get<
      ApiResponse<DocumentItem[]> & {
        meta: { page: number; limit: number; total: number; totalPages: number };
      }
    >(`/documents?${query.toString()}`);
    return {
      documents: res.data.data,
      meta: res.data.meta,
    };
  },

  async getDocumentById(id: number) {
    const res = await apiClient.get<ApiResponse<DocumentItem>>(`/documents/${id}`);
    return res.data.data;
  },

  async downloadDocument(id: number) {
    const res = await apiClient.get<
      ApiResponse<{ fileUrl: string; fileName: string; downloadsCount: number }>
    >(`/documents/${id}/download`);
    return res.data.data;
  },

  async rateDocument(id: number, rating: number, comment?: string) {
    const res = await apiClient.post<
      ApiResponse<{ rating: unknown; avgRating: number; ratingsCount: number }>
    >(`/documents/${id}/ratings`, { rating, comment });
    return res.data.data;
  },

  async deleteDocument(id: number) {
    const res = await apiClient.delete<ApiResponse<{ success: boolean; message: string }>>(
      `/documents/${id}`,
    );
    return res.data.data;
  },
};
