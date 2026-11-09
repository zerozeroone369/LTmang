# DTO Contracts — Hợp Đồng Dữ Liệu Giao Tiếp Client/Admin & Backend

> Tài liệu này được Tú Anh khởi tạo để thống nhất cấu trúc JSON giữa Backend (Tú Anh, Duy, Huy, Bảo) và Frontend (Thái, Tú Anh).

## 1. Standard API Response Wrapper

```ts
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
```

## 2. Auth & User DTOs (Phối hợp Thái — Nhiệm vụ 9)

### `UserDTO` (Không bao giờ chứa `passwordHash`)
```ts
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
  role: 'ADMIN' | 'STUDENT';
  status: 'ACTIVE' | 'LOCKED';
  lockedReason: string | null;
  school: AcademicSummaryDTO | null;
  faculty: AcademicSummaryDTO | null;
  major: AcademicSummaryDTO | null;
  course: AcademicSummaryDTO | null;
  classInfo: AcademicSummaryDTO | null;
  lastLoginAt: string | null;
  createdAt: string;
}
```

### `AuthResponseDTO` (`POST /api/auth/register`, `POST /api/auth/login`)
```ts
export interface AuthResponseDTO {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: string;
  user: UserDTO;
}
```

## 3. Academic Hierarchy DTOs
- `GET /api/academic/schools` -> `SchoolDTO[]`
- `GET /api/academic/faculties?schoolId=1` -> `FacultyDTO[]`
- `GET /api/academic/majors?facultyId=1` -> `MajorDTO[]`
- `GET /api/academic/courses?schoolId=1` -> `CourseDTO[]`
- `GET /api/academic/classes?majorId=1&courseId=1` -> `ClassDTO[]`

## 4. Campus Post DTO (Đồng bộ Tú Anh & Bảo & Thái)
```ts
export interface CampusPostDTO {
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
  author: {
    id: number;
    fullName: string;
    avatarUrl: string | null;
  };
  createdAt: string;
  updatedAt: string;
}
```

## 5. Admin Moderation & Dashboard DTOs
- `AdminDashboardStatsDTO`: `{ totalUsers, activeUsers, lockedUsers, totalPosts, totalDocuments, totalQuestions, totalStudyGroups, totalCampusPosts, pendingReports }`
- `PostReportDTO`: `{ id, reason, description, status, createdAt, handledAt, handledNote, post: { id, title, content, status, author }, reporter: { id, fullName, email } }`
- `AdminLogDTO`: `{ id, action, targetType, targetId, details, ipAddress, createdAt, admin: { id, fullName, email } }`
- `SystemSettingDTO`: `{ id, key, value, description, group, updatedAt }`
