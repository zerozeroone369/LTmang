import {
  ArrowBigDown,
  ArrowBigUp,
  Check,
  CheckCircle,
  Clock,
  Eye,
  Filter,
  HelpCircle,
  MessageCircle,
  Plus,
  RefreshCw,
  Search,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { documentApi } from '../api/documentApi';
import { qaApi } from '../api/qaApi';
import { useAuth } from '../context/auth-context';
import { SubjectItem } from '../types/document';
import { QuestionItem } from '../types/qa';
import { formatRelativeTime } from '../utils/formatTime';

export function QAPage() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<number | ''>('');
  const [filterSolved, setFilterSolved] = useState<'ALL' | 'SOLVED' | 'UNSOLVED'>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'unanswered' | 'views'>('newest');

  // Detail view state
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionItem | null>(null);
  const [answerContent, setAnswerContent] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);

  // Create question modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createSubjectId, setCreateSubjectId] = useState<number | ''>('');
  const [createTitle, setCreateTitle] = useState('');
  const [createContent, setCreateContent] = useState('');
  const [createTags, setCreateTags] = useState('');
  const [creating, setCreating] = useState(false);

  const [appliedSearch, setAppliedSearch] = useState('');

  const loadSubjects = useCallback(async () => {
    try {
      const data = await documentApi.getSubjects();
      setSubjects(data);
    } catch {
      // ignore
    }
  }, []);

  const loadQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await qaApi.getQuestions({
        subjectId: selectedSubject ? Number(selectedSubject) : undefined,
        isSolved: filterSolved === 'ALL' ? undefined : filterSolved === 'SOLVED',
        search: appliedSearch.trim() || undefined,
        sortBy,
      });
      setQuestions(res.questions);
    } catch {
      toast.error('Không thể tải danh sách câu hỏi');
    } finally {
      setLoading(false);
    }
  }, [selectedSubject, filterSolved, appliedSearch, sortBy]);

  useEffect(() => {
    loadSubjects();
  }, [loadSubjects]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (appliedSearch === search) {
      loadQuestions();
    } else {
      setAppliedSearch(search);
    }
  };

  const handleOpenDetail = async (questionId: number) => {
    try {
      const res = await qaApi.getQuestionById(questionId);
      setSelectedQuestion(res);
    } catch {
      toast.error('Không thể tải chi tiết câu hỏi');
    }
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createSubjectId) {
      toast.error('Vui lòng chọn môn học');
      return;
    }
    if (!createTitle.trim()) {
      toast.error('Vui lòng nhập tiêu đề câu hỏi');
      return;
    }
    if (!createContent.trim()) {
      toast.error('Vui lòng nhập nội dung câu hỏi');
      return;
    }

    setCreating(true);
    try {
      await qaApi.createQuestion({
        subjectId: Number(createSubjectId),
        title: createTitle.trim(),
        content: createContent.trim(),
        tags: createTags.trim() || undefined,
      });

      toast.success('Đặt câu hỏi thành công!');
      setCreateModalOpen(false);
      setCreateTitle('');
      setCreateContent('');
      setCreateTags('');
      loadQuestions();
    } catch {
      toast.error('Không thể tạo câu hỏi, vui lòng thử lại');
    } finally {
      setCreating(false);
    }
  };

  const handleAddAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuestion) return;
    if (!answerContent.trim()) {
      toast.error('Vui lòng nhập nội dung câu trả lời');
      return;
    }

    setSubmittingAnswer(true);
    try {
      await qaApi.addAnswer(selectedQuestion.id, answerContent.trim());
      toast.success('Đã gửi câu trả lời của bạn!');
      setAnswerContent('');
      // Reload detail
      handleOpenDetail(selectedQuestion.id);
      loadQuestions();
    } catch {
      toast.error('Không thể gửi câu trả lời');
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleVote = async (answerId: number, value: 1 | -1) => {
    try {
      const res = await qaApi.voteAnswer(answerId, value);
      toast.success(res.message);

      if (selectedQuestion?.answers) {
        setSelectedQuestion({
          ...selectedQuestion,
          answers: selectedQuestion.answers.map((a) =>
            a.id === answerId ? { ...a, upvotesCount: res.score, userVote: res.userVote } : a,
          ),
        });
      }
    } catch {
      toast.error('Không thể vote cho câu trả lời này');
    }
  };

  const handleToggleAccept = async (answerId: number) => {
    if (!selectedQuestion) return;
    try {
      const res = await qaApi.toggleAcceptAnswer(answerId);
      toast.success(res.message);
      // Refresh detail
      handleOpenDetail(selectedQuestion.id);
      loadQuestions();
    } catch {
      toast.error('Chỉ người hỏi mới có quyền xác nhận câu trả lời đúng');
    }
  };

  const handleDeleteQuestion = async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa câu hỏi này không?')) return;
    try {
      await qaApi.deleteQuestion(id);
      toast.success('Đã xóa câu hỏi');
      setSelectedQuestion(null);
      loadQuestions();
    } catch {
      toast.error('Không thể xóa câu hỏi');
    }
  };

  const handleDeleteAnswer = async (answerId: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa câu trả lời này?')) return;
    try {
      await qaApi.deleteAnswer(answerId);
      toast.success('Đã xóa câu trả lời');
      if (selectedQuestion) handleOpenDetail(selectedQuestion.id);
    } catch {
      toast.error('Không thể xóa câu trả lời');
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Banner Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-6 text-white shadow-lg sm:p-8">
        <div className="relative z-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-white/20 px-2.5 py-0.5 text-xs font-bold tracking-wide uppercase backdrop-blur-sm">
                Diễn đàn học thuật
              </span>
              <span className="flex items-center gap-1 text-xs text-emerald-100">
                <CheckCircle className="h-3.5 w-3.5 text-white" /> Upvote & Chốt đáp án
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
              Hỏi Đáp Học Thuật (Q&A)
            </h1>
            <p className="mt-1 text-sm text-emerald-100">
              Cộng đồng giải đáp thắc mắc bài tập, chia sẻ phương pháp học tập và hỗ trợ bạn bè cùng
              tiến bộ.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-emerald-700 shadow-md transition hover:bg-emerald-50 hover:shadow-lg active:scale-95"
          >
            <Plus className="h-4 w-4" /> Đặt câu hỏi mới
          </button>
        </div>
      </div>

      {/* Main Content: List or Detail */}
      {selectedQuestion ? (
        /* Detailed Question View */
        <div className="space-y-6">
          {/* Back button */}
          <button
            type="button"
            onClick={() => setSelectedQuestion(null)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-600"
          >
            ← Quay lại danh sách câu hỏi
          </button>

          {/* Question Box */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                  {selectedQuestion.subject?.code} - {selectedQuestion.subject?.name}
                </span>
                {selectedQuestion.isSolved ? (
                  <span className="flex items-center gap-1 rounded-lg bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                    <Check className="h-3.5 w-3.5" /> Đã có câu trả lời đúng
                  </span>
                ) : (
                  <span className="rounded-lg bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                    Chờ giải đáp
                  </span>
                )}
              </div>

              {user?.id === selectedQuestion.authorId && (
                <button
                  type="button"
                  onClick={() => handleDeleteQuestion(selectedQuestion.id)}
                  className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Xóa câu hỏi
                </button>
              )}
            </div>

            <h2 className="mt-3 text-lg font-bold text-slate-800 sm:text-xl">
              {selectedQuestion.title}
            </h2>

            <div className="mt-2 text-sm leading-relaxed whitespace-pre-wrap text-slate-700">
              {selectedQuestion.content}
            </div>

            {/* Tags */}
            {selectedQuestion.tags && (
              <div className="mt-4 flex flex-wrap items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-slate-400" />
                {selectedQuestion.tags.split(',').map((tag, idx) => (
                  <span
                    key={idx}
                    className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600"
                  >
                    #{tag.trim()}
                  </span>
                ))}
              </div>
            )}

            {/* Author info */}
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">
                  {selectedQuestion.author?.fullName}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {formatRelativeTime(selectedQuestion.createdAt)}
                </span>
              </div>
              <span className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" /> {selectedQuestion.viewsCount} lượt xem
              </span>
            </div>
          </div>

          {/* Answers Section */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-800">
              {selectedQuestion.answers?.length || 0} Câu trả lời
            </h3>

            {/* Submit answer form */}
            <form
              onSubmit={handleAddAnswer}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <label className="block text-xs font-bold text-slate-700">Câu trả lời của bạn</label>
              <textarea
                rows={3}
                value={answerContent}
                onChange={(e) => setAnswerContent(e.target.value)}
                placeholder="Chia sẻ cách giải hoặc ý kiến của bạn về câu hỏi này..."
                required
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
              <div className="mt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={submittingAnswer}
                  className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
                >
                  {submittingAnswer ? 'Đang gửi...' : 'Gửi câu trả lời'}
                </button>
              </div>
            </form>

            {/* Answers List */}
            {selectedQuestion.answers && selectedQuestion.answers.length > 0 ? (
              selectedQuestion.answers.map((answer) => (
                <div
                  key={answer.id}
                  className={`flex gap-4 rounded-2xl border p-5 shadow-sm transition ${
                    answer.isCorrect
                      ? 'border-emerald-300 bg-emerald-50/40'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  {/* Voting Column */}
                  <div className="flex flex-col items-center">
                    <button
                      type="button"
                      onClick={() => handleVote(answer.id, 1)}
                      title="Hữu ích (+1)"
                      className={`rounded-lg p-1 transition ${
                        answer.userVote === 1
                          ? 'bg-emerald-100 text-emerald-600'
                          : 'text-slate-400 hover:bg-slate-100 hover:text-emerald-600'
                      }`}
                    >
                      <ArrowBigUp className="h-6 w-6" />
                    </button>
                    <span className="my-0.5 text-xs font-bold text-slate-700">
                      {answer.upvotesCount}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleVote(answer.id, -1)}
                      title="Chưa hữu ích (-1)"
                      className={`rounded-lg p-1 transition ${
                        answer.userVote === -1
                          ? 'bg-rose-100 text-rose-600'
                          : 'text-slate-400 hover:bg-slate-100 hover:text-rose-600'
                      }`}
                    >
                      <ArrowBigDown className="h-6 w-6" />
                    </button>
                  </div>

                  {/* Answer Content */}
                  <div className="flex-1">
                    {/* Best Answer Banner */}
                    {answer.isCorrect && (
                      <div className="mb-2 flex items-center gap-1.5 rounded-lg bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                        <CheckCircle className="h-4 w-4" /> Câu trả lời chính xác nhất được người
                        hỏi chấp nhận
                      </div>
                    )}

                    <div className="text-sm leading-relaxed whitespace-pre-wrap text-slate-800">
                      {answer.content}
                    </div>

                    {/* Footer */}
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2 text-[11px] text-slate-500">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-700">
                          {answer.author?.fullName}
                        </span>
                        <span>•</span>
                        <span>{formatRelativeTime(answer.createdAt)}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Accept Button for question author */}
                        {user?.id === selectedQuestion.authorId && (
                          <button
                            type="button"
                            onClick={() => handleToggleAccept(answer.id)}
                            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                              answer.isCorrect
                                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                : 'bg-emerald-600 text-white hover:bg-emerald-700'
                            }`}
                          >
                            <Check className="h-3.5 w-3.5" />
                            {answer.isCorrect ? 'Bỏ chọn đúng' : 'Chốt câu này đúng'}
                          </button>
                        )}

                        {/* Delete button */}
                        {user?.id === answer.authorId && (
                          <button
                            type="button"
                            onClick={() => handleDeleteAnswer(answer.id)}
                            className="rounded-lg p-1 text-slate-400 hover:text-rose-600"
                            title="Xóa câu trả lời của tôi"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-xs text-slate-500">
                Chưa có câu trả lời nào. Hãy là người đầu tiên trả lời câu hỏi này!
              </p>
            )}
          </div>
        </div>
      ) : (
        /* Questions List View */
        <>
          {/* Filter and Search Bar */}
          <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
            <form onSubmit={handleSearchSubmit} className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm câu hỏi theo từ khóa, nội dung, hashtag..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pr-4 pl-10 text-xs text-slate-800 transition outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
              />
            </form>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Filter className="h-3.5 w-3.5" /> Môn học:
              </div>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value ? Number(e.target.value) : '')}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-emerald-500 focus:bg-white"
              >
                <option value="">Tất cả môn học</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    [{sub.code}] {sub.name}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'unanswered' | 'views')}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-emerald-500 focus:bg-white"
              >
                <option value="newest">Mới nhất</option>
                <option value="unanswered">Chưa trả lời</option>
                <option value="views">Xem nhiều nhất</option>
              </select>

              <button
                type="button"
                onClick={loadQuestions}
                title="Làm mới"
                className="rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-slate-600 hover:bg-slate-100"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Solved Status Tabs */}
          <div className="flex items-center gap-2">
            {[
              { key: 'ALL', label: 'Tất cả câu hỏi' },
              { key: 'SOLVED', label: 'Đã có câu trả lời đúng' },
              { key: 'UNSOLVED', label: 'Chưa được giải quyết' },
            ].map((tab) => {
              const isActive = filterSolved === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setFilterSolved(tab.key as 'ALL' | 'SOLVED' | 'UNSOLVED')}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Questions Grid */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white p-5"
                />
              ))}
            </div>
          ) : questions.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <HelpCircle className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-800">Chưa có câu hỏi nào</h3>
              <p className="mt-1 max-w-sm text-xs text-slate-500">
                Chưa có câu hỏi phù hợp với bộ lọc. Hãy đặt câu hỏi để cùng thảo luận bài học nhé!
              </p>
              <button
                type="button"
                onClick={() => setCreateModalOpen(true)}
                className="mt-4 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700"
              >
                Đặt câu hỏi ngay
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {questions.map((q) => (
                <div
                  key={q.id}
                  onClick={() => handleOpenDetail(q.id)}
                  className="group flex cursor-pointer flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-300 hover:shadow-md"
                >
                  <div>
                    {/* Top Tags & Status */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="rounded-lg bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                          {q.subject?.code}
                        </span>
                        <span className="text-xs text-slate-500">{q.subject?.name}</span>
                      </div>

                      {q.isSolved ? (
                        <span className="flex items-center gap-1 rounded-lg bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                          <Check className="h-3 w-3" /> Đã có câu trả lời đúng
                        </span>
                      ) : (
                        <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                          Chờ giải đáp
                        </span>
                      )}
                    </div>

                    {/* Question Title */}
                    <h3 className="mt-2 text-sm font-bold text-slate-800 transition group-hover:text-emerald-600">
                      {q.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-600">{q.content}</p>

                    {/* Tags */}
                    {q.tags && (
                      <div className="mt-2.5 flex flex-wrap gap-1">
                        {q.tags.split(',').map((tag, idx) => (
                          <span
                            key={idx}
                            className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600"
                          >
                            #{tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer Info */}
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-500">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-700">{q.author?.fullName}</span>
                      <span>•</span>
                      <span>{formatRelativeTime(q.createdAt)}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5 text-slate-400" /> {q.viewsCount}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-emerald-600">
                        <MessageCircle className="h-3.5 w-3.5" /> {q.answersCount || 0} câu trả lời
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal Create Question */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-800">Đặt câu hỏi học thuật mới</h3>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQuestion} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Môn học *</label>
                <select
                  value={createSubjectId}
                  onChange={(e) => setCreateSubjectId(e.target.value ? Number(e.target.value) : '')}
                  required
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-emerald-500"
                >
                  <option value="">-- Chọn môn học --</option>
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      [{sub.code}] {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Tiêu đề câu hỏi *
                </label>
                <input
                  type="text"
                  value={createTitle}
                  onChange={(e) => setCreateTitle(e.target.value)}
                  placeholder="Tóm tắt ngắn gọn câu hỏi (ví dụ: Cơ chế bắt tay 3 bước trong TCP?)"
                  required
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Chi tiết câu hỏi *
                </label>
                <textarea
                  rows={4}
                  value={createContent}
                  onChange={(e) => setCreateContent(e.target.value)}
                  placeholder="Mô tả cụ thể thắc mắc của bạn, bài toán cần giải quyết..."
                  required
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Thẻ / Hashtag (ngăn cách bằng dấu phẩy)
                </label>
                <input
                  type="text"
                  value={createTags}
                  onChange={(e) => setCreateTags(e.target.value)}
                  placeholder="Socket, TCP, UDP, Network"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
                >
                  {creating ? 'Đang tạo...' : 'Đăng câu hỏi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
