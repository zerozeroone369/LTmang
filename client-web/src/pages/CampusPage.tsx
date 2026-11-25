import {
  ArrowDownRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  Megaphone,
  Pin,
  Search,
  X,
} from 'lucide-react';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { campusApi, CAMPUS_CATEGORIES, CampusPostItem } from '../api/campusApi';
import { getErrorMessage } from '../api/client';
import { EmptyState } from '../components/EmptyState';

const PAGE_SIZE = 9;

const CATEGORY_COLORS: Record<CampusPostItem['category'], string> = {
  ANNOUNCEMENT: 'bg-blue-50 text-blue-700',
  EVENT: 'bg-violet-50 text-violet-700',
  SCHOLARSHIP: 'bg-amber-50 text-amber-700',
  CLUB: 'bg-emerald-50 text-emerald-700',
  JOB_INTERNSHIP: 'bg-rose-50 text-rose-700',
};

function dateLabel(value: string | null, fallback = 'Chưa cập nhật') {
  if (!value) return fallback;
  const date = new Date(value);
  return Number.isNaN(date.valueOf())
    ? fallback
    : new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

export function CampusPage() {
  const [items, setItems] = useState<CampusPostItem[]>([]);
  const [category, setCategory] = useState<CampusPostItem['category'] | ''>('');
  const [searchText, setSearchText] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<CampusPostItem | null>(null);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const result = await campusApi.list({
        category: category || undefined,
        search: search || undefined,
        page,
        limit: PAGE_SIZE,
      });
      setItems(result.data);
      setTotalPages(result.meta?.totalPages ?? 1);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [category, page, search]);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchText.trim());
  };

  const openDetails = async (item: CampusPostItem) => {
    try {
      setSelectedItem(await campusApi.get(item.id));
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-teal-700 to-cyan-800 p-6 text-white shadow-sm sm:p-8">
        <div className="absolute -right-5 -bottom-20 h-64 w-64 rounded-full border-[38px] border-white/10" />
        <div className="relative max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-100">
            Đời sống sinh viên
          </span>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Campus</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-emerald-50">
            Tin tức nhà trường, sự kiện, câu lạc bộ, học bổng và cơ hội dành cho sinh viên.
          </p>
        </div>
      </section>

      <form
        onSubmit={handleSearch}
        className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-xs sm:flex-row"
      >
        <label className="relative min-w-0 flex-1">
          <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Tìm sự kiện, học bổng, việc làm..."
            className="w-full rounded-xl border border-transparent bg-slate-50 py-2.5 pr-3 pl-10 text-sm outline-none focus:border-emerald-400 focus:bg-white"
          />
        </label>
        <button className="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800">
          Tìm kiếm
        </button>
      </form>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {CAMPUS_CATEGORIES.map((item) => (
          <button
            key={item.value || 'all'}
            type="button"
            onClick={() => {
              setCategory(item.value);
              setPage(1);
            }}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition ${category === item.value ? 'bg-emerald-700 text-white shadow-sm' : 'border border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:text-emerald-700'}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={index}
              className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      ) : items.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => {
            const categoryLabel =
              CAMPUS_CATEGORIES.find((option) => option.value === item.category)?.label ??
              item.category;
            return (
              <article
                key={item.id}
                className="group flex overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="hidden w-2 shrink-0 bg-gradient-to-b from-emerald-500 to-teal-700 sm:block" />
                <div className="flex min-w-0 flex-1 flex-col p-5">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${CATEGORY_COLORS[item.category]}`}
                    >
                      {categoryLabel}
                    </span>
                    {item.isPinned && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600">
                        <Pin className="h-3.5 w-3.5" />
                        Ghim
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => void openDetails(item)}
                    className="mt-4 text-left text-lg font-bold leading-6 text-slate-900 group-hover:text-emerald-800"
                  >
                    {item.title}
                  </button>
                  {item.thumbnailUrl && (
                    <img
                      src={item.thumbnailUrl}
                      alt=""
                      loading="lazy"
                      className="mt-3 max-h-40 w-full rounded-xl object-cover"
                    />
                  )}
                  <p className="mt-2 line-clamp-3 flex-1 whitespace-pre-line text-sm leading-5 text-slate-600">
                    {item.content}
                  </p>
                  <div className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
                    {item.eventDate && (
                      <p className="flex items-center gap-2">
                        <CalendarDays className="h-3.5 w-3.5 text-emerald-700" />
                        {dateLabel(item.eventDate)}
                      </p>
                    )}
                    {item.deadline && (
                      <p className="flex items-center gap-2">
                        <Clock3 className="h-3.5 w-3.5 text-amber-600" />
                        Hạn: {dateLabel(item.deadline)}
                      </p>
                    )}
                    {item.location && (
                      <p className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5" />
                        {item.location}
                      </p>
                    )}
                    <div className="flex items-center justify-between pt-1">
                      <span>{item.author.fullName}</span>
                      <button
                        type="button"
                        onClick={() => void openDetails(item)}
                        className="inline-flex items-center gap-1 font-semibold text-emerald-700"
                      >
                        Xem chi tiết <ArrowDownRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Megaphone}
          title="Chưa có tin Campus phù hợp"
          description="Tin mới sẽ xuất hiện tại đây. Bạn có thể đổi chuyên mục hoặc từ khóa tìm kiếm."
        />
      )}

      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
        <span className="text-xs text-slate-500">
          Trang {page} / {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            className="rounded-lg border border-slate-200 p-2 text-slate-600 disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
            className="rounded-lg border border-slate-200 p-2 text-slate-600 disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedItem(null);
          }}
        >
          <article
            role="dialog"
            aria-modal="true"
            aria-label={selectedItem.title}
            className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
          >
            {selectedItem.thumbnailUrl && (
              <img
                src={selectedItem.thumbnailUrl}
                alt=""
                className="max-h-72 w-full object-cover"
              />
            )}
            <div className="p-5 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${CATEGORY_COLORS[selectedItem.category]}`}
                  >
                    {
                      CAMPUS_CATEGORIES.find((option) => option.value === selectedItem.category)
                        ?.label
                    }
                  </span>
                  <h2 className="mt-3 text-xl font-black text-slate-900 sm:text-2xl">
                    {selectedItem.title}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                {selectedItem.content}
              </p>
              <div className="mt-5 grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 sm:grid-cols-2">
                {selectedItem.eventDate && (
                  <p className="flex items-start gap-2">
                    <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                    <span>
                      <b className="text-slate-800">Thời gian</b>
                      <br />
                      {dateLabel(selectedItem.eventDate)}
                    </span>
                  </p>
                )}
                {selectedItem.deadline && (
                  <p className="flex items-start gap-2">
                    <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                    <span>
                      <b className="text-slate-800">Hạn đăng ký</b>
                      <br />
                      {dateLabel(selectedItem.deadline)}
                    </span>
                  </p>
                )}
                {selectedItem.location && (
                  <p className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>
                      <b className="text-slate-800">Địa điểm</b>
                      <br />
                      {selectedItem.location}
                    </span>
                  </p>
                )}
                <p className="text-xs text-slate-500">
                  Đăng bởi {selectedItem.author.fullName} · {dateLabel(selectedItem.createdAt)}
                </p>
              </div>
            </div>
          </article>
        </div>
      )}
    </div>
  );
}
