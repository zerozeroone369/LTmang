import {
  AdminDashboardStats,
  AdminLogItem,
  AdminPostItem,
  ApiResponse,
  CampusPostItem,
  ClassItem,
  CourseItem,
  FacultyItem,
  MajorItem,
  PostReportItem,
  SchoolItem,
  SystemSettingItem,
  UserDTO,
} from '../types/admin';
import { apiClient } from './client';

export const adminApi = {
  // Auth
  async login(identifier: string, password: string) {
    const res = await apiClient.post<ApiResponse<{ accessToken: string; user: UserDTO }>>(
      '/auth/login',
      { identifier, password },
    );
    return res.data.data;
  },

  async me() {
    const res = await apiClient.get<ApiResponse<UserDTO>>('/auth/me');
    return res.data.data;
  },

  async logout() {
    await apiClient.post('/auth/logout');
  },

  // Dashboard
  async getDashboard() {
    const res = await apiClient.get<
      ApiResponse<{
        stats: AdminDashboardStats;
        recentLogs: AdminLogItem[];
        recentReports: PostReportItem[];
      }>
    >('/admin/dashboard');
    return res.data.data;
  },

  // Users
  async listUsers(params: {
    search?: string;
    role?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const res = await apiClient.get<ApiResponse<UserDTO[]>>('/admin/users', { params });
    return res.data;
  },

  async lockUser(userId: number, reason: string) {
    const res = await apiClient.patch<ApiResponse<UserDTO>>(`/admin/users/${userId}/lock`, {
      reason,
    });
    return res.data.data;
  },

  async unlockUser(userId: number) {
    const res = await apiClient.patch<ApiResponse<UserDTO>>(`/admin/users/${userId}/unlock`);
    return res.data.data;
  },

  async updateUserRole(userId: number, role: 'ADMIN' | 'STUDENT') {
    const res = await apiClient.patch<ApiResponse<UserDTO>>(`/admin/users/${userId}/role`, {
      role,
    });
    return res.data.data;
  },

  // Moderation & Posts
  async listReports(params: { status?: string; page?: number; limit?: number }) {
    const res = await apiClient.get<ApiResponse<PostReportItem[]>>('/admin/reports', { params });
    return res.data;
  },

  async resolveReport(
    reportId: number,
    action: 'HIDE_POST' | 'DELETE_POST' | 'DISMISS',
    note?: string,
  ) {
    const res = await apiClient.patch<ApiResponse<PostReportItem>>(
      `/admin/reports/${reportId}/resolve`,
      { action, note },
    );
    return res.data.data;
  },

  async listPosts(params: { search?: string; status?: string; page?: number; limit?: number }) {
    const res = await apiClient.get<ApiResponse<AdminPostItem[]>>('/admin/posts', { params });
    return res.data;
  },

  async hidePost(postId: number) {
    const res = await apiClient.patch<ApiResponse<AdminPostItem>>(`/admin/posts/${postId}/hide`);
    return res.data.data;
  },

  async restorePost(postId: number) {
    const res = await apiClient.patch<ApiResponse<AdminPostItem>>(`/admin/posts/${postId}/restore`);
    return res.data.data;
  },

  async deletePost(postId: number) {
    const res = await apiClient.delete<ApiResponse<AdminPostItem>>(`/admin/posts/${postId}`);
    return res.data.data;
  },

  // Campus Posts
  async listCampusPosts(params: {
    search?: string;
    category?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const res = await apiClient.get<ApiResponse<CampusPostItem[]>>('/admin/campus', { params });
    return res.data;
  },

  async createCampusPost(payload: {
    title: string;
    content: string;
    category: CampusPostItem['category'];
    location?: string | null;
    isPinned?: boolean;
    status?: CampusPostItem['status'];
  }) {
    const res = await apiClient.post<ApiResponse<CampusPostItem>>('/admin/campus', payload);
    return res.data.data;
  },

  async updateCampusPost(
    id: number,
    payload: Partial<{
      title: string;
      content: string;
      category: CampusPostItem['category'];
      location: string | null;
      isPinned: boolean;
      status: CampusPostItem['status'];
    }>,
  ) {
    const res = await apiClient.put<ApiResponse<CampusPostItem>>(`/admin/campus/${id}`, payload);
    return res.data.data;
  },

  async deleteCampusPost(id: number) {
    await apiClient.delete(`/admin/campus/${id}`);
  },

  // Academic Hierarchy
  async getSchools() {
    const res = await apiClient.get<ApiResponse<SchoolItem[]>>('/academic/schools');
    return res.data.data;
  },
  async createSchool(payload: {
    code: string;
    name: string;
    shortName?: string;
    address?: string;
  }) {
    const res = await apiClient.post<ApiResponse<SchoolItem>>('/admin/academic/schools', payload);
    return res.data.data;
  },
  async deleteSchool(id: number) {
    await apiClient.delete(`/admin/academic/schools/${id}`);
  },

  async getFaculties(schoolId?: number) {
    const res = await apiClient.get<ApiResponse<FacultyItem[]>>('/academic/faculties', {
      params: schoolId ? { schoolId } : undefined,
    });
    return res.data.data;
  },
  async createFaculty(payload: { schoolId: number; code: string; name: string }) {
    const res = await apiClient.post<ApiResponse<FacultyItem>>(
      '/admin/academic/faculties',
      payload,
    );
    return res.data.data;
  },
  async deleteFaculty(id: number) {
    await apiClient.delete(`/admin/academic/faculties/${id}`);
  },

  async getMajors(facultyId?: number) {
    const res = await apiClient.get<ApiResponse<MajorItem[]>>('/academic/majors', {
      params: facultyId ? { facultyId } : undefined,
    });
    return res.data.data;
  },
  async createMajor(payload: { facultyId: number; code: string; name: string }) {
    const res = await apiClient.post<ApiResponse<MajorItem>>('/admin/academic/majors', payload);
    return res.data.data;
  },
  async deleteMajor(id: number) {
    await apiClient.delete(`/admin/academic/majors/${id}`);
  },

  async getCourses(schoolId?: number) {
    const res = await apiClient.get<ApiResponse<CourseItem[]>>('/academic/courses', {
      params: schoolId ? { schoolId } : undefined,
    });
    return res.data.data;
  },
  async createCourse(payload: {
    schoolId: number;
    code: string;
    name: string;
    startYear?: number;
    endYear?: number;
  }) {
    const res = await apiClient.post<ApiResponse<CourseItem>>('/admin/academic/courses', payload);
    return res.data.data;
  },
  async deleteCourse(id: number) {
    await apiClient.delete(`/admin/academic/courses/${id}`);
  },

  async getClasses() {
    const res = await apiClient.get<ApiResponse<ClassItem[]>>('/academic/classes');
    return res.data.data;
  },
  async createClass(payload: { majorId: number; courseId: number; code: string; name: string }) {
    const res = await apiClient.post<ApiResponse<ClassItem>>('/admin/academic/classes', payload);
    return res.data.data;
  },
  async deleteClass(id: number) {
    await apiClient.delete(`/admin/academic/classes/${id}`);
  },

  // Logs & Settings
  async listLogs(params: { targetType?: string; page?: number; limit?: number }) {
    const res = await apiClient.get<ApiResponse<AdminLogItem[]>>('/admin/logs', { params });
    return res.data;
  },

  async listSettings() {
    const res = await apiClient.get<ApiResponse<SystemSettingItem[]>>('/admin/settings');
    return res.data.data;
  },

  async updateSettings(settings: Array<{ key: string; value: string }>) {
    const res = await apiClient.put<ApiResponse<SystemSettingItem[]>>('/admin/settings', {
      settings,
    });
    return res.data.data;
  },
};
