import { ApiResponse } from '../types/auth';
import { CreateQuestionPayload, QuestionItem } from '../types/qa';
import { apiClient } from './client';

export const qaApi = {
  async getQuestions(params?: {
    page?: number;
    limit?: number;
    subjectId?: number;
    isSolved?: boolean;
    search?: string;
    sortBy?: 'newest' | 'unanswered' | 'views';
  }) {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.subjectId) query.append('subjectId', String(params.subjectId));
    if (params?.isSolved !== undefined) query.append('isSolved', String(params.isSolved));
    if (params?.search) query.append('search', params.search);
    if (params?.sortBy) query.append('sortBy', params.sortBy);

    const res = await apiClient.get<
      ApiResponse<QuestionItem[]> & {
        meta: { page: number; limit: number; total: number; totalPages: number };
      }
    >(`/qa/questions?${query.toString()}`);
    return {
      questions: res.data.data,
      meta: res.data.meta,
    };
  },

  async getQuestionById(id: number) {
    const res = await apiClient.get<ApiResponse<QuestionItem>>(`/qa/questions/${id}`);
    return res.data.data;
  },

  async createQuestion(payload: CreateQuestionPayload) {
    const res = await apiClient.post<ApiResponse<QuestionItem>>('/qa/questions', payload);
    return res.data.data;
  },

  async deleteQuestion(id: number) {
    const res = await apiClient.delete<ApiResponse<{ success: boolean }>>(`/qa/questions/${id}`);
    return res.data.data;
  },

  async addAnswer(questionId: number, content: string) {
    const res = await apiClient.post<ApiResponse<unknown>>(`/qa/questions/${questionId}/answers`, {
      content,
    });
    return res.data.data;
  },

  async deleteAnswer(answerId: number) {
    const res = await apiClient.delete<ApiResponse<{ success: boolean }>>(
      `/qa/answers/${answerId}`,
    );
    return res.data.data;
  },

  async toggleAcceptAnswer(answerId: number) {
    const res = await apiClient.post<ApiResponse<{ isCorrect: boolean; message: string }>>(
      `/qa/answers/${answerId}/accept`,
    );
    return res.data.data;
  },

  async voteAnswer(answerId: number, value: 1 | -1) {
    const res = await apiClient.post<
      ApiResponse<{ score: number; userVote: number; message: string }>
    >(`/qa/answers/${answerId}/vote`, { value });
    return res.data.data;
  },
};
