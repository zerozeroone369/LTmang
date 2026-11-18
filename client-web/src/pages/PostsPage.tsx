import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { apiClient, getErrorMessage } from '../api/client';
import { useAuth } from '../context/auth-context';
import { ConfirmModal } from '../components/ConfirmModal';
import { SkeletonPost } from '../components/SkeletonPost';
import { EmptyState } from '../components/EmptyState';
import { formatRelativeTime } from '../utils/formatTime';
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
  Inbox,
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
  const [loadingComments, setLoadingComments] = useState<Record<number, boolean>>({});

  // Báo cáo vi phạm Modal
  const [reportingPostId, setReportingPostId] = useState<number | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [reportDesc, setReportDesc] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  // Modal Xóa bài
  const [deletingPostId, setDeletingPostId] = useState<number | null>(null);
  const [deletingPostLoading, setDeletingPostLoading] = useState(false);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const url = filterScope !== 'ALL' ? `/posts?scope=${filterScope}` : '/posts';
      const res = await apiClient.get(url);
      if (res.data?.success) {
        setPosts(res.data.data);
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
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
      await apiClient.post('/posts', {
        title: title.trim() || undefined,
        content: content.trim(),
        category,
        scope,
      });

      toast.success('Đã đăng bài viết thành công!', {
        description: `Bài viết được chia sẻ theo phạm vi: ${getScopeLabel(scope)}`,
      });
      setTitle('');
      setContent('');
      await loadPosts();
    } catch (err) {
      toast.error(getErrorMessage(err));
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
          prev.map((p) => (p.id === postId ? { ...p, isLikedByMe: liked, likesCount } : p)),
        );
        if (liked) {
          toast.success('Đã thích bài viết!', { duration: 1500 });
        }
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const confirmDeletePost = async () => {
    if (!deletingPostId) return;
    try {
      setDeletingPostLoading(true);
      await apiClient.delete(`/posts/${deletingPostId}`);
      setPosts((prev) => prev.filter((p) => p.id !== deletingPostId));
      toast.success('Đã xóa bài viết vĩnh viễn!');
      setDeletingPostId(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeletingPostLoading(false);
    }
  };

  const toggleComments = async (postId: number) => {
    if (activeCommentsPostId === postId) {
      setActiveCommentsPostId(null);
      return;
    }

    setActiveCommentsPostId(postId);
    try {
      setLoadingComments((prev) => ({ ...prev, [postId]: true }));
      const res = await apiClient.get(`/posts/${postId}/comments`);
      if (res.data?.success) {
        setCommentsMap((prev) => ({ ...prev, [postId]: res.data.data }));
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoadingComments((prev) => ({ ...prev, [postId]: false }));
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
        toast.success('Đã gửi bình luận!');
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleCopyLink = (postId: number) => {
    navigator.clipboard.writeText(`${window.location.origin}/posts#post-${postId}`);
    toast.success('Đã sao chép liên kết bài viết vào clipboard!');
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingPostId || !reportReason.trim()) return;

    try {
      setSubmittingReport(true);
      await apiClient.post(`/posts/${reportingPostId}/report`, {
        reason: reportReason,
        description: reportDesc || undefined,
      });
      toast.success('Đã gửi báo cáo vi phạm!', {
        description: 'Quản trị viên (Admin) sẽ kiểm duyệt và xử lý.',
      });
      setReportingPostId(null);
      setReportReason('');
      setReportDesc('');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmittingReport(false);
    }
  };

  function getScopeLabel(s: string) {
    switch (s) {
      case 'CLASS':
        return 'Chỉ trong Lớp';
      case 'COURSE':
        return 'Cùng Khóa';
      case 'MAJOR':
        return 'Cùng Ngành';
      case 'FACULTY':
        return 'Cùng Khoa';
      case 'SCHOOL':
        return 'Toàn Trường';
      case 'PUBLIC':
        return 'Công khai';
      default:
        return s;
    }
  }

  function getCategoryBadge(cat: string) {
    switch (cat) {
      case 'STUDY':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
            📚 Học tập
          </span>
        );
      case 'ACTIVITY':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-100">
            🎉 Hoạt động
          </span>
        );
      case 'OPPORTUNITY':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-100">
            💼 Cơ hội
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
            💬 Cộng đồng
          </span>
        );
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Banner Header Bài viết & Tương tác */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur">
            <Sparkles className="w-3.5 h-3.5" />
            Bài viết & Tương tác
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Quản Lý Bài Viết & Phân Quyền Bảo Mật
          </h1>
          <p className="text-indigo-100 text-sm leading-relaxed">
            Đăng bài theo phạm vi (<span className="text-white font-semibold">Lớp / Khóa / Khoa / Trường</span>).
            Bảo mật chặt chẽ tại Backend: chỉ chủ bài mới được sửa/xóa; cơ chế Toggle Like chống trùng lặp; báo cáo vi phạm trực tiếp tới Admin.
          </p>
        </div>
      </div>

      {/* Form Tạo Bài Viết Mới */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-bold flex items-center justify-center text-sm shadow-sm">
            {user?.fullName?.charAt(0) || 'D'}
          </div>
          <div>
            <div className="font-semibold text-slate-900 text-sm flex items-center gap-2">
              {user?.fullName || 'Sinh viên'}
              {user?.classInfo && (
                <span className="text-[11px] font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                  {user.classInfo.name}
                </span>
              )}
            </div>
            <div className="text-xs text-slate-400">Tạo bài viết chia sẻ tới cộng đồng</div>
          </div>
        </div>

        <form onSubmit={handleCreatePost} className="space-y-3">
          <input
            type="text"
            placeholder="Tiêu đề bài viết (tùy chọn)..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all placeholder:text-slate-400"
          />

          <textarea
            rows={3}
            placeholder="Bạn đang muốn chia sẻ điều gì với lớp, khoa hay toàn trường?..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-none placeholder:text-slate-400"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {/* Chọn Scope */}
              <div className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/80 px-3 py-1.5 rounded-xl text-slate-700 transition-colors">
                <Globe className="w-3.5 h-3.5 text-indigo-600" />
                <span className="font-medium text-slate-500">Phạm vi:</span>
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
              <div className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/80 px-3 py-1.5 rounded-xl text-slate-700 transition-colors">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                <span className="font-medium text-slate-500">Mục:</span>
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
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-200 transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              {submitting ? 'Đang đăng...' : 'Đăng bài viết'}
            </button>
          </div>
        </form>
      </div>

      {/* Thanh Filter Scope */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
          <Filter className="w-4 h-4 text-indigo-600" />
          Bảng tin bài viết
          <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">
            {posts.length}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: 'Tất cả' },
            { id: 'CLASS', label: 'Trong Lớp' },
            { id: 'FACULTY', label: 'Trong Khoa' },
            { id: 'SCHOOL', label: 'Toàn Trường' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilterScope(item.id)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all shrink-0 ${
                filterScope === item.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Danh sách bài viết */}
      {loading ? (
        <div className="space-y-4">
          <SkeletonPost />
          <SkeletonPost />
          <SkeletonPost />
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Chưa có bài viết nào"
          description="Chưa có bài viết nào trong phạm vi này. Hãy chia sẻ bài viết đầu tiên để kết nối bạn bè!"
        />
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const isMyPost = user?.id === post.author.id;
            const comments = commentsMap[post.id] || [];

            return (
              <div
                key={post.id}
                id={`post-${post.id}`}
                className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4 hover:border-slate-300 transition-all"
              >
                {/* Header bài viết */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 text-white font-bold flex items-center justify-center text-sm shadow-sm shrink-0">
                      {post.author.fullName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {post.author.fullName}
                        </span>
                        {post.class && (
                          <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                            {post.class.name}
                          </span>
                        )}
                        {getCategoryBadge(post.category)}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {formatRelativeTime(post.createdAt)}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Scope Badge */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {getScopeLabel(post.scope)}
                    </span>

                    {/* Nút Xóa (chỉ bài của mình) */}
                    {isMyPost && (
                      <button
                        onClick={() => setDeletingPostId(post.id)}
                        title="Xóa bài viết của tôi"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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

                {/* Tương tác Like, Comment, Share */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-semibold text-slate-600">
                  <div className="flex items-center gap-2">
                    {/* Nút Like có scale bounce */}
                    <button
                      onClick={() => handleToggleLike(post.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all active:scale-125 ${
                        post.isLikedByMe
                          ? 'bg-rose-50 text-rose-600 font-bold'
                          : 'hover:bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 transition-transform ${
                          post.isLikedByMe ? 'fill-rose-600 text-rose-600' : 'text-slate-400'
                        }`}
                      />
                      <span>{post.likesCount} Thích</span>
                    </button>

                    {/* Nút Bình luận */}
                    <button
                      onClick={() => toggleComments(post.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4 text-slate-400" />
                      <span>{post.commentsCount} Bình luận</span>
                    </button>
                  </div>

                  {/* Nút Chia sẻ link */}
                  <button
                    onClick={() => handleCopyLink(post.id)}
                    title="Sao chép liên kết"
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Khung Bình luận mở rộng */}
                {activeCommentsPostId === post.id && (
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-3 bg-slate-50/70 p-4 rounded-2xl">
                    <div className="space-y-2.5">
                      {loadingComments[post.id] ? (
                        <div className="text-xs text-slate-400 text-center py-2 animate-pulse">
                          Đang tải bình luận...
                        </div>
                      ) : comments.length === 0 ? (
                        <div className="text-xs text-slate-400 text-center py-2">
                          Chưa có bình luận nào. Hãy gửi bình luận đầu tiên!
                        </div>
                      ) : (
                        comments.map((cm) => (
                          <div key={cm.id} className="flex items-start gap-2.5 text-xs">
                            <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                              {cm.author.fullName.charAt(0)}
                            </div>
                            <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 flex-1 shadow-2xs">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-slate-900">
                                  {cm.author.fullName}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {formatRelativeTime(cm.createdAt)}
                                </span>
                              </div>
                              <div className="text-slate-700 mt-1 leading-relaxed">{cm.content}</div>
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
                        className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                      />
                      <button
                        onClick={() => handleSendComment(post.id)}
                        className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-colors shrink-0"
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

      {/* Modal Xác Nhận Xóa Bài Viết (Thay cho confirm thô sơ) */}
      <ConfirmModal
        isOpen={deletingPostId !== null}
        title="Xóa bài viết này?"
        message="Hành động này sẽ xóa vĩnh viễn bài viết cùng toàn bộ lượt thích và bình luận liên quan. Bạn không thể hoàn tác."
        confirmLabel="Xóa vĩnh viễn"
        cancelLabel="Hủy"
        isDestructive
        isLoading={deletingPostLoading}
        onConfirm={confirmDeletePost}
        onCancel={() => setDeletingPostId(null)}
      />

      {/* Modal Báo Cáo Vi Phạm (Gửi Admin) */}
      {reportingPostId && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Flag className="w-5 h-5 text-amber-600" />
                Báo Cáo Bài Viết Vi Phạm
              </h3>
              <button
                onClick={() => setReportingPostId(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
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
                  <option value="">-- Chọn lý do vi phạm --</option>
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
                  Mô tả chi tiết (tùy chọn):
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
                  disabled={!reportReason || submittingReport}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-xs disabled:opacity-50"
                >
                  {submittingReport ? 'Đang gửi...' : 'Gửi báo cáo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
