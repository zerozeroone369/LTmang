import { apiClient } from './client';

export interface StudySubject {
  id: number;
  code: string;
  name: string;
  faculty: { name: string } | null;
}

export interface StudyGroupItem {
  id: number;
  name: string;
  description: string | null;
  subjectId: number | null;
  goal: string | null;
  scheduleText: string | null;
  location: string | null;
  maxMembers: number;
  status: 'OPEN' | 'CLOSED';
  createdAt: string;
  subject: { id: number; code: string; name: string } | null;
  creator: { id: number; fullName: string; avatarUrl: string | null };
  members: Array<{
    id: number;
    role: 'LEADER' | 'MEMBER';
    joinedAt: string;
    user: { id: number; fullName: string; avatarUrl: string | null };
  }>;
  _count: { members: number; joinRequests: number };
  joinRequests?: Array<{ id: number; status: string; userId?: number }>;
}

export interface JoinRequestItem {
  id: number;
  message: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  user: {
    id: number;
    fullName: string;
    avatarUrl: string | null;
    class: { name: string } | null;
  };
}

export interface ApiPage<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: { page: number; limit: number; total: number; totalPages: number };
}

export const studyGroupsApi = {
  async listSubjects() {
    const res = await apiClient.get<ApiPage<StudySubject[]>>('/groups/subjects');
    return res.data.data;
  },

  async search(params: {
    q?: string;
    subjectId?: number;
    location?: string;
    page?: number;
    limit?: number;
  }) {
    const res = await apiClient.get<ApiPage<StudyGroupItem[]>>('/groups/search', { params });
    return res.data;
  },

  async get(id: number) {
    const res = await apiClient.get<ApiPage<StudyGroupItem>>(`/groups/${id}`);
    return res.data.data;
  },

  async create(payload: {
    name: string;
    description?: string;
    subjectId?: number | null;
    goal?: string;
    scheduleText?: string;
    location?: string;
    maxMembers: number;
  }) {
    const res = await apiClient.post<ApiPage<StudyGroupItem>>('/groups', payload);
    return res.data.data;
  },

  async requestToJoin(groupId: number, message?: string) {
    const res = await apiClient.post(`/groups/${groupId}/join`, { message });
    return res.data.data;
  },

  async listRequests(groupId: number) {
    const res = await apiClient.get<ApiPage<JoinRequestItem[]>>(`/groups/${groupId}/join-requests`);
    return res.data.data;
  },

  async reviewRequest(requestId: number, status: 'APPROVED' | 'REJECTED') {
    const res = await apiClient.put(`/groups/join-requests/${requestId}`, { status });
    return res.data.data;
  },

  async leave(groupId: number) {
    const res = await apiClient.delete(`/groups/${groupId}/leave`);
    return res.data.data as { left: boolean; groupClosed: boolean };
  },

  async removeMember(groupId: number, memberId: number) {
    const res = await apiClient.delete(`/groups/${groupId}/members/${memberId}`);
    return res.data.data as { removed: boolean; groupId: number; memberId: number };
  },
};
