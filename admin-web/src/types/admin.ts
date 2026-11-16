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
  role: 'ADMIN' | 'STUDENT' | string;
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

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

export interface AdminDashboardStats {
  totalUsers: number;
  activeUsers: number;
  lockedUsers: number;
  totalPosts: number;
  totalDocuments: number;
  totalQuestions: number;
  totalStudyGroups: number;
  totalCampusPosts: number;
  pendingReports: number;
}

export interface AdminLogItem {
  id: number;
  action: string;
  targetType: string;
  targetId: string | null;
  details: string | null;
  ipAddress: string | null;
  createdAt: string;
  admin: {
    id: number;
    fullName: string;
    email: string;
  };
}

export interface PostReportItem {
  id: number;
  postId: number;
  reason: string;
  description: string | null;
  status: 'PENDING' | 'RESOLVED_HIDDEN' | 'RESOLVED_DELETED' | 'DISMISSED';
  handledNote: string | null;
  handledAt: string | null;
  createdAt: string;
  reporter: {
    id: number;
    fullName: string;
    email: string;
  };
  handledBy: {
    id: number;
    fullName: string;
    email: string;
  } | null;
  post: {
    id: number;
    title: string | null;
    content: string;
    category?: string;
    status: string;
    author: {
      id: number;
      fullName: string;
      email: string;
    };
  };
}

export interface AdminPostItem {
  id: number;
  title: string | null;
  content: string;
  category: string;
  scope: string;
  status: 'ACTIVE' | 'HIDDEN' | 'DELETED';
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  author: {
    id: number;
    fullName: string;
    email: string;
    studentCode: string | null;
  };
  _count: {
    reports: number;
    comments: number;
  };
}

export interface CampusPostItem {
  id: number;
  title: string;
  content: string;
  category: 'ANNOUNCEMENT' | 'EVENT' | 'SCHOLARSHIP' | 'CLUB' | 'JOB_INTERNSHIP';
  thumbnailUrl: string | null;
  location: string | null;
  eventDate: string | null;
  deadline: string | null;
  isPinned: boolean;
  status: 'PUBLISHED' | 'HIDDEN' | 'DRAFT';
  createdAt: string;
  updatedAt: string;
  author: {
    id: number;
    fullName: string;
    email: string;
  };
}

export interface SystemSettingItem {
  id: number;
  key: string;
  value: string;
  description: string | null;
  group: string;
  updatedAt: string;
  updatedBy: {
    id: number;
    fullName: string;
    email: string;
  } | null;
}

export interface SchoolItem {
  id: number;
  code: string;
  name: string;
  shortName: string | null;
  address: string | null;
}

export interface FacultyItem {
  id: number;
  schoolId: number;
  code: string;
  name: string;
  school?: AcademicSummaryDTO;
}

export interface MajorItem {
  id: number;
  facultyId: number;
  code: string;
  name: string;
  faculty?: AcademicSummaryDTO & { schoolId: number };
}

export interface CourseItem {
  id: number;
  schoolId: number;
  code: string;
  name: string;
  startYear: number | null;
  endYear: number | null;
  school?: AcademicSummaryDTO;
}

export interface ClassItem {
  id: number;
  majorId: number;
  courseId: number;
  code: string;
  name: string;
  major?: AcademicSummaryDTO;
  course?: AcademicSummaryDTO;
}
