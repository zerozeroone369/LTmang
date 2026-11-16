import {
  ApiResponse,
  ClassItem,
  CourseItem,
  FacultyItem,
  MajorItem,
  SchoolItem,
  UserDTO,
} from '../types/auth';
import { apiClient } from './client';

export const authApi = {
  async register(payload: {
    fullName: string;
    email: string;
    studentCode?: string;
    password: string;
    phone?: string;
    schoolId?: number;
    facultyId?: number;
    majorId?: number;
    courseId?: number;
    classId?: number;
  }) {
    const res = await apiClient.post<ApiResponse<{ accessToken: string; user: UserDTO }>>(
      '/auth/register',
      payload,
    );
    return res.data.data;
  },

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

  async updateProfile(payload: {
    fullName?: string;
    bio?: string;
    avatarUrl?: string;
    phone?: string;
    classId?: number;
  }) {
    const res = await apiClient.put<ApiResponse<UserDTO>>('/users/profile', payload);
    return res.data.data;
  },

  async changePassword(currentPassword: string, newPassword: string) {
    const res = await apiClient.put<ApiResponse<{ changed: boolean }>>('/users/password', {
      currentPassword,
      newPassword,
    });
    return res.data.data;
  },

  // Academic Cascading APIs
  async getSchools() {
    const res = await apiClient.get<ApiResponse<SchoolItem[]>>('/academic/schools');
    return res.data.data;
  },

  async getFaculties(schoolId?: number) {
    const res = await apiClient.get<ApiResponse<FacultyItem[]>>('/academic/faculties', {
      params: schoolId ? { schoolId } : undefined,
    });
    return res.data.data;
  },

  async getMajors(facultyId?: number) {
    const res = await apiClient.get<ApiResponse<MajorItem[]>>('/academic/majors', {
      params: facultyId ? { facultyId } : undefined,
    });
    return res.data.data;
  },

  async getCourses(schoolId?: number) {
    const res = await apiClient.get<ApiResponse<CourseItem[]>>('/academic/courses', {
      params: schoolId ? { schoolId } : undefined,
    });
    return res.data.data;
  },

  async getClasses(params?: { majorId?: number; courseId?: number }) {
    const res = await apiClient.get<ApiResponse<ClassItem[]>>('/academic/classes', { params });
    return res.data.data;
  },
};
