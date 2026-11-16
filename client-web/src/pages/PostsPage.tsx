import React, { useEffect, useState } from 'react';
import { apiClient, getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Heart,
  MessageCircle,
  Share2,
  Trash2,
  Flag,
  Send,
  Sparkles,
  Layers,
  Globe,
  Filter,
} from 'lucide-react';

interface CommentItem {
  id: number;
  content: string;
  createdAt: string;
  author: {
    id: number;
    fullName: string;
    studentCode: string;
    avatarUrl: string | null;
  };
}

interface PostItem {
  id: number;
  title: string | null;
  content: string;
  category: string;
  scope: string;
  likesCount: number;
  commentsCount: number;
  isLikedByMe: boolean;
  createdAt: string;
  author: {
    id: number;
    fullName: string;
    studentCode: string;
    avatarUrl: string | null;
  };
  school?: { name: string } | null;
  faculty?: { name: string } | null;
  class?: { name: string } | null;
}

export const PostsPage: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Form đăng bài
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('COMMUNITY');
  const [scope, setScope] = useState('CLASS');
  const [submitting, setSubmitting] = useState(false);

  // Bộ lọc
  const [filterScope, setFilterScope] = useState<string>('ALL');

  // Bình luận
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<number | null>(null);
  const [commentsMap, setCommentsMap] = useState<Record<number, CommentItem[]>>({});
  const [commentInputMap, setCommentInputMap] = useState<Record<number, string>>({});

  // Báo cáo vi phạm Modal
  const [reportingPostId, setReportingPostId] = useState<number | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [reportDesc, setReportDesc] = useState('');

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const url = filterScope !== 'ALL' ? `/posts?scope=${filterScope}` : '/posts';
      const res = await apiClient.get(url);
      if (res.data?.success) {
        setPosts(res.data.data);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [filterScope]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      setSubmitting(true);
      setError(null);
      await apiClient.post('/posts', {
        title: title.trim() || undefined,
        content: content.trim(),
        category,
        scope,
      });

      setTitle('');
      setContent('');
      await loadPosts();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleLike = async (postId: number) => {
    try {
      const res = await apiClient.post(`/posts/${postId}/like`);
      if (res.data?.success) {
        const { liked, likesCount } = res.data.data;
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, isLikedByMe: liked, likesCount } : p,
          ),
        );
      }
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return;
    try {
      await apiClient.delete(`/posts/${postId}`);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  const toggleComments = async (postId: number) => {
    if (activeCommentsPostId === postId) {
      setActiveCommentsPostId(null);
      return;
    }

    setActiveCommentsPostId(postId);
    try {
      const res = await apiClient.get(`/posts/${postId}/comments`);
      if (res.data?.success) {
        setCommentsMap((prev) => ({ ...prev, [postId]: res.data.data }));
      }
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  const handleSendComment = async (postId: number) => {
    const text = commentInputMap[postId]?.trim();
    if (!text) return;

    try {
      const res = await apiClient.post(`/posts/${postId}/comments`, { content: text });
      if (res.data?.success) {
        setCommentsMap((prev) => ({
          ...prev,
          [postId]: [...(prev[postId] || []), res.data.data],
        }));
        setCommentInputMap((prev) => ({ ...prev, [postId]: '' }));
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p)),
        );
      }
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingPostId || !reportReason.trim()) return;

    try {
      await apiClient.post(`/posts/${reportingPostId}/report`, {
        reason: reportReason,
        description: reportDesc || undefined,
      });
      alert('Đã gửi báo cáo vi phạm tới Admin thành công!');
      setReportingPostId(null);
      setReportReason('');
      setReportDesc('');
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Banner Header Module 3 của Duy */}
      <div className="bg-gradient-to-r from-violet-700 via-indigo-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur">
            <Sparkles className="w-3.5 h-3.5" />
            Module 3: Bài viết & Tương tác — Phụ trách: Duy
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Quản Lý Bài Viết & Phạm Vi Hiển Thị
          </h1>
          <p className="text-indigo-100 text-sm leading-relaxed">
            Đăng bài theo phạm vi (Lớp / Khóa / Khoa / Trường / Công khai). Bảo mật chặt chẽ ở Backend: chỉ chủ bài mới được sửa/xóa; cơ chế Toggle Like chống spam; báo cáo vi phạm trực tiếp tới Admin.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-sm font-medium">
          {error}
        </div>
      )}

      {/* Form Tạo Bài Viết Mới */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 text-white font-bold flex items-center justify-center text-sm shadow-sm">
            {user?.fullName?.charAt(0) || 'D'}
          </div>
          <div>
            <div className="font-semibold text-slate-800 text-sm">
              {user?.fullName || 'Sinh viên'}
            </div>
            <div className="text-xs text-slate-400">Đăng bài lên cộng đồng sinh viên</div>
          </div>
        </div>

        <form onSubmit={handleCreatePost} className="space-y-3">
          <input
            type="text"
            placeholder="Tiêu đề bài viết (tùy chọn)..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <textarea
            rows={3}
            placeholder="Bạn đang muốn chia sẻ điều gì với lớp, khoa hay toàn trường?..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {/* Chọn Scope */}
              <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg text-slate-700">
                <Globe className="w-3.5 h-3.5 text-indigo-600" />
                <span className="font-medium">Phạm vi:</span>
                <select
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                  className="bg-transparent font-semibold text-indigo-700 focus:outline-none cursor-pointer"
                >
                  <option value="CLASS">Chỉ trong Lớp</option>
                  <option value="COURSE">Cùng Khóa</option>
                  <option value="MAJOR">Cùng Ngành</option>
                  <option value="FACULTY">Cùng Khoa</option>
                  <option value="SCHOOL">Toàn Trường</option>
                  <option value="PUBLIC">Công khai</option>
                </select>
              </div>

              {/* Chọn Category */}
              <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg text-slate-700">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                <span className="font-medium">Danh mục:</span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="COMMUNITY">Cộng đồng</option>
                  <option value="STUDY">Học tập</option>
                  <option value="ACTIVITY">Hoạt động</option>
                  <option value="OPPORTUNITY">Cơ hội</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors disabled:opacity-50"
            >
              {submitting ? 'Đang đăng...' : 'Đăng bài viết'}
            </button>
          </div>
        </form>
      </div>

      {/* Bộ lọc phạm vi xem */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
          <Filter className="w-4 h-4 text-indigo-600" />
          Bảng tin bài viết ({posts.length})
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          {['ALL', 'CLASS', 'FACULTY', 'SCHOOL'].map((sc) => (
            <button
              key={sc}
              onClick={() => setFilterScope(sc)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filterScope === sc
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {sc === 'ALL'
                ? 'Tất cả'
                : sc === 'CLASS'
                  ? 'Trong Lớp'
                  : sc === 'FACULTY'
                    ? 'Trong Khoa'
                    : 'Toàn Trường'}
            </button>
          ))}
        </div>
      </div>

      {/* Danh sách bài viết */}
      {loading ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 text-slate-400 text-sm">
          Đang tải danh sách bài viết...
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 text-slate-500 text-sm">
          Chưa có bài viết nào trong phạm vi này. Hãy là người đầu tiên đăng bài!
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const isMyPost = user?.id === post.author.id;
            const comments = commentsMap[post.id] || [];

            return (
              <div
                key={post.id}
                className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4 hover:border-slate-300 transition-colors"
              >
                {/* Header bài viết */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                      {post.author.fullName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {post.author.fullName}
                        </span>
                        {post.class && (
                          <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                            {post.class.name}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {new Date(post.createdAt).toLocaleString('vi-VN')}
                      </div>
                    </div>
                  </div>

                  {/* Badges & Actions */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                      Phạm vi: {post.scope}
                    </span>

                    {/* Nút Xóa (chỉ bài của mình) */}
                    {isMyPost && (
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        title="Xóa bài viết của tôi"
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    {/* Nút Báo cáo (bài của người khác) */}
                    {!isMyPost && (
                      <button
                        onClick={() => setReportingPostId(post.id)}
                        title="Báo cáo bài viết này lên Admin"
                        className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      >
                        <Flag className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Nội dung bài viết */}
                <div className="space-y-1.5">
                  {post.title && (
                    <h3 className="font-bold text-slate-900 text-base leading-snug">
                      {post.title}
                    </h3>
                  )}
                  <p className="text-slate-800 text-sm whitespace-pre-wrap leading-relaxed">
                    {post.content}
                  </p>
                </div>

                {/* Tương tác Like & Comment */}
                <div className="flex items-center gap-4 pt-3 border-t border-slate-100 text-xs font-semibold text-slate-600">
                  <button
                    onClick={() => handleToggleLike(post.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                      post.isLikedByMe
                        ? 'bg-rose-50 text-rose-600'
                        : 'hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        post.isLikedByMe ? 'fill-rose-600 text-rose-600' : 'text-slate-400'
                      }`}
                    />
                    <span>{post.likesCount} Thích</span>
                  </button>

                  <button
                    onClick={() => toggleComments(post.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 text-slate-400" />
                    <span>{post.commentsCount} Bình luận</span>
                  </button>
                </div>

                {/* Khung Bình luận mở rộng */}
                {activeCommentsPostId === post.id && (
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-3 bg-slate-50/50 p-4 rounded-2xl">
                    <div className="space-y-2.5">
                      {comments.length === 0 ? (
                        <div className="text-xs text-slate-400 text-center py-2">
                          Chưa có bình luận nào. Hãy gửi bình luận đầu tiên!
                        </div>
                      ) : (
                        comments.map((cm) => (
                          <div key={cm.id} className="flex items-start gap-2.5 text-xs">
                            <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px] shrink-0">
                              {cm.author.fullName.charAt(0)}
                            </div>
                            <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 flex-1">
                              <div className="font-semibold text-slate-900">
                                {cm.author.fullName}
                              </div>
                              <div className="text-slate-700 mt-0.5">{cm.content}</div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Ô nhập bình luận */}
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="text"
                        placeholder="Viết bình luận của bạn..."
                        value={commentInputMap[post.id] || ''}
                        onChange={(e) =>
                          setCommentInputMap((prev) => ({
                            ...prev,
                            [post.id]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSendComment(post.id);
                        }}
                        className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        onClick={() => handleSendComment(post.id)}
                        className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Báo Cáo Vi Phạm */}
      {reportingPostId && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Flag className="w-5 h-5 text-amber-600" />
                Báo Cáo Bài Viết Vi Phạm
              </h3>
              <button
                onClick={() => setReportingPostId(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitReport} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lý do vi phạm:
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Chọn lý do --</option>
                  <option value="Spam / Quảng cáo trái phép">Spam / Quảng cáo trái phép</option>
                  <option value="Xúc phạm, quấy rối sinh viên khác">
                    Xúc phạm, quấy rối sinh viên khác
                  </option>
                  <option value="Vi phạm quy chế học thuật / Thi hộ">
                    Vi phạm quy chế học thuật / Thi hộ
                  </option>
                  <option value="Thông tin sai sự thật">Thông tin sai sự thật</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Chi tiết bổ sung (tùy chọn):
                </label>
                <textarea
                  rows={3}
                  value={reportDesc}
                  onChange={(e) => setReportDesc(e.target.value)}
                  placeholder="Mô tả cụ thể hành vi vi phạm..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReportingPostId(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!reportReason}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-sm disabled:opacity-50"
                >
                  Gửi báo cáo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
