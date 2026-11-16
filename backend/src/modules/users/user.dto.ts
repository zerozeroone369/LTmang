import { Class, Course, Faculty, Major, Role, School, User } from '@prisma/client';

export type UserWithRelations = User & {
  role: Role;
  school: School | null;
  faculty: Faculty | null;
  major: Major | null;
  course: Course | null;
  class: Class | null;
};

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
  role: string;
  status: string;
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

export function toUserDTO(user: UserWithRelations): UserDTO {
  return {
    id: user.id,
    studentCode: user.studentCode,
    email: user.email,
    fullName: user.fullName,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    phone: user.phone,
    role: user.role.name,
    status: user.status,
    lockedReason: user.lockedReason,
    lockedAt: user.lockedAt ? user.lockedAt.toISOString() : null,
    school: user.school
      ? { id: user.school.id, code: user.school.code, name: user.school.name }
      : null,
    faculty: user.faculty
      ? { id: user.faculty.id, code: user.faculty.code, name: user.faculty.name }
      : null,
    major: user.major ? { id: user.major.id, code: user.major.code, name: user.major.name } : null,
    course: user.course
      ? { id: user.course.id, code: user.course.code, name: user.course.name }
      : null,
    classInfo: user.class
      ? { id: user.class.id, code: user.class.code, name: user.class.name }
      : null,
    lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
    createdAt: user.createdAt.toISOString(),
  };
}
