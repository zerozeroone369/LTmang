interface StatusBadgeProps {
  value: string;
}

const STYLES: Record<string, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  PUBLISHED: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  ADMIN: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
  STUDENT: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  LOCKED: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  DELETED: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  RESOLVED_DELETED: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  PENDING: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  HIDDEN: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  RESOLVED_HIDDEN: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  DRAFT: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  DISMISSED: 'bg-slate-100 text-slate-600 ring-slate-500/20',
};

const LABELS: Record<string, string> = {
  ACTIVE: 'Hoạt động',
  LOCKED: 'Đã khóa',
  PUBLISHED: 'Đã đăng',
  HIDDEN: 'Đang ẩn',
  DRAFT: 'Bản nháp',
  DELETED: 'Đã xóa',
  PENDING: 'Chờ xử lý',
  RESOLVED_HIDDEN: 'Đã ẩn bài',
  RESOLVED_DELETED: 'Đã xóa bài',
  DISMISSED: 'Bỏ qua',
  ADMIN: 'Admin',
  STUDENT: 'Sinh viên',
};

export function StatusBadge({ value }: StatusBadgeProps) {
  const style = STYLES[value] || 'bg-slate-100 text-slate-700 ring-slate-500/20';
  const label = LABELS[value] || value;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${style}`}
    >
      {label}
    </span>
  );
}
