import { MapPin, Pencil, Pin, Plus, Trash2 } from 'lucide-react';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { adminApi } from '../api/adminApi';
import { getErrorMessage } from '../api/client';
import { StatusBadge } from '../components/StatusBadge';
import { CampusPostItem } from '../types/admin';

const CATEGORY_LABELS: Record<CampusPostItem['category'], string> = {
  ANNOUNCEMENT: 'Thông báo',
  EVENT: 'Sự kiện',
  SCHOLARSHIP: 'Học bổng',
  CLUB: 'Câu lạc bộ',
  JOB_INTERNSHIP: 'Việc làm / Thực tập',
};

export function CampusPage() {
  const [items, setItems] = useState<CampusPostItem[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null,
  );

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CampusPostItem | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<CampusPostItem['category']>('ANNOUNCEMENT');
  const [location, setLocation] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [status, setStatus] = useState<CampusPostItem['status']>('PUBLISHED');
  const [submitting, setSubmitting] = useState(false);

  const fetchCampus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.listCampusPosts({
        category: categoryFilter || undefined,
        page: 1,
        limit: 20,
      });
      setItems(res.data);
    } catch (err) {
      setFeedback({ type: 'error', text: getErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  }, [categoryFilter]);

  useEffect(() => {
    fetchCampus();
  }, [fetchCampus]);

  const openCreateModal = () => {
    setEditingItem(null);
    setTitle('');
    setContent('');
    setCategory('ANNOUNCEMENT');
    setLocation('');
    setIsPinned(false);
    setStatus('PUBLISHED');
    setModalOpen(true);
  };

  const openEditModal = (item: CampusPostItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setContent(item.content);
    setCategory(item.category);
    setLocation(item.location || '');
    setIsPinned(item.isPinned);
    setStatus(item.status);
    setModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        content: content.trim(),
        category,
        location: location.trim() || null,
        isPinned,
        status,
      };
      if (editingItem) {
        await adminApi.updateCampusPost(editingItem.id, payload);
        setFeedback({ type: 'success', text: 'Đã cập nhật tin tức Campus' });
      } else {
        await adminApi.createCampusPost(payload);
        setFeedback({ type: 'success', text: 'Đã đăng tin tức Campus mới' });
      }
      setModalOpen(false);
      await fetchCampus();
    } catch (err) {
      setFeedback({ type: 'error', text: getErrorMessage(err) });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await adminApi.deleteCampusPost(id);
      setFeedback({ type: 'success', text: 'Đã xóa tin tức Campus' });
      await fetchCampus();
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

      <div className="flex flex-wrap items-center justify-between gap-3">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm outline-none focus:border-indigo-500"
        >
          <option value="">Tất cả chuyên mục Campus</option>
          {Object.entries(CATEGORY_LABELS).map(([k, label]) => (
            <option key={k} value={k}>
              {label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          <span>Đăng tin Campus</span>
        </button>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-400">
          Đang tải danh sách tin Campus...
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-400">
          Chưa có bài viết Campus nào.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs"
            >
              <div>
                <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                      {CATEGORY_LABELS[item.category]}
                    </span>
                    <StatusBadge value={item.status} />
                    {item.isPinned && (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
                        <Pin className="h-3 w-3" /> Ghim
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(item)}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600"
                      title="Chỉnh sửa"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                      title="Xóa"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                <p className="mt-1.5 line-clamp-3 text-sm text-slate-600">{item.content}</p>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {item.location || 'Toàn trường'}
                </span>
                <span>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900">
              {editingItem ? 'Chỉnh sửa tin Campus' : 'Đăng tin Campus mới'}
            </h3>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Tiêu đề</label>
                <input
                  type="text"
                  required
                  minLength={3}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Chuyên mục
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as CampusPostItem['category'])}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                  >
                    {Object.entries(CATEGORY_LABELS).map(([k, label]) => (
                      <option key={k} value={k}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Trạng thái
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as CampusPostItem['status'])}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                  >
                    <option value="PUBLISHED">Xuất bản ngay</option>
                    <option value="HIDDEN">Ẩn tạm thời</option>
                    <option value="DRAFT">Lưu nháp</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Địa điểm</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ví dụ: Hội trường Khu A"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Nội dung chi tiết
                </label>
                <textarea
                  rows={4}
                  required
                  minLength={10}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-indigo-500"
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                />
                <span>Ghim tin nổi bật lên đầu tab Campus</span>
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  {submitting ? 'Đang lưu...' : editingItem ? 'Cập nhật' : 'Đăng tin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
