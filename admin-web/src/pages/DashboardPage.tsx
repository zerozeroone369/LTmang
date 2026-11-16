import {
  Activity,
  FileText,
  Megaphone,
  MessageSquare,
  ShieldAlert,
  UserCheck,
  UserX,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../api/adminApi';
import { getErrorMessage } from '../api/client';
import { StatusBadge } from '../components/StatusBadge';
import { AdminDashboardStats, AdminLogItem, PostReportItem } from '../types/admin';

export function DashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [recentLogs, setRecentLogs] = useState<AdminLogItem[]>([]);
  const [recentReports, setRecentReports] = useState<PostReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminApi
      .getDashboard()
      .then((data) => {
        setStats(data.stats);
        setRecentLogs(data.recentLogs);
        setRecentReports(data.recentReports);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-200/70" />
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
        {error || 'Không thể tải dữ liệu tổng quan'}
      </div>
    );
  }

  const statCards = [
    {
      label: 'Tổng người dùng',
      value: stats.totalUsers,
      icon: Users,
      accent: 'bg-indigo-50 text-indigo-600',
    },
    {
      label: 'Đang hoạt động',
      value: stats.activeUsers,
      icon: UserCheck,
      accent: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Tài khoản bị khóa',
      value: stats.lockedUsers,
      icon: UserX,
      accent: 'bg-rose-50 text-rose-600',
    },
    {
      label: 'Báo cáo chờ duyệt',
      value: stats.pendingReports,
      icon: ShieldAlert,
      accent: 'bg-amber-50 text-amber-600',
    },
    {
      label: 'Bài viết cộng đồng',
      value: stats.totalPosts,
      icon: MessageSquare,
      accent: 'bg-sky-50 text-sky-600',
    },
    {
      label: 'Tin tức Campus',
      value: stats.totalCampusPosts,
      icon: Megaphone,
      accent: 'bg-violet-50 text-violet-600',
    },
    {
      label: 'Tài liệu học tập',
      value: stats.totalDocuments,
      icon: FileText,
      accent: 'bg-teal-50 text-teal-600',
    },
    {
      label: 'Câu hỏi Q&A',
      value: stats.totalQuestions,
      icon: Activity,
      accent: 'bg-blue-50 text-blue-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs transition hover:shadow-sm"
            >
              <div>
                <p className="text-sm font-medium text-slate-500">{card.label}</p>
                <p className="mt-1.5 text-2xl font-bold text-slate-900">{card.value}</p>
              </div>
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.accent}`}
              >
                <Icon className="h-6 w-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Lower Panels */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Pending Reports */}
        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Báo cáo vi phạm chờ xử lý</h2>
            <Link
              to="/moderation"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Xem tất cả &rarr;
            </Link>
          </div>
          {recentReports.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">
              Không có báo cáo nào đang chờ duyệt.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentReports.map((report) => (
                <div key={report.id} className="py-3.5 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {report.post.title || 'Bài viết không tiêu đề'}
                      </p>
                      <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                        Lý do: <span className="font-medium text-rose-600">{report.reason}</span> —
                        Bởi {report.reporter.fullName}
                      </p>
                    </div>
                    <StatusBadge value={report.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent Admin Logs */}
        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Nhật ký thao tác gần đây</h2>
            <Link
              to="/settings"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Xem nhật ký &rarr;
            </Link>
          </div>
          {recentLogs.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">
              Chưa có thao tác quản trị nào.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800">
                      <span className="font-semibold text-indigo-600">{log.action}</span>{' '}
                      <span className="text-slate-500">({log.targetType})</span>
                    </p>
                    <p className="truncate text-xs text-slate-400">
                      Thực hiện bởi {log.admin.fullName} &bull;{' '}
                      {new Date(log.createdAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
