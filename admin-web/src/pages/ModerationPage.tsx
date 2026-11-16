import { CheckCircle2, Eye, EyeOff, RotateCcw, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '../api/adminApi';
import { getErrorMessage } from '../api/client';
import { StatusBadge } from '../components/StatusBadge';
import { AdminPostItem, PostReportItem } from '../types/admin';

export function ModerationPage() {
  const [tab, setTab] = useState<'reports' | 'posts'>('reports');
  const [reports, setReports] = useState<PostReportItem[]>([]);
  const [posts, setPosts] = useState<AdminPostItem[]>([]);
  const [reportStatus, setReportStatus] = useState('PENDING');
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null,
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === 'reports') {
        const res = await adminApi.listReports({
          status: reportStatus || undefined,
          page: 1,
          limit: 20,
        });
        setReports(res.data);
      } else {
        const res = await adminApi.listPosts({ page: 1, limit: 20 });
        setPosts(res.data);
      }
    } catch (err) {
      setFeedback({ type: 'error', text: getErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  }, [tab, reportStatus]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleResolveReport = async (
    reportId: number,
    action: 'HIDE_POST' | 'DELETE_POST' | 'DISMISS',
  ) => {
    try {
      await adminApi.resolveReport(reportId, action);
      setFeedback({ type: 'success', text: 'Đã xử lý báo cáo vi phạm' });
      await loadData();
    } catch (err) {
      setFeedback({ type: 'error', text: getErrorMessage(err) });
    }
  };

  const handlePostAction = async (postId: number, action: 'hide' | 'restore' | 'delete') => {
    try {
      if (action === 'hide') await adminApi.hidePost(postId);
      if (action === 'restore') await adminApi.restorePost(postId);
      if (action === 'delete') await adminApi.deletePost(postId);
      setFeedback({ type: 'success', text: 'Đã cập nhật trạng thái bài viết' });
      await loadData();
    } catch (err) {
      setFeedback({ type: 'error', text: getErrorMessage(err) });
    }
  };

  return (
    <div className="space-y-6">
      {feedback && (
        <div
          className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm ${
            feedback.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-rose-200 bg-rose-50 text-rose-800'
          }`}
        >
          <span>{feedback.text}</span>
          <button type="button" onClick={() => setFeedback(null)} className="font-semibold">
            &times;
          </button>
        </div>
      )}

      {/* Tabs & Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1">
          <button
            type="button"
            onClick={() => setTab('reports')}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              tab === 'reports' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Báo cáo vi phạm
          </button>
          <button
            type="button"
            onClick={() => setTab('posts')}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              tab === 'posts' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Quản lý tất cả Bài viết
          </button>
        </div>

        {tab === 'reports' && (
          <select
            value={reportStatus}
            onChange={(e) => setReportStatus(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm outline-none focus:border-indigo-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="PENDING">Chờ xử lý</option>
            <option value="RESOLVED_HIDDEN">Đã ẩn bài</option>
            <option value="RESOLVED_DELETED">Đã xóa bài</option>
            <option value="DISMISSED">Đã bỏ qua</option>
          </select>
        )}
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-400">
          Đang tải dữ liệu kiểm duyệt...
        </div>
      ) : tab === 'reports' ? (
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-400">
              Không có báo cáo nào phù hợp bộ lọc.
            </div>
          ) : (
            reports.map((report) => (
              <div
                key={report.id}
                className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge value={report.status} />
                      <span className="text-xs font-semibold text-rose-600">
                        Lý do: {report.reason}
                      </span>
                      <span className="text-xs text-slate-400">
                        &bull; Báo cáo bởi {report.reporter.fullName}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">
                      {report.post.title || 'Bài viết không có tiêu đề'}
                    </h3>
                    <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                      {report.post.content}
                    </p>
                    <p className="text-xs text-slate-500">
                      Tác giả bài viết: <strong>{report.post.author.fullName}</strong> (
                      {report.post.author.email}) &bull; Trạng thái bài viết:{' '}
                      <StatusBadge value={report.post.status} />
                    </p>
                  </div>

                  {report.status === 'PENDING' && (
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleResolveReport(report.id, 'HIDE_POST')}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-100"
                      >
                        <EyeOff className="h-3.5 w-3.5" />
                        <span>Ẩn bài viết</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleResolveReport(report.id, 'DELETE_POST')}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Xóa bài</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleResolveReport(report.id, 'DISMISS')}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Giữ nguyên</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Nội dung bài viết</th>
                  <th className="px-5 py-3.5">Tác giả</th>
                  <th className="px-5 py-3.5">Phân loại</th>
                  <th className="px-5 py-3.5">Trạng thái</th>
                  <th className="px-5 py-3.5 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-50/60">
                    <td className="max-w-md px-5 py-3.5">
                      <p className="font-semibold text-slate-900">
                        {post.title || 'Không tiêu đề'}
                      </p>
                      <p className="line-clamp-2 text-xs text-slate-500">{post.content}</p>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-600">
                      <p className="font-medium text-slate-800">{post.author.fullName}</p>
                      <p>{post.author.email}</p>
                    </td>
                    <td className="px-5 py-3.5 text-xs font-medium text-slate-600">
                      {post.category}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge value={post.status} />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-2">
                        {post.status === 'ACTIVE' ? (
                          <button
                            type="button"
                            onClick={() => handlePostAction(post.id, 'hide')}
                            className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-800"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Ẩn</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handlePostAction(post.id, 'restore')}
                            className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            <span>Khôi phục</span>
                          </button>
                        )}
                        {post.status !== 'DELETED' && (
                          <button
                            type="button"
                            onClick={() => handlePostAction(post.id, 'delete')}
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Xóa</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
