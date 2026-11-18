import {
  BookOpen,
  Calendar,
  CheckCircle2,
  GraduationCap,
  HelpCircle,
  MessageSquare,
  Sparkles,
  Users,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient, getErrorMessage } from '../api/client';
import { useAuth } from '../context/auth-context';

const feedCategories = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'STUDY', label: 'Học tập' },
  { value: 'COMMUNITY', label: 'Cộng đồng' },
  { value: 'ACTIVITY', label: 'Hoạt động' },
  { value: 'OPPORTUNITY', label: 'Cơ hội' },
] as const;

const feedScopes = [
  { value: 'CLASS', label: 'Lớp' },
  { value: 'COURSE', label: 'Khóa' },
  { value: 'MAJOR', label: 'Ngành' },
  { value: 'FACULTY', label: 'Khoa' },
  { value: 'SCHOOL', label: 'Trường' },
  { value: 'GLOBAL', label: 'Toàn hệ thống' },
] as const;

type FeedCategory = (typeof feedCategories)[number]['value'];
type FeedScope = (typeof feedScopes)[number]['value'];
type FeedUnavailableSource = { sourceType: string; reason: string };

interface FeedItem {
  id: string;
  sourceType: 'POST' | 'CAMPUS_POST';
  sourceId: number;
  category: Exclude<FeedCategory, 'ALL'>;
  subtype: string;
  title: string | null;
  excerpt: string;
  createdAt: string;
  isPinned: boolean;
  author: { id: number; fullName: string; avatarUrl: string | null };
  scopeLevel: string;
}

interface FeedResponse {
  data?: {
    items?: FeedItem[];
    preferences?: {
      categories?: Exclude<FeedCategory, 'ALL'>[];
      scope?: FeedScope;
    };
    unavailableSources?: FeedUnavailableSource[];
  };
  meta?: { page?: number; limit?: number; total?: number; totalPages?: number };
}

export function HomePage() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<FeedCategory>('ALL');
  const [selectedScope, setSelectedScope] = useState<FeedScope>('CLASS');
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [unavailableSources, setUnavailableSources] = useState<FeedUnavailableSource[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [feedError, setFeedError] = useState<string | null>(null);
  const initializedUserId = useRef<number | null>(null);
  const feedRequestSequence = useRef(0);

  const loadFeed = useCallback(
    async (
      requestedPage: number,
      append: boolean,
      categoryOverride?: FeedCategory,
      scopeOverride?: FeedScope,
    ) => {
      if (!user) return;

      const category = categoryOverride ?? selectedCategory;
      const scope = scopeOverride ?? selectedScope;
      const shouldUsePreferences = preferencesLoaded || scopeOverride !== undefined;
      const requestId = ++feedRequestSequence.current;
      setIsLoading(true);
      setFeedError(null);
      try {
        const response = await apiClient.get<FeedResponse>('/feed', {
          params: {
            page: requestedPage,
            limit: 10,
            ...(shouldUsePreferences && category !== 'ALL' ? { category } : {}),
            ...(shouldUsePreferences ? { scope } : {}),
          },
        });
        if (requestId !== feedRequestSequence.current) return;

        const feedData = response.data?.data;
        const items = feedData?.items ?? [];
        const preferences = feedData?.preferences;
        const savedScope =
          feedScopes.find((item) => item.value === preferences?.scope)?.value ?? 'CLASS';
        const savedCategories = preferences?.categories ?? [];
        if (!shouldUsePreferences && requestedPage === 1) {
          setSelectedScope(savedScope);
          setSelectedCategory(savedCategories.length === 1 ? savedCategories[0] : 'ALL');
          setPreferencesLoaded(true);
        }
        setFeedItems((current) => {
          if (!append) return items;
          const merged = new Map(current.map((item) => [item.id, item]));
          for (const item of items) merged.set(item.id, item);
          return [...merged.values()];
        });
        setUnavailableSources(feedData?.unavailableSources ?? []);
        setPage(response.data?.meta?.page ?? requestedPage);
        setTotal(response.data?.meta?.total ?? items.length);
        setTotalPages(response.data?.meta?.totalPages ?? requestedPage);
        setPreferencesLoaded(true);
      } catch (error) {
        if (requestId === feedRequestSequence.current) {
          setFeedError(getErrorMessage(error));
          setPreferencesLoaded(true);
        }
      } finally {
        if (requestId === feedRequestSequence.current) {
          setIsLoading(false);
        }
      }
    },
    [preferencesLoaded, selectedCategory, selectedScope, user],
  );

  useEffect(() => {
    if (!user) {
      initializedUserId.current = null;
      setFeedItems([]);
      setPreferencesLoaded(false);
      setPage(1);
      setTotal(0);
      return;
    }

    if (initializedUserId.current === user.id) return;
    initializedUserId.current = user.id;
    setFeedItems([]);
    setPage(1);
    setTotal(0);
    setPreferencesLoaded(false);
    void loadFeed(1, false);
  }, [loadFeed, user]);

  const saveFeedPreferences = async (category: FeedCategory, scope: FeedScope) => {
    if (isSavingPreferences) return;

    setIsSavingPreferences(true);
    try {
      await apiClient.put('/feed/preferences', {
        categories: category === 'ALL' ? 'ALL' : [category],
        scope,
      });
      setSelectedCategory(category);
      setSelectedScope(scope);
      await loadFeed(1, false, category, scope);
    } catch (error) {
      setFeedError(getErrorMessage(error));
    } finally {
      setIsSavingPreferences(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-6 text-white shadow-lg sm:p-8">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-xs">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <span>Mạng xã hội phục vụ đời sống Sinh viên</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            Xin chào, {user ? user.fullName : 'Sinh viên UniConnect'}!
          </h1>
          <p className="text-xs text-blue-100 sm:text-sm">
            Hệ thống kết nối đời sống đại học: học tập, chia sẻ tài liệu, hỏi đáp môn học, tìm nhóm
            học và cập nhật tin tức Campus theo cấu trúc Trường → Khoa → Ngành → Khóa → Lớp.
          </p>
          {user && (
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="rounded-xl bg-white/15 px-3 py-1.5 font-medium">
                Lớp: <strong>{user.classInfo?.code || 'Chưa gán lớp'}</strong>
              </span>
              <span className="rounded-xl bg-white/15 px-3 py-1.5 font-medium">
                Khoa: <strong>{user.faculty?.code || user.school?.code}</strong>
              </span>
              <span className="rounded-xl bg-white/15 px-3 py-1.5 font-medium">
                Trường: <strong>{user.school?.code || user.school?.name}</strong>
              </span>
            </div>
          )}
        </div>
      </div>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Bảng tin thông minh</h2>
            <p className="mt-1 text-sm text-slate-500">
              Bài viết được sắp xếp theo phạm vi ưu tiên và hồ sơ học vụ của bạn.
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            Ưu tiên phạm vi
            <select
              value={selectedScope}
              disabled={!user || isSavingPreferences}
              onChange={(event) =>
                void saveFeedPreferences(selectedCategory, event.target.value as FeedScope)
              }
              className="rounded-lg border border-slate-300 bg-white px-3 py-2"
            >
              {feedScopes.map((scope) => (
                <option key={scope.value} value={scope.value}>
                  {scope.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex flex-wrap gap-2" aria-label="Lọc nhóm nội dung">
          {feedCategories.map((category) => (
            <button
              key={category.value}
              type="button"
              disabled={!user || isSavingPreferences}
              aria-pressed={selectedCategory === category.value}
              onClick={() => void saveFeedPreferences(category.value, selectedScope)}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                selectedCategory === category.value
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {!user ? (
          <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
            <Link to="/login" className="font-semibold text-blue-700 hover:underline">
              Đăng nhập
            </Link>{' '}
            để xem bảng tin cá nhân hóa.
          </p>
        ) : (
          <>
            {unavailableSources.length > 0 && (
              <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
                Tài liệu và câu hỏi chưa được đưa vào bảng tin vì chính sách truy cập chưa được xác
                nhận.
              </p>
            )}
            {feedError && (
              <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">
                Không thể tải bảng tin: {feedError}
              </p>
            )}
            {feedItems.length === 0 && !isLoading && !feedError ? (
              <p className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">
                Chưa có nội dung phù hợp.
              </p>
            ) : (
              <div className="space-y-3">
                {feedItems.map((item) => (
                  <article key={item.id} className="rounded-xl border border-slate-200 p-4">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 font-semibold text-blue-700">
                        {feedCategories.find((category) => category.value === item.category)?.label}
                      </span>
                      <span>{item.scopeLevel}</span>
                      {item.isPinned && (
                        <span className="rounded-full bg-amber-50 px-2.5 py-1 font-semibold text-amber-700">
                          Đã ghim
                        </span>
                      )}
                      <time className="ml-auto" dateTime={item.createdAt}>
                        {new Date(item.createdAt).toLocaleString()}
                      </time>
                    </div>
                    <h3 className="mt-2 font-semibold text-slate-900">
                      {item.title || item.subtype}
                    </h3>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">
                      {item.excerpt}
                    </p>
                    <p className="mt-3 text-xs text-slate-400">
                      {item.author.fullName} · {item.sourceType === 'POST' ? 'Bài viết' : 'Campus'}
                    </p>
                  </article>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-slate-500">
                {feedItems.length} / {total} nội dung
              </p>
              {page < totalPages && (
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => void loadFeed(page + 1, true)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  {isLoading ? 'Đang tải…' : 'Tải thêm'}
                </button>
              )}
            </div>
          </>
        )}
      </section>

      {/* Module Navigation Grid */}
      <div>
        <h2 className="mb-3 text-sm font-bold text-slate-800">
          Không gian chức năng (10 Module sở hữu trọn gói):
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            to="/profile"
            className="flex items-start gap-3.5 rounded-2xl border border-blue-200/80 bg-blue-50/40 p-4 transition hover:bg-blue-50 hover:shadow-xs"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-blue-700">Module 1 (Đã hoàn thành)</p>
              <h3 className="text-sm font-bold text-slate-900">Tài khoản & Hồ sơ cá nhân</h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Đăng ký, đăng nhập, đổi mật khẩu, phân cấp cộng đồng. (Phụ trách: Tú Anh)
              </p>
            </div>
          </Link>

          <Link
            to="/communities"
            className="flex items-start gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 transition hover:bg-slate-50 hover:shadow-xs"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-indigo-600">Module 2 (Duy)</p>
              <h3 className="text-sm font-bold text-slate-900">Không gian Cộng đồng</h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Phân luồng Trường → Khoa → Ngành → Khóa → Lớp.
              </p>
            </div>
          </Link>

          <Link
            to="/posts"
            className="flex items-start gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 transition hover:bg-slate-50 hover:shadow-xs"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-sky-600">Module 3 (Duy)</p>
              <h3 className="text-sm font-bold text-slate-900">Bài viết & Tương tác</h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Đăng bài theo phạm vi, like, comment, báo cáo vi phạm.
              </p>
            </div>
          </Link>

          <Link
            to="/documents"
            className="flex items-start gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 transition hover:bg-slate-50 hover:shadow-xs"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-teal-600">Module 4 (Huy)</p>
              <h3 className="text-sm font-bold text-slate-900">Tài liệu học tập</h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Upload/download file &lt;20MB, đánh giá sao, lọc môn học.
              </p>
            </div>
          </Link>

          <Link
            to="/qa"
            className="flex items-start gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 transition hover:bg-slate-50 hover:shadow-xs"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-amber-600">Module 5 (Huy)</p>
              <h3 className="text-sm font-bold text-slate-900">Hỏi đáp học thuật (Q&A)</h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Đặt câu hỏi theo môn, upvote, chốt câu trả lời đúng.
              </p>
            </div>
          </Link>

          <Link
            to="/study-groups"
            className="flex items-start gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 transition hover:bg-slate-50 hover:shadow-xs"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-violet-600">Module 6 (Bảo)</p>
              <h3 className="text-sm font-bold text-slate-900">Nhóm học (Study Groups)</h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Tạo nhóm học, tìm bạn cùng mục tiêu, duyệt thành viên.
              </p>
            </div>
          </Link>

          <Link
            to="/campus"
            className="flex items-start gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 transition hover:bg-slate-50 hover:shadow-xs"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-rose-600">Module 7 (Bảo)</p>
              <h3 className="text-sm font-bold text-slate-900">Campus & Việc làm</h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Thông báo, lịch thi, học bổng, câu lạc bộ, thực tập.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
