export interface AcademicSummaryDTO {
  id: number;
  code: string;
  name: string;
}

export interface UserDTO {
  id: number;
  studentCode: string | null;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  bio: string | null;
  phone: string | null;
  role: 'STUDENT' | 'ADMIN' | string;
  status: 'ACTIVE' | 'LOCKED' | string;
  lockedReason: string | null;
  lockedAt: string | null;
  school: AcademicSummaryDTO | null;
  faculty: AcademicSummaryDTO | null;
  major: AcademicSummaryDTO | null;
  course: AcademicSummaryDTO | null;
  classInfo: AcademicSummaryDTO | null;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface SchoolItem {
  id: number;
  code: string;
  name: string;
  shortName: string | null;
}

export interface FacultyItem {
  id: number;
  schoolId: number;
  code: string;
  name: string;
}

export interface MajorItem {
  id: number;
  facultyId: number;
  code: string;
  name: string;
}

export interface CourseItem {
  id: number;
  schoolId: number;
  code: string;
  name: string;
}

export interface ClassItem {
  id: number;
  majorId: number;
  courseId: number;
  code: string;
  name: string;
}
