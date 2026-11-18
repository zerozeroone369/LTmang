import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  Plus,
  Search,
  UserMinus,
  Users,
  X,
} from 'lucide-react';
import { FormEvent, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { getErrorMessage } from '../api/client';
import {
  JoinRequestItem,
  StudyGroupItem,
  StudySubject,
  studyGroupsApi,
} from '../api/studyGroupsApi';
import { EmptyState } from '../components/EmptyState';
import { useAuth } from '../context/auth-context';

const PAGE_SIZE = 9;

const inputClassName =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15';

export function StudyGroupsPage() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<StudyGroupItem[]>([]);
  const [subjects, setSubjects] = useState<StudySubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [search, setSearch] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedGroup, setSelectedGroup] = useState<StudyGroupItem | null>(null);
  const [pendingRequests, setPendingRequests] = useState<JoinRequestItem[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [busyRequestId, setBusyRequestId] = useState<number | null>(null);
  const [removingMemberId, setRemovingMemberId] = useState<number | null>(null);
  const [joiningGroupId, setJoiningGroupId] = useState<number | null>(null);
  const [leaving, setLeaving] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({
    name: '',
    description: '',
    subjectId: '',
    goal: '',
    scheduleText: '',
    location: '',
    maxMembers: '8',
  });

  const loadSubjects = useCallback(async () => {
    try {
      setSubjects(await studyGroupsApi.listSubjects());
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }, []);

  const loadGroups = useCallback(async () => {
    setLoading(true);
    try {
      const result = await studyGroupsApi.search({
        q: search || undefined,
        subjectId: subjectId ? Number(subjectId) : undefined,
        page,
        limit: PAGE_SIZE,
      });
      setGroups(result.data);
      setTotalPages(result.meta?.totalPages ?? 1);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [page, search, subjectId]);

  useEffect(() => {
    void loadSubjects();
  }, [loadSubjects]);

  useEffect(() => {
    void loadGroups();
  }, [loadGroups]);

  const openDetails = async (group: StudyGroupItem) => {
    try {
      const details = await studyGroupsApi.get(group.id);
      setSelectedGroup(details);
      if (details.creator.id === user?.id) {
        setLoadingRequests(true);
        const requests = await studyGroupsApi.listRequests(details.id);
        setPendingRequests(requests);
      } else {
        setPendingRequests([]);
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchText.trim());
  };

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    setCreating(true);
    try {
      await studyGroupsApi.create({
        name: draft.name.trim(),
        description: draft.description.trim() || undefined,
        subjectId: draft.subjectId ? Number(draft.subjectId) : null,
        goal: draft.goal.trim() || undefined,
        scheduleText: draft.scheduleText.trim() || undefined,
        location: draft.location.trim() || undefined,
        maxMembers: Number(draft.maxMembers),
      });
      toast.success('Đã tạo nhóm học. Bạn là trưởng nhóm.');
      setCreateOpen(false);
      setDraft({
        name: '', description: '', subjectId: '', goal: '', scheduleText: '', location: '', maxMembers: '8',
      });
      setPage(1);
      await loadGroups();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async (group: StudyGroupItem) => {
    setJoiningGroupId(group.id);
    try {
      await studyGroupsApi.requestToJoin(group.id);
      toast.success('Đã gửi yêu cầu tham gia.');
      await loadGroups();
      if (selectedGroup?.id === group.id) {
        setSelectedGroup(await studyGroupsApi.get(group.id));
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setJoiningGroupId(null);
    }
  };

  const handleReview = async (request: JoinRequestItem, status: 'APPROVED' | 'REJECTED') => {
    setBusyRequestId(request.id);
    try {
      await studyGroupsApi.reviewRequest(request.id, status);
      toast.success(status === 'APPROVED' ? `Đã thêm ${request.user.fullName} vào nhóm.` : 'Đã từ chối yêu cầu.');
      if (selectedGroup) {
        const [details, requests] = await Promise.all([
          studyGroupsApi.get(selectedGroup.id),
          studyGroupsApi.listRequests(selectedGroup.id),
        ]);
        setSelectedGroup(details);
        setPendingRequests(requests);
      }
      await loadGroups();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusyRequestId(null);
    }
  };

  const handleLeave = async () => {
    if (!selectedGroup) return;
    setLeaving(true);
    try {
      const result = await studyGroupsApi.leave(selectedGroup.id);
      toast.success(result.groupClosed ? 'Bạn đã rời nhóm. Nhóm đã đóng vì không còn thành viên.' : 'Bạn đã rời nhóm.');
      setSelectedGroup(null);
      await loadGroups();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLeaving(false);
    }
  };

  const handleRemoveMember = async (member: StudyGroupItem['members'][number]) => {
    if (!selectedGroup || selectedGroup.creator.id !== user?.id || member.role === 'LEADER') return;
    const confirmed = window.confirm(`Xóa ${member.user.fullName} khỏi nhóm này?`);
    if (!confirmed) return;

    setRemovingMemberId(member.user.id);
    try {
      await studyGroupsApi.removeMember(selectedGroup.id, member.user.id);
      toast.success(`Đã xóa ${member.user.fullName} khỏi nhóm.`);
      const [details, requests] = await Promise.all([
        studyGroupsApi.get(selectedGroup.id),
        studyGroupsApi.listRequests(selectedGroup.id),
      ]);
      setSelectedGroup(details);
      setPendingRequests(requests);
      await loadGroups();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setRemovingMemberId(null);
    }
  };

  const selectedSubject = useMemo(
    () => subjects.find((subject) => String(subject.id) === subjectId)?.name,
    [subjectId, subjects],
  );

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-indigo-700 to-violet-800 p-6 text-white shadow-sm sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div className="max-w-xl">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-blue-200">Học cùng nhau</span>
            <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Nhóm học sinh viên</h1>
            <p className="mt-2 text-sm leading-6 text-blue-100">
              Tìm bạn cùng môn, đặt mục tiêu học tập và hẹn lịch gặp nhóm.
            </p>
          </div>
          {user?.role === 'STUDENT' && (
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-blue-800 shadow-sm transition hover:bg-blue-50"
            >
              <Plus className="h-4 w-4" /> Tạo nhóm học
            </button>
          )}
        </div>
      </section>

      <form onSubmit={handleSearch} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-xs sm:grid-cols-[1fr_230px_auto]">
        <label className="relative">
          <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={searchText} onChange={(event) => setSearchText(event.target.value)} placeholder="Tìm theo tên, mục tiêu hoặc địa điểm..." className={`${inputClassName} pl-10`} />
        </label>
        <select value={subjectId} onChange={(event) => { setSubjectId(event.target.value); setPage(1); }} className={inputClassName}>
          <option value="">Tất cả môn học</option>
          {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
        </select>
        <button type="submit" className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700">Tìm nhóm</button>
      </form>

      {selectedSubject && <p className="text-xs text-slate-500">Đang lọc theo môn <span className="font-semibold text-slate-700">{selectedSubject}</span></p>}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => <div key={index} className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white" />)}
        </div>
      ) : groups.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {groups.map((group) => {
            const isMember = group.members.some((member) => member.user.id === user?.id);
            const requestStatus = group.joinRequests?.[0]?.status;
            const isLeader = group.creator.id === user?.id;
            return (
              <article key={group.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">{group.subject?.name ?? 'Nhóm học chung'}</span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500"><Users className="h-3.5 w-3.5" />{group._count.members}/{group.maxMembers}</span>
                </div>
                <button type="button" onClick={() => void openDetails(group)} className="mt-4 text-left text-lg font-bold text-slate-900 hover:text-blue-700">{group.name}</button>
                <p className="mt-2 line-clamp-3 min-h-[60px] text-sm leading-5 text-slate-600">{group.goal || group.description || 'Nhóm đang tìm thêm thành viên cùng học.'}</p>
                <div className="mt-4 space-y-2 text-xs text-slate-500">
                  {group.scheduleText && <p className="flex items-center gap-2"><CalendarDays className="h-3.5 w-3.5" />{group.scheduleText}</p>}
                  {group.location && <p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" />{group.location}</p>}
                  <p className="flex items-center gap-2"><Users className="h-3.5 w-3.5" />Trưởng nhóm: {group.creator.fullName}</p>
                </div>
                <div className="mt-auto flex gap-2 pt-5">
                  {isLeader ? (
                    <button type="button" onClick={() => void openDetails(group)} className="w-full rounded-xl border border-blue-200 bg-blue-50 px-3 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-100">Quản lý nhóm</button>
                  ) : isMember ? (
                    <button type="button" onClick={() => void openDetails(group)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Đã tham gia · Chi tiết</button>
                  ) : requestStatus === 'PENDING' ? (
                    <button type="button" disabled className="w-full cursor-not-allowed rounded-xl bg-amber-50 px-3 py-2.5 text-sm font-semibold text-amber-700">Đang chờ duyệt</button>
                  ) : (
                    <button type="button" disabled={user?.role !== 'STUDENT' || joiningGroupId === group.id || group._count.members >= group.maxMembers} onClick={() => void handleJoin(group)} className="w-full rounded-xl bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500">
                      {group._count.members >= group.maxMembers ? 'Đã đủ thành viên' : joiningGroupId === group.id ? 'Đang gửi...' : 'Xin tham gia'}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState icon={Users} title="Chưa tìm thấy nhóm phù hợp" description="Thử đổi từ khóa hoặc môn học, hoặc tạo nhóm mới để tìm bạn học." actionLabel={user?.role === 'STUDENT' ? 'Tạo nhóm học' : undefined} onAction={user?.role === 'STUDENT' ? () => setCreateOpen(true) : undefined} />
      )}

      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
        <span className="text-xs text-slate-500">Trang {page} / {totalPages}</span>
        <div className="flex gap-2">
          <button type="button" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="rounded-lg border border-slate-200 p-2 text-slate-600 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button>
          <button type="button" disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} className="rounded-lg border border-slate-200 p-2 text-slate-600 disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>

      {createOpen && (
        <Modal title="Tạo nhóm học" onClose={() => setCreateOpen(false)}>
          <form onSubmit={(event) => void handleCreate(event)} className="space-y-4">
            <Field label="Tên nhóm"><input required minLength={3} maxLength={120} value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} className={inputClassName} placeholder="Ví dụ: Ôn thi Lập trình mạng" /></Field>
            <Field label="Môn học"><select value={draft.subjectId} onChange={(event) => setDraft({ ...draft, subjectId: event.target.value })} className={inputClassName}><option value="">Chọn sau hoặc nhóm học chung</option>{subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</select></Field>
            <Field label="Mục tiêu học tập"><input value={draft.goal} onChange={(event) => setDraft({ ...draft, goal: event.target.value })} className={inputClassName} placeholder="Ôn thi, làm đồ án, học theo tuần..." /></Field>
            <Field label="Mô tả"><textarea rows={3} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} className={inputClassName} /></Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Lịch học"><input value={draft.scheduleText} onChange={(event) => setDraft({ ...draft, scheduleText: event.target.value })} className={inputClassName} placeholder="Tối thứ 7" /></Field>
              <Field label="Địa điểm"><input value={draft.location} onChange={(event) => setDraft({ ...draft, location: event.target.value })} className={inputClassName} placeholder="Thư viện trường" /></Field>
            </div>
            <Field label="Số thành viên tối đa"><input required type="number" min={2} max={100} value={draft.maxMembers} onChange={(event) => setDraft({ ...draft, maxMembers: event.target.value })} className={inputClassName} /></Field>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setCreateOpen(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600">Hủy</button>
              <button disabled={creating} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{creating ? 'Đang tạo...' : 'Tạo nhóm'}</button>
            </div>
          </form>
        </Modal>
      )}

      {selectedGroup && (
        <Modal title={selectedGroup.name} onClose={() => setSelectedGroup(null)}>
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-blue-50 px-3 py-1.5 font-semibold text-blue-700">{selectedGroup.subject?.name ?? 'Nhóm học chung'}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1.5 font-semibold text-slate-600">{selectedGroup._count.members}/{selectedGroup.maxMembers} thành viên</span>
            </div>
            {selectedGroup.description && <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">{selectedGroup.description}</p>}
            <div className="grid gap-2 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              {selectedGroup.goal && <p><span className="font-semibold text-slate-800">Mục tiêu:</span> {selectedGroup.goal}</p>}
              {selectedGroup.scheduleText && <p className="flex items-center gap-2"><Clock3 className="h-4 w-4" />{selectedGroup.scheduleText}</p>}
              {selectedGroup.location && <p className="flex items-center gap-2"><MapPin className="h-4 w-4" />{selectedGroup.location}</p>}
            </div>
            <section>
              <h3 className="mb-2 text-sm font-bold text-slate-800">Thành viên</h3>
              <div className="space-y-2">
                {selectedGroup.members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-3 py-2.5">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <Avatar name={member.user.fullName} src={member.user.avatarUrl} />
                      <span className="truncate text-sm font-medium text-slate-700">{member.user.fullName}</span>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-[11px] font-semibold text-slate-500">
                        {member.role === 'LEADER' ? 'Trưởng nhóm' : 'Thành viên'}
                      </span>
                      {selectedGroup.creator.id === user?.id && member.role !== 'LEADER' && (
                        <button
                          type="button"
                          disabled={removingMemberId === member.user.id}
                          onClick={() => void handleRemoveMember(member)}
                          className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-2 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                          aria-label={`Xóa ${member.user.fullName} khỏi nhóm`}
                        >
                          <UserMinus className="h-3.5 w-3.5" />
                          {removingMemberId === member.user.id ? 'Đang xóa...' : 'Xóa'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
            {selectedGroup.creator.id === user?.id && (
              <section className="border-t border-slate-100 pt-4">
                <h3 className="mb-3 text-sm font-bold text-slate-800">Yêu cầu đang chờ ({pendingRequests.length})</h3>
                {loadingRequests ? <p className="text-sm text-slate-500">Đang tải yêu cầu...</p> : pendingRequests.length ? <div className="space-y-2">{pendingRequests.map((request) => <div key={request.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-3"><div className="flex items-center gap-2.5"><Avatar name={request.user.fullName} src={request.user.avatarUrl} /><div><p className="text-sm font-semibold text-slate-800">{request.user.fullName}</p><p className="text-xs text-slate-500">{request.user.class?.name ?? 'Sinh viên'}{request.message ? ` · “${request.message}”` : ''}</p></div></div><div className="flex gap-2"><button type="button" disabled={busyRequestId === request.id || selectedGroup._count.members >= selectedGroup.maxMembers} onClick={() => void handleReview(request, 'APPROVED')} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50"><Check className="h-3.5 w-3.5" />Chấp nhận</button><button type="button" disabled={busyRequestId === request.id} onClick={() => void handleReview(request, 'REJECTED')} className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700 disabled:opacity-50">Từ chối</button></div></div>)}</div> : <p className="text-sm text-slate-500">Chưa có yêu cầu mới.</p>}
              </section>
            )}
            <div className="flex justify-end border-t border-slate-100 pt-4">
              {selectedGroup.members.some((member) => member.user.id === user?.id) && <button type="button" disabled={leaving} onClick={() => void handleLeave()} className="rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-semibold text-rose-700 disabled:opacity-50">{leaving ? 'Đang rời nhóm...' : 'Rời nhóm'}</button>}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block space-y-1.5"><span className="text-xs font-semibold text-slate-600">{label}</span>{children}</label>;
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 p-0 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section role="dialog" aria-modal="true" aria-label={title} className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-6"><header className="mb-5 flex items-center justify-between gap-4"><h2 className="text-lg font-bold text-slate-900">{title}</h2><button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X className="h-4 w-4" /></button></header>{children}</section></div>;
}

function Avatar({ name, src }: { name: string; src: string | null }) {
  return src ? <img src={src} alt="" className="h-8 w-8 rounded-full object-cover" /> : <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">{name.slice(0, 1).toUpperCase()}</div>;
}
