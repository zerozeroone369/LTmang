import { Lock, Search, Shield, Unlock } from 'lucide-react';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { adminApi } from '../api/adminApi';
import { getErrorMessage } from '../api/client';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../context/auth-context';
import { UserDTO } from '../types/admin';

export function UsersPage() {
  const { user: currentAdmin } = useAuth();
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null,
  );

  // Lock Modal state
  const [lockingUser, setLockingUser] = useState<UserDTO | null>(null);
  const [lockReason, setLockReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.listUsers({
        search: search || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
        page,
        limit: 10,
      });
      setUsers(res.data);
      setTotalPages(res.meta?.totalPages || 1);
    } catch (err) {
      setFeedback({ type: 'error', text: getErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, statusFilter, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleLockSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!lockingUser) return;
    setSubmitting(true);
    try {
      await adminApi.lockUser(lockingUser.id, lockReason.trim());
      setFeedback({ type: 'success', text: `Đã khóa tài khoản ${lockingUser.fullName}` });
      setLockingUser(null);
      setLockReason('');
      await fetchUsers();
    } catch (err) {
      setFeedback({ type: 'error', text: getErrorMessage(err) });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnlock = async (target: UserDTO) => {
    try {
      await adminApi.unlockUser(target.id);
      setFeedback({ type: 'success', text: `Đã mở khóa tài khoản ${target.fullName}` });
      await fetchUsers();
    } catch (err) {
      setFeedback({ type: 'error', text: getErrorMessage(err) });
    }
  };

  const handleToggleRole = async (target: UserDTO) => {
    const nextRole = target.role === 'ADMIN' ? 'STUDENT' : 'ADMIN';
    try {
      await adminApi.updateUserRole(target.id, nextRole);
      setFeedback({ type: 'success', text: `Đã chuyển ${target.fullName} sang quyền ${nextRole}` });
      await fetchUsers();
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

      {/* Filter Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder="Tìm theo tên, email hoặc mã sinh viên..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pr-4 pl-10 text-sm outline-none focus:border-indigo-500 focus:bg-white"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => {
            setPage(1);
            setRoleFilter(e.target.value);
          }}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm outline-none focus:border-indigo-500"
        >
          <option value="">Tất cả vai trò</option>
          <option value="STUDENT">Sinh viên</option>
          <option value="ADMIN">Admin</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => {
            setPage(1);
            setStatusFilter(e.target.value);
          }}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm outline-none focus:border-indigo-500"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="ACTIVE">Đang hoạt động</option>
          <option value="LOCKED">Đã khóa</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/70 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3.5">Người dùng</th>
                <th className="px-5 py-3.5">MSSV</th>
                <th className="px-5 py-3.5">Đơn vị / Lớp</th>
                <th className="px-5 py-3.5">Vai trò</th>
                <th className="px-5 py-3.5">Trạng thái</th>
                <th className="px-5 py-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-400">
                    Đang tải danh sách người dùng...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-400">
                    Không tìm thấy tài khoản phù hợp.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isSelf = u.id === currentAdmin?.id;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/60">
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-slate-900">{u.fullName}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                        {u.status === 'LOCKED' && u.lockedReason && (
                          <p className="mt-1 text-xs text-rose-600">Lý do: {u.lockedReason}</p>
                        )}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs text-slate-600">
                        {u.studentCode || '—'}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-600">
                        {u.classInfo ? (
                          <span>
                            {u.classInfo.code} &bull; {u.faculty?.code || u.school?.code}
                          </span>
                        ) : (
                          u.school?.code || u.school?.name || '—'
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge value={u.role} />
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge value={u.status} />
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          {!isSelf && (
                            <>
                              {u.status === 'ACTIVE' ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setLockingUser(u);
                                    setLockReason('');
                                  }}
                                  className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                                >
                                  <Lock className="h-3.5 w-3.5" />
                                  <span>Khóa</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleUnlock(u)}
                                  className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                                >
                                  <Unlock className="h-3.5 w-3.5" />
                                  <span>Mở khóa</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleToggleRole(u)}
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                              >
                                <Shield className="h-3.5 w-3.5" />
                                <span>{u.role === 'ADMIN' ? 'Hạ SV' : 'Cấp Admin'}</span>
                              </button>
                            </>
                          )}
                          {isSelf && <span className="text-xs italic text-slate-400">Bạn</span>}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
          <span>
            Trang {page} / {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium disabled:opacity-40"
            >
              Trước
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium disabled:opacity-40"
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      {/* Lock Modal */}
      {lockingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900">Khóa tài khoản người dùng</h3>
            <p className="mt-1 text-sm text-slate-500">
              Tài khoản <span className="font-semibold text-slate-800">{lockingUser.fullName}</span>{' '}
              sẽ bị chặn đăng nhập ngay lập tức.
            </p>
            <form onSubmit={handleLockSubmit} className="mt-4 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Lý do khóa tài khoản
                </label>
                <textarea
                  rows={3}
                  required
                  minLength={3}
                  value={lockReason}
                  onChange={(e) => setLockReason(e.target.value)}
                  placeholder="Ví dụ: Đăng bài spam hoặc vi phạm quy chế học thuật..."
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setLockingUser(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
                >
                  {submitting ? 'Đang xử lý...' : 'Xác nhận khóa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
