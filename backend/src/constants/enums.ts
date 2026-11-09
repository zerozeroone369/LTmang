export const RoleName = {
  ADMIN: 'ADMIN',
  STUDENT: 'STUDENT',
} as const;

export type RoleNameType = (typeof RoleName)[keyof typeof RoleName];

export const UserStatus = {
  ACTIVE: 'ACTIVE',
  LOCKED: 'LOCKED',
} as const;

export type UserStatusType = (typeof UserStatus)[keyof typeof UserStatus];

export const PostCategory = {
  STUDY: 'STUDY',
  COMMUNITY: 'COMMUNITY',
  ACTIVITY: 'ACTIVITY',
  OPPORTUNITY: 'OPPORTUNITY',
} as const;

export const PostStatus = {
  ACTIVE: 'ACTIVE',
  HIDDEN: 'HIDDEN',
  DELETED: 'DELETED',
} as const;

export const ReportStatus = {
  PENDING: 'PENDING',
  RESOLVED_HIDDEN: 'RESOLVED_HIDDEN',
  RESOLVED_DELETED: 'RESOLVED_DELETED',
  DISMISSED: 'DISMISSED',
} as const;

export const CampusCategory = {
  ANNOUNCEMENT: 'ANNOUNCEMENT',
  EVENT: 'EVENT',
  SCHOLARSHIP: 'SCHOLARSHIP',
  CLUB: 'CLUB',
  JOB_INTERNSHIP: 'JOB_INTERNSHIP',
} as const;

export const CampusStatus = {
  PUBLISHED: 'PUBLISHED',
  HIDDEN: 'HIDDEN',
  DRAFT: 'DRAFT',
} as const;

export const ErrorCode = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  TOKEN_REVOKED: 'TOKEN_REVOKED',
  FORBIDDEN: 'FORBIDDEN',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  TOO_MANY_ATTEMPTS: 'TOO_MANY_ATTEMPTS',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  BAD_REQUEST: 'BAD_REQUEST',
  RATE_LIMITED: 'RATE_LIMITED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;
