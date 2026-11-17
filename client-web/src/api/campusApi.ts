import { apiClient } from './client';
import { ApiPage } from './studyGroupsApi';

export type CampusCategory =
  | 'ANNOUNCEMENT'
  | 'EVENT'
  | 'SCHOLARSHIP'
  | 'CLUB'
  | 'JOB_INTERNSHIP';

export interface CampusPostItem {
  id: number;
  title: string;
  content: string;
  category: CampusCategory;
  thumbnailUrl: string | null;
  location: string | null;
  eventDate: string | null;
  deadline: string | null;
  isPinned: boolean;
  createdAt: string;
  author: { id: number; fullName: string; avatarUrl: string | null };
}

export const CAMPUS_CATEGORIES: Array<{ value: CampusCategory | ''; label: string }> = [
  { value: '', label: 'Tất cả nội dung' },
  { value: 'ANNOUNCEMENT', label: 'Thông báo' },
  { value: 'EVENT', label: 'Sự kiện' },
  { value: 'SCHOLARSHIP', label: 'Học bổng' },
  { value: 'CLUB', label: 'Câu lạc bộ' },
  { value: 'JOB_INTERNSHIP', label: 'Việc làm & thực tập' },
];

export const campusApi = {
  async list(params: {
    category?: CampusCategory;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const res = await apiClient.get<ApiPage<CampusPostItem[]>>('/campus', { params });
    return res.data;
  },

  async get(id: number) {
    const res = await apiClient.get<ApiPage<CampusPostItem>>(`/campus/${id}`);
    return res.data.data;
  },
};
